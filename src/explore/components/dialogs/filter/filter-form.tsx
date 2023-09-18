/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import { UniqueNameInput } from '../commons/unique-name-input';
import { FILTER_TYPE, NAME } from '../../utils/field-constants';
import { ElementType, FilterType } from '../../../utils/elementType';
import { RadioInput } from '@gridsuite/commons-ui';
import CriteriaBasedFilterForm from './criteria-based/criteria-based-filter-form';
import ExplicitNamingFilterForm from './explicit-naming/explicit-naming-filter-form';
import React, { FunctionComponent } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

interface FilterFormProps {
    creation?: boolean;
}

export const FilterForm: FunctionComponent<FilterFormProps> = (props) => {
    const { setValue } = useFormContext();

    const filterType = useWatch({ name: FILTER_TYPE });

    // We do this because setValue don't set the field dirty
    const handleChange = (
        _event: React.ChangeEvent<HTMLInputElement>,
        value: string
    ) => {
        setValue(FILTER_TYPE, value);
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <UniqueNameInput
                    name={NAME}
                    label={'nameProperty'}
                    elementType={ElementType.FILTER}
                    autoFocus={props.creation}
                />
            </Grid>
            {props.creation && (
                <Grid item>
                    <RadioInput
                        name={FILTER_TYPE}
                        options={Object.values(FilterType)}
                        formProps={{ onChange: handleChange }} // need to override this in order to do not activate the validate button when changing the filter type
                    />
                </Grid>
            )}
            {filterType === FilterType.CRITERIA_BASED.id ? (
                <CriteriaBasedFilterForm />
            ) : (
                <ExplicitNamingFilterForm />
            )}
        </Grid>
    );
};
