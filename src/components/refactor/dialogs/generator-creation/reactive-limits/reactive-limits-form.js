/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import RadioInput from '../../../rhf-inputs/radio-input';
import {
    MAXIMUM_REACTIVE_POWER,
    MINIMUM_REACTIVE_POWER,
    REACTIVE_CAPABILITY_CURVE_CHOICE,
} from '../../../utils/field-constants';
import { REACTIVE_LIMIT_TYPES } from '../../../../network/constants';
import React from 'react';
import FloatInput from '../../../rhf-inputs/float-input';
import {
    gridItem,
    GridSection,
    ReactivePowerAdornment,
} from '../../../../dialogs/dialogUtils';
import {
    REACTIVE_CAPABILITY_CURVE_EMPTY_FORM_DATA,
    REACTIVE_CAPABILITY_CURVE_VALIDATION_SCHEMA,
    ReactiveCapabilityCurveTable
} from './reactive-capability-curve/reactive-capability-curve-table';
import { useWatch } from 'react-hook-form';
import Grid from '@mui/material/Grid';
import yup from "../../../utils/yup-config";

export const REACTIVE_LIMITS_EMPTY_FORM_DATA = {
    [REACTIVE_CAPABILITY_CURVE_CHOICE]: 'CURVE',
    [MINIMUM_REACTIVE_POWER]: null,
    [MAXIMUM_REACTIVE_POWER]: null,
    ...REACTIVE_CAPABILITY_CURVE_EMPTY_FORM_DATA
};

export const REACTIVE_LIMITS_SCHEMA = yup.object().shape({
    [REACTIVE_CAPABILITY_CURVE_CHOICE]: yup.string().nullable().required(),
    [MINIMUM_REACTIVE_POWER]: yup.number().nullable(),
    [MAXIMUM_REACTIVE_POWER]: yup.number().nullable(),
    ...REACTIVE_CAPABILITY_CURVE_VALIDATION_SCHEMA,
});

const headerIds = [
    'ActivePowerText',
    'MinimumReactivePower',
    'MaximumReactivePower',
];

const ReactiveLimitsForm = () => {
    const reactiveCapabilityCurveChoice = useWatch({
        name: REACTIVE_CAPABILITY_CURVE_CHOICE,
    });

    const isReactiveCapabilityCurveOn =
        reactiveCapabilityCurveChoice !== 'MINMAX';

    const reactiveCapabilityCurveChoiceRadioField = (
        <RadioInput
            name={`${REACTIVE_CAPABILITY_CURVE_CHOICE}`}
            defaultValue={'CURVE'}
            options={REACTIVE_LIMIT_TYPES}
        />
    );

    const minimumReactivePowerField = (
        <FloatInput
            name={MINIMUM_REACTIVE_POWER}
            label={'MinimumReactivePower'}
            adornment={ReactivePowerAdornment}
        />
    );

    const maximumReactivePowerField = (
        <FloatInput
            name={MAXIMUM_REACTIVE_POWER}
            label={'MaximumReactivePower'}
            adornment={ReactivePowerAdornment}
        />
    );

    const reactiveCapabilityCurveTableField = (
        <ReactiveCapabilityCurveTable
            tableHeadersIds={headerIds}
            isReactiveCapabilityCurveOn={isReactiveCapabilityCurveOn}
        />
    );

    return (
        <>
            <GridSection title="ReactiveLimits" />
            <Grid container spacing={2}>
                {gridItem(reactiveCapabilityCurveChoiceRadioField, 12)}
            </Grid>
            <Grid container spacing={2}>
                {!isReactiveCapabilityCurveOn &&
                    gridItem(minimumReactivePowerField, 4)}
                {!isReactiveCapabilityCurveOn &&
                    gridItem(maximumReactivePowerField, 4)}
                {isReactiveCapabilityCurveOn &&
                    gridItem(reactiveCapabilityCurveTableField, 12)}
            </Grid>
        </>
    );
};

export default ReactiveLimitsForm;
