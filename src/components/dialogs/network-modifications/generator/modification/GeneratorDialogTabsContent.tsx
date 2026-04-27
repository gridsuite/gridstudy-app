/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Grid } from '@mui/material';
import { GeneratorDialogTab } from './generatorTabs.utils';
import GridSection from 'components/dialogs/commons/grid-section';
import {
    ActivePowerAdornment,
    CheckboxNullableInput,
    ConnectivityForm,
    ConnectivityNetworkProps,
    FloatInput,
    MVAPowerAdornment,
    PowerMeasurementsForm,
    PropertiesForm,
    SetPointsForm,
} from '@gridsuite/commons-ui';
import { GeneratorFormInfos } from '../generator-dialog.type';
import { FormattedMessage, useIntl } from 'react-intl';
import GridItem from 'components/dialogs/commons/grid-item';
import { ReactiveLimitsForm } from 'components/dialogs/reactive-limits/reactive-limits-form';
import {
    FORCED_OUTAGE_RATE,
    MARGINAL_COST,
    MAXIMUM_ACTIVE_POWER,
    MINIMUM_ACTIVE_POWER,
    PLANNED_ACTIVE_POWER_SET_POINT,
    PLANNED_OUTAGE_RATE,
    RATED_NOMINAL_POWER,
    VOLTAGE_REGULATION,
} from 'components/utils/field-constants';
import ShortCircuitForm from '../../../short-circuit/short-circuit-form';
import { ActivePowerControlForm } from '../../../active-power-control/active-power-control-form';
import { useWatch } from 'react-hook-form';
import { VoltageRegulationForm } from 'components/dialogs/voltage-regulation/voltage-regulation-form';
import type { UUID } from 'node:crypto';
import { CurrentTreeNode } from '../../../../graph/tree-node.type';

export interface GeneratorDialogTabsContentProps extends ConnectivityNetworkProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    generatorToModify?: GeneratorFormInfos | null;
    updatePreviousReactiveCapabilityCurveTable: (action: string, index: number) => void;
    tabIndex: number;
}

