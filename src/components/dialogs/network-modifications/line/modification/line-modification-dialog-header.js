/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { EQUIPMENT_NAME } from 'components/utils/field-constants';
import { Box, Grid } from '@mui/material';
import { filledTextField, gridItem } from 'components/dialogs/dialogUtils';
import LineDialogTabs from '../line-dialog-tabs';
import TextInput from 'components/utils/rhf-inputs/text-input';
import { TextField } from '@mui/material';

const LineModificationDialogHeader = ({
    lineToModify,
    tabIndexesWithError,
    tabIndex,
    setTabIndex,
    equipmentId,
}) => {
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
                    {gridItem(lineIdField, 4)}
                    {gridItem(lineNameField, 4)}
                </Grid>
                <LineDialogTabs
                    tabIndex={tabIndex}
                    tabIndexesWithError={tabIndexesWithError}
                    setTabIndex={setTabIndex}
                />
            </Box>
        </>
    );
};

export default LineModificationDialogHeader;
