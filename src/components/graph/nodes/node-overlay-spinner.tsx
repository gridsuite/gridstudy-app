/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { alpha, Box, CircularProgress, colors, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { nodeActivityLabelId, type NodeActivity } from 'components/node-activity/types/node-activity.type';

const NodeOverlaySpinner = ({ activity }: Readonly<{ activity: NodeActivity }>) => {
    return (
        <Box
            sx={(theme) => ({
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                gap: 0.5,
                zIndex: 10,
                backgroundColor: alpha(theme.node.common.background, 0.85),
            })}
        >
            <CircularProgress size={35} sx={{ color: colors.blue[600] }} />
            <Typography variant="caption" color="text.primary">
                <FormattedMessage id={nodeActivityLabelId(activity.label)} />
            </Typography>
        </Box>
    );
};

export default NodeOverlaySpinner;
