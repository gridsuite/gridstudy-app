/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ADD_SUBSTATION_CREATION,
    BUS_BAR_COUNT,
    COUNTRY,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    HIGH_SHORT_CIRCUIT_CURRENT_LIMIT,
    HIGH_VOLTAGE_LIMIT,
    LOW_SHORT_CIRCUIT_CURRENT_LIMIT,
    LOW_VOLTAGE_LIMIT,
    NOMINAL_V,
    SECTION_COUNT,
    SUBSTATION_CREATION,
    SUBSTATION_CREATION_ID,
    SUBSTATION_ID,
    SUBSTATION_NAME,
} from 'components/utils/field-constants';
import { useCallback, useEffect, useState } from 'react';
import { KiloAmpereAdornment, VoltageAdornment } from 'components/dialogs/dialog-utils';
import { AutocompleteInput, FloatInput, IntegerInput, TextInput } from '@gridsuite/commons-ui';
import { Box, Grid, Paper, Tooltip } from '@mui/material';

import { CouplingOmnibusForm } from '../coupling-omnibus/coupling-omnibus-form';
import { SwitchesBetweenSections } from '../switches-between-sections/switches-between-sections';
import { fetchEquipmentsIds } from '../../../../../services/study/network-map';
import PropertiesForm from '../../common/properties/properties-form';
import { useFormContext, useWatch } from 'react-hook-form';
import GridItem from '../../../commons/grid-item';
import GridSection from '../../../commons/grid-section';
import IconButton from '@mui/material/IconButton';
import { useIntl } from 'react-intl';
import CountrySelectionInput from '../../../../utils/rhf-inputs/country-selection-input';
import DeleteIcon from '@mui/icons-material/Delete';
import LineSeparator from '../../../commons/line-separator';

const VoltageLevelCreationForm = ({ currentNode, studyUuid, currentRootNetworkUuid }) => {
    const currentNodeUuid = currentNode?.id;
    const intl = useIntl();
    const { setValue, getValues } = useFormContext();
    const [substations, setSubstations] = useState([]);
    const [isWithSubstationCreation, setIsWithSubstationCreation] = useState(false);
    const watchBusBarCount = useWatch({ name: BUS_BAR_COUNT });
    const watchSectionCount = useWatch({ name: SECTION_COUNT });
    const watchAddSubstationCreation = useWatch({ name: ADD_SUBSTATION_CREATION });
    useEffect(() => {
        setIsWithSubstationCreation(watchAddSubstationCreation);
    }, [watchAddSubstationCreation]);

    useEffect(() => {
        if (studyUuid && currentNodeUuid && currentRootNetworkUuid) {
            fetchEquipmentsIds(studyUuid, currentNodeUuid, currentRootNetworkUuid, undefined, 'SUBSTATION', true).then(
                (values) => {
                    setSubstations(values.sort((a, b) => a.localeCompare(b)));
                }
            );
        }
    }, [studyUuid, currentNodeUuid, currentRootNetworkUuid]);

    const voltageLevelIdField = (
        <TextInput name={EQUIPMENT_ID} label={'ID'} formProps={{ autoFocus: true, margin: 'normal' }} />
    );

    function getCustomPaper(children) {
        return (
            <Paper>
                <Box>
                    {children}
                    <LineSeparator />
                    <IconButton
                        color="primary"
                        fullWidth
                        sx={{ justifyContent: 'flex-start', fontSize: 'medium', marginLeft: '2%' }}
                        onMouseDown={handleAddButton}
                    >
                        {`${intl.formatMessage({ id: 'CreateSubstation' })} : ${getValues(SUBSTATION_ID)}`}
                    </IconButton>
                </Box>
            </Paper>
        );
    }

    const handleAddButton = useCallback(() => {
        setValue(SUBSTATION_CREATION_ID, getValues(SUBSTATION_ID));
        setValue(ADD_SUBSTATION_CREATION, true);
        setIsWithSubstationCreation(true);
    }, [setValue, getValues]);
    const voltageLevelNameField = <TextInput name={EQUIPMENT_NAME} label={'Name'} formProps={{ margin: 'normal' }} />;

    const substationField = (
        <AutocompleteInput
            openOnFocus
            forcePopupIcon
            name={SUBSTATION_ID}
            label="SUBSTATION"
            options={substations}
            size={'small'}
            formProps={{ margin: 'normal' }}
            PaperComponent={({ children }) => getCustomPaper(children)}
            noOptionsText={''}
            allowNewValue
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

    const substationCreationIdField = <TextInput name={SUBSTATION_CREATION_ID} label={'SubstationId'} />;
    const substationCreationNameField = <TextInput name={SUBSTATION_NAME} label={'substationName'} />;

    const substationCreationCountryField = <CountrySelectionInput name={COUNTRY} label={'Country'} size={'small'} />;

    const handleDeleteButton = useCallback(() => {
        setValue(ADD_SUBSTATION_CREATION, false);
        setIsWithSubstationCreation(false);
    }, [setValue]);

    return (
        <>
            <Grid container spacing={2}>
                <GridItem>{voltageLevelIdField}</GridItem>
                <GridItem>{voltageLevelNameField}</GridItem>
            </Grid>

            {isWithSubstationCreation ? (
                <Grid>
                    <Grid item xs={12} container spacing={2}></Grid>
                    <GridSection title={intl.formatMessage({ id: 'CreateSubstation' })} />
                    <Grid container spacing={2}>
                        <Grid item xs={4}>
                            {substationCreationIdField}
                        </Grid>
                        <Grid item xs={4}>
                            {substationCreationNameField}
                        </Grid>
                        <Grid item xs={3}>
                            {substationCreationCountryField}
                        </Grid>
                        <Grid item xs={1}>
                            <Tooltip
                                title={intl.formatMessage({
                                    id: 'DeleteRows',
                                })}
                            >
                                <IconButton onClick={handleDeleteButton}>
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                    </Grid>
                    <PropertiesForm id={SUBSTATION_CREATION} networkElementType={'substation'} />
                    <Grid item xs={12} paddingTop={2}>
                        <LineSeparator />
                    </Grid>
                </Grid>
            ) : (
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        {substationField}
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
