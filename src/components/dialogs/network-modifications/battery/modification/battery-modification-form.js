/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import TextInput from 'components/utils/rhf-inputs/text-input';
import {
    ACTIVE_POWER_SET_POINT,
    EQUIPMENT_NAME,
    MAXIMUM_ACTIVE_POWER,
    MINIMUM_ACTIVE_POWER,
    REACTIVE_POWER_SET_POINT,
} from 'components/utils/field-constants';
import {
    ActivePowerAdornment,
    filledTextField,
    gridItem,
    GridSection,
    ReactivePowerAdornment,
} from '../../../dialogUtils';
import Grid from '@mui/material/Grid';
import React from 'react';
import FloatInput from 'components/utils/rhf-inputs/float-input';
import ReactiveLimitsForm from '../../../reactive-limits/reactive-limits-form';
import { TextField } from '@mui/material';
import FrequencyRegulation from '../../../set-points/frequency-regulation';

const BatteryModificationForm = ({
    batteryToModify,
    updatePreviousReactiveCapabilityCurveTable,
    equipmentId,
}) => {
    const batteryIdField = (
        <TextField
            size="small"
            fullWidth
            label={'ID'}
            value={equipmentId}
            InputProps={{
                readOnly: true,
            }}
            disabled
            {...filledTextField}
        />
    );

    const batteryNameField = (
        <TextInput
            name={EQUIPMENT_NAME}
            label={'Name'}
            formProps={filledTextField}
            previousValue={batteryToModify?.name}
            clearable={true}
        />
    );

    const maximumActivePowerField = (
        <FloatInput
            name={MAXIMUM_ACTIVE_POWER}
            label={'MaximumActivePowerText'}
            adornment={ActivePowerAdornment}
            previousValue={batteryToModify?.maxP}
            clearable={true}
        />
    );

    const minimumActivePowerField = (
        <FloatInput
            name={MINIMUM_ACTIVE_POWER}
            label={'MinimumActivePowerText'}
            adornment={ActivePowerAdornment}
            previousValue={batteryToModify?.minP}
            clearable={true}
        />
    );

    const activePowerSetPointField = (
        <FloatInput
            name={ACTIVE_POWER_SET_POINT}
            label={'ActivePowerText'}
            adornment={ActivePowerAdornment}
            previousValue={batteryToModify?.targetP}
            clearable={true}
        />
    );

    const reactivePowerSetPointField = (
        <FloatInput
            name={REACTIVE_POWER_SET_POINT}
            label={'ReactivePowerText'}
            adornment={ReactivePowerAdornment}
            previousValue={batteryToModify?.targetQ}
            clearable={true}
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                {gridItem(batteryIdField, 4)}
                {gridItem(batteryNameField, 4)}
            </Grid>
            {/* Limits part */}
            <GridSection title="ActiveLimits" />
            <Grid container spacing={2}>
                {gridItem(minimumActivePowerField, 4)}
                {gridItem(maximumActivePowerField, 4)}
            </Grid>
            {/* Reactive limits part */}
            <ReactiveLimitsForm
                equipmentToModify={batteryToModify}
                updatePreviousReactiveCapabilityCurveTable={
                    updatePreviousReactiveCapabilityCurveTable
                }
            />
            {/* Set points part */}
            <GridSection title="Setpoints" />
            <Grid container spacing={2}>
                {gridItem(activePowerSetPointField, 4)}
                {gridItem(reactivePowerSetPointField, 4)}
            </Grid>
            <Grid container spacing={2} paddingTop={2}>
                <FrequencyRegulation
                    isEquipmentModification={batteryToModify}
                    previousValues={batteryToModify}
                />
            </Grid>
        </>
    );
};

export default BatteryModificationForm;
