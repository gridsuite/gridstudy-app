/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { gridItem } from '../dialogUtils';
import Grid from '@mui/material/Grid';
import makeStyles from '@mui/styles/makeStyles';
import { Box } from '@mui/system';
import { FormattedMessage } from 'react-intl';
import { useTheme } from '@mui/material/styles';

const useStyles = makeStyles((theme) => ({
    filler: {
        fontSize: 'small',
        fontStyle: 'italic',
        color: theme.palette.text.secondary,
        backgroundColor: theme.palette.action.hover,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
}));

export const FormFiller = ({ messageId = null, size = 12, height = 1 }) => {
    const classes = useStyles();
    const theme = useTheme();

    return (
        <Grid container spacing={2}>
            {gridItem(
                <Box
                    className={classes.filler}
                    sx={{
                        height: theme.spacing(7 * height),
                    }}
                >
                    {messageId && <FormattedMessage id={messageId} />}
                </Box>,
                size
            )}
        </Grid>
    );
};
