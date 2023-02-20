/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import {
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    SUSCEPTANCE_PER_SECTION,
    CHARACTERISTICS_CHOICES,
    CHARACTERISTICS_CHOICE,
    Q_AT_NOMINAL_V,
    SHUNT_COMPENSATOR_TYPE,
    SHUNT_COMPENSATOR_TYPES,
} from 'components/refactor/utils/field-constants';
import React, { useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';
import {
    filledTextField,
    gridItem,
    GridSection,
    SusceptanceAdornment,
    ReactivePowerAdornment,
} from '../../../dialogs/dialogUtils';

import TextInput from '../../rhf-inputs/text-input';
import { ConnectivityForm } from '../connectivity/connectivity-form';
import FloatInput from 'components/refactor/rhf-inputs/float-input';
import RadioInput from 'components/refactor/rhf-inputs/radio-input';
import EnumInput from 'components/refactor/rhf-inputs/enum-input';
import { Box } from '@mui/material';
import { fetchVoltageLevelsIdAndTopology } from 'utils/rest-api';

const ShuntCompensatorCreationForm = ({ studyUuid, currentNode }) => {
    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);

    useEffect(() => {
        if (studyUuid && currentNode?.id)
            fetchVoltageLevelsIdAndTopology(studyUuid, currentNode?.id).then(
                (values) => {
                    setVoltageLevelOptions(
                        values.sort((a, b) => a?.id?.localeCompare(b?.id))
                    );
                }
            );
    }, [studyUuid, currentNode?.id]);

    const shuntCompensatorIdField = (
        <TextInput
            name={EQUIPMENT_ID}
            label={'ID'}
            formProps={{ autoFocus: true, ...filledTextField }}
        />
    );

    const shuntCompensatorNameField = (
        <TextInput
            name={EQUIPMENT_NAME}
            label={'Name'}
            formProps={filledTextField}
        />
    );

    const reactivePowerControlField = (
        <RadioInput
            name={CHARACTERISTICS_CHOICE}
            possibleValues={Object.values(CHARACTERISTICS_CHOICES)}
        />
    );

    const susceptancePerSectionField = (
        <FloatInput
            name={SUSCEPTANCE_PER_SECTION}
            label={'ShuntSusceptancePerSection'}
            adornment={SusceptanceAdornment}
        />
    );

    const connectivityForm = (
        <ConnectivityForm
            withPosition={true}
            voltageLevelOptions={voltageLevelOptions}
            studyUuid={studyUuid}
            currentNode={currentNode}
        />
    );

    const reactiveNominalPower = (
        <FloatInput
            name={Q_AT_NOMINAL_V}
            label={'QatNominalV'}
            adornment={ReactivePowerAdornment}
        />
    );

    const reactiveNominalPowerType = (
        <EnumInput
            options={Object.values(SHUNT_COMPENSATOR_TYPES)}
            name={SHUNT_COMPENSATOR_TYPE}
            label={'Type'}
            size={'small'}
        />
    );

    const reactivePowerControlChoice = useWatch({
        name: CHARACTERISTICS_CHOICE,
    });

    return (
        <>
            <Grid container spacing={2}>
                {gridItem(shuntCompensatorIdField, 4)}
                {gridItem(shuntCompensatorNameField, 4)}
            </Grid>
            <GridSection title="Connectivity" />
            <Grid container spacing={2}>
                {gridItem(connectivityForm, 12)}
            </Grid>
            <GridSection title="Characteristics" />
            <Grid container spacing={2}>
                {gridItem(reactivePowerControlField, 12)}
                {reactivePowerControlChoice ===
                    CHARACTERISTICS_CHOICES.SUSCEPTANCE.id &&
                    gridItem(susceptancePerSectionField, 4)}
                {reactivePowerControlChoice ===
                    CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id &&
                    gridItem(reactiveNominalPowerType, 4)}
                <Box sx={{ width: '100%' }} />
                {reactivePowerControlChoice ===
                    CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id &&
                    gridItem(reactiveNominalPower, 4)}
            </Grid>
        </>
    );
};

export default ShuntCompensatorCreationForm;
