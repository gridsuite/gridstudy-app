/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import TextInput from '../../rhf-inputs/text-input';
import {
    ACTIVE_POWER_SET_POINT,
    DROOP,
    ENERGY_SOURCE,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    FORCED_OUTAGE_RATE,
    FREQUENCY_REGULATION,
    MARGINAL_COST,
    MAXIMUM_ACTIVE_POWER,
    MAXIMUM_REACTIVE_POWER,
    MINIMUM_ACTIVE_POWER,
    MINIMUM_REACTIVE_POWER,
    PLANNED_ACTIVE_POWER_SET_POINT,
    PLANNED_OUTAGE_RATE,
    Q_PERCENT,
    RATED_NOMINAL_POWER,
    REACTIVE_CAPABILITY_CURVE_CHOICE,
    REACTIVE_CAPABILITY_CURVE_TABLE,
    REACTIVE_POWER_SET_POINT,
    REGULATING_TERMINAL,
    STARTUP_COST,
    TRANSFORMER_REACTANCE,
    TRANSIENT_REACTANCE,
    VOLTAGE_REGULATION,
    VOLTAGE_REGULATION_TYPE,
    VOLTAGE_SET_POINT,
} from '../../utils/field-constants';
import {
    ActivePowerAdornment,
    filledTextField,
    gridItem,
    GridSection,
    MVAPowerAdornment,
    OhmAdornment,
    percentageTextField,
    ReactivePowerAdornment,
    VoltageAdornment,
} from '../../../dialogs/dialogUtils';
import SelectInput from '../../rhf-inputs/select-input';
import {
    ENERGY_SOURCES,
    REACTIVE_LIMIT_TYPES,
    REGULATION_TYPES,
} from '../../../network/constants';
import Grid from '@mui/material/Grid';
import React, {useEffect} from 'react';
import { ConnectivityForm } from '../connectivity/connectivity-form';
import FloatInput from '../../rhf-inputs/float-input';
import RadioInput from '../../rhf-inputs/radio-input';
import RegulatingTerminalForm from '../regulating-terminal/regulating-terminal-form';
import { useWatch } from 'react-hook-form';
import { ReactiveCapabilityCurveTable } from './reactive-capability-curve/reactive-capability-curve-table';
import BooleanInput from '../../rhf-inputs/boolean-input';
import { Box } from '@mui/system';
import { FormattedMessage } from 'react-intl';

const headerIds = [
    'ActivePowerText',
    'MinimumReactivePower',
    'MaximumReactivePower',
];

