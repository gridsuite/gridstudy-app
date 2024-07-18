/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FloatInput, SelectInput, TextInput } from '@gridsuite/commons-ui';
import {
    EQUIPMENT_NAME,
    LOAD_TYPE,
    P0,
    Q0,
} from 'components/utils/field-constants';
import {
    ActivePowerAdornment,
    filledTextField,
    gridItem,
    GridSection,
    ReactivePowerAdornment,
} from '../../../dialogUtils';
import { getLoadTypeLabel, LOAD_TYPES } from 'components/network/constants';
import Grid from '@mui/material/Grid';
import React from 'react';
import { useIntl } from 'react-intl';
import { TextField } from '@mui/material';
import PropertiesForm from '../../common/properties/properties-form';
import { ConnectivityForm } from '../../../connectivity/connectivity-form.jsx';
import useVoltageLevelsListInfos from '../../../../../hooks/use-voltage-levels-list-infos';

const LoadModificationForm = ({
    studyUuid,
    currentNode,
    loadToModify,
    equipmentId,
}) => {
    const intl = useIntl();
    const voltageLevelOptions = useVoltageLevelsListInfos(
        studyUuid,
        currentNode?.id
    );

    const loadIdField = (
        <TextField
            size="small"
            fullWidth
            label={'ID'}
            value={equipmentId}
            InputProps={{
                readOnly: true,
            }}
            disabled
            {...filledTextField}
        />
    );

    const loadNameField = (
        <TextInput
            name={EQUIPMENT_NAME}
            label={'Name'}
            formProps={filledTextField}
            previousValue={loadToModify?.name}
            clearable
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
            previousValue={
                loadToModify?.type && loadToModify.type !== 'UNDEFINED'
                    ? intl.formatMessage({
                          id: getLoadTypeLabel(loadToModify?.type),
                      })
                    : undefined
            }
        />
    );

    const activePowerField = (
        <FloatInput
            name={P0}
            label={'ActivePowerText'}
            adornment={ActivePowerAdornment}
            previousValue={loadToModify?.p0}
            clearable
        />
    );

    const reactivePowerField = (
        <FloatInput
            name={Q0}
            label={'ReactivePowerText'}
            adornment={ReactivePowerAdornment}
            previousValue={loadToModify?.q0}
            clearable
        />
    );

    const connectivityForm = (
        <ConnectivityForm
            voltageLevelOptions={voltageLevelOptions}
            withPosition={true}
            studyUuid={studyUuid}
            currentNode={currentNode}
            isEquipmentModification={true}
            previousValues={loadToModify}
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                {gridItem(loadIdField, 4)}
                {gridItem(loadNameField, 4)}
                {gridItem(loadTypeField, 4)}
            </Grid>
            {/* Connectivity part */}
            <GridSection title="Connectivity" />
            <Grid container spacing={2}>
                {gridItem(connectivityForm, 12)}
            </Grid>
            <GridSection title="Setpoints" />
            <Grid container spacing={2}>
                {gridItem(activePowerField, 4)}
                {gridItem(reactivePowerField, 4)}
            </Grid>
            <PropertiesForm networkElementType={'load'} isModification={true} />
        </>
    );
};

export default LoadModificationForm;
