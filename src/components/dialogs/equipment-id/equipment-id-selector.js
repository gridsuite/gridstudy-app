/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useState } from 'react';
import { fetchEquipmentsIds } from '../../../utils/rest-api';
import { filledTextField, gridItem, useStyles } from '../dialogUtils';
import { Autocomplete, TextField } from '@mui/material';
import { FieldLabel } from '../../utils/inputs/hooks-helpers';
import Grid from '@mui/material/Grid';
import { FormFiller } from '../commons/formFiller';

export const EquipmentIdSelector = ({
    studyUuid,
    currentNode,
    selectedId,
    setSelectedId,
    equipmentType,
    formProps,
    readOnly = false,
    addFiller = false,
    fillerHeight = 1,
    fillerMessageId = 'idSelector.idNeeded',
    ...props
}) => {
    const classes = useStyles();
    const currentNodeUuid = currentNode?.id;
    const [equipmentOptions, setEquipmentOptions] = useState([]);

    useEffect(() => {
        fetchEquipmentsIds(
            studyUuid,
            currentNodeUuid,
            undefined,
            equipmentType,
            true
        ).then((values) => {
            setEquipmentOptions(values.sort((a, b) => a.localeCompare(b)));
        });
    }, [studyUuid, currentNodeUuid, equipmentType]);

    const handleChange = (newId, reason) => {
        if (newId && (reason === 'createOption' || reason === 'selectOption')) {
            setSelectedId(newId);
        } else if (reason === 'clear') {
            setSelectedId(null);
        }
    };

    const equipmentIdField = (
        <Autocomplete
            value={selectedId}
            freeSolo
            size="small"
            autoComplete
            blurOnSelect
            autoSelect={false}
            forcePopupIcon
            onChange={(_, data, reason) => handleChange(data, reason)}
            onInputChange={(_, data, reason) => handleChange(data, reason)}
            options={equipmentOptions}
            renderInput={({ inputProps, ...rest }) => (
                <TextField
                    label={FieldLabel({
                        label: 'ID',
                    })}
                    FormHelperTextProps={{
                        className: classes.helperText,
                    }}
                    inputProps={{ ...inputProps, readOnly: readOnly }}
                    autoFocus
                    {...filledTextField}
                    {...rest}
                />
            )}
            {...props}
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                {gridItem(equipmentIdField, 4)}
            </Grid>
            {addFiller && (
                <FormFiller messageId={fillerMessageId} height={fillerHeight} />
            )}
        </>
    );
};