const GeneratorCreationForm = ({
    voltageLevelOptionsPromise,
    voltageLevelsEquipmentsOptionsPromise,
}) => {
    const reactiveCapabilityCurveChoice = useWatch({
        name: REACTIVE_CAPABILITY_CURVE_CHOICE,
    });

    const isVoltageRegulationOn = useWatch({
        name: VOLTAGE_REGULATION,
    });

    const voltageRegulationType = useWatch({
        name: VOLTAGE_REGULATION_TYPE,
    });

    const isFrequencyRegulationOn = useWatch({
        name: FREQUENCY_REGULATION,
    });

    const isReactiveCapabilityCurveOn =
        reactiveCapabilityCurveChoice !== 'MINMAX';
    const isDistantRegulation =
        voltageRegulationType === REGULATION_TYPES.DISTANT.id;

    const generatorIdField = (
        <TextInput
            name={EQUIPMENT_ID}
            label={'ID'}
            formProps={{ autoFocus: true, ...filledTextField }}
        />
    );

    const generatorNameField = (
        <TextInput
            name={EQUIPMENT_NAME}
            label={'Name'}
            formProps={filledTextField}
        />
    );

    const energySourceField = (
        <SelectInput
            name={ENERGY_SOURCE}
            label={'EnergySourceText'}
            options={ENERGY_SOURCES}
            fullWidth
            size={'small'}
            formProps={filledTextField}
        />
    );

    const connectivityForm = (
        <ConnectivityForm
            withPosition={true}
            voltageLevelOptionsPromise={voltageLevelOptionsPromise}
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
            label={'MaximumActivePowerText'}
            adornment={ActivePowerAdornment}
        />
    );

    const ratedNominalPowerField = (
        <FloatInput
            name={RATED_NOMINAL_POWER}
            label={'MaximumActivePowerText'}
            adornment={MVAPowerAdornment}
        />
    );

    const reactiveCapabilityCurveChoiceRadioField = (
        <RadioInput
            name={`${REACTIVE_CAPABILITY_CURVE_CHOICE}`}
            defaultValue={'CURVE'}
            possibleValues={REACTIVE_LIMIT_TYPES}
        />
    );

    const reactiveCapabilityCurveTableField = (
        <ReactiveCapabilityCurveTable
            name={REACTIVE_CAPABILITY_CURVE_TABLE}
            tableHeadersIds={headerIds}
            isReactiveCapabilityCurveOn={isReactiveCapabilityCurveOn}
        />
    );

    const minimumReactivePowerField = (
        <FloatInput
            name={MINIMUM_REACTIVE_POWER}
            label={'MinimumReactivePower'}
            adornment={ReactivePowerAdornment}
        />
    );

    const maximumReactivePowerField = (
        <FloatInput
            name={MAXIMUM_REACTIVE_POWER}
            label={'MaximumReactivePower'}
            adornment={ReactivePowerAdornment}
        />
    );

    const activePowerSetPointField = (
        <FloatInput
            name={ACTIVE_POWER_SET_POINT}
            label={'ActivePowerText'}
            adornment={ActivePowerAdornment}
        />
    );

    const voltageRegulationField = (
        <BooleanInput
            name={VOLTAGE_REGULATION}
            label={'VoltageRegulationText'}
        />
    );

    const reactivePowerSetPointField = (
        <FloatInput
            name={REACTIVE_POWER_SET_POINT}
            label={'ReactivePowerText'}
            adornment={ReactivePowerAdornment}
        />
    );

    const voltageRegulationTypeField = (
        <SelectInput
            options={Object.values(REGULATION_TYPES)}
            name={VOLTAGE_REGULATION_TYPE}
            label={'RegulationTypeText'}
            size={'small'}
        />
    );

    const test = useWatch({name: VOLTAGE_REGULATION_TYPE})
    useEffect(() => {
        console.log('test : ', test);
    }, [test])

    const voltageSetPointField = (
        <FloatInput
            name={VOLTAGE_SET_POINT}
            label={'VoltageText'}
            adornment={VoltageAdornment}
        />
    );

    const regulatingTerminalField = (
        <RegulatingTerminalForm
            id={REGULATING_TERMINAL}
            voltageLevelOptionsPromise={voltageLevelOptionsPromise}
            voltageLevelsEquipmentsOptionsPromise={
                voltageLevelsEquipmentsOptionsPromise
            }
            equipmentSectionTypeDefaultValue={''}
        />
    );

    const qPercentField = (
        <FloatInput
            name={Q_PERCENT}
            label={'QPercentText'}
            adornment={percentageTextField}
        />
    );

    const frequencyRegulationField = (
        <BooleanInput
            name={FREQUENCY_REGULATION}
            label={'FrequencyRegulation'}
        />
    );

    const droopField = (
        <FloatInput
            name={DROOP}
            label={'Droop'}
            adornment={percentageTextField}
        />
    );

    const transientReactanceField = (
        <FloatInput
            name={TRANSIENT_REACTANCE}
            label={'TransientReactance'}
            adornment={OhmAdornment}
        />
    );

    const transformerReactanceField = (
        <FloatInput
            name={TRANSFORMER_REACTANCE}
            label={'TransformerReactance'}
            adornment={OhmAdornment}
        />
    );

    const plannedActivePowerSetPointField = (
        <FloatInput
            name={PLANNED_ACTIVE_POWER_SET_POINT}
            label={'PlannedActivePowerSetPoint'}
            adornment={ActivePowerAdornment}
        />
    );

    const startupCostField = (
        <FloatInput name={STARTUP_COST} label={'StartupCost'} />
    );

    const marginalCostField = (
        <FloatInput name={MARGINAL_COST} label={'MarginalCost'} />
    );

    const plannedOutageRateField = (
        <FloatInput name={PLANNED_OUTAGE_RATE} label={'PlannedOutageRate'} />
    );

    const forcedOutageRateField = (
        <FloatInput name={FORCED_OUTAGE_RATE} label={'ForcedOutageRate'} />
    );

    const voltageRegulationFields = (
        <>
            {gridItem(voltageRegulationTypeField, 4)}
            <Box sx={{ width: '100%' }} />
            <Grid item xs={4} justifySelf={'end'} />
            {gridItem(voltageSetPointField, 4)}
            <Box sx={{ width: '100%' }} />
            {isDistantRegulation && (
                <>
                    <Grid item xs={4} justifySelf={'end'}>
                        <FormattedMessage id="RegulatingTerminalGenerator" />
                    </Grid>
                    {gridItem(regulatingTerminalField, 8)}
                    <Grid item xs={4} justifySelf={'end'} />
                    {gridItem(qPercentField, 4)}
                </>
            )}
        </>
    );
    return (
        <>
            <Grid container spacing={2}>
                {gridItem(generatorIdField, 4)}
                {gridItem(generatorNameField, 4)}
                {gridItem(energySourceField, 4)}
            </Grid>
            <GridSection title="Connectivity" />
            <Grid container spacing={2}>
                {gridItem(connectivityForm, 12)}
            </Grid>
            <GridSection title="ActiveLimits" />
            <Grid container spacing={2}>
                {gridItem(minimumActivePowerField, 4)}
                {gridItem(maximumActivePowerField, 4)}
                {gridItem(ratedNominalPowerField, 4)}
            </Grid>
            <GridSection title="ReactiveLimits" />
            <Grid container spacing={2}>
                {gridItem(reactiveCapabilityCurveChoiceRadioField, 12)}
            </Grid>
            <Grid container spacing={2}>
                {!isReactiveCapabilityCurveOn &&
                    gridItem(minimumReactivePowerField, 4)}
                {!isReactiveCapabilityCurveOn &&
                    gridItem(maximumReactivePowerField, 4)}
                {isReactiveCapabilityCurveOn &&
                    gridItem(reactiveCapabilityCurveTableField, 12)}
            </Grid>
            <GridSection title="Setpoints" />
            <Grid container spacing={2}>
                {gridItem(activePowerSetPointField, 4)}
                <Box sx={{ width: '100%' }} />
                {gridItem(voltageRegulationField, 4)}
                {!isVoltageRegulationOn &&
                    gridItem(reactivePowerSetPointField, 4)}
                {isVoltageRegulationOn && voltageRegulationFields}
                <Box sx={{ width: '100%' }} />
                {gridItem(frequencyRegulationField, 4)}
                {isFrequencyRegulationOn && gridItem(droopField, 4)}
            </Grid>
            <GridSection title="ShortCircuit" />
            <Grid container spacing={2}>
                {gridItem(transientReactanceField, 4)}
                {gridItem(transformerReactanceField, 4)}
            </Grid>

            {/* Cost of start part */}
            <GridSection title="Startup" />
            <Grid container spacing={2}>
                {gridItem(plannedActivePowerSetPointField, 4)}
                <Grid container item spacing={2}>
                    {gridItem(startupCostField, 4)}
                    {gridItem(marginalCostField, 4)}
                </Grid>
                <Grid container item spacing={2}>
                    {gridItem(plannedOutageRateField, 4)}
                    {gridItem(forcedOutageRateField, 4)}
                </Grid>
            </Grid>
        </>
    );
};

export default GeneratorCreationForm;
