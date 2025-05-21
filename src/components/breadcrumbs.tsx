/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { MoreHoriz, RemoveRedEye, VisibilityOff } from '@mui/icons-material';
import { MenuItem, Tooltip, ListItemText, Box, Select, Breadcrumbs as MuiBreadcrumbs } from '@mui/material';
import { CurrentTreeNode } from './graph/tree-node.type';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../redux/reducer';
import { RootNetworkMetadata } from './graph/menus/network-modifications/network-modification-menu.type';
import { UUID } from 'crypto';
import { setCurrentRootNetworkUuid } from 'redux/actions';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { User } from 'oidc-client';

export interface BreadcrumbsProps {
    studyName: string;
    studyPath: string;
}

function NetworkSelect({
    currentRootNetworkUuid,
    rootNetworks,
}: {
    currentRootNetworkUuid: UUID | null;
    rootNetworks: RootNetworkMetadata[];
}) {
    const dispatch = useDispatch();

    return rootNetworks && rootNetworks.length > 1 ? (
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
    ) : null;
}

export default function Breadcrumbs({ studyName, studyPath }: Readonly<BreadcrumbsProps>) {
    const currentNode: CurrentTreeNode | null = useSelector((state: AppState) => state.currentTreeNode);
    const user: User | null = useSelector((state: AppState) => state.user);
    const currentRootNetworkUuid: UUID | null = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const rootNetworks: RootNetworkMetadata[] = useSelector((state: AppState) => state.rootNetworks);
    const currentRootNetworktag = rootNetworks.find((item) => item.rootNetworkUuid === currentRootNetworkUuid)?.tag;

    return (
        <MuiBreadcrumbs aria-label="breadcrumb" separator={<KeyboardArrowRightIcon fontSize="small" />}>
            <Tooltip
                title={
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        {user?.profile.name}
                        <KeyboardArrowRightIcon />
                        <span>{studyPath}</span>
                        <KeyboardArrowRightIcon />
                        <span>{studyName}</span>
                        <KeyboardArrowRightIcon />
                        <span>{currentNode?.data.label}</span>
                        <KeyboardArrowRightIcon />
                        <span>{currentRootNetworktag}</span>
                    </div>
                }
            >
                <MoreHoriz sx={{ display: 'flex', alignItems: 'center' }} />
            </Tooltip>
            <Box>{studyName}</Box>
            <Box>{currentNode?.data?.label}</Box>
            <NetworkSelect currentRootNetworkUuid={currentRootNetworkUuid} rootNetworks={rootNetworks} />
        </MuiBreadcrumbs>
    );
}
