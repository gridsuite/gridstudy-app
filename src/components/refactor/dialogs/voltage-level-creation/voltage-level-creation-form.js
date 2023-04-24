/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import {
    BUS_BAR_COUNT,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    HIGH_SHORT_CIRCUIT_CURRENT_LIMIT,
    HIGH_VOLTAGE_LIMIT,
    LOW_SHORT_CIRCUIT_CURRENT_LIMIT,
    LOW_VOLTAGE_LIMIT,
    NOMINAL_VOLTAGE,
    SECTION_COUNT,
    SUBSTATION_ID,
} from 'components/refactor/utils/field-constants';
import React, { useEffect, useState } from 'react';
import { fetchEquipmentsIds } from 'utils/rest-api';
import {
    gridItem,
    GridSection,
    VoltageAdornment,
    KiloAmpereAdornment,
} from 'components/dialogs/dialogUtils';
import FloatInput from 'components/refactor/rhf-inputs/float-input';
import TextInput from 'components/refactor/rhf-inputs/text-input';
import AutocompleteInput from 'components/refactor/rhf-inputs/autocomplete-input';
import { getObjectId } from 'components/refactor/utils/utils';
import { Box } from '@mui/material';
import IntegerInput from 'components/refactor/rhf-inputs/integer-input';

import { CouplingOmnibusForm } from './coupling-omnibus/coupling-omnibus-form';
import { SwitchesBetweenSections } from './switches-between-sections/switches-between-sections';
import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
    padding: {
        paddingLeft: theme.spacing(2),
    },
}));

const VoltageLevelCreationForm = ({ currentNode, studyUuid }) => {
    const classes = useStyles();
    const currentNodeUuid = currentNode?.id;
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
        <TextInput
            name={EQUIPMENT_ID}
            label={'ID'}
            formProps={{ autoFocus: true, margin: 'normal' }}
        />
    );

    const voltageLevelNameField = (
        <TextInput
            name={EQUIPMENT_NAME}
            label={'Name'}
            formProps={{ margin: 'normal' }}
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
            formProps={{ margin: 'normal' }}
        />
    );

    const nominalVoltageField = (
        <FloatInput
            name={NOMINAL_VOLTAGE}
            label={'NominalVoltage'}
            adornment={VoltageAdornment}
        />
    );

    const lowVoltageLimitField = (
        <FloatInput
            name={LOW_VOLTAGE_LIMIT}
            label={'LowVoltageLimit'}
            adornment={VoltageAdornment}
        />
    );

    const highVoltageLimitField = (
        <FloatInput
            name={HIGH_VOLTAGE_LIMIT}
            label={'HighVoltageLimit'}
            adornment={VoltageAdornment}
        />
    );

    const lowShortCircuitCurrentLimitField = (
        <FloatInput
            name={LOW_SHORT_CIRCUIT_CURRENT_LIMIT}
            label={'LowShortCircuitCurrentLimit'}
            adornment={KiloAmpereAdornment}
        />
    );

    const highShortCircuitCurrentLimitField = (
        <FloatInput
            name={HIGH_SHORT_CIRCUIT_CURRENT_LIMIT}
            label={'HighShortCircuitCurrentLimit'}
            adornment={KiloAmpereAdornment}
        />
    );

    const busBarCountField = (
        <IntegerInput name={BUS_BAR_COUNT} label={'BusBarCount'} />
    );

    const sectionCountField = (
        <IntegerInput name={SECTION_COUNT} label={'SectionCount'} />
    );

    const couplingOmnibusForm = <CouplingOmnibusForm />;

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
                <Box sx={{ width: '100%' }} />
            </Grid>
            <GridSection title={'BusBarSections'} />
            <Grid container spacing={2}>
                {gridItem(busBarCountField, 4)}
                {gridItem(sectionCountField, 4)}
                <SwitchesBetweenSections />
            </Grid>
            <GridSection title={'Coupling_Omnibus'} />
            <Grid container className={classes.padding}>
                {gridItem(couplingOmnibusForm, 12)}
            </Grid>
        </>
    );
};

export default VoltageLevelCreationForm;
