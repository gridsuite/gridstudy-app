/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    BUS_BAR_COUNT,
    COUNTRY,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    EQUIPMENT_SUBSTATION_ID,
    EQUIPMENT_SUBSTATION_NAME,
    HIGH_SHORT_CIRCUIT_CURRENT_LIMIT,
    HIGH_VOLTAGE_LIMIT,
    LOW_SHORT_CIRCUIT_CURRENT_LIMIT,
    LOW_VOLTAGE_LIMIT,
    NOMINAL_V,
    SECTION_COUNT,
    SUBSTATION_ID,
} from 'components/utils/field-constants';
import { useCallback, useEffect, useState } from 'react';
import { filledTextField, KiloAmpereAdornment, VoltageAdornment } from 'components/dialogs/dialog-utils';
import { AutocompleteInput, FloatInput, IntegerInput, TextInput } from '@gridsuite/commons-ui';
import { getObjectId } from 'components/utils/utils';
import { Box, Divider, Grid } from '@mui/material';

import { CouplingOmnibusForm } from '../coupling-omnibus/coupling-omnibus-form';
import { SwitchesBetweenSections } from '../switches-between-sections/switches-between-sections';
import { fetchEquipmentsIds } from '../../../../../services/study/network-map';
import PropertiesForm from '../../common/properties/properties-form';
import { useWatch } from 'react-hook-form';
import GridItem from '../../../commons/grid-item';
import GridSection from '../../../commons/grid-section';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Typography from '@mui/material/Typography';
import { useIntl } from 'react-intl';
import CountrySelectionInput from '../../../../utils/rhf-inputs/country-selection-input.jsx';
import DeleteIcon from '@mui/icons-material/Delete.js';

const VoltageLevelCreationForm = ({ currentNode, studyUuid }) => {
    const currentNodeUuid = currentNode?.id;
    const intl = useIntl();
    const [substations, setSubstations] = useState([]);
    const [showForm, setShowForm] = useState(false);

    const watchBusBarCount = useWatch({ name: BUS_BAR_COUNT });
    const watchSectionCount = useWatch({ name: SECTION_COUNT });

    useEffect(() => {
        if (studyUuid && currentNodeUuid) {
            fetchEquipmentsIds(studyUuid, currentNodeUuid, undefined, 'SUBSTATION', true).then((values) => {
                setSubstations(values.sort((a, b) => a.localeCompare(b)));
            });
        }
    }, [studyUuid, currentNodeUuid]);

    const voltageLevelIdField = (
        <TextInput name={EQUIPMENT_ID} label={'ID'} formProps={{ autoFocus: true, margin: 'normal' }} />
    );

    const voltageLevelNameField = <TextInput name={EQUIPMENT_NAME} label={'Name'} formProps={{ margin: 'normal' }} />;

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

    const nominalVoltageField = <FloatInput name={NOMINAL_V} label={'NominalVoltage'} adornment={VoltageAdornment} />;

    const lowVoltageLimitField = (
        <FloatInput name={LOW_VOLTAGE_LIMIT} label={'LowVoltageLimit'} adornment={VoltageAdornment} />
    );

    const highVoltageLimitField = (
        <FloatInput name={HIGH_VOLTAGE_LIMIT} label={'HighVoltageLimit'} adornment={VoltageAdornment} />
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

    const busBarCountField = <IntegerInput name={BUS_BAR_COUNT} label={'BusBarCount'} />;

    const sectionCountField = <IntegerInput name={SECTION_COUNT} label={'numberOfSections'} />;

    const displayOmnibus = watchBusBarCount > 1 || watchSectionCount > 1;

    const couplingOmnibusForm = <CouplingOmnibusForm />;

    const substationIdField = (
        <TextInput name={EQUIPMENT_SUBSTATION_ID} label={'equipmentSubstationId'} formProps={filledTextField} />
    );

    const substationNameField = (
        <TextInput name={EQUIPMENT_SUBSTATION_NAME} label={'equipmentSubstationName'} formProps={filledTextField} />
    );

    const substationCountryField = (
        <CountrySelectionInput name={COUNTRY} label={'Country'} formProps={filledTextField} size={'small'} />
    );

    const handleAddButton = useCallback(() => {
        setShowForm(true);
    }, []);

    const handleCloseButton = useCallback(() => {
        setShowForm(false);
    }, []);

    return (
        <>
            <Grid container spacing={2}>
                <GridItem>{voltageLevelIdField}</GridItem>
                <GridItem>{voltageLevelNameField}</GridItem>
            </Grid>
            {showForm ? (
                <Grid container spacing={2}>
                    <Divider></Divider>
                    <GridSection title={intl.formatMessage({ id: 'CreateSubstation' })} />
                    <Grid item>
                        <IconButton onClick={handleCloseButton}>
                            <DeleteIcon />
                        </IconButton>
                    </Grid>
                    <Grid container spacing={2}>
                        <GridItem size={4}>{substationIdField}</GridItem>
                        <GridItem size={4}>{substationNameField}</GridItem>
                        <GridItem size={4}>{substationCountryField}</GridItem>
                    </Grid>
                </Grid>
            ) : (
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        {substationField}
                    </Grid>
                    <Grid item xs={12} sm={6} container alignItems="center" spacing={2}>
                        <Grid item>
                            <IconButton onClick={handleAddButton}>
                                <AddCircleIcon />
                            </IconButton>
                        </Grid>
                        <Grid item>
                            <Typography>{intl.formatMessage({ id: 'CreateSubstation' })}</Typography>
                        </Grid>
                    </Grid>
                </Grid>
            )}
            <GridSection title={intl.formatMessage({ id: 'VoltageText' })} />
            <Grid container spacing={2}>
                <GridItem size={4}>{nominalVoltageField}</GridItem>
                <GridItem size={4}>{lowVoltageLimitField}</GridItem>
                <GridItem size={4}>{highVoltageLimitField}</GridItem>
            </Grid>
            <GridSection title={'ShortCircuit'} />
            <Grid container spacing={2}>
                <GridItem size={4}>{lowShortCircuitCurrentLimitField}</GridItem>
                <GridItem size={4}>{highShortCircuitCurrentLimitField}</GridItem>
                <Box sx={{ width: '100%' }} />
            </Grid>
            <GridSection title={'BusBarSections'} />
            <Grid container spacing={2}>
                <GridItem size={4}>{busBarCountField}</GridItem>
                <GridItem size={4}>{sectionCountField}</GridItem>
                <SwitchesBetweenSections />
            </Grid>
            {displayOmnibus && (
                <>
                    <GridSection title={'Coupling_Omnibus'} />
                    <Grid container>
                        <GridItem size={12}>{couplingOmnibusForm}</GridItem>
                    </Grid>
                </>
            )}
            <PropertiesForm networkElementType={'voltageLevel'} />
        </>
    );
};

export default VoltageLevelCreationForm;
