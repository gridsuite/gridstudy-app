/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { ReactNode } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { FunctionComponent } from 'react';

const styles = {
    wrapper: {
        height: '100%',
        width: '100%',
    },
    glassPane: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'block',
        zIndex: 19,
        position: 'absolute',
        height: 'inherit',
        width: 'inherit',
        textAlign: 'center',
    },
    circularProgress: {
        position: 'relative',
        top: 'calc(40% - 20px)',
    },
};

interface GlassPaneProps {
    active: boolean;
    children: ReactNode;
}

const GlassPane: FunctionComponent<GlassPaneProps> = ({ active, children }) => {
    return (
        <Box sx={styles.wrapper}>
            {active && (
                <Box sx={styles.glassPane}>
                    <CircularProgress size={64} sx={styles.circularProgress} />
                </Box>
            )}
            {children}
        </Box>
    );
};

export default GlassPane;
