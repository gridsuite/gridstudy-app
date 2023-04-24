/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import RadioInput from '../../../util/rhf-inputs/radio-input';
import {
    MAXIMUM_REACTIVE_POWER,
    MINIMUM_REACTIVE_POWER,
    REACTIVE_CAPABILITY_CURVE_CHOICE,
    REACTIVE_CAPABILITY_CURVE_TABLE,
} from '../../../util/field-constants';
import { REACTIVE_LIMIT_TYPES } from '../../../network/constants';
import React from 'react';
import FloatInput from '../../../util/rhf-inputs/float-input';
import { gridItem, ReactivePowerAdornment } from '../../dialogUtils';
import { ReactiveCapabilityCurveTable } from './reactive-capability-curve/reactive-capability-curve-table';
import { useWatch } from 'react-hook-form';
import Grid from '@mui/material/Grid';
import { FormattedMessage } from 'react-intl';

const headerIds = [
    'ActivePowerText',
    'MinimumReactivePower',
    'MaximumReactivePower',
];

const ReactiveLimitsForm = ({
    generatorToModify,
    updatePreviousReactiveCapabilityCurveTable,
}) => {
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
            formProps={{ style: { marginTop: '-12px' } }}
        />
    );

    const minimumReactivePowerField = (
        <FloatInput
            name={MINIMUM_REACTIVE_POWER}
            label={'MinimumReactivePower'}
            adornment={ReactivePowerAdornment}
            previousValue={
                generatorToModify?.minMaxReactiveLimits?.minimumReactivePower
            }
            clearable={true}
        />
    );

    const maximumReactivePowerField = (
        <FloatInput
            name={MAXIMUM_REACTIVE_POWER}
            label={'MaximumReactivePower'}
            adornment={ReactivePowerAdornment}
            previousValue={
                generatorToModify?.minMaxReactiveLimits?.maximumReactivePower
            }
            clearable={true}
        />
    );

    const reactiveCapabilityCurveTableField = (
        <ReactiveCapabilityCurveTable
            id={REACTIVE_CAPABILITY_CURVE_TABLE}
            tableHeadersIds={headerIds}
            isReactiveCapabilityCurveOn={isReactiveCapabilityCurveOn}
            previousValues={generatorToModify?.reactiveCapabilityCurvePoints}
            updatePreviousReactiveCapabilityCurveTable={
                updatePreviousReactiveCapabilityCurveTable
            }
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <h4>
                        <FormattedMessage id="ReactiveLimits" />
                    </h4>
                </Grid>
            </Grid>
            <Grid container spacing={2}>
                {gridItem(reactiveCapabilityCurveChoiceRadioField, 12)}

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
