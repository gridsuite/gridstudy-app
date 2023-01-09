/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import React from 'react';
import { LOAD_TYPES } from '../../../network/constants';
import {
    ActivePowerAdornment,
    filledTextField,
    gridItem,
    GridSection,
    ReactivePowerAdornment,
} from '../../../dialogs/dialogUtils';

import { ConnectivityForm } from '../connectivity/connectivity-form';
import TextInput from '../../inputs/text-input';
import FloatInput from '../../inputs/float-input';
import SelectInput from '../../inputs/select-input';
import { formControlledItem } from '../../utils/form-utils';
import {
    ACTIVE_POWER,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    EQUIPMENT_TYPE,
    REACTIVE_POWER,
} from './load-creation-dialog';

const LoadCreationForm = ({ editData, currentNodeUuid, ...dialogProps }) => {
    const loadIdField = formControlledItem(
        <TextInput
            label={'ID'}
            formProps={{ autoFocus: true, ...filledTextField }}
        />,
        EQUIPMENT_ID
    );

    const loadNameField = formControlledItem(
        <TextInput label={'Name'} formProps={filledTextField} />,
        EQUIPMENT_NAME
    );

    const loadTypeField = formControlledItem(
        <SelectInput
            label="Type"
            options={LOAD_TYPES}
            fullWidth
            size={'small'}
            formProps={filledTextField}
        />,
        EQUIPMENT_TYPE
    );

    const activePowerField = formControlledItem(
        <TextInput
            label={'ActivePowerText'}
            adornment={ActivePowerAdornment}
        />,
        ACTIVE_POWER
    );

    const reactivePowerField = formControlledItem(
        <FloatInput
            label={'ReactivePowerText'}
            adornment={ReactivePowerAdornment}
        />,
        REACTIVE_POWER
    );

    const connectivityForm = (
        <ConnectivityForm label={'Connectivity'} withPosition={true} />
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
        </>
    );
};

export default LoadCreationForm;
