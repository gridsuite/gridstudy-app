/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import { EQUIPMENT_ID, EQUIPMENT_NAME, LOAD_TYPE, P0, Q0 } from 'components/utils/field-constants';
import React, { FunctionComponent } from 'react';
import { ActivePowerAdornment, gridItem, GridSection, ReactivePowerAdornment } from '../../../dialogUtils';
import { LOAD_TYPES } from 'components/network/constants';
import { FloatInput, SelectInput, TextInput } from '@gridsuite/commons-ui';
import { ConnectivityForm } from '../../../connectivity/connectivity-form';
import PropertiesForm from '../../common/properties/properties-form';
import useVoltageLevelsListInfos from '../../../../../hooks/use-voltage-levels-list-infos';
import { UUID } from 'crypto';
import { CurrentTreeNode } from '../../../../../redux/reducer';

interface LoadCreationFormProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
}

const LoadCreationForm: FunctionComponent<LoadCreationFormProps> = ({ studyUuid, currentNode }) => {
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNode?.id);

    const loadIdField = (
        <TextInput name={EQUIPMENT_ID} label={'ID'} formProps={{ autoFocus: true, variant: 'filled' }} />
    );

    const loadNameField = <TextInput name={EQUIPMENT_NAME} label={'Name'} formProps={{ variant: 'filled' }} />;

    const loadTypeField = (
        <SelectInput
            name={LOAD_TYPE}
            label="Type"
            options={LOAD_TYPES}
            fullWidth
            size={'small'}
            formProps={{ variant: 'filled' }}
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
            previousValues={null}
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
