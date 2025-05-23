/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useDispatch } from 'react-redux';
import { Box, ListItemText, MenuItem, Select } from '@mui/material';
import { setCurrentRootNetworkUuid } from '../../redux/actions';
import { UUID } from 'crypto';
import { RemoveRedEye, VisibilityOff } from '@mui/icons-material';
import { RootNetworkMetadata } from '../graph/menus/network-modifications/network-modification-menu.type';

interface RootNetworkSelectProps {
    currentRootNetworkUuid: UUID | null;
    rootNetworks: RootNetworkMetadata[];
}

export default function RootNetworkSelect({ currentRootNetworkUuid, rootNetworks }: Readonly<RootNetworkSelectProps>) {
    const dispatch = useDispatch();

    return (
        <Box sx={{ paddingTop: '8px', paddingBottom: '8px' }}>
            <Select
                size="small"
                id="breadCrumbsSelect"
                sx={{ height: '36px' }}
                value={currentRootNetworkUuid}
                onChange={(event) => dispatch(setCurrentRootNetworkUuid(event.target.value as UUID))}
                renderValue={(value) => {
                    const tag = rootNetworks.find((item) => item.rootNetworkUuid === value)?.tag;
                    return (
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <RemoveRedEye />
                            <ListItemText primary={tag} />
                        </Box>
                    );
                }}
            >
                {rootNetworks.map(
                    (item: RootNetworkMetadata) =>
                        item.rootNetworkUuid !== currentRootNetworkUuid && (
                            <MenuItem value={item.rootNetworkUuid} sx={{ gap: 1 }}>
                                <VisibilityOff />
                                <ListItemText primary={item.tag} />
                            </MenuItem>
                        )
                )}
            </Select>
        </Box>
    );
}
