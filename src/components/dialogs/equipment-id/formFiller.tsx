/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { mergeSx, type MuiStyles } from '@gridsuite/commons-ui';
import { Box, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ReactNode } from 'react';

const styles = {
    filler: (theme) => ({
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.formFiller.backgroundColor,
    }),
} as const satisfies MuiStyles;

interface FormFillerProps {
    size?: number;
    lineHeight?: number; // Filler's height will be X times a generic row in the form (or 100% by default)
    children: ReactNode;
}
export function FormFiller({ size = 12, lineHeight, children }: Readonly<FormFillerProps>) {
    const theme = useTheme();

    return (
        <Grid container spacing={2} sx={{ height: lineHeight ? undefined : 'calc(100% - 32px)' }}>
            <Grid
                item
                xs={size}
                sx={{
                    marginTop: theme.spacing(2),
                    align: 'start',
                }}
            >
                <Box
                    sx={mergeSx(styles.filler, {
                        height: lineHeight ? theme.spacing(7 * lineHeight) : '100%',
                    })}
                >
                    {children}
                </Box>
            </Grid>
        </Grid>
    );
}
