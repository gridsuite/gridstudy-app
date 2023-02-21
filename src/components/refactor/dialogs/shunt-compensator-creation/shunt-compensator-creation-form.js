/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import { Box } from '@mui/material';
import BooleanInput from 'components/refactor/rhf-inputs/boolean-input';
import IntegerInput from 'components/refactor/rhf-inputs/integer-input';
import {
    CURRENT_NUMBER_OF_SECTIONS,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    IDENTICAL_SECTIONS,
    MAXIMUM_NUMBER_OF_SECTIONS,
    SUSCEPTANCE_PER_SECTION,
} from 'components/refactor/utils/field-constants';
import React, { useEffect, useState } from 'react';
import {
    filledTextField,
    gridItem,
    GridSection,
    SusceptanceAdornment,
} from '../../../dialogs/dialogUtils';

import TextInput from '../../rhf-inputs/text-input';
import { ConnectivityForm } from '../connectivity/connectivity-form';
import FloatInput from 'components/refactor/rhf-inputs/float-input';
import { fetchVoltageLevelsIdAndTopology } from 'utils/rest-api';

const ShuntCompensatorCreationForm = ({ studyUuid, currentNode }) => {
    const disabledChecked = { disabled: true };
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

    const maximumNumberOfSectionsField = (
        <IntegerInput
            name={MAXIMUM_NUMBER_OF_SECTIONS}
            label={'ShuntMaximumNumberOfSections'}
            isInputPositiveOnly={true}
        />
    );

    const currentNumberOfSectionsField = (
        <IntegerInput
            name={CURRENT_NUMBER_OF_SECTIONS}
            label={'ShuntCurrentNumberOfSections'}
            isInputPositiveOnly={true}
        />
    );

    const identicalSectionsField = (
        <BooleanInput
            name={IDENTICAL_SECTIONS}
            label={'ShuntIdenticalSections'}
            formProps={disabledChecked}
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
                {gridItem(maximumNumberOfSectionsField, 4)}
                {gridItem(currentNumberOfSectionsField, 4)}
                <Box sx={{ width: '100%' }} />
                {gridItem(identicalSectionsField, 4)}
                {gridItem(susceptancePerSectionField, 4)}
                <Box sx={{ width: '100%' }} />
            </Grid>
        </>
    );
};

export default ShuntCompensatorCreationForm;
