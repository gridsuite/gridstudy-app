/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import Grid from '@mui/material/Grid';
import { Box } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import { mergeSx } from '../../utils/functions';

const styles = {
    filler: (theme) => ({
        backgroundColor: theme.formFiller.background,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    }),
};

export const FormFiller = ({
    size = 12, // Default will take the whole row
    lineHeight, // Filler's height : by default 100%, or if specified, equal to X times a generic row in the form.
    children, // These elements will be centered in the filler
}) => {
    const theme = useTheme();

    return (
        <Grid
            container
            spacing={2}
            sx={{ height: lineHeight ? undefined : 'calc(100% - 32px)' }}
        >
            <Grid
                item
                xs={size}
                align={'start'}
                sx={{
                    marginTop: theme.spacing(2),
                }}
            >
                <Box
                    sx={mergeSx(styles.filler, {
                        height: lineHeight
                            ? theme.spacing(7 * lineHeight)
                            : '100%',
                    })}
                >
                    {children}
                </Box>
            </Grid>
        </Grid>
    );
};
