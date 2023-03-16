/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import TextInput from '../../../rhf-inputs/text-input';
import {
    ENERGY_SOURCE,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    FORCED_OUTAGE_RATE,
    MARGINAL_COST,
    MAXIMUM_ACTIVE_POWER,
    MINIMUM_ACTIVE_POWER,
    OLD_EQUIPMENT,
    OLD_P,
    OLD_Q_MAX_P,
    OLD_Q_MIN_P,
    OLD_VOLTAGE_LEVEL,
    P,
    PLANNED_ACTIVE_POWER_SET_POINT,
    PLANNED_OUTAGE_RATE,
    Q_MAX_P,
    Q_MIN_P,
    RATED_NOMINAL_POWER,
    REACTIVE_CAPABILITY_CURVE_CHOICE,
    REACTIVE_CAPABILITY_CURVE_TABLE,
    STARTUP_COST,
    TRANSFORMER_REACTANCE,
    TRANSIENT_REACTANCE,
    VOLTAGE_REGULATION_TYPE,
} from '../../../utils/field-constants';
import {
    ActivePowerAdornment,
    filledTextField,
    gridItem,
    GridSection,
    italicFontTextField,
    MVAPowerAdornment,
    OhmAdornment,
} from '../../../../dialogs/dialogUtils';
import SelectInput from '../../../rhf-inputs/select-input';
import {
    ENERGY_SOURCES,
    getEnergySourceLabel,
    REGULATION_TYPES,
} from '../../../../network/constants';
import Grid from '@mui/material/Grid';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import FloatInput from '../../../rhf-inputs/float-input';
import {
    fetchEquipmentInfos,
    fetchEquipmentsIds,
    fetchVoltageLevelsIdAndTopology,
} from '../../../../../utils/rest-api';
import ReactiveLimitsForm from '../reactive-limits/reactive-limits-form';
import SetPointsForm from '../set-points/set-points-form';
import { FormattedMessage, useIntl } from 'react-intl';
import AutocompleteInput from 'components/refactor/rhf-inputs/autocomplete-input';
import { useFormContext, useWatch } from 'react-hook-form';
import { getModificationRowEmptyFormData } from '../reactive-limits/reactive-capability-curve/reactive-capability-utils';

