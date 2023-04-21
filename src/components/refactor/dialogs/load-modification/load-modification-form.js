/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import TextInput from '../../rhf-inputs/text-input';
import {
    ACTIVE_POWER,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    LOAD_TYPE,
    REACTIVE_POWER,
} from '../../utils/field-constants';
import {
    ActivePowerAdornment,
    filledTextField,
    gridItem,
    GridSection,
    ReactivePowerAdornment,
} from '../../../dialogs/dialogUtils';
import SelectInput from '../../rhf-inputs/select-input';
import { getLoadTypeLabel, LOAD_TYPES } from '../../../network/constants';
import FloatInput from '../../rhf-inputs/float-input';
import Grid from '@mui/material/Grid';
import { useCallback, useEffect, useState } from 'react';
import {
    fetchEquipmentInfos,
    fetchEquipmentsIds,
} from '../../../../utils/rest-api';
import AutocompleteInput from '../../rhf-inputs/autocomplete-input';
import { useWatch } from 'react-hook-form';
import { useIntl } from 'react-intl';

const LoadModificationForm = ({ currentNode, studyUuid, setIsDataFetched }) => {
    const currentNodeUuid = currentNode?.id;
    const [equipmentOptions, setEquipmentOptions] = useState([]);
    const [loadInfos, setLoadInfos] = useState(null);
    const intl = useIntl();

    const loadId = useWatch({
        name: `${EQUIPMENT_ID}`,
    });

    useEffect(() => {
        fetchEquipmentsIds(
            studyUuid,
            currentNodeUuid,
            undefined,
            'LOAD',
            true
        ).then((values) => {
            setEquipmentOptions(values.sort((a, b) => a.localeCompare(b)));
        });
    }, [studyUuid, currentNodeUuid]);

    useEffect(() => {
        if (loadId) {
            setIsDataFetched(false);
            fetchEquipmentInfos(
                studyUuid,
                currentNodeUuid,
                'loads',
                loadId,
                true
            )
                .then((value) => {
                    if (value) {
                        setLoadInfos(value);
                    }
                })
                .finally(() => setIsDataFetched(true));
        } else {
            setLoadInfos(null);
        }
    }, [studyUuid, currentNodeUuid, loadId, setIsDataFetched]);

    const getObjectId = useCallback((object) => {
        if (typeof object === 'string') {
            return object;
        }

        return object.id;
    }, []);

    const loadIdField = (
        <AutocompleteInput
            allowNewValue
            forcePopupIcon
            name={`${EQUIPMENT_ID}`}
            label="ID"
            options={equipmentOptions}
            getOptionLabel={getObjectId}
            size={'small'}
            formProps={{ autoFocus: true, ...filledTextField }}
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
