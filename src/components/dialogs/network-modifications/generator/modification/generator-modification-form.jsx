/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FloatInput, SelectInput, TextInput } from '@gridsuite/commons-ui';
import {
    ENERGY_SOURCE,
    EQUIPMENT_NAME,
    FORCED_OUTAGE_RATE,
    MARGINAL_COST,
    MAXIMUM_ACTIVE_POWER,
    MINIMUM_ACTIVE_POWER,
    PLANNED_ACTIVE_POWER_SET_POINT,
    PLANNED_OUTAGE_RATE,
    RATED_NOMINAL_POWER,
    TRANSFORMER_REACTANCE,
    TRANSIENT_REACTANCE,
} from 'components/utils/field-constants';
import { ActivePowerAdornment, filledTextField, MVAPowerAdornment, OhmAdornment } from '../../../dialog-utils';
import { ENERGY_SOURCES, getEnergySourceLabel } from 'components/network/constants';
import ReactiveLimitsForm from '../../../reactive-limits/reactive-limits-form';
import SetPointsForm from '../../../set-points/set-points-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { TextField, Grid } from '@mui/material';
import PropertiesForm from '../../common/properties/properties-form';
import { ConnectivityForm } from '../../../connectivity/connectivity-form';
import useVoltageLevelsListInfos from '../../../../../hooks/use-voltage-levels-list-infos';
import { GridItem } from '../../../commons/grid-item';
import { GridSection } from '../../../commons/grid-section';

const GeneratorModificationForm = ({
    studyUuid,
    currentNode,
    generatorToModify,
    updatePreviousReactiveCapabilityCurveTable,
    equipmentId,
}) => {
    const currentNodeUuid = currentNode?.id;
    const intl = useIntl();
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNodeUuid);

    const energySourceLabelId = getEnergySourceLabel(generatorToModify?.energySource);
    const previousEnergySourceLabel = energySourceLabelId
        ? intl.formatMessage({
              id: energySourceLabelId,
          })
        : undefined;

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
            options={ENERGY_SOURCES}
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
            previousValue={generatorToModify?.generatorShortCircuit?.directTransX}
            clearable={true}
        />
    );

    const transformerReactanceField = (
        <FloatInput
            name={TRANSFORMER_REACTANCE}
            label={'TransformerReactanceForm'}
            adornment={OhmAdornment}
            previousValue={
                isNaN(generatorToModify?.generatorShortCircuit?.stepUpTransformerX)
                    ? null
                    : generatorToModify?.generatorShortCircuit?.stepUpTransformerX
            }
            clearable={true}
        />
    );

    const plannedActivePowerSetPointField = (
        <FloatInput
            name={PLANNED_ACTIVE_POWER_SET_POINT}
            label={'PlannedActivePowerSetPointForm'}
            adornment={ActivePowerAdornment}
            previousValue={generatorToModify?.generatorStartup?.plannedActivePowerSetPoint}
            clearable={true}
        />
    );

    const marginalCostField = (
        <FloatInput
            name={MARGINAL_COST}
            label={'MarginalCost'}
            previousValue={generatorToModify?.generatorStartup?.marginalCost}
            clearable={true}
        />
    );

    const plannedOutageRateField = (
        <FloatInput
            name={PLANNED_OUTAGE_RATE}
            label={'plannedOutageRate'}
            previousValue={generatorToModify?.generatorStartup?.plannedOutageRate}
            clearable={true}
        />
    );

    const forcedOutageRateField = (
        <FloatInput
            name={FORCED_OUTAGE_RATE}
            label={'forcedOutageRate'}
            previousValue={generatorToModify?.generatorStartup?.forcedOutageRate}
            clearable={true}
        />
    );

    const connectivityForm = (
        <ConnectivityForm
            withPosition={true}
            studyUuid={studyUuid}
            currentNode={currentNode}
            isEquipmentModification={true}
            previousValues={generatorToModify}
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
                equipmentToModify={generatorToModify}
                updatePreviousReactiveCapabilityCurveTable={updatePreviousReactiveCapabilityCurveTable}
            />

            {/* Set points part */}
            <SetPointsForm
                studyUuid={studyUuid}
                currentNodeUuid={currentNodeUuid}
                voltageLevelOptions={voltageLevelOptions}
                isEquipmentModification={true}
                previousValues={generatorToModify}
            />

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
};

export default GeneratorModificationForm;
