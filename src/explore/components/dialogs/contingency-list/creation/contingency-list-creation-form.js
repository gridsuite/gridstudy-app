/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { RadioInput } from '@gridsuite/commons-ui';
import {
    CONTINGENCY_LIST_TYPE,
    CRITERIA_BASED,
    NAME,
    SCRIPT,
} from '../../../utils/field-constants';
import {
    ContingencyListType,
    ElementType,
} from '../../../../utils/elementType';
import { Grid } from '@mui/material';
import { gridItem } from '../../../utils/dialog-utils';
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import ExplicitNamingForm from '../explicit-naming/explicit-naming-form';
import {
    CONTINGENCY_LIST_EQUIPMENTS,
    getCriteriaBasedFormData,
} from '../../commons/criteria-based/criteria-based-utils';
import CriteriaBasedForm from '../../commons/criteria-based/criteria-based-form';
import ScriptInputForm from '../script/script-input-form';
import { UniqueNameInput } from '../../commons/unique-name-input';

const ContingencyListCreationForm = () => {
    const { setValue } = useFormContext();

    const watchContingencyListType = useWatch({
        name: CONTINGENCY_LIST_TYPE,
    });

    // We do this because setValue don't set the field dirty
    const handleChange = (_event, value) => {
        setValue(CONTINGENCY_LIST_TYPE, value);
    };

    const contingencyListTypeField = (
        <RadioInput
            name={CONTINGENCY_LIST_TYPE}
            options={Object.values(ContingencyListType)}
            formProps={{ onChange: handleChange }} // need to override this in order to do not activate the validate button when changing the filter type
        />
    );

    const emptyValues = getCriteriaBasedFormData();
    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <UniqueNameInput
                    name={NAME}
                    label={'nameProperty'}
                    elementType={ElementType.CONTINGENCY_LIST}
                    autoFocus
                />
            </Grid>
            <Grid container item>
                {gridItem(contingencyListTypeField, 12)}
            </Grid>
            {watchContingencyListType ===
                ContingencyListType.CRITERIA_BASED.id && (
                <CriteriaBasedForm
                    equipments={CONTINGENCY_LIST_EQUIPMENTS}
                    defaultValues={emptyValues[CRITERIA_BASED]}
                />
            )}
            {watchContingencyListType ===
                ContingencyListType.EXPLICIT_NAMING.id && (
                <ExplicitNamingForm />
            )}
            {watchContingencyListType === ContingencyListType.SCRIPT.id && (
                <ScriptInputForm name={SCRIPT} />
            )}
        </Grid>
    );
};

export default ContingencyListCreationForm;
