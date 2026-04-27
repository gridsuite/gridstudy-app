/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Grid } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import {
    ActivePowerAdornment,
    ConnectivityForm,
    ConnectivityNetworkProps,
    FloatInput,
    PropertiesForm,
    ReactivePowerAdornment,
} from '@gridsuite/commons-ui';
import {
    ACTIVE_POWER_SET_POINT,
    MAXIMUM_ACTIVE_POWER,
    MINIMUM_ACTIVE_POWER,
    REACTIVE_POWER_SET_POINT,
} from 'components/utils/field-constants';
import GridItem from 'components/dialogs/commons/grid-item';
import GridSection from 'components/dialogs/commons/grid-section';
import { ReactiveLimitsForm } from '../../../reactive-limits/reactive-limits-form';
import { ActivePowerControlForm } from '../../../active-power-control/active-power-control-form';
import ShortCircuitForm from '../../../short-circuit/short-circuit-form';
import { BatteryFormInfos } from '../battery-dialog.type';
import { BatteryDialogTab } from './batteryTabs.utils';

export interface BatteryDialogTabsContentProps extends ConnectivityNetworkProps {
    batteryToModify?: BatteryFormInfos | null;
    updatePreviousReactiveCapabilityCurveTable: (action: string, index: number) => void;
    tabIndex: number;
}

export function BatteryDialogTabsContent({
    batteryToModify,
    updatePreviousReactiveCapabilityCurveTable,
    tabIndex,
    voltageLevelOptions = [],
    PositionDiagramPane,
    fetchBusesOrBusbarSections,
}: Readonly<BatteryDialogTabsContentProps>) {
    return (
        <>
            <Box hidden={tabIndex !== BatteryDialogTab.CONNECTIVITY_TAB}>
                <GridSection title="Connectivity" />
                <ConnectivityForm
                    withPosition={true}
                    isEquipmentModification={true}
                    previousValues={{
                        connectablePosition: batteryToModify?.connectablePosition,
                        voltageLevelId: batteryToModify?.voltageLevelId,
                        busOrBusbarSectionId: batteryToModify?.busOrBusbarSectionId,
                        terminalConnected: batteryToModify?.terminalConnected,
                    }}
                    voltageLevelOptions={voltageLevelOptions}
                    PositionDiagramPane={PositionDiagramPane}
                    fetchBusesOrBusbarSections={fetchBusesOrBusbarSections}
                />
            </Box>

            <Box hidden={tabIndex !== BatteryDialogTab.LIMITS_AND_SETPOINTS_TAB}>
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
                    <GridItem size={4}>
                        <FloatInput
                            name={MINIMUM_ACTIVE_POWER}
                            label={'MinimumActivePowerText'}
                            adornment={ActivePowerAdornment}
                            previousValue={batteryToModify?.minP}
                            clearable={true}
                        />
                    </GridItem>
                    <GridItem size={4}>
                        <FloatInput
                            name={MAXIMUM_ACTIVE_POWER}
                            label={'MaximumActivePowerText'}
                            adornment={ActivePowerAdornment}
                            previousValue={batteryToModify?.maxP}
                            clearable={true}
                        />
                    </GridItem>
                </Grid>
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
                <GridSection title="Setpoints" />
                <Grid container spacing={2}>
                    <GridItem size={4}>
                        <FloatInput
                            name={ACTIVE_POWER_SET_POINT}
                            label={'ActivePowerText'}
                            adornment={ActivePowerAdornment}
                            previousValue={batteryToModify?.targetP}
                            clearable={true}
                        />
                    </GridItem>
                    <GridItem size={4}>
                        <FloatInput
                            name={REACTIVE_POWER_SET_POINT}
                            label={'ReactivePowerText'}
                            adornment={ReactivePowerAdornment}
                            previousValue={batteryToModify?.targetQ}
                            clearable={true}
                        />
                    </GridItem>
                </Grid>
                <Grid container spacing={2} paddingTop={2}>
                    <ActivePowerControlForm
                        isEquipmentModification={true}
                        previousValues={batteryToModify?.activePowerControl}
                    />
                </Grid>
            </Box>

            <Box hidden={tabIndex !== BatteryDialogTab.SPECIFIC_TAB}>
                <GridSection title="ShortCircuit" />
                <ShortCircuitForm previousValues={batteryToModify?.batteryShortCircuit} />
            </Box>

            <Box hidden={tabIndex !== BatteryDialogTab.ADDITIONAL_INFORMATION_TAB}>
                <PropertiesForm networkElementType={'battery'} isModification={true} />
            </Box>
        </>
    );
}
