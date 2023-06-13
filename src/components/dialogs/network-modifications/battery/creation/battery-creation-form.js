/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import TextInput from 'components/utils/rhf-inputs/text-input';
import {
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    MAXIMUM_ACTIVE_POWER,
    MINIMUM_ACTIVE_POWER,
    ACTIVE_POWER,
    REACTIVE_POWER,
} from 'components/utils/field-constants';
import {
    ActivePowerAdornment,
    filledTextField,
    gridItem,
    GridSection,
    ReactivePowerAdornment,
} from '../../../dialogUtils';
import Grid from '@mui/material/Grid';
import React, { useEffect, useState } from 'react';
import { ConnectivityForm } from '../../../connectivity/connectivity-form';
import FloatInput from 'components/utils/rhf-inputs/float-input';
import ReactiveLimitsForm from '../../generator/reactive-limits/reactive-limits-form';
import { fetchVoltageLevelsListInfos } from 'utils/rest-api';
import FrequencyRegulation from '../../generator/set-points/frequency-regulation';
const BatteryCreationForm = ({ studyUuid, currentNode }) => {
    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);
    const currentNodeUuid = currentNode?.id;

    useEffect(() => {
        if (studyUuid && currentNodeUuid) {
            fetchVoltageLevelsListInfos(studyUuid, currentNodeUuid).then(
                (values) => {
                    setVoltageLevelOptions(
                        values.sort((a, b) => a.id.localeCompare(b.id))
                    );
                }
            );
        }
    }, [studyUuid, currentNodeUuid]);

    const batteryIdField = (
        <TextInput
            name={EQUIPMENT_ID}
            label={'ID'}
            formProps={{ autoFocus: true, ...filledTextField }}
        />
    );

    const batteryNameField = (
        <TextInput
            name={EQUIPMENT_NAME}
            label={'Name'}
            formProps={filledTextField}
        />
    );

    const connectivityForm = (
        <ConnectivityForm
            voltageLevelOptions={voltageLevelOptions}
            withPosition={true}
            studyUuid={studyUuid}
            currentNode={currentNode}
        />
    );

    const maximumActivePowerField = (
        <FloatInput
            name={MAXIMUM_ACTIVE_POWER}
            label={'MaximumActivePowerText'}
            adornment={ActivePowerAdornment}
        />
    );

    const minimumActivePowerField = (
        <FloatInput
            name={MINIMUM_ACTIVE_POWER}
            label={'MinimumActivePowerText'}
            adornment={ActivePowerAdornment}
        />
    );
    const activePowerField = (
        <FloatInput
            name={ACTIVE_POWER}
            label={'ActivePowerText'}
            adornment={ActivePowerAdornment}
            clearable
        />
    );

    const reactivePowerField = (
        <FloatInput
            name={REACTIVE_POWER}
            label={'ReactivePowerText'}
            adornment={ReactivePowerAdornment}
            clearable
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                {gridItem(batteryIdField, 4)}
                {gridItem(batteryNameField, 4)}
            </Grid>

            {/* Connectivity part */}
            <GridSection title="Connectivity" />
            <Grid container spacing={2}>
                {gridItem(connectivityForm, 12)}
            </Grid>

            {/* ActiveLimits part */}
            <GridSection title="ActiveLimits" />
            <Grid container spacing={2}>
                {gridItem(minimumActivePowerField, 4)}
                {gridItem(maximumActivePowerField, 4)}
            </Grid>

            {/* Reactive limits part */}
            <ReactiveLimitsForm />

            {/* Set points part */}
            <GridSection title="Setpoints" />
            <Grid container spacing={2}>
                {gridItem(activePowerField, 4)}
                {gridItem(reactivePowerField, 4)}
            </Grid>
            <FrequencyRegulation />
        </>
    );
};

export default BatteryCreationForm;
