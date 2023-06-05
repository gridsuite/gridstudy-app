/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import TextInput from 'components/utils/rhf-inputs/text-input';
import {
    ENERGY_SOURCE,
    //EQUIPMENT_ID,
    EQUIPMENT_NAME,
    FORCED_OUTAGE_RATE,
    MARGINAL_COST,
    MAXIMUM_ACTIVE_POWER,
    MINIMUM_ACTIVE_POWER,
    PLANNED_ACTIVE_POWER_SET_POINT,
    PLANNED_OUTAGE_RATE,
    RATED_NOMINAL_POWER,
    STARTUP_COST,
    TRANSFORMER_REACTANCE,
    TRANSIENT_REACTANCE,
} from 'components/utils/field-constants';
import {
    ActivePowerAdornment,
    filledTextField,
    gridItem,
    GridSection,
    MVAPowerAdornment,
    OhmAdornment,
} from '../../../dialogUtils';
import SelectInput from 'components/utils/rhf-inputs/select-input';
import {
    ENERGY_SOURCES,
    getEnergySourceLabel,
} from 'components/network/constants';
import Grid from '@mui/material/Grid';
import React, { useEffect, useState } from 'react';
import FloatInput from 'components/utils/rhf-inputs/float-input';
import {
    //fetchEquipmentsIds,
    fetchVoltageLevelsIdAndTopology,
} from 'utils/rest-api';
import ReactiveLimitsForm from '../reactive-limits/reactive-limits-form';
import SetPointsForm from '../set-points/set-points-form';
import { FormattedMessage, useIntl } from 'react-intl';

const GeneratorModificationForm = ({
    studyUuid,
    currentNode,
    //onEquipmentIdChange,
    generatorToModify,
    updatePreviousReactiveCapabilityCurveTable,
}) => {
    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);
    // [equipmentOptions, setEquipmentOptions] = useState([]); // TODO CHARLY remove this
    const currentNodeUuid = currentNode?.id;
    const intl = useIntl();

    // const watchEquipmentId = useWatch({ // TODO CHARLY remove this
    //     name: EQUIPMENT_ID,
    // });

    // useEffect(() => {
    //     onEquipmentIdChange(watchEquipmentId);
    // }, [watchEquipmentId, onEquipmentIdChange]);

    useEffect(() => {
        if (studyUuid && currentNodeUuid) {
            fetchVoltageLevelsIdAndTopology(studyUuid, currentNodeUuid).then(
                (values) => {
                    setVoltageLevelOptions(
                        values.sort((a, b) => a.id.localeCompare(b.id))
                    );
                }
            );
            // fetchEquipmentsIds( // TODO CHARLY remove this
            //     studyUuid,
            //     currentNodeUuid,
            //     undefined,
            //     'GENERATOR',
            //     true
            // ).then((values) => {
            //     setEquipmentOptions(values.sort());
            // });
        }
    }, [studyUuid, currentNodeUuid]);

    const energySourceLabelId = getEnergySourceLabel(
        generatorToModify?.energySource
    );
    const previousEnergySourceLabel = energySourceLabelId
        ? intl.formatMessage({
              id: energySourceLabelId,
          })
        : undefined;
    //const areIdsEqual = useCallback((val1, val2) => val1 === val2, []); // TODO CHARLY remove this

    // const generatorIdField = (
    //     <AutocompleteInput
    //         allowNewValue
    //         forcePopupIcon
    //         name={EQUIPMENT_ID}
    //         label={'ID'}
    //         options={equipmentOptions}
    //         formProps={{ ...filledTextField }}
    //         size={'small'}
    //         isOptionEqualToValue={areIdsEqual}
    //     />
    // );

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
            previousValue={
                isNaN(generatorToModify?.stepUpTransformerReactance)
                    ? null
                    : generatorToModify?.stepUpTransformerReactance
            }
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
                {/*{gridItem(generatorIdField, 4)}*/}
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
