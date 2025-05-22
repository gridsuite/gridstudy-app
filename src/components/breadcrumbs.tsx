/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { MoreHoriz, RemoveRedEye, VisibilityOff } from '@mui/icons-material';
import {
    Box,
    Breadcrumbs as MuiBreadcrumbs,
    ListItemText,
    MenuItem,
    Select,
    styled,
    Tooltip,
    tooltipClasses,
    TooltipProps,
} from '@mui/material';
import { CurrentTreeNode } from './graph/tree-node.type';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../redux/reducer';
import { RootNetworkMetadata } from './graph/menus/network-modifications/network-modification-menu.type';
import { UUID } from 'crypto';
import { setCurrentRootNetworkUuid } from 'redux/actions';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { useParameterState } from './dialogs/parameters/use-parameters-state';
import { PARAM_DEVELOPER_MODE } from '../utils/config-params';

const toolTipStyle = {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'nowrap',
};

interface NetworkSelectProps {
    currentRootNetworkUuid: UUID | null;
    rootNetworks: RootNetworkMetadata[];
}

function NetworkSelect({ currentRootNetworkUuid, rootNetworks }: Readonly<NetworkSelectProps>) {
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

const NoMaxWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))({
    [`& .${tooltipClasses.tooltip}`]: {
        maxWidth: 'none',
    },
});

export interface BreadcrumbsProps {
    studyName: string | undefined;
    parentDirectoriesNames: string[];
}

export default function Breadcrumbs({ studyName, parentDirectoriesNames }: Readonly<BreadcrumbsProps>) {
    const currentNode: CurrentTreeNode | null = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid: UUID | null = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const rootNetworks: RootNetworkMetadata[] = useSelector((state: AppState) => state.rootNetworks);
    const currentRootNetworktag = rootNetworks.find((item) => item.rootNetworkUuid === currentRootNetworkUuid)?.tag;
    const [isDeveloperModeEnabled] = useParameterState(PARAM_DEVELOPER_MODE);

    return (
        <MuiBreadcrumbs aria-label="breadcrumb" color="text" separator={<KeyboardArrowRightIcon fontSize="small" />}>
            <NoMaxWidthTooltip
                title={
                    <Box sx={toolTipStyle}>
                        {parentDirectoriesNames?.map((directoryName: string) => (
                            <Box sx={toolTipStyle}>
                                {directoryName}
                                <KeyboardArrowRightIcon fontSize="small" />
                            </Box>
                        ))}
                        <Box sx={toolTipStyle}>
                            {studyName}
                            <KeyboardArrowRightIcon fontSize="small" />
                        </Box>
                        <Box sx={toolTipStyle}>
                            {currentNode?.data.label}
                            <KeyboardArrowRightIcon fontSize="small" />
                        </Box>
                        <Box sx={toolTipStyle}>{currentRootNetworktag}</Box>
                    </Box>
                }
            >
                <MoreHoriz sx={{ display: 'flex', alignItems: 'center' }} />
            </NoMaxWidthTooltip>
            <Box>{studyName}</Box>
            <Box>{currentNode?.data?.label}</Box>
            {rootNetworks && rootNetworks.length > 1 && isDeveloperModeEnabled && (
                <NetworkSelect currentRootNetworkUuid={currentRootNetworkUuid} rootNetworks={rootNetworks} />
            )}
        </MuiBreadcrumbs>
    );
}
