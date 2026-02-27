/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { mergeSx, type MuiStyles } from '@gridsuite/commons-ui';
import { RemoveRedEye as RemoveRedEyeIcon } from '@mui/icons-material';
import { Badge, Box, Chip, Stack } from '@mui/material';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer.type';

const styles = {
    panel: (theme) => ({
        flexGrow: 1,
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0.5),
    }),
    minimizedPanel: (theme) => ({
        marginLeft: theme.spacing(0.5),
    }),
    icon: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
} as const satisfies MuiStyles;

interface RootNetworkMinimizedPanelContentProps {
    isRootNetworkPanelMinimized: boolean;
}

const RootNetworkMinimizedPanelContent: React.FC<RootNetworkMinimizedPanelContentProps> = ({
    isRootNetworkPanelMinimized,
}) => {
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const rootNetworks = useSelector((state: AppState) => state.rootNetworks);

    const currentRootNetwork = rootNetworks.find(
        (rootNetwork) => rootNetwork.rootNetworkUuid === currentRootNetworkUuid
    );

    return (
        <Box sx={mergeSx(styles.panel, isRootNetworkPanelMinimized ? styles.minimizedPanel : undefined)}>
            <Stack direction="row" spacing={0.5}>
                <Chip size="small" label={currentRootNetwork?.tag} color="primary" />
                <Box sx={styles.icon}>
                    <Badge overlap="circular" color="primary" variant="dot">
                        <RemoveRedEyeIcon fontSize="small" />
                    </Badge>
                </Box>
            </Stack>
        </Box>
    );
};

export default RootNetworkMinimizedPanelContent;
