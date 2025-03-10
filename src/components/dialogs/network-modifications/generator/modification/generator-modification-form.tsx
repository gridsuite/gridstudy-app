/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FloatInput, SelectInput, TextInput } from '@gridsuite/commons-ui';
import {
    CONNECTIVITY,
    ENERGY_SOURCE,
    EQUIPMENT_NAME,
    FORCED_OUTAGE_RATE,
    MARGINAL_COST,
    MAXIMUM_ACTIVE_POWER,
    MINIMUM_ACTIVE_POWER,
    PLANNED_ACTIVE_POWER_SET_POINT,
    PLANNED_OUTAGE_RATE,
    RATED_NOMINAL_POWER,
    REACTIVE_LIMITS,
    TRANSFORMER_REACTANCE,
    TRANSIENT_REACTANCE,
    VOLTAGE_REGULATION,
} from 'components/utils/field-constants';
import { ActivePowerAdornment, filledTextField, MVAPowerAdornment, OhmAdornment } from '../../../dialog-utils';
import { ENERGY_SOURCES, getEnergySourceLabel } from 'components/network/constants';
import ReactiveLimitsForm from '../../../reactive-limits/reactive-limits-form';
import SetPointsForm from '../../../set-points/set-points-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { Box, Grid, TextField } from '@mui/material';
import PropertiesForm from '../../common/properties/properties-form';
import useVoltageLevelsListInfos from '../../../../../hooks/use-voltage-levels-list-infos';
import GridItem from '../../../commons/grid-item';
import GridSection from '../../../commons/grid-section';
import { UUID } from 'crypto';
import { CurrentTreeNode } from '../../../../../redux/reducer';
import FrequencyRegulation from '../../../frequency-regulation/frequency-regulation';
import { GeneratorFormInfos } from '../generator-dialog.type';
import { ConnectivityForm } from '../../../connectivity/connectivity-form';
import VoltageRegulationForm from '../../../voltage-regulation/voltage-regulation';
import { useWatch } from 'react-hook-form';
import CheckboxNullableInput from '../../../../utils/rhf-inputs/boolean-nullable-input';

export interface GeneratorModificationFormProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    generatorToModify: GeneratorFormInfos | null;
    updatePreviousReactiveCapabilityCurveTable?: (action: string, index: number) => void;
    equipmentId: string;
}

export default function GeneratorModificationForm({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    generatorToModify,
    updatePreviousReactiveCapabilityCurveTable,
    equipmentId,
}: Readonly<GeneratorModificationFormProps>) {
    const currentNodeUuid: UUID | null = currentNode?.id ?? null;
    const intl = useIntl();
    const watchVoltageRegulation = useWatch({
        name: VOLTAGE_REGULATION,
    });
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNodeUuid, currentRootNetworkUuid);

    const energySourceLabelId = getEnergySourceLabel(generatorToModify?.energySource);
    const previousEnergySourceLabel = energySourceLabelId
        ? intl.formatMessage({
              id: energySourceLabelId,
          })
        : undefined;

    const previousRegulation = () => {
        if (generatorToModify?.voltageRegulatorOn) {
            return intl.formatMessage({ id: 'On' });
        }
        if (generatorToModify?.voltageRegulatorOn === false) {
            return intl.formatMessage({ id: 'Off' });
        }
        return null;
    };

    const generatorIdField = (
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

    const generatorNameField = (
        <TextInput
            name={EQUIPMENT_NAME}
            label={'Name'}
            formProps={filledTextField}
            previousValue={generatorToModify?.name}
            clearable={true}
        />
    );

    const energySourceField = (
        <SelectInput
            name={ENERGY_SOURCE}
            label={'energySource'}
            options={Object.values(ENERGY_SOURCES)}
            fullWidth
            size={'small'}
            formProps={{ ...filledTextField }}
            previousValue={previousEnergySourceLabel}
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

    const transientReactanceField = (
        <FloatInput
            name={TRANSIENT_REACTANCE}
            label={'TransientReactanceForm'}
            adornment={OhmAdornment}
            previousValue={generatorToModify?.generatorShortCircuit?.directTransX ?? undefined}
            clearable={true}
        />
    );

    const transformerReactanceField = (
        <FloatInput
            name={TRANSFORMER_REACTANCE}
            label={'TransformerReactanceForm'}
            adornment={OhmAdornment}
            previousValue={generatorToModify?.generatorShortCircuit?.stepUpTransformerX ?? undefined}
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

    const connectivityForm = (
        <ConnectivityForm
            id={CONNECTIVITY}
            withPosition={true}
            withDirectionsInfos={false}
            studyUuid={studyUuid}
            currentNode={currentNode}
            currentRootNetworkUuid={currentRootNetworkUuid}
            isEquipmentModification={true}
            previousValues={{
                connectablePosition: generatorToModify?.connectablePosition,
                terminalConnected: generatorToModify?.terminalConnected,
            }}
        />
    );

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
            studyUuid={studyUuid}
            currentNodeUuid={currentNodeUuid}
            currentRootNetworkUuid={currentRootNetworkUuid}
            voltageLevelOptions={voltageLevelOptions}
            previousTargetV={generatorToModify?.targetP}
            previousQPercent={generatorToModify?.qPercent}
            previousRegulatingTerminalVlId={generatorToModify?.regulatingTerminalVlId}
            previousRegulatingTerminalConnectableId={generatorToModify?.regulatingTerminalConnectableId}
            previousRegulatingTerminalConnectableType={generatorToModify?.regulatingTerminalConnectableType}
            isEquipmentModification={true}
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                <GridItem size={4}>{generatorIdField}</GridItem>
                <GridItem size={4}>{generatorNameField}</GridItem>
                <GridItem size={4}>{energySourceField}</GridItem>
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
                <GridItem size={4}>{ratedNominalPowerField}</GridItem>
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
                id={REACTIVE_LIMITS}
                previousMinMaxReactiveLimits={generatorToModify?.minMaxReactiveLimits}
                previousReactiveCapabilityCurveTable={generatorToModify?.reactiveCapabilityCurvePoints}
                updatePreviousReactiveCapabilityCurveTable={updatePreviousReactiveCapabilityCurveTable}
            />

            {/* Set points part */}
            <SetPointsForm
                previousValuesTargetP={generatorToModify?.targetP}
                previousValuesTargetQ={generatorToModify?.targetQ}
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
                <FrequencyRegulation
                    isEquipmentModification={true}
                    previousValues={generatorToModify?.activePowerControl}
                />
            </Grid>

            {/* Short Circuit of start part */}
            <GridSection title="ShortCircuit" />
            <Grid container spacing={2}>
                <GridItem size={4}>{transientReactanceField}</GridItem>
                <GridItem size={4}>{transformerReactanceField}</GridItem>
            </Grid>

            {/* Cost of start part */}
            <GridSection title="GenerationDispatch" />
            <Grid container spacing={2}>
                <GridItem size={4}>{plannedActivePowerSetPointField}</GridItem>
                <GridItem size={4}>{marginalCostField}</GridItem>
                <Grid container item spacing={2}>
                    <GridItem size={4}>{plannedOutageRateField}</GridItem>
                    <GridItem size={4}>{forcedOutageRateField}</GridItem>
                </Grid>
            </Grid>
            <PropertiesForm networkElementType={'generator'} isModification={true} />
        </>
    );
}
