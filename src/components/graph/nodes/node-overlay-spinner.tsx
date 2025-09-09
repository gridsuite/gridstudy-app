/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { alpha, Box, CircularProgress, colors } from '@mui/material';

const NodeOverlaySpinner = () => {
    return (
        <Box
            sx={(theme) => ({
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                backgroundColor: alpha(theme.node.common.background, 0.6),
            })}
        >
            <CircularProgress size={40} style={{ color: colors.blue[600] }} />
        </Box>
    );
};

export default NodeOverlaySpinner;
