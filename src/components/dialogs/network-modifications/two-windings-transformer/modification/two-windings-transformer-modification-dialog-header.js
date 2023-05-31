/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { EQUIPMENT_ID, EQUIPMENT_NAME } from 'components/utils/field-constants';
import React, { useEffect, useState } from 'react';
import { filledTextField, gridItem } from '../../../dialogUtils';
import TextInput from 'components/utils/rhf-inputs/text-input';
import { fetchEquipmentsIds } from '../../../../../utils/rest-api';
import AutocompleteInput from '../../../../utils/rhf-inputs/autocomplete-input';
import { getObjectId } from '../../../../utils/utils';
import { useWatch } from 'react-hook-form';

const TwoWindingsTransformerModificationDialogHeader = ({
    studyUuid,
    currentNode,
    onEquipmentIdChange,
    equipmentToModify,
}) => {
    const [equipmentOptions, setEquipmentOptions] = useState([]);
    const watchEquipmentId = useWatch({
        name: EQUIPMENT_ID,
    });

    useEffect(() => {
        onEquipmentIdChange(watchEquipmentId);
    }, [watchEquipmentId, onEquipmentIdChange]);

    useEffect(() => {
        fetchEquipmentsIds(
            studyUuid,
            currentNode?.id,
            undefined,
            'TWO_WINDINGS_TRANSFORMER',
            true
        ).then((values) => {
            setEquipmentOptions(values.sort((a, b) => a.localeCompare(b)));
        });
    }, [studyUuid, currentNode?.id]);

    const twoWindingsTransformerIdField = (
        <AutocompleteInput
            allowNewValue
            forcePopupIcon
            name={`${EQUIPMENT_ID}`}
            label="ID"
            options={equipmentOptions}
            getOptionLabel={getObjectId}
            outputTransform={getObjectId}
            size={'small'}
            formProps={{ autoFocus: true, ...filledTextField }}
        />
    );

    const twoWindingsTransformerNameField = (
        <TextInput
            name={`${EQUIPMENT_NAME}`}
            label="Name"
            formProps={filledTextField}
            previousValue={equipmentToModify?.name}
            clearable
        />
    );

    return (
        <Grid container item spacing={2}>
            {gridItem(twoWindingsTransformerIdField, 4)}
            {gridItem(twoWindingsTransformerNameField, 4)}
        </Grid>
    );
};

export default TwoWindingsTransformerModificationDialogHeader;
