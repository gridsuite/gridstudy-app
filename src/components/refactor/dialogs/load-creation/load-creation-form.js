/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import {
    P0,
    ID,
    NAME,
    LOAD_TYPE,
    Q0,
} from 'components/refactor/utils/field-constants';
import React from 'react';
import {
    ActivePowerAdornment,
    filledTextField,
    gridItem,
    GridSection,
    ReactivePowerAdornment,
} from '../../../dialogs/dialogUtils';
import { LOAD_TYPES } from '../../../network/constants';
import FloatInput from '../../rhf-inputs/float-input';
import SelectInput from '../../rhf-inputs/select-input';
import TextInput from '../../rhf-inputs/text-input';
import { ConnectivityForm } from '../connectivity/connectivity-form';

const LoadCreationForm = ({ voltageLevelOptionsPromise }) => {
    const loadIdField = (
        <TextInput
            name={ID}
            label={'ID'}
            formProps={{ autoFocus: true, ...filledTextField }}
        />
    );

    const loadNameField = (
        <TextInput name={NAME} label={'Name'} formProps={filledTextField} />
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
            withPosition={true}
            voltageLevelOptionsPromise={voltageLevelOptionsPromise}
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
        </>
    );
};

export default LoadCreationForm;
