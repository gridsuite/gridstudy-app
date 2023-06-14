/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useState } from 'react';
import { fetchEquipmentsIds } from '../../../utils/rest-api';
import { filledTextField, gridItem } from '../dialogUtils';
import { Autocomplete, TextField } from '@mui/material';
import { FieldLabel } from '../../utils/inputs/hooks-helpers';
import Grid from '@mui/material/Grid';
import { FormFiller } from '../commons/formFiller';
import CircularProgress from '@mui/material/CircularProgress';
import makeStyles from '@mui/styles/makeStyles';
import { Box } from '@mui/system';
import { FormattedMessage } from 'react-intl';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    message: {
        fontSize: 'small',
        fontStyle: 'italic',
        color: theme.palette.text.secondary,
    },
    hidden: {
        color: 'rgba(0,0,0,0)',
        width: 0,
    },
}));

export const EquipmentIdSelector = ({
    studyUuid,
    currentNode,
    defaultValue,
    setSelectedId,
    equipmentType,
    formProps,
    readOnly = false,
    fillerHeight = 1,
    fillerMessageId = 'idSelector.idNeeded',
    ...props
}) => {
    const classes = useStyles();
    const currentNodeUuid = currentNode?.id;
    const [equipmentOptions, setEquipmentOptions] = useState([]);
    const [selectedValue, setSelectedValue] = useState(null);

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

    // We go through this effect to force a rerender and display the loading icon.
    useEffect(() => {
        if (selectedValue) {
            setSelectedId(selectedValue);
        }
    }, [selectedValue, setSelectedId]);

    const handleChange = (newId, reason) => {
        if (newId && (reason === 'createOption' || reason === 'selectOption')) {
            setSelectedValue(newId);
        } else if (reason === 'clear') {
            setSelectedValue(null);
        }
    };

    const equipmentIdField = (
        <Autocomplete
            value={defaultValue}
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
            <FormFiller height={fillerHeight}>
                {fillerMessageId && !selectedValue && (
                    <Box className={classes.message}>
                        <FormattedMessage id={fillerMessageId} />
                    </Box>
                )}
                <CircularProgress
                    // We keep the circular progress rendered but hidden to prevent an incomplete
                    // rendering when we set the choosen ID in the parent component.
                    className={clsx({ [classes.hidden]: !selectedValue })}
                />
            </FormFiller>
        </>
    );
};
