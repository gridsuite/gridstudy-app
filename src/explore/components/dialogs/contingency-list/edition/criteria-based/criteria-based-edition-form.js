/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import React from 'react';
import {
    CONTINGENCY_LIST_EQUIPMENTS,
    getCriteriaBasedFormData,
} from 'explore/components/dialogs/commons/criteria-based/criteria-based-utils';
import CriteriaBasedForm from 'explore/components/dialogs/commons/criteria-based/criteria-based-form';
import { CRITERIA_BASED, NAME } from 'explore/components/utils/field-constants';
import { UniqueNameInput } from '../../../commons/unique-name-input';
import { ElementType } from '../../../../../utils/elementType';

const CriteriaBasedEditionForm = () => {
    const emptyValues = getCriteriaBasedFormData();
    return (
        <Grid container spacing={2} marginTop={'auto'}>
            <Grid item xs={12}>
                <UniqueNameInput
                    name={NAME}
                    label={'nameProperty'}
                    elementType={ElementType.CONTINGENCY_LIST}
                />
            </Grid>
            <CriteriaBasedForm
                equipments={CONTINGENCY_LIST_EQUIPMENTS}
                defaultValues={emptyValues[CRITERIA_BASED]}
            />
        </Grid>
    );
};

export default CriteriaBasedEditionForm;
