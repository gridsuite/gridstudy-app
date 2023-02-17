/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import {
    ACTIVE_POWER,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    LOAD_TYPE,
    NOMINAL_VOLTAGE,
    REACTIVE_POWER,
    SUBSTATION_ID,
} from 'components/refactor/utils/field-constants';
import React, { useEffect, useState } from 'react';
import { fetchEquipmentsIds } from 'utils/rest-api';
import {
    filledTextField,
    gridItem,
    VoltageAdornment,
} from '../../../dialogs/dialogUtils';
import FloatInput from '../../rhf-inputs/float-input';
import SelectInput from '../../rhf-inputs/select-input';
import TextInput from '../../rhf-inputs/text-input';
import { ConnectivityForm } from '../connectivity/connectivity-form';

const VoltageLevelCreationForm = ({ currentNodeUuid, studyUuid }) => {
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
                setSubstations(
                    values
                        .map((value) => {
                            return { id: value };
                        })
                        .sort((a, b) => a.id.localeCompare(b.id))
                );
                //setSubstations(values);
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
        <SelectInput
            name={SUBSTATION_ID}
            label="SUBSTATION"
            options={substations}
            fullWidth
            size={'small'}
            formProps={filledTextField}
        />
    );

    /*  const reactivePowerField = (
        <FloatInput
            name={REACTIVE_POWER}
            label={'ReactivePowerText'}
            adornment={ReactivePowerAdornment}
        />
    );

    const connectivityForm = (
        <ConnectivityForm
            voltageLevelOptions={voltageLevelOptions}
            withPosition={true}
            studyUuid={studyUuid}
            currentNodeUuid={currentNodeUuid}
        />
    );
 */
    return (
        <>
            <Grid container spacing={2}>
                {gridItem(voltageLevelIdField, 3)}
                {gridItem(voltageLevelNameField, 3)}
                {gridItem(nominalVoltageLevelField, 3)}
                {gridItem(substationField, 3)}
            </Grid>
            {/*  <GridSection title="Connectivity" />
            <Grid container spacing={2}>
                {gridItem(connectivityForm, 12)}
            </Grid>
            <GridSection title="Setpoints" />
            <Grid container spacing={2}>
                {gridItem(activePowerField, 4)}
                {gridItem(reactivePowerField, 4)}
            </Grid> */}
        </>
    );
};

export default VoltageLevelCreationForm;