export function GeneratorDialogTabsContent({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    generatorToModify,
    updatePreviousReactiveCapabilityCurveTable,
    tabIndex,
    voltageLevelOptions = [],
    PositionDiagramPane,
    fetchBusesOrBusbarSections,
}: Readonly<GeneratorDialogTabsContentProps>) {
    const currentNodeUuid = currentNode?.id;
    const intl = useIntl();
    const watchVoltageRegulation = useWatch({
        name: VOLTAGE_REGULATION,
    });

    const previousRegulation = () => {
        if (generatorToModify?.voltageRegulatorOn) {
            return intl.formatMessage({ id: 'On' });
        }
        if (generatorToModify?.voltageRegulatorOn === false) {
            return intl.formatMessage({ id: 'Off' });
        }
        return null;
    };

    const voltageRegulationField = (
        <Box>
            <CheckboxNullableInput
                name={VOLTAGE_REGULATION}
                label={'VoltageRegulationText'}
                previousValue={previousRegulation() ?? undefined}
            />
        </Box>
    );

    const voltageRegulationFields = (
        <VoltageRegulationForm
            voltageLevelOptions={voltageLevelOptions}
            currentNodeUuid={currentNodeUuid}
            currentRootNetworkUuid={currentRootNetworkUuid}
            studyUuid={studyUuid}
            previousValues={{
                regulatingTerminalConnectableId: generatorToModify?.regulatingTerminalConnectableId,
                regulatingTerminalVlId: generatorToModify?.regulatingTerminalVlId,
                regulatingTerminalConnectableType: generatorToModify?.regulatingTerminalConnectableType,
                voltageSetPoint: generatorToModify?.targetV,
                qPercent: generatorToModify?.coordinatedReactiveControl?.qPercent,
            }}
            isEquipmentModification={true}
        />
    );

    const maximumActivePowerField = (
        <FloatInput
            name={MAXIMUM_ACTIVE_POWER}
            label={'MaximumActivePowerText'}
            adornment={ActivePowerAdornment}
            previousValue={generatorToModify?.maxP}
            clearable={true}
        />
    );

    const minimumActivePowerField = (
        <FloatInput
            name={MINIMUM_ACTIVE_POWER}
            label={'MinimumActivePowerText'}
            adornment={ActivePowerAdornment}
            previousValue={generatorToModify?.minP}
            clearable={true}
        />
    );

    const ratedNominalPowerField = (
        <FloatInput
            name={RATED_NOMINAL_POWER}
            label={'RatedNominalPowerText'}
            adornment={MVAPowerAdornment}
            previousValue={generatorToModify?.ratedS}
            clearable={true}
        />
    );

    const plannedActivePowerSetPointField = (
        <FloatInput
            name={PLANNED_ACTIVE_POWER_SET_POINT}
            label={'PlannedActivePowerSetPointForm'}
            adornment={ActivePowerAdornment}
            previousValue={generatorToModify?.generatorStartup?.plannedActivePowerSetPoint ?? undefined}
            clearable={true}
        />
    );

    const marginalCostField = (
        <FloatInput
            name={MARGINAL_COST}
            label={'MarginalCost'}
            previousValue={generatorToModify?.generatorStartup?.marginalCost ?? undefined}
            clearable={true}
        />
    );

    const plannedOutageRateField = (
        <FloatInput
            name={PLANNED_OUTAGE_RATE}
            label={'plannedOutageRate'}
            previousValue={generatorToModify?.generatorStartup?.plannedOutageRate ?? undefined}
            clearable={true}
        />
    );

    const forcedOutageRateField = (
        <FloatInput
            name={FORCED_OUTAGE_RATE}
            label={'forcedOutageRate'}
            previousValue={generatorToModify?.generatorStartup?.forcedOutageRate ?? undefined}
            clearable={true}
        />
    );

    return (
        <>
            <Box hidden={tabIndex !== GeneratorDialogTab.CONNECTIVITY_TAB}>
                <GridSection title="ConnectivityTab" />
                <ConnectivityForm
                    withPosition={true}
                    isEquipmentModification={true}
                    previousValues={{
                        connectablePosition: generatorToModify?.connectablePosition,
                        voltageLevelId: generatorToModify?.voltageLevelId,
                        busOrBusbarSectionId: generatorToModify?.busOrBusbarSectionId,
                        terminalConnected: generatorToModify?.terminalConnected,
                    }}
                    voltageLevelOptions={voltageLevelOptions}
                    PositionDiagramPane={PositionDiagramPane}
                    fetchBusesOrBusbarSections={fetchBusesOrBusbarSections}
                />
            </Box>

            <Box hidden={tabIndex !== GeneratorDialogTab.SETPOINTS_AND_LIMITS_TAB}>
                <SetPointsForm
                    previousValues={{
                        activePower: generatorToModify?.targetP,
                        reactivePower: generatorToModify?.targetQ,
                    }}
                    isModification={true}
                />
                <Grid container spacing={2} paddingTop={2}>
                    <Box sx={{ width: '100%' }} />
                    <GridItem
                        tooltip={watchVoltageRegulation !== null ? '' : <FormattedMessage id={'NoModification'} />}
                        size={4}
                    >
                        {voltageRegulationField}
                    </GridItem>
                    {voltageRegulationFields}
                    <Box sx={{ width: '100%' }} />
                    <ActivePowerControlForm
                        isEquipmentModification={true}
                        previousValues={generatorToModify?.activePowerControl}
                    />
                </Grid>
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
                    <GridItem size={4}>{ratedNominalPowerField}</GridItem>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <h4>
                            <FormattedMessage id="ReactiveLimits" />
                        </h4>
                    </Grid>
                </Grid>
                <ReactiveLimitsForm
                    previousReactiveCapabilityCurvePoints={generatorToModify?.reactiveCapabilityCurvePoints}
                    previousMinMaxReactiveLimits={generatorToModify?.minMaxReactiveLimits}
                    updatePreviousReactiveCapabilityCurveTable={updatePreviousReactiveCapabilityCurveTable}
                />
            </Box>

            <Box hidden={tabIndex !== GeneratorDialogTab.SPECIFIC_TAB}>
                <GridSection title="ShortCircuit" />
                <ShortCircuitForm previousValues={generatorToModify?.generatorShortCircuit} />
                <GridSection title="GenerationDispatch" />
                <Grid container spacing={2}>
                    <GridItem size={4}>{plannedActivePowerSetPointField}</GridItem>
                    <GridItem size={4}>{marginalCostField}</GridItem>
                    <Grid container item spacing={2}>
                        <GridItem size={4}>{plannedOutageRateField}</GridItem>
                        <GridItem size={4}>{forcedOutageRateField}</GridItem>
                    </Grid>
                </Grid>
                <GridSection title="MeasurementsSection" />
                <PowerMeasurementsForm
                    activePowerMeasurement={generatorToModify?.measurementP}
                    reactivePowerMeasurement={generatorToModify?.measurementQ}
                />
            </Box>

            <Box hidden={tabIndex !== GeneratorDialogTab.ADDITIONAL_INFORMATION_TAB}>
                <PropertiesForm networkElementType={'generator'} isModification={true} />
            </Box>
        </>
    );
}
