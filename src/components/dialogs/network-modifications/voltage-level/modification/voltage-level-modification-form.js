/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useState } from 'react';
import { fetchEquipmentsIds } from 'utils/rest-api';
import AutocompleteInput from 'components/utils/rhf-inputs/autocomplete-input';
import { getObjectId } from 'components/utils/utils';
import {
    EQUIPMENT_NAME,
    HIGH_SHORT_CIRCUIT_CURRENT_LIMIT,
    HIGH_VOLTAGE_LIMIT,
    LOW_SHORT_CIRCUIT_CURRENT_LIMIT,
    LOW_VOLTAGE_LIMIT,
    NOMINAL_VOLTAGE,
    SUBSTATION_ID,
} from 'components/utils/field-constants';
import TextInput from 'components/utils/rhf-inputs/text-input';
import FloatInput from 'components/utils/rhf-inputs/float-input';
import {
    filledTextField,
    gridItem,
    GridSection,
    KiloAmpereAdornment,
    VoltageAdornment,
} from '../../../dialogUtils';
import Grid from '@mui/material/Grid';
import { TextField } from '@mui/material';

const VoltageLevelModificationForm = ({
    studyUuid,
    currentNodeUuid,
    voltageLevelInfos,
    equipmentId,
}) => {
    const [substations, setSubstations] = useState([]);

    useEffect(() => {
        if (studyUuid && currentNodeUuid) {
            fetchEquipmentsIds(
                studyUuid,
                currentNodeUuid,
                undefined,
                'SUBSTATION',
                true
            ).then((values) => {
                setSubstations(values.sort((a, b) => a.localeCompare(b)));
            });
        }
    }, [studyUuid, currentNodeUuid]);

    const voltageLevelIdField = (
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

    const voltageLevelNameField = (
        <TextInput
            name={EQUIPMENT_NAME}
            label={'Name'}
            formProps={filledTextField}
            clearable
            previousValue={voltageLevelInfos?.name}
        />
    );

    const substationField = (
        <AutocompleteInput
            allowNewValue
            forcePopupIcon
            //hack to work with freesolo autocomplete
            //setting null programatically when freesolo is enable wont empty the field
            name={SUBSTATION_ID}
            label="SUBSTATION"
            options={substations}
            getOptionLabel={getObjectId}
            inputTransform={(value) => (value === null ? '' : value)}
            outputTransform={(value) => value}
            size={'small'}
            formProps={filledTextField}
            disabled //TODO to be removed when it is possible to change the substation of a voltage level in the backend (Powsybl)
        />
    );

    const nominalVoltageField = (
        <FloatInput
            name={NOMINAL_VOLTAGE}
            label={'NominalVoltage'}
            adornment={VoltageAdornment}
            clearable
            previousValue={voltageLevelInfos?.nominalVoltage}
        />
    );

    const lowVoltageLimitField = (
        <FloatInput
            name={LOW_VOLTAGE_LIMIT}
            label={'LowVoltageLimit'}
            adornment={VoltageAdornment}
            clearable
            previousValue={voltageLevelInfos?.lowVoltageLimit}
        />
    );

    const highVoltageLimitField = (
        <FloatInput
            name={HIGH_VOLTAGE_LIMIT}
            label={'HighVoltageLimit'}
            adornment={VoltageAdornment}
            clearable
            previousValue={voltageLevelInfos?.highVoltageLimit}
        />
    );

    const lowShortCircuitCurrentLimitField = (
        <FloatInput
            name={LOW_SHORT_CIRCUIT_CURRENT_LIMIT}
            label={'LowShortCircuitCurrentLimit'}
            adornment={KiloAmpereAdornment}
            clearable
            previousValue={voltageLevelInfos?.ipMin}
        />
    );

    const highShortCircuitCurrentLimitField = (
        <FloatInput
            name={HIGH_SHORT_CIRCUIT_CURRENT_LIMIT}
            label={'HighShortCircuitCurrentLimit'}
            adornment={KiloAmpereAdornment}
            clearable
            previousValue={voltageLevelInfos?.ipMax}
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                {gridItem(voltageLevelIdField, 4)}
                {gridItem(voltageLevelNameField, 4)}
                {gridItem(substationField, 4)}
            </Grid>
            <GridSection title={'VoltageText'} />
            <Grid container spacing={2}>
                {gridItem(nominalVoltageField, 4)}
                {gridItem(lowVoltageLimitField, 4)}
                {gridItem(highVoltageLimitField, 4)}
            </Grid>
            <GridSection title={'ShortCircuit'} />
            <Grid container spacing={2}>
                {gridItem(lowShortCircuitCurrentLimitField, 4)}
                {gridItem(highShortCircuitCurrentLimitField, 4)}
            </Grid>
        </>
    );
};

export default VoltageLevelModificationForm;
