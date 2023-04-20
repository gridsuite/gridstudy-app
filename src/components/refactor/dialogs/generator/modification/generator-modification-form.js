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
} from '../../../utils/field-constants';
import {
    ActivePowerAdornment,
    filledTextField,
    gridItem,
    GridSection,
    MVAPowerAdornment,
    OhmAdornment,
} from '../../../../dialogs/dialogUtils';
import SelectInput from '../../../rhf-inputs/select-input';
import {
    ENERGY_SOURCES,
    getEnergySourceLabel,
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
import {
    getRowEmptyFormData,
    REMOVE,
} from '../reactive-limits/reactive-capability-curve/reactive-capability-utils';

const GeneratorModificationForm = ({
    studyUuid,
    currentNode,
    generatorToModify,
    editData,
    setValuesAndEmptyOthers,
    setIsDataFetched,
    setGeneratorToModify,
}) => {
    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);
    const [equipmentOptions, setEquipmentOptions] = useState([]);
    const currentNodeUuid = currentNode?.id;
    const intl = useIntl();
    const shouldEmptyFormOnGeneratorIdChangeRef = useRef(!editData);

    const watchEquipmentId = useWatch({
        name: EQUIPMENT_ID,
    });

    const { getValues, setValue } = useFormContext();

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

    const emptyFormAndFormatReactiveCapabilityCurveTable = useCallback(
        (value, equipmentId) => {
            //creating empty table depending on existing generator
            const reactiveCapabilityCurvePoints =
                value?.reactiveCapabilityCurvePoints
                    ? value?.reactiveCapabilityCurvePoints.map((val) => ({
                          [P]: null,
                          [Q_MIN_P]: null,
                          [Q_MAX_P]: null,
                      }))
                    : [getRowEmptyFormData(), getRowEmptyFormData()];
            // resets all fields except EQUIPMENT_ID and REACTIVE_CAPABILITY_CURVE_TABLE
            setValuesAndEmptyOthers(
                {
                    [EQUIPMENT_ID]: equipmentId,
                    [REACTIVE_CAPABILITY_CURVE_TABLE]:
                        reactiveCapabilityCurvePoints,
                    [REACTIVE_CAPABILITY_CURVE_CHOICE]:
                        value?.minMaxReactiveLimits != null
                            ? 'MINMAX'
                            : 'CURVE',
                },
                true
            );
        },
        [setValuesAndEmptyOthers]
    );

    const insertEmptyRowAtSecondToLastIndex = (table) => {
        table.splice(table.length - 1, 0, {
            [P]: null,
            [Q_MAX_P]: null,
            [Q_MIN_P]: null,
        });
    };

    const updatePreviousReactiveCapabilityCurveTable = (action, index) => {
        setGeneratorToModify((previousValue) => {
            const newRccValues = previousValue?.reactiveCapabilityCurvePoints;
            action === REMOVE
                ? newRccValues.splice(index, 1)
                : newRccValues.splice(index, 0, {
                      [P]: null,
                      [Q_MIN_P]: null,
                      [Q_MAX_P]: null,
                  });
            return {
                ...previousValue,
                reactiveCapabilityCurvePoints: newRccValues,
            };
        });
    };

    const onEquipmentIdChange = useCallback(
        (equipmentId) => {
            if (equipmentId) {
                setIsDataFetched(false);
                fetchEquipmentInfos(
                    studyUuid,
                    currentNodeUuid,
                    'generators',
                    equipmentId,
                    true
                )
                    .then((value) => {
                        if (value) {
                            // when editing modification form, first render should not trigger this reset
                            // which would empty the form instead of displaying data of existing form
                            const previousReactiveCapabilityCurveTable =
                                value.reactiveCapabilityCurvePoints;
                            if (
                                shouldEmptyFormOnGeneratorIdChangeRef?.current
                            ) {
                                emptyFormAndFormatReactiveCapabilityCurveTable(
                                    value,
                                    equipmentId
                                );
                            } else {
                                // on first render, we need to adjust the UI for the reactive capability curve table
                                const currentReactiveCapabilityCurveTable =
                                    getValues(REACTIVE_CAPABILITY_CURVE_TABLE);
                                const sizeDiff =
                                    previousReactiveCapabilityCurveTable.length -
                                    currentReactiveCapabilityCurveTable.length;

                                // if there are more values in previousValues table, we need to insert rows to current tables to match the number of previousValues table rows
                                if (sizeDiff > 0) {
                                    for (let i = 0; i < sizeDiff; i++) {
                                        insertEmptyRowAtSecondToLastIndex(
                                            currentReactiveCapabilityCurveTable
                                        );
                                    }
                                    setValue(
                                        REACTIVE_CAPABILITY_CURVE_TABLE,
                                        currentReactiveCapabilityCurveTable
                                    );
                                } else if (sizeDiff < 0) {
                                    // if there are more values in current table, we need to add rows to previousValues tables to match the number of current table rows
                                    for (let i = 0; i > sizeDiff; i--) {
                                        insertEmptyRowAtSecondToLastIndex(
                                            previousReactiveCapabilityCurveTable
                                        );
                                    }
                                }
                            }
                            shouldEmptyFormOnGeneratorIdChangeRef.current = true;
                            setGeneratorToModify({
                                ...value,
                                reactiveCapabilityCurveTable:
                                    previousReactiveCapabilityCurveTable,
                            });
                            setIsDataFetched(true);
                        }
                    })
                    .catch(() => setGeneratorToModify(null));
            } else {
                setValuesAndEmptyOthers();
                setGeneratorToModify(null);
            }
        },
        [
            setIsDataFetched,
            studyUuid,
            currentNodeUuid,
            setGeneratorToModify,
            emptyFormAndFormatReactiveCapabilityCurveTable,
            getValues,
            setValue,
            setValuesAndEmptyOthers,
        ]
    );
    useEffect(() => {
        console.log('useEffect editData -------------', editData);
        console.log(
            'useEffect watchEquipmentId -------------',
            watchEquipmentId
        );
        onEquipmentIdChange(watchEquipmentId);
    }, [watchEquipmentId, onEquipmentIdChange, editData]);

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
            forcePopupIcon
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
            label={'TransientReactance'}
            adornment={OhmAdornment}
            previousValue={generatorToModify?.transientReactance}
            clearable={true}
        />
    );

    const transformerReactanceField = (
        <FloatInput
            name={TRANSFORMER_REACTANCE}
            label={'TransformerReactance'}
            adornment={OhmAdornment}
            previousValue={generatorToModify?.stepUpTransformerReactance}
            clearable={true}
        />
    );

    const plannedActivePowerSetPointField = (
        <FloatInput
            name={PLANNED_ACTIVE_POWER_SET_POINT}
            label={'PlannedActivePowerSetPoint'}
            adornment={ActivePowerAdornment}
            previousValue={generatorToModify?.plannedActivePowerSetPoint}
            clearable={true}
        />
    );

    const startupCostField = (
        <FloatInput
            name={STARTUP_COST}
            label={'StartupCost'}
            previousValue={generatorToModify?.startupCost}
            clearable={true}
        />
    );

    const marginalCostField = (
        <FloatInput
            name={MARGINAL_COST}
            label={'MarginalCost'}
            previousValue={generatorToModify?.marginalCost}
            clearable={true}
        />
    );

    const plannedOutageRateField = (
        <FloatInput
            name={PLANNED_OUTAGE_RATE}
            label={'PlannedOutageRate'}
            previousValue={generatorToModify?.plannedOutageRate}
            clearable={true}
        />
    );

    const forcedOutageRateField = (
        <FloatInput
            name={FORCED_OUTAGE_RATE}
            label={'ForcedOutageRate'}
            previousValue={generatorToModify?.forcedOutageRate}
            clearable={true}
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