const GeneratorModificationForm = ({
    studyUuid,
    currentNode,
    resetForm,
    editData,
    generatorToModify,
    setGeneratorToModify,
    updatePreviousReactiveCapabilityCurveTable,
}) => {
    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);
    const [equipmentOptions, setEquipmentOptions] = useState([]);
    const currentNodeUuid = currentNode?.id;
    const intl = useIntl();
    const { clearErrors } = useFormContext();
    const shouldEmptyFormOnGeneratorIdChangeRef = useRef();
    const watchEquipmentId = useWatch({
        name: EQUIPMENT_ID,
    });

    useEffect(() => {
        if (!editData) shouldEmptyFormOnGeneratorIdChangeRef.current = true;
    }, [editData]);

    useEffect(() => {
        if (studyUuid && currentNodeUuid) {
            fetchVoltageLevelsIdAndTopology(studyUuid, currentNodeUuid).then(
                (values) => {
                    setVoltageLevelOptions(
                        values.sort((a, b) => a.id.localeCompare(b.id))
                    );
                }
            );
            fetchEquipmentsIds(
                studyUuid,
                currentNodeUuid,
                undefined,
                'GENERATOR',
                true
            ).then((values) => {
                setEquipmentOptions(values.sort());
            });
        }
    }, [studyUuid, currentNodeUuid]);

    //this useEffect fetches previous equipment properties values, resets form values
    //then create empty reactive limits table depending on fetched equipment data
    useEffect(() => {
        clearErrors();
        if (watchEquipmentId) {
            fetchEquipmentInfos(
                studyUuid,
                currentNodeUuid,
                'generators',
                watchEquipmentId,
                true
            )
                .then((value) => {
                    if (value) {
                        // when editing modification form, first render should not trigger this reset
                        // which would empty the form instead of displaying data of existing form
                        if (shouldEmptyFormOnGeneratorIdChangeRef?.current) {
                            //creating empty table depending on existing generator
                            let reactiveCapabilityCurvePoints = [
                                getModificationRowEmptyFormData(),
                                getModificationRowEmptyFormData(),
                            ];
                            if (value?.reactiveCapabilityCurvePoints) {
                                reactiveCapabilityCurvePoints = [];
                            }
                            value?.reactiveCapabilityCurvePoints?.forEach(
                                (element) => {
                                    reactiveCapabilityCurvePoints.push({
                                        [P]: null,
                                        [Q_MIN_P]: null,
                                        [Q_MAX_P]: null,
                                        [OLD_P]: element.p ?? null,
                                        [OLD_Q_MIN_P]: element.qminP ?? null,
                                        [OLD_Q_MAX_P]: element.qmaxP ?? null,
                                    });
                                }
                            );
                            // resets all fields except EQUIPMENT_ID and REACTIVE_CAPABILITY_CURVE_TABLE
                            resetForm(
                                {
                                    [EQUIPMENT_ID]: watchEquipmentId,
                                    [REACTIVE_CAPABILITY_CURVE_TABLE]:
                                        reactiveCapabilityCurvePoints,
                                    [REACTIVE_CAPABILITY_CURVE_CHOICE]:
                                        value?.minMaxReactiveLimits != null
                                            ? 'MINMAX'
                                            : 'CURVE',
                                    [VOLTAGE_REGULATION_TYPE]:
                                        value?.regulatingTerminalVlId ||
                                        value?.regulatingTerminalConnectableId
                                            ? REGULATION_TYPES.DISTANT.id
                                            : REGULATION_TYPES.LOCAL.id,
                                    [OLD_VOLTAGE_LEVEL]:
                                        value?.regulatingTerminalVlId,
                                    [OLD_EQUIPMENT]:
                                        value?.regulatingTerminalConnectableId,
                                },
                                true
                            );
                        }
                        shouldEmptyFormOnGeneratorIdChangeRef.current = true;
                        setGeneratorToModify(value);
                    }
                })
                .catch(() => setGeneratorToModify(null));
        } else {
            resetForm();
            setGeneratorToModify(null);
        }
    }, [
        watchEquipmentId,
        studyUuid,
        currentNodeUuid,
        setGeneratorToModify,
        clearErrors,
        resetForm,
    ]);

    const energySourceLabelId = getEnergySourceLabel(
        generatorToModify?.energySource
    );
    const previousEnergySourceLabel = energySourceLabelId
        ? intl.formatMessage({
              id: energySourceLabelId,
          })
        : undefined;
    const areIdsEqual = useCallback((val1, val2) => val1 === val2, []);

    const generatorIdField = (
        <AutocompleteInput
            allowNewValue
            name={EQUIPMENT_ID}
            label={'ID'}
            options={equipmentOptions}
            formProps={{ ...filledTextField }}
            size={'small'}
            isOptionEqualToValue={areIdsEqual}
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
            label={'EnergySourceText'}
            options={ENERGY_SOURCES}
            fullWidth
            size={'small'}
            formProps={{ ...italicFontTextField, ...filledTextField }}
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
            label={'TransientReactance'}
            adornment={OhmAdornment}
            previousValue={generatorToModify?.transientReactance}
        />
    );

    const transformerReactanceField = (
        <FloatInput
            name={TRANSFORMER_REACTANCE}
            label={'TransformerReactance'}
            adornment={OhmAdornment}
            previousValue={generatorToModify?.stepUpTransformerReactance}
        />
    );

    const plannedActivePowerSetPointField = (
        <FloatInput
            name={PLANNED_ACTIVE_POWER_SET_POINT}
            label={'PlannedActivePowerSetPoint'}
            adornment={ActivePowerAdornment}
            previousValue={generatorToModify?.plannedActivePowerSetPoint}
        />
    );

    const startupCostField = (
        <FloatInput
            name={STARTUP_COST}
            label={'StartupCost'}
            previousValue={generatorToModify?.startupCost}
        />
    );

    const marginalCostField = (
        <FloatInput
            name={MARGINAL_COST}
            label={'MarginalCost'}
            previousValue={generatorToModify?.marginalCost}
        />
    );

    const plannedOutageRateField = (
        <FloatInput
            name={PLANNED_OUTAGE_RATE}
            label={'PlannedOutageRate'}
            previousValue={generatorToModify?.plannedOutageRate}
        />
    );

    const forcedOutageRateField = (
        <FloatInput
            name={FORCED_OUTAGE_RATE}
            label={'ForcedOutageRate'}
            previousValue={generatorToModify?.forcedOutageRate}
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                {gridItem(generatorIdField, 4)}
                {gridItem(generatorNameField, 4)}
                {gridItem(energySourceField, 4)}
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
                {gridItem(minimumActivePowerField, 4)}
                {gridItem(maximumActivePowerField, 4)}
                {gridItem(ratedNominalPowerField, 4)}
            </Grid>

            {/* Reactive limits part */}
            <ReactiveLimitsForm
                generatorToModify={generatorToModify}
                updatePreviousReactiveCapabilityCurveTable={
                    updatePreviousReactiveCapabilityCurveTable
                }
            />

            {/* Set points part */}
            <SetPointsForm
                studyUuid={studyUuid}
                currentNodeUuid={currentNodeUuid}
                voltageLevelOptions={voltageLevelOptions}
                isGeneratorModification={true}
                previousValues={generatorToModify}
            />

            {/* Short Circuit of start part */}
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

export default GeneratorModificationForm;
