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
    gridItem,
    GridSection,
    italicFontTextField,
    MVAPowerAdornment,
    OhmAdornment,
} from '../../../dialogUtils';
import { ENERGY_SOURCES } from 'components/network/constants';
import Grid from '@mui/material/Grid';
import React from 'react';
import { ConnectivityForm } from '../../../connectivity/connectivity-form';
import ReactiveLimitsForm from '../../../reactive-limits/reactive-limits-form';
import SetPointsForm from '../../../set-points/set-points-form';
import PropertiesForm from '../../common/properties/properties-form';
import useVoltageLevelsListInfos from '../../../../../hooks/use-voltage-levels-list-infos';

const GeneratorCreationForm = ({ studyUuid, currentNode }) => {
    const currentNodeUuid = currentNode?.id;
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNodeUuid);

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
                {gridItem(generatorIdField, 4)}
                {gridItem(generatorNameField, 4)}
                {gridItem(energySourceField, 4)}
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
                {gridItem(ratedNominalPowerField, 4)}
            </Grid>

            {/* Reactive limits part */}
            <GridSection title="ReactiveLimits" />
            <ReactiveLimitsForm />

            {/* Set points part */}
            <SetPointsForm
                studyUuid={studyUuid}
                currentNodeUuid={currentNodeUuid}
                voltageLevelOptions={voltageLevelOptions}
            />

            {/* Short Circuit of start part */}
            <GridSection title="ShortCircuit" />
            <Grid container spacing={2}>
                {gridItem(transientReactanceField, 4)}
                {gridItem(transformerReactanceField, 4)}
            </Grid>

            {/* Cost of start part */}
            <GridSection title="GenerationDispatch" />
            <Grid container spacing={2}>
                {gridItem(plannedActivePowerSetPointField, 4)}
                {gridItem(marginalCostField, 4)}
                <Grid container item spacing={2}>
                    {gridItem(plannedOutageRateField, 4)}
                    {gridItem(forcedOutageRateField, 4)}
                </Grid>
            </Grid>
            <PropertiesForm networkElementType={'generator'} />
        </>
    );
};

export default GeneratorCreationForm;
