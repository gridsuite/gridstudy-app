/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { AutocompleteInput } from '@gridsuite/commons-ui';
import { getObjectId } from 'components/utils/utils';
import {
    EQUIPMENT_NAME,
    HIGH_SHORT_CIRCUIT_CURRENT_LIMIT,
    HIGH_VOLTAGE_LIMIT,
    LOW_SHORT_CIRCUIT_CURRENT_LIMIT,
    LOW_VOLTAGE_LIMIT,
    NOMINAL_V,
    SUBSTATION_ID,
} from 'components/utils/field-constants';
import { TextInput } from '@gridsuite/commons-ui';
import { FloatInput } from '@gridsuite/commons-ui';
import { filledTextField, GridItem, GridSection, KiloAmpereAdornment, VoltageAdornment } from '../../../dialog-utils';
import Grid from '@mui/material/Grid';
import { TextField } from '@mui/material';
import PropertiesForm from '../../common/properties/properties-form';

const VoltageLevelModificationForm = ({ voltageLevelInfos, equipmentId }) => {
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
            // Because of a mui/material bug, the disabled attribute do not work properly.
            // It should be fixed after v5.12.2. For the moment, instead of fetching the
            // substation list to display in this AutocompleteInput, we only show the current substation.
            options={[voltageLevelInfos?.substationId]}
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
            name={NOMINAL_V}
            label={'NominalVoltage'}
            adornment={VoltageAdornment}
            clearable
            previousValue={voltageLevelInfos?.nominalV}
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
            previousValue={voltageLevelInfos?.identifiableShortCircuit?.ipMin}
        />
    );

    const highShortCircuitCurrentLimitField = (
        <FloatInput
            name={HIGH_SHORT_CIRCUIT_CURRENT_LIMIT}
            label={'HighShortCircuitCurrentLimit'}
            adornment={KiloAmpereAdornment}
            clearable
            previousValue={voltageLevelInfos?.identifiableShortCircuit?.ipMax}
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                {GridItem(voltageLevelIdField, 4)}
                {GridItem(voltageLevelNameField, 4)}
                {GridItem(substationField, 4)}
            </Grid>
            <GridSection title={'VoltageText'} />
            <Grid container spacing={2}>
                {GridItem(nominalVoltageField, 4)}
                {GridItem(lowVoltageLimitField, 4)}
                {GridItem(highVoltageLimitField, 4)}
            </Grid>
            <GridSection title={'ShortCircuit'} />
            <Grid container spacing={2}>
                {GridItem(lowShortCircuitCurrentLimitField, 4)}
                {GridItem(highShortCircuitCurrentLimitField, 4)}
            </Grid>
            <PropertiesForm networkElementType={'voltageLevel'} isModification={true} />
        </>
    );
};

export default VoltageLevelModificationForm;
