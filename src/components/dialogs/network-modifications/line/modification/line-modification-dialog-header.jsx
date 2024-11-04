/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { EQUIPMENT_NAME } from 'components/utils/field-constants';
import { Box, Grid, TextField } from '@mui/material';
import { filledTextField, GridItem } from 'components/dialogs/dialog-utils.tsx';
import LineDialogTabs from '../line-dialog-tabs';
import { TextInput } from '@gridsuite/commons-ui';

const LineModificationDialogHeader = ({ lineToModify, tabIndexesWithError, tabIndex, setTabIndex, equipmentId }) => {
    const lineIdField = (
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

    const lineNameField = (
        <TextInput
            name={EQUIPMENT_NAME}
            label={'Name'}
            formProps={filledTextField}
            previousValue={lineToModify?.name}
            clearable
        />
    );

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '15px',
                }}
            >
                <Grid container spacing={2}>
                    {GridItem(lineIdField, 4)}
                    {GridItem(lineNameField, 4)}
                </Grid>
                <LineDialogTabs
                    tabIndex={tabIndex}
                    tabIndexesWithError={tabIndexesWithError}
                    setTabIndex={setTabIndex}
                    isModification={true}
                />
            </Box>
        </>
    );
};

export default LineModificationDialogHeader;
