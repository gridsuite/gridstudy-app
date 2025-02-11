/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ReactNode } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { FunctionComponent } from 'react';
import { FormattedMessage } from 'react-intl';

const styles = {
    glassPane: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        zIndex: 19,
        position: 'absolute',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
    },
};

interface GlassPaneProps {
    active: boolean;
    children: ReactNode;
    loadingMessageText?: string;
}

const GlassPane: FunctionComponent<GlassPaneProps> = ({ active, children, loadingMessageText }) => {
    return (
        <>
            {active && (
                <Box sx={styles.glassPane}>
                    <CircularProgress size={64} />
                    {loadingMessageText && <FormattedMessage id={loadingMessageText} />}
                </Box>
            )}
            {children}
        </>
    );
};

export default GlassPane;
