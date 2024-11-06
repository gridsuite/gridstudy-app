/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useState } from 'react';
import { filledTextField } from '../dialog-utils';
import { Autocomplete, TextField, Grid, CircularProgress } from '@mui/material';
import { FieldLabel } from '@gridsuite/commons-ui';
import { FormFiller } from '../commons/formFiller';
import { Box } from '@mui/system';
import { FormattedMessage } from 'react-intl';
import { fetchEquipmentsIds } from '../../../services/study/network-map';
import GridItem from '../commons/grid-item';

const styles = {
    message: (theme) => ({
        fontSize: 'small',
        fontStyle: 'italic',
        color: theme.palette.text.secondary,
    }),
    hidden: {
        color: 'rgba(0,0,0,0)',
        width: 0,
    },
};

export const EquipmentIdSelector = ({
    studyUuid,
    currentNode,
    defaultValue,
    setSelectedId,
    equipmentType,
    readOnly = false,
    fillerHeight,
    fillerMessageId = 'idSelector.idNeeded',
    loading = false,
    ...props
}) => {
    const currentNodeUuid = currentNode?.id;
    const [equipmentOptions, setEquipmentOptions] = useState([]);
    const [selectedValue, setSelectedValue] = useState(null);

    useEffect(() => {
        fetchEquipmentsIds(studyUuid, currentNodeUuid, undefined, equipmentType, true).then((values) => {
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
                <GridItem size={4}>{equipmentIdField}</GridItem>
            </Grid>
            <FormFiller lineHeight={fillerHeight}>
                {fillerMessageId && (!loading || !selectedValue) && (
                    <Box sx={styles.message}>
                        <FormattedMessage id={fillerMessageId} />
                    </Box>
                )}
                <CircularProgress
                    // We keep the circular progress rendered but hidden to prevent an incomplete
                    // rendering when we set the choosen ID in the parent component.
                    // TODO: Enhance the loader to support all modification forms,
                    // ensuring it accounts for the full details of the equipment, not just the ID
                    sx={!loading || !selectedValue ? styles.hidden : undefined}
                />
            </FormFiller>
        </>
    );
};
