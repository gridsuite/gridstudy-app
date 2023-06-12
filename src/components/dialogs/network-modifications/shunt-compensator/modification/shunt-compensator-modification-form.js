/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CharacteristicsForm } from '../characteristics-pane/characteristics-form';
import React, { useEffect, useState } from 'react';
import TextInput from '../../../../utils/rhf-inputs/text-input';
import {
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
} from '../../../../utils/field-constants';
import { filledTextField, gridItem, GridSection } from '../../../dialogUtils';
import Grid from '@mui/material/Grid';
import AutocompleteInput from '../../../../utils/rhf-inputs/autocomplete-input';
import { areIdsEqual, getObjectId } from '../../../../utils/utils';
import { fetchEquipmentsIds } from '../../../../../utils/rest-api';
import { useWatch } from 'react-hook-form';

const ShuntCompensatorModificationForm = ({
    studyUuid,
    currentNodeUuid,
    onEquipmentIdChange,
    shuntCompensatorInfos,
}) => {
    const [shuntCompensatorOptions, setShuntCompensatorOptions] = useState([]);
    const watchShuntCompensatorId = useWatch({
        name: `${EQUIPMENT_ID}`,
    });

    useEffect(() => {
        onEquipmentIdChange(watchShuntCompensatorId);
    }, [watchShuntCompensatorId, onEquipmentIdChange]);

    useEffect(() => {
        fetchEquipmentsIds(
            studyUuid,
            currentNodeUuid,
            undefined,
            'SHUNT_COMPENSATOR',
            true
        ).then((values) => {
            setShuntCompensatorOptions(
                values.sort((a, b) => a.localeCompare(b))
            );
        });
    }, [studyUuid, currentNodeUuid]);

    const shuntCompensatorIdField = (
        <AutocompleteInput
            isOptionEqualToValue={areIdsEqual}
            allowNewValue
            forcePopupIcon
            name={EQUIPMENT_ID}
            label={'ID'}
            options={shuntCompensatorOptions}
            getOptionLabel={getObjectId}
            outputTransform={getObjectId}
            size={'small'}
            formProps={{ autoFocus: true, ...filledTextField }}
        />
    );

    const shuntCompensatorNameField = (
        <TextInput
            name={EQUIPMENT_NAME}
            label={'Name'}
            formProps={filledTextField}
            previousValue={shuntCompensatorInfos?.name}
        />
    );

    const characteristicsForm = (
        <CharacteristicsForm previousValues={shuntCompensatorInfos} />
    );

    return (
        <>
            <Grid container spacing={2}>
                {gridItem(shuntCompensatorIdField, 4)}
                {gridItem(shuntCompensatorNameField, 4)}
            </Grid>
            <GridSection title="Characteristics" />
            <Grid container spacing={2}>
                {gridItem(characteristicsForm, 12)}
            </Grid>
        </>
    );
};

export default ShuntCompensatorModificationForm;
