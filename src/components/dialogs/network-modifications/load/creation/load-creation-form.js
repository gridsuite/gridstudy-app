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
    LOAD_TYPE,
    P0,
    Q0,
} from 'components/utils/field-constants';
import React, { useEffect, useState } from 'react';
import {
    ActivePowerAdornment,
    filledTextField,
    gridItem,
    GridSection,
    ReactivePowerAdornment,
} from '../../../dialogUtils';
import { LOAD_TYPES } from 'components/network/constants';
import { FloatInput } from '@gridsuite/commons-ui';
import { SelectInput } from '@gridsuite/commons-ui';
import { TextInput } from '@gridsuite/commons-ui';
import { ConnectivityForm } from '../../../connectivity/connectivity-form';

import { fetchVoltageLevelsListInfos } from '../../../../../services/study/network';
import PropertiesForm from '../../common/properties/properties-form';

const LoadCreationForm = ({ currentNode, studyUuid }) => {
    const currentNodeUuid = currentNode?.id;
    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);

    useEffect(() => {
        if (studyUuid && currentNodeUuid) {
            fetchVoltageLevelsListInfos(studyUuid, currentNodeUuid).then(
                (values) => {
                    setVoltageLevelOptions(
                        values.sort((a, b) => a.id.localeCompare(b.id))
                    );
                }
            );
        }
    }, [studyUuid, currentNodeUuid]);

    const loadIdField = (
        <TextInput
            name={EQUIPMENT_ID}
            label={'ID'}
            formProps={{ autoFocus: true, ...filledTextField }}
        />
    );

    const loadNameField = (
        <TextInput
            name={EQUIPMENT_NAME}
            label={'Name'}
            formProps={filledTextField}
        />
    );

    const loadTypeField = (
        <SelectInput
            name={LOAD_TYPE}
            label="Type"
            options={LOAD_TYPES}
            fullWidth
            size={'small'}
            formProps={filledTextField}
        />
    );

    const activePowerField = (
        <FloatInput
            name={P0}
            label={'ActivePowerText'}
            adornment={ActivePowerAdornment}
        />
    );

    const reactivePowerField = (
        <FloatInput
            name={Q0}
            label={'ReactivePowerText'}
            adornment={ReactivePowerAdornment}
        />
    );

    const connectivityForm = (
        <ConnectivityForm
            voltageLevelOptions={voltageLevelOptions}
            withPosition={true}
            studyUuid={studyUuid}
            currentNode={currentNode}
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                {gridItem(loadIdField, 4)}
                {gridItem(loadNameField, 4)}
                {gridItem(loadTypeField, 4)}
            </Grid>
            <GridSection title="Connectivity" />
            <Grid container spacing={2}>
                {gridItem(connectivityForm, 12)}
            </Grid>
            <GridSection title="Setpoints" />
            <Grid container spacing={2}>
                {gridItem(activePowerField, 4)}
                {gridItem(reactivePowerField, 4)}
            </Grid>
            <PropertiesForm networkElementType={'load'} />
        </>
    );
};

export default LoadCreationForm;
