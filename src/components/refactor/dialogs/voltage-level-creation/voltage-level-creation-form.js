/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import {
    BUS_BAR_CONNECTIONS,
    BUS_BAR_SECTIONS,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    NOMINAL_VOLTAGE,
    SUBSTATION_ID,
} from 'components/refactor/utils/field-constants';
import React, { useEffect, useState } from 'react';
import { fetchEquipmentsIds } from 'utils/rest-api';
import {
    filledTextField,
    gridItem,
    GridSection,
    VoltageAdornment,
} from 'components/dialogs/dialogUtils';
import FloatInput from 'components/refactor/rhf-inputs/float-input';
import TextInput from 'components/refactor/rhf-inputs/text-input';
import { VOLTAGE_LEVEL_COMPONENTS } from 'components/network/constants';
import { BusBarSection } from './bus-bar-section/bus-bar-section';
import AutocompleteInput from 'components/refactor/rhf-inputs/autocomplete-input';
import { getObjectId } from 'components/refactor/utils/utils';

const VoltageLevelCreationForm = ({ currentNode, studyUuid }) => {
    const currentNodeUuid = currentNode?.id;
    const [substations, setSubstations] = useState([]);

    useEffect(() => {
        if (studyUuid && currentNodeUuid)
            fetchEquipmentsIds(
                studyUuid,
                currentNodeUuid,
                undefined,
                'SUBSTATION',
                true
            ).then((values) => {
                setSubstations(values.sort((a, b) => a.localeCompare(b)));
            });
    }, [studyUuid, currentNodeUuid]);

    const voltageLevelIdField = (
        <TextInput
            name={EQUIPMENT_ID}
            label={'ID'}
            formProps={{ autoFocus: true, ...filledTextField }}
        />
    );

    const voltageLevelNameField = (
        <TextInput
            name={EQUIPMENT_NAME}
            label={'Name'}
            formProps={filledTextField}
        />
    );

    const nominalVoltageLevelField = (
        <FloatInput
            name={NOMINAL_VOLTAGE}
            label={'NominalVoltage'}
            adornment={VoltageAdornment}
            formProps={filledTextField}
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
            formProps={filledTextField}
            size={'small'}
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                {gridItem(voltageLevelIdField, 3)}
                {gridItem(voltageLevelNameField, 3)}
                {gridItem(nominalVoltageLevelField, 3)}
                {gridItem(substationField, 3)}
            </Grid>
            <Grid container>
                <GridSection title={'BusBarSections'} />
                <BusBarSection
                    id={BUS_BAR_SECTIONS}
                    type={VOLTAGE_LEVEL_COMPONENTS.BUS_BAR_SECTION_CREATION}
                />
                <GridSection title={'Connectivity'} />
                <BusBarSection
                    id={BUS_BAR_CONNECTIONS}
                    type={VOLTAGE_LEVEL_COMPONENTS.BUS_BAR_SECTION_CONNECTION}
                />
            </Grid>
        </>
    );
};

export default VoltageLevelCreationForm;
