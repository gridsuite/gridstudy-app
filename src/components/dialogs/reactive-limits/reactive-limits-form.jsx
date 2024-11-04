/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { RadioInput } from '@gridsuite/commons-ui';
import {
    MAXIMUM_REACTIVE_POWER,
    MINIMUM_REACTIVE_POWER,
    REACTIVE_CAPABILITY_CURVE_CHOICE,
    REACTIVE_CAPABILITY_CURVE_TABLE,
    REACTIVE_LIMITS,
} from 'components/utils/field-constants';
import { REACTIVE_LIMIT_TYPES } from 'components/network/constants';
import React from 'react';
import { FloatInput } from '@gridsuite/commons-ui';
import { GridItem, ReactivePowerAdornment } from '../dialog-utils';
import { ReactiveCapabilityCurveTable } from './reactive-capability-curve/reactive-capability-curve-table';
import { useWatch } from 'react-hook-form';
import Grid from '@mui/material/Grid';

const headerIds = ['ActivePowerText', 'MinimumReactivePower', 'MaximumReactivePower'];

const ReactiveLimitsForm = ({
    id = REACTIVE_LIMITS,
    equipmentToModify = null,
    updatePreviousReactiveCapabilityCurveTable = undefined,
}) => {
    const reactiveCapabilityCurveChoice = useWatch({
        name: `${id}.${REACTIVE_CAPABILITY_CURVE_CHOICE}`,
    });

    const isReactiveCapabilityCurveOn = reactiveCapabilityCurveChoice !== 'MINMAX';

    const reactiveCapabilityCurveChoiceRadioField = (
        <RadioInput
            name={`${id}.${REACTIVE_CAPABILITY_CURVE_CHOICE}`}
            defaultValue={'CURVE'}
            options={REACTIVE_LIMIT_TYPES}
            formProps={{ style: { marginTop: '-12px' } }}
        />
    );

    const minimumReactivePowerField = (
        <FloatInput
            name={`${id}.${MINIMUM_REACTIVE_POWER}`}
            label={'MinimumReactivePower'}
            adornment={ReactivePowerAdornment}
            previousValue={equipmentToModify?.minMaxReactiveLimits?.minQ}
            clearable={true}
        />
    );

    const maximumReactivePowerField = (
        <FloatInput
            name={`${id}.${MAXIMUM_REACTIVE_POWER}`}
            label={'MaximumReactivePower'}
            adornment={ReactivePowerAdornment}
            previousValue={equipmentToModify?.minMaxReactiveLimits?.maxQ}
            clearable={true}
        />
    );

    const reactiveCapabilityCurveTableField = (
        <ReactiveCapabilityCurveTable
            id={`${id}.${REACTIVE_CAPABILITY_CURVE_TABLE}`}
            tableHeadersIds={headerIds}
            isReactiveCapabilityCurveOn={isReactiveCapabilityCurveOn}
            previousValues={equipmentToModify?.reactiveCapabilityCurvePoints}
            updatePreviousReactiveCapabilityCurveTable={updatePreviousReactiveCapabilityCurveTable}
        />
    );

    return (
        <Grid container spacing={2}>
            {GridItem(reactiveCapabilityCurveChoiceRadioField, 12)}

            {!isReactiveCapabilityCurveOn && GridItem(minimumReactivePowerField, 4)}
            {!isReactiveCapabilityCurveOn && GridItem(maximumReactivePowerField, 4)}
            {isReactiveCapabilityCurveOn && GridItem(reactiveCapabilityCurveTableField, 12)}
        </Grid>
    );
};

export default ReactiveLimitsForm;
