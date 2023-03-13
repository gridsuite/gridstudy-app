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
    OLD_P,
    OLD_Q_MAX_P,
    OLD_Q_MIN_P,
    P,
    PLANNED_ACTIVE_POWER_SET_POINT,
    PLANNED_OUTAGE_RATE,
    Q_MAX_P,
    Q_MIN_P,
    RATED_NOMINAL_POWER,
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
    italicFontTextField,
    MVAPowerAdornment,
    OhmAdornment,
} from '../../../../dialogs/dialogUtils';
import SelectInput from '../../../rhf-inputs/select-input';
import {
    ENERGY_SOURCES,
    getEnergySourceLabel,
} from '../../../../network/constants';
import Grid from '@mui/material/Grid';
import React, { useCallback, useEffect, useState } from 'react';
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

const GeneratorModificationForm = ({
    studyUuid,
    currentNode,
    editData,
    onClear,
    generatorToModify,
    setGeneratorToModify,
    handleReactiveCapabilityCurveTableRow,
}) => {
    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);
    const [equipmentOptions, setEquipmentOptions] = useState([]);
    const currentNodeUuid = currentNode?.id;
    const intl = useIntl();
    const { setValue, getValues, clearErrors } = useFormContext();

    const watchEquipmentId = useWatch({
        name: EQUIPMENT_ID,
    });

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

    useEffect(() => {
        clearErrors();
        setGeneratorToModify(null);
        if (watchEquipmentId) {
            fetchEquipmentInfos(
                studyUuid,
                currentNodeUuid,
                'generators',
                watchEquipmentId,
                true
            ).then((value) => {
                if (value) {
                    if (
                        editData &&
                        editData.equipmentId === getValues(EQUIPMENT_ID)
                    ) {
                        setValue(
                            REACTIVE_CAPABILITY_CURVE_TABLE,
                            editData?.reactiveCapabilityCurvePoints
                        );
                    } else {
                        let reactiveCapabilityCurvePoints = [];
                        value?.reactiveCapabilityCurvePoints?.forEach(
                            (element) => {
                                reactiveCapabilityCurvePoints.push({
                                    [P]: null,
                                    [Q_MIN_P]: null,
                                    [Q_MAX_P]: null,
                                    [OLD_P]: element.p,
                                    [OLD_Q_MIN_P]: element.qminP,
                                    [OLD_Q_MAX_P]: element.qmaxP,
                                });
                            }
                        );
                        setValue(
                            REACTIVE_CAPABILITY_CURVE_TABLE,
                            reactiveCapabilityCurvePoints
                        );
                    }
                    setGeneratorToModify(value);
                }
            });
        }
    }, [
        watchEquipmentId,
        studyUuid,
        currentNodeUuid,
        editData,
        setValue,
        setGeneratorToModify,
        getValues,
        clearErrors,
        onClear,
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
    const changeCallBack = () => {
        if (!editData) setValue(REACTIVE_CAPABILITY_CURVE_TABLE, [{}, {}]);
    };
    const generatorIdField = (
        <AutocompleteInput
            allowNewValue
            name={EQUIPMENT_ID}
            label={'ID'}
            options={equipmentOptions}
            formProps={{ ...filledTextField }}
            size={'small'}
            isOptionEqualToValue={areIdsEqual}
            onChangeCallback={changeCallBack}
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
                generatorInfos={generatorToModify}
                handleReactiveCapabilityCurveTableRow={
                    handleReactiveCapabilityCurveTableRow
                }
            />

            {/* Set points part */}
            <SetPointsForm
                studyUuid={studyUuid}
                currentNodeUuid={currentNodeUuid}
                voltageLevelOptions={voltageLevelOptions}
                isGeneratorModification={true}
                generatorInfos={generatorToModify}
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
