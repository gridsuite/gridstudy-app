/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { type MuiStyles } from '@gridsuite/commons-ui';

const styles = {
    overlay: {
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
} as const satisfies MuiStyles;

export interface OverlayProps {
    children: ReactNode;
    message: string | undefined;
}

const Overlay = ({ children, message }: OverlayProps) => {
    return message ? (
        <Box sx={styles.overlay}>
            <Typography variant={'body2'}>{message}</Typography>
        </Box>
    ) : (
        children
    );
};

export default Overlay;
