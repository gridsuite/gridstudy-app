/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import TextInput from 'components/utils/rhf-inputs/text-input';
import {
    ACTIVE_POWER,
    EQUIPMENT_NAME,
    LOAD_TYPE,
    REACTIVE_POWER,
} from 'components/utils/field-constants';
import {
    ActivePowerAdornment,
    filledTextField,
    gridItem,
    GridSection,
    ReactivePowerAdornment,
} from '../../../dialogUtils';
import SelectInput from 'components/utils/rhf-inputs/select-input';
import { getLoadTypeLabel, LOAD_TYPES } from 'components/network/constants';
import FloatInput from 'components/utils/rhf-inputs/float-input';
import Grid from '@mui/material/Grid';
import React, { useEffect, useState } from 'react';
import { fetchNetworkElementInfos, FetchStatus } from 'utils/rest-api';
import { useIntl } from 'react-intl';
import {
    EQUIPMENT_INFOS_TYPES,
    EQUIPMENT_TYPES,
} from 'components/utils/equipment-types';
import { TextField } from '@mui/material';

const LoadModificationForm = ({
    currentNode,
    studyUuid,
    setDataFetchStatus,
    equipmentId,
}) => {
    const currentNodeUuid = currentNode?.id;
    const [loadInfos, setLoadInfos] = useState(null);
    const intl = useIntl();

    useEffect(() => {
        if (equipmentId) {
            setDataFetchStatus(FetchStatus.RUNNING);
            fetchNetworkElementInfos(
                studyUuid,
                currentNodeUuid,
                EQUIPMENT_TYPES.LOAD.type,
                EQUIPMENT_INFOS_TYPES.FORM.type,
                equipmentId,
                true
            )
                .then((value) => {
                    if (value) {
                        setLoadInfos(value);
                        setDataFetchStatus(FetchStatus.SUCCEED);
                    } else {
                        setDataFetchStatus(FetchStatus.FAILED);
                    }
                })
                .catch(() => {
                    setDataFetchStatus(FetchStatus.FAILED);
                });
        } else {
            setLoadInfos(null);
        }
    }, [studyUuid, currentNodeUuid, equipmentId, setDataFetchStatus]);

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
            previousValue={loadInfos?.name}
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
                loadInfos?.type && loadInfos.type !== 'UNDEFINED'
                    ? intl.formatMessage({
                          id: getLoadTypeLabel(loadInfos?.type),
                      })
                    : undefined
            }
        />
    );

    const activePowerField = (
        <FloatInput
            name={ACTIVE_POWER}
            label={'ActivePowerText'}
            adornment={ActivePowerAdornment}
            previousValue={loadInfos?.p0}
            clearable
        />
    );

    const reactivePowerField = (
        <FloatInput
            name={REACTIVE_POWER}
            label={'ReactivePowerText'}
            adornment={ReactivePowerAdornment}
            previousValue={loadInfos?.q0}
            clearable
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                {gridItem(loadIdField, 4)}
                {gridItem(loadNameField, 4)}
                {gridItem(loadTypeField, 4)}
            </Grid>
            <GridSection title="Setpoints" />
            <Grid container spacing={2}>
                {gridItem(activePowerField, 4)}
                {gridItem(reactivePowerField, 4)}
            </Grid>
        </>
    );
};

export default LoadModificationForm;
