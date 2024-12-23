/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FloatInput, SelectInput, TextInput } from '@gridsuite/commons-ui';
import {
    ENERGY_SOURCE,
    EQUIPMENT_ID,
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
import {
    ActivePowerAdornment,
    filledTextField,
    italicFontTextField,
    MVAPowerAdornment,
    OhmAdornment,
} from '../../../dialog-utils';
import { ENERGY_SOURCES } from 'components/network/constants';
import { Grid } from '@mui/material';
import { ConnectivityForm } from '../../../connectivity/connectivity-form';
import ReactiveLimitsForm from '../../../reactive-limits/reactive-limits-form';
import SetPointsForm from '../../../set-points/set-points-form';
import PropertiesForm from '../../common/properties/properties-form';
import useVoltageLevelsListInfos from '../../../../../hooks/use-voltage-levels-list-infos';
import GridItem from '../../../commons/grid-item';
import GridSection from '../../../commons/grid-section';

const GeneratorCreationForm = ({ studyUuid, currentNode, currentRootNetworkUuid }) => {
    const currentNodeUuid = currentNode?.id;
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNodeUuid,currentRootNetworkUuid);

    const generatorIdField = (
        <TextInput name={EQUIPMENT_ID} label={'ID'} formProps={{ autoFocus: true, ...filledTextField }} />
    );

    const generatorNameField = <TextInput name={EQUIPMENT_NAME} label={'Name'} formProps={filledTextField} />;

    const energySourceField = (
        <SelectInput
            name={ENERGY_SOURCE}
            label={'energySource'}
            options={ENERGY_SOURCES}
            fullWidth
            size={'small'}
            disableClearable={true}
            formProps={{ ...italicFontTextField, ...filledTextField }}
        />
    );

    const connectivityForm = (
        <ConnectivityForm
            voltageLevelOptions={voltageLevelOptions}
            withPosition={true}
            studyUuid={studyUuid}
            currentNode={currentNode}
            currentRootNetworkUuid={currentRootNetworkUuid}
        />
    );

    const maximumActivePowerField = (
        <FloatInput name={MAXIMUM_ACTIVE_POWER} label={'MaximumActivePowerText'} adornment={ActivePowerAdornment} />
    );

    const minimumActivePowerField = (
        <FloatInput name={MINIMUM_ACTIVE_POWER} label={'MinimumActivePowerText'} adornment={ActivePowerAdornment} />
    );

    const ratedNominalPowerField = (
        <FloatInput name={RATED_NOMINAL_POWER} label={'RatedNominalPowerText'} adornment={MVAPowerAdornment} />
    );

    const transientReactanceField = (
        <FloatInput name={TRANSIENT_REACTANCE} label={'TransientReactanceForm'} adornment={OhmAdornment} />
    );

    const transformerReactanceField = (
        <FloatInput name={TRANSFORMER_REACTANCE} label={'TransformerReactanceForm'} adornment={OhmAdornment} />
    );

    const plannedActivePowerSetPointField = (
        <FloatInput
            name={PLANNED_ACTIVE_POWER_SET_POINT}
            label={'PlannedActivePowerSetPointForm'}
            adornment={ActivePowerAdornment}
        />
    );

    const marginalCostField = <FloatInput name={MARGINAL_COST} label={'MarginalCost'} />;

    const plannedOutageRateField = <FloatInput name={PLANNED_OUTAGE_RATE} label={'plannedOutageRate'} />;

    const forcedOutageRateField = <FloatInput name={FORCED_OUTAGE_RATE} label={'forcedOutageRate'} />;

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

            {/* ActiveLimits part */}
            <GridSection title="ActiveLimits" />
            <Grid container spacing={2}>
                <GridItem size={4}>{minimumActivePowerField}</GridItem>
                <GridItem size={4}>{maximumActivePowerField}</GridItem>
                <GridItem size={4}>{ratedNominalPowerField}</GridItem>
            </Grid>

            {/* Reactive limits part */}
            <GridSection title="ReactiveLimits" />
            <ReactiveLimitsForm />

            {/* Set points part */}
            <SetPointsForm
                studyUuid={studyUuid}
                currentNodeUuid={currentNodeUuid}
                currentRootNetworkUuid={currentRootNetworkUuid}
                voltageLevelOptions={voltageLevelOptions}
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
            <PropertiesForm networkElementType={'generator'} />
        </>
    );
};

export default GeneratorCreationForm;
