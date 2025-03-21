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
import { ActivePowerAdornment, filledTextField, ReactivePowerAdornment } from '../../../dialog-utils';
import { Grid, TextField } from '@mui/material';
import { FloatInput, TextInput } from '@gridsuite/commons-ui';
import { ReactiveLimitsForm } from '../../../reactive-limits/reactive-limits-form';
import { FormattedMessage } from 'react-intl';
import PropertiesForm from '../../common/properties/properties-form';
import { ConnectivityForm } from '../../../connectivity/connectivity-form';
import GridItem from '../../../commons/grid-item';
import GridSection from '../../../commons/grid-section';
import { ActivePowerControlForm } from '../../../active-power-control/active-power-control-form';

const BatteryModificationForm = ({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
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
            currentRootNetworkUuid={currentRootNetworkUuid}
            isEquipmentModification={true}
            previousValues={batteryToModify}
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                <GridItem size={4}>{batteryIdField}</GridItem>
                <GridItem size={4}>{batteryNameField}</GridItem>
            </Grid>
            {/* Connectivity part */}
            <GridSection title="Connectivity" />
            <Grid container spacing={2}>
                <GridItem size={12}>{connectivityForm}</GridItem>
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
                <GridItem size={4}>{minimumActivePowerField}</GridItem>
                <GridItem size={4}>{maximumActivePowerField}</GridItem>
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
                previousReactiveCapabilityCurvePoints={batteryToModify?.reactiveCapabilityCurvePoints}
                previousMinMaxReactiveLimits={batteryToModify?.minMaxReactiveLimits}
                updatePreviousReactiveCapabilityCurveTable={updatePreviousReactiveCapabilityCurveTable}
            />
            {/* Set points part */}
            <GridSection title="Setpoints" />
            <Grid container spacing={2}>
                <GridItem size={4}>{activePowerSetPointField}</GridItem>
                <GridItem size={4}>{reactivePowerSetPointField}</GridItem>
            </Grid>
            <Grid container spacing={2} paddingTop={2}>
                <ActivePowerControlForm
                    isEquipmentModification={true}
                    previousValues={batteryToModify?.activePowerControl}
                />
            </Grid>
            <PropertiesForm networkElementType={'battery'} isModification={true} />
        </>
    );
};

export default BatteryModificationForm;
