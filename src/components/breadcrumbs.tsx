/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ArrowForwardIos, MoreHoriz, RemoveRedEye, VisibilityOff } from '@mui/icons-material';
import { MenuItem, Tooltip, ListItemText, Box, Select, Breadcrumbs as MuiBreadcrumbs } from '@mui/material';
import { CurrentTreeNode } from './graph/tree-node.type';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../redux/reducer';
import { RootNetworkMetadata } from './graph/menus/network-modifications/network-modification-menu.type';
import { UUID } from 'crypto';
import { setCurrentRootNetworkUuid } from 'redux/actions';

export interface BreadcrumbsProps {
    studyName: string;
    studyPath: string;
}

function NetworkSelect() {
    const currentRootNetworkUuid: UUID | null = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const rootNetworks: RootNetworkMetadata[] = useSelector((state: AppState) => state.rootNetworks);
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
                {rootNetworks?.map(
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
    ) : undefined;
}

export default function Breadcrumbs({ studyName, studyPath }: Readonly<BreadcrumbsProps>) {
    const currentNode: CurrentTreeNode | null = useSelector((state: AppState) => state.currentTreeNode);

    return (
        <MuiBreadcrumbs aria-label="breadcrumb" separator={<ArrowForwardIos />}>
            <Tooltip title={`${studyPath}/${studyName}`}>
                <MoreHoriz sx={{ display: 'flex', alignItems: 'center' }} />
            </Tooltip>
            <Box>{studyName}</Box>
            <Box>{currentNode?.data?.label}</Box>
            <NetworkSelect />
        </MuiBreadcrumbs>
    );
}
