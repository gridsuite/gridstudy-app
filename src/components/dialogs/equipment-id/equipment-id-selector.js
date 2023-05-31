/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useState } from 'react';
import { fetchEquipmentsIds } from '../../../utils/rest-api';
import { gridItem, useStyles } from '../dialogUtils';
import { Autocomplete, TextField } from '@mui/material';
import { FieldLabel } from '../../utils/inputs/hooks-helpers';
import Grid from '@mui/material/Grid';

export const EquipmentIdSelector = ({
    studyUuid,
    currentNode,
    selectedId,
    setSelectedId,
    equipmentType,
    formProps,
    readOnly = false,
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

    const handleChange = (newId) => {
        if (newId && equipmentOptions.includes(newId)) {
            setSelectedId(newId);
        }
    };

    const equipmentIdField = (
        <Autocomplete
            value={selectedId}
            freeSolo
            autoComplete={true}
            blurOnSelect={true}
            autoSelect={false}
            onChange={(_, data) => handleChange(data)}
            onInputChange={(_, data) => handleChange(data)}
            options={equipmentOptions}
            renderInput={({ inputProps, ...rest }) => (
                <TextField
                    label={FieldLabel({
                        label: 'ID',
                        optional: !props?.disabled,
                    })}
                    FormHelperTextProps={{
                        className: classes.helperText,
                    }}
                    inputProps={{ ...inputProps, readOnly: readOnly }}
                    {...formProps}
                    {...rest}
                />
            )}
            {...props}
        />
    );

    return (
        <Grid container spacing={2}>
            {gridItem(equipmentIdField, 4)}
        </Grid>
    );
};
