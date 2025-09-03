/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, ListItemText, MenuItem, Select, Theme } from '@mui/material';
import { UUID } from 'crypto';
import { RemoveRedEye, VisibilityOff } from '@mui/icons-material';
import { RootNetworkMetadata } from '../graph/menus/network-modifications/network-modification-menu.type';
import { useMemo } from 'react';
import { useSyncNavigationActions } from 'hooks/use-sync-navigation-actions';

const styles = {
    selectRoot: (theme: Theme) => ({
        height: theme.spacing(4),
        width: theme.spacing(15),
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    }),
    selectInput: { display: 'flex', gap: 1, alignItems: 'center' },
    selectItem: { gap: 1 },
};

interface RootNetworkSelectProps {
    currentRootNetworkUuid: UUID | null;
    rootNetworks: RootNetworkMetadata[];
}

export default function RootNetworkSelect({ currentRootNetworkUuid, rootNetworks }: Readonly<RootNetworkSelectProps>) {
    const { setCurrentRootNetworkUuidWithSync } = useSyncNavigationActions();

    const filteredRootNetworks = useMemo(() => {
        return rootNetworks.filter((item) => item.rootNetworkUuid !== currentRootNetworkUuid);
    }, [rootNetworks, currentRootNetworkUuid]);

    return (
        <Select
            size="small"
            id="breadCrumbsSelect"
            sx={styles.selectRoot}
            value={currentRootNetworkUuid}
            onChange={(event) => {
                setCurrentRootNetworkUuidWithSync(event.target.value as UUID);
            }}
            renderValue={(value) => {
                const tag = rootNetworks.find((item) => item.rootNetworkUuid === value)?.tag;
                return (
                    <Box sx={styles.selectInput}>
                        <RemoveRedEye />
                        <ListItemText primary={tag} />
                    </Box>
                );
            }}
        >
            {filteredRootNetworks.map((item: RootNetworkMetadata) => (
                <MenuItem key={item.rootNetworkUuid} value={item.rootNetworkUuid} sx={styles.selectItem}>
                    <VisibilityOff />
                    <ListItemText primary={item.tag} />
                </MenuItem>
            ))}
        </Select>
    );
}
