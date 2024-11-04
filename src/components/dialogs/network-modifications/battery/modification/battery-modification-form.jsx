/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
    GridItem,
    GridSection,
    ReactivePowerAdornment,
} from '../../../dialog-utils';
import Grid from '@mui/material/Grid';
import React from 'react';
import { FloatInput, TextInput } from '@gridsuite/commons-ui';
import ReactiveLimitsForm from '../../../reactive-limits/reactive-limits-form';
import { TextField } from '@mui/material';
import FrequencyRegulation from '../../../set-points/frequency-regulation';
import { FormattedMessage } from 'react-intl';
import PropertiesForm from '../../common/properties/properties-form';
import { ConnectivityForm } from '../../../connectivity/connectivity-form';

const BatteryModificationForm = ({
    studyUuid,
    currentNode,
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

    const connectivityForm = (
        <ConnectivityForm
            withPosition={true}
            studyUuid={studyUuid}
            currentNode={currentNode}
            isEquipmentModification={true}
            previousValues={batteryToModify}
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
            {/* Limits part */}
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <h3>
                        <FormattedMessage id="Limits" />
                    </h3>
                    <h4>
                        <FormattedMessage id="ActiveLimits" />
                    </h4>
                </Grid>
            </Grid>
            <Grid container spacing={2}>
                {GridItem(minimumActivePowerField, 4)}
                {GridItem(maximumActivePowerField, 4)}
            </Grid>

            {/* Reactive limits part */}
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <h4>
                        <FormattedMessage id="ReactiveLimits" />
                    </h4>
                </Grid>
            </Grid>
            <ReactiveLimitsForm
                equipmentToModify={batteryToModify}
                updatePreviousReactiveCapabilityCurveTable={updatePreviousReactiveCapabilityCurveTable}
            />
            {/* Set points part */}
            <GridSection title="Setpoints" />
            <Grid container spacing={2}>
                {GridItem(activePowerSetPointField, 4)}
                {GridItem(reactivePowerSetPointField, 4)}
            </Grid>
            <Grid container spacing={2} paddingTop={2}>
                <FrequencyRegulation isEquipmentModification={true} previousValues={batteryToModify} />
            </Grid>
            <PropertiesForm networkElementType={'battery'} isModification={true} />
        </>
    );
};

export default BatteryModificationForm;
