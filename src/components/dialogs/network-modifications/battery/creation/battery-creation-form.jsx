/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FloatInput, TextInput } from '@gridsuite/commons-ui';
import {
    ACTIVE_POWER_SET_POINT,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    MAXIMUM_ACTIVE_POWER,
    MINIMUM_ACTIVE_POWER,
    REACTIVE_POWER_SET_POINT,
} from 'components/utils/field-constants';
import {
    ActivePowerAdornment,
    filledTextField,
    GridItem,
    GridSection,
    ReactivePowerAdornment,
} from '../../../dialog-utils';
import Grid from '@mui/material/Grid';
import React from 'react';
import { ConnectivityForm } from '../../../connectivity/connectivity-form';
import ReactiveLimitsForm from '../../../reactive-limits/reactive-limits-form';
import FrequencyRegulation from '../../../set-points/frequency-regulation';
import PropertiesForm from '../../common/properties/properties-form';
import useVoltageLevelsListInfos from '../../../../../hooks/use-voltage-levels-list-infos';

const BatteryCreationForm = ({ studyUuid, currentNode }) => {
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNode.id);

    const batteryIdField = (
        <TextInput name={EQUIPMENT_ID} label={'ID'} formProps={{ autoFocus: true, ...filledTextField }} />
    );

    const batteryNameField = <TextInput name={EQUIPMENT_NAME} label={'Name'} formProps={filledTextField} />;

    const connectivityForm = (
        <ConnectivityForm
            voltageLevelOptions={voltageLevelOptions}
            withPosition={true}
            studyUuid={studyUuid}
            currentNode={currentNode}
        />
    );

    const maximumActivePowerField = (
        <FloatInput name={MAXIMUM_ACTIVE_POWER} label={'MaximumActivePowerText'} adornment={ActivePowerAdornment} />
    );

    const minimumActivePowerField = (
        <FloatInput name={MINIMUM_ACTIVE_POWER} label={'MinimumActivePowerText'} adornment={ActivePowerAdornment} />
    );
    const activePowerSetPointField = (
        <FloatInput
            name={ACTIVE_POWER_SET_POINT}
            label={'ActivePowerText'}
            adornment={ActivePowerAdornment}
            clearable
        />
    );

    const reactivePowerSetPointField = (
        <FloatInput
            name={REACTIVE_POWER_SET_POINT}
            label={'ReactivePowerText'}
            adornment={ReactivePowerAdornment}
            clearable
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                {GridItem(batteryIdField, 4)}
                {GridItem(batteryNameField, 4)}
            </Grid>

            {/* Connectivity part */}
            <GridSection title="Connectivity" />
            <Grid container spacing={2}>
                {GridItem(connectivityForm, 12)}
            </Grid>

            {/* ActiveLimits part */}
            <GridSection title="ActiveLimits" />
            <Grid container spacing={2}>
                {GridItem(minimumActivePowerField, 4)}
                {GridItem(maximumActivePowerField, 4)}
            </Grid>

            {/* Reactive limits part */}
            <GridSection title="ReactiveLimits" />
            <ReactiveLimitsForm />

            {/* Set points part */}
            <GridSection title="Setpoints" />
            <Grid container spacing={2}>
                {GridItem(activePowerSetPointField, 4)}
                {GridItem(reactivePowerSetPointField, 4)}
            </Grid>
            <Grid container spacing={2} paddingTop={2}>
                <FrequencyRegulation />
            </Grid>
            <PropertiesForm networkElementType={'battery'} />
        </>
    );
};

export default BatteryCreationForm;
