/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, MenuItem, Select } from '@mui/material';
import type { UUID } from 'node:crypto';
import { RemoveRedEye, VisibilityOff } from '@mui/icons-material';
import { RootNetworkMetadata } from '../graph/menus/network-modifications/network-modification-menu.type';
import { useSyncNavigationActions } from 'hooks/use-sync-navigation-actions';
import { mergeSx, type MuiStyles } from '@gridsuite/commons-ui';

const styles = {
    selectRoot: (theme) => ({
        height: theme.spacing(4),
        width: 'fit-content',
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
        '& .MuiSelect-select.MuiSelect-select': { paddingLeft: 0, paddingRight: theme.spacing(3.5) },
    }),
    selectInput: (theme) => ({
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        fontSize: theme.typography.fontSize,
    }),
    selectItem: (theme) => ({
        gap: 1,
        fontSize: theme.typography.fontSize,
    }),
    hiddenItem: { display: 'none' },
} as const satisfies MuiStyles;

interface RootNetworkSelectProps {
    currentRootNetworkUuid: UUID | null;
    rootNetworks: RootNetworkMetadata[];
}

export default function RootNetworkSelect({ currentRootNetworkUuid, rootNetworks }: Readonly<RootNetworkSelectProps>) {
    const { setCurrentRootNetworkUuidWithSync } = useSyncNavigationActions();

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
                        {tag}
                        <RemoveRedEye fontSize="small" />
                    </Box>
                );
            }}
        >
            {rootNetworks.map((item: RootNetworkMetadata) => (
                <MenuItem
                    key={item.rootNetworkUuid}
                    value={item.rootNetworkUuid}
                    sx={mergeSx(
                        styles.selectItem,
                        item.rootNetworkUuid === currentRootNetworkUuid ? styles.hiddenItem : undefined
                    )}
                >
                    {item.tag}
                    <VisibilityOff fontSize="small" />
                </MenuItem>
            ))}
        </Select>
    );
}
