import React from 'react';

import {
    FILTER_EQUIPMENTS,
    getCriteriaBasedFormData,
    getCriteriaBasedSchema,
} from '../criteria-based/criteria-based-utils';
import Grid from '@mui/material/Grid';
import { CRITERIA_BASED, ENERGY_SOURCE } from 'components/utils/field-constants';
import yup from 'components/utils/yup-config';
import { FILTER_PROPERTIES } from '../../filter-property';
import CriteriaBasedForm from './criteria-based-form';

export const criteriaBasedFilterSchema = getCriteriaBasedSchema({
    [ENERGY_SOURCE]: yup.string().nullable(),
    ...filterPropertiesYupSchema,
});

export const criteriaBasedFilterEmptyFormData = getCriteriaBasedFormData(null, {
    [ENERGY_SOURCE]: null,
    [FILTER_PROPERTIES]: [],
});

function CriteriaBasedFilterForm() {
    return (
        <Grid container item spacing={1}>
            <CriteriaBasedForm
                equipments={FILTER_EQUIPMENTS}
                defaultValues={criteriaBasedFilterEmptyFormData[CRITERIA_BASED]}
            />
            <FilterProperties />
        </Grid>
    );
}

export default CriteriaBasedFilterForm;
