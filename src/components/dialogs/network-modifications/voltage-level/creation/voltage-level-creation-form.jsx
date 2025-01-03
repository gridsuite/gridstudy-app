/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    BUS_BAR_COUNT,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    HIGH_SHORT_CIRCUIT_CURRENT_LIMIT,
    HIGH_VOLTAGE_LIMIT,
    LOW_SHORT_CIRCUIT_CURRENT_LIMIT,
    LOW_VOLTAGE_LIMIT,
    NOMINAL_V,
    SECTION_COUNT,
    SUBSTATION_ID,
} from 'components/utils/field-constants';
import { useEffect, useState } from 'react';
import { VoltageAdornment, KiloAmpereAdornment } from 'components/dialogs/dialog-utils';
import { FloatInput } from '@gridsuite/commons-ui';
import { TextInput } from '@gridsuite/commons-ui';
import { AutocompleteInput } from '@gridsuite/commons-ui';
import { getObjectId } from 'components/utils/utils';
import { Box, Grid } from '@mui/material';
import { IntegerInput } from '@gridsuite/commons-ui';

import { CouplingOmnibusForm } from '../coupling-omnibus/coupling-omnibus-form';
import { SwitchesBetweenSections } from '../switches-between-sections/switches-between-sections';
import { fetchEquipmentsIds } from '../../../../../services/study/network-map';
import PropertiesForm from '../../common/properties/properties-form';
import { useWatch } from 'react-hook-form';
import GridItem from '../../../commons/grid-item';
import GridSection from '../../../commons/grid-section';

const VoltageLevelCreationForm = ({ currentNode, studyUuid }) => {
    const currentNodeUuid = currentNode?.id;
    const [substations, setSubstations] = useState([]);

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

    return (
        <>
            <Grid container spacing={2}>
                <GridItem size={4}>{voltageLevelIdField}</GridItem>
                <GridItem size={4}>{voltageLevelNameField}</GridItem>
                <GridItem size={4}>{substationField}</GridItem>
            </Grid>
            <GridSection title={'VoltageText'} />
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
