/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import { EQUIPMENT_ID, EQUIPMENT_NAME } from 'components/utils/field-constants';
import React, { useEffect, useState } from 'react';

import { filledTextField, gridItem, GridSection } from '../../../dialogUtils';

import TextInput from 'components/utils/rhf-inputs/text-input';
import { ConnectivityForm } from '../../../connectivity/connectivity-form';
import { fetchVoltageLevelsListInfos } from 'utils/rest-api';
import { CharacteristicsForm } from '../characteristics-pane/characteristics-form';

const ShuntCompensatorCreationForm = ({ studyUuid, currentNode }) => {
    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);

    useEffect(() => {
        if (studyUuid && currentNode?.id) {
            fetchVoltageLevelsListInfos(studyUuid, currentNode.id).then(
                (values) => {
                    setVoltageLevelOptions(
                        values.sort((a, b) => a?.id?.localeCompare(b?.id))
                    );
                }
            );
        }
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

    const connectivityForm = (
        <ConnectivityForm
            withPosition={true}
            voltageLevelOptions={voltageLevelOptions}
            studyUuid={studyUuid}
            currentNode={currentNode}
        />
    );

    const characteristicsForm = <CharacteristicsForm />;

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
                {gridItem(characteristicsForm, 12)}
            </Grid>
        </>
    );
};

export default ShuntCompensatorCreationForm;
