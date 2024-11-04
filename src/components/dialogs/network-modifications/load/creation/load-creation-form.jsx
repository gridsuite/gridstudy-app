/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import { EQUIPMENT_ID, EQUIPMENT_NAME, LOAD_TYPE, P0, Q0 } from 'components/utils/field-constants';
import React from 'react';
import {
    ActivePowerAdornment,
    filledTextField,
    GridItem,
    GridSection,
    ReactivePowerAdornment,
} from '../../../dialog-utils';
import { LOAD_TYPES } from 'components/network/constants';
import { FloatInput, SelectInput, TextInput } from '@gridsuite/commons-ui';
import { ConnectivityForm } from '../../../connectivity/connectivity-form';
import PropertiesForm from '../../common/properties/properties-form';
import useVoltageLevelsListInfos from '../../../../../hooks/use-voltage-levels-list-infos';

const LoadCreationForm = ({ currentNode, studyUuid }) => {
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNode?.id);

    const loadIdField = (
        <TextInput name={EQUIPMENT_ID} label={'ID'} formProps={{ autoFocus: true, ...filledTextField }} />
    );

    const loadNameField = <TextInput name={EQUIPMENT_NAME} label={'Name'} formProps={filledTextField} />;

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

    const activePowerField = <FloatInput name={P0} label={'ActivePowerText'} adornment={ActivePowerAdornment} />;

    const reactivePowerField = <FloatInput name={Q0} label={'ReactivePowerText'} adornment={ReactivePowerAdornment} />;

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
                <GridItem field={loadIdField} size={4} />
                <GridItem field={loadNameField} size={4} />
                <GridItem field={loadTypeField} size={4} />
            </Grid>
            <GridSection title="Connectivity" />
            <Grid container spacing={2}>
                <GridItem field={connectivityForm} size={12} />
            </Grid>
            <GridSection title="Setpoints" />
            <Grid container spacing={2}>
                <GridItem field={activePowerField} size={4} />
                <GridItem field={loadNameField} size={4} />
                <GridItem field={reactivePowerField} size={4} />
                <GridItem field={loadNameField} size={4} />
            </Grid>
            <PropertiesForm networkElementType={'load'} />
        </>
    );
};

export default LoadCreationForm;
