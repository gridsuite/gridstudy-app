/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import Grid from '@mui/material/Grid';
import makeStyles from '@mui/styles/makeStyles';
import { Box } from '@mui/system';
import { useTheme } from '@mui/material/styles';

const useStyles = makeStyles((theme) => ({
    filler: {
        backgroundColor: theme.formFiller.background,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
}));

export const FormFiller = ({ size = 12, height = 1, children }) => {
    const classes = useStyles();
    const theme = useTheme();

    return (
        <Grid container spacing={2}>
            <Grid
                item
                xs={size}
                align={'start'}
                sx={{
                    marginTop: theme.spacing(2),
                }}
            >
                <Box
                    className={classes.filler}
                    sx={{
                        height: theme.spacing(7 * height),
                    }}
                >
                    {children}
                </Box>
            </Grid>
        </Grid>
    );
};
