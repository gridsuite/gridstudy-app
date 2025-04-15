/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { RemoveRedEye as RemoveRedEyeIcon } from '@mui/icons-material';

import { Box, Theme, Badge, Stack, Chip } from '@mui/material';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';

const styles = {
    header: (theme: Theme) => ({
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(1),
    }),
    rootNameTitle: (theme: Theme) => ({
        flexGrow: 1,
        fontWeight: 'bold',
        marginLeft: theme.spacing(2),
    }),
    minimizedPanel: (theme: Theme) => ({
        flexGrow: 1,
        fontWeight: 'bold',
        marginLeft: theme.spacing(3),
    }),
};

const RootNetworkMinimizedPanelContent = () => {
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const rootNetworks = useSelector((state: AppState) => state.rootNetworks);

    const currentRootNetwork = rootNetworks.find(
        (rootNetwork) => rootNetwork.rootNetworkUuid === currentRootNetworkUuid
    );

    return (
        <Box sx={styles.minimizedPanel}>
            <Box sx={styles.header}>
                <Stack direction="row" spacing={1}>
                    <Chip size="small" label={currentRootNetwork?.tag} color="primary" />
                </Stack>
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <Badge overlap="circular" color="primary" variant="dot">
                        <RemoveRedEyeIcon />
                    </Badge>
                </Box>
            </Box>
        </Box>
    );
};

export default RootNetworkMinimizedPanelContent;
