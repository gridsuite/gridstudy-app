/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { MoreHoriz } from '@mui/icons-material';
import { Box, Breadcrumbs as MuiBreadcrumbs, Tooltip } from '@mui/material';
import { CurrentTreeNode } from '../graph/tree-node.type';
import { useSelector } from 'react-redux';
import { AppState } from '../../redux/reducer';
import { RootNetworkMetadata } from '../graph/menus/network-modifications/network-modification-menu.type';
import { UUID } from 'crypto';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import RootNetworkSelect from './root-network-select';
import SyncToggle from 'components/SyncToggle';

const styles = {
    tooltipItem: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'nowrap',
    },
};

export interface StudyPathBreadcrumbsProps {
    studyName: string | undefined;
    parentDirectoriesNames: string[];
}

export default function StudyPathBreadcrumbs({
    studyName,
    parentDirectoriesNames,
}: Readonly<StudyPathBreadcrumbsProps>) {
    const currentNode: CurrentTreeNode | null = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid: UUID | null = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const rootNetworks: RootNetworkMetadata[] = useSelector((state: AppState) => state.rootNetworks);
    const currentRootNetworkTag = rootNetworks.find((item) => item.rootNetworkUuid === currentRootNetworkUuid)?.tag;

    return (
        <MuiBreadcrumbs aria-label="breadcrumb" color="text" separator={<KeyboardArrowRightIcon fontSize="small" />}>
            <Tooltip
                componentsProps={{
                    tooltip: {
                        sx: {
                            maxWidth: 'none', //  to override background of text is auto cut
                        },
                    },
                }}
                title={
                    <Box sx={styles.tooltipItem}>
                        {parentDirectoriesNames?.map((directoryName: string, index) => (
                            <Box key={`${directoryName}-${index}`} sx={styles.tooltipItem}>
                                {directoryName}
                                <KeyboardArrowRightIcon fontSize="small" />
                            </Box>
                        ))}
                        <Box sx={styles.tooltipItem}>
                            {studyName}
                            <KeyboardArrowRightIcon fontSize="small" />
                        </Box>
                        <Box sx={styles.tooltipItem}>{currentNode?.data.label}</Box>
                        {rootNetworks?.length > 1 && (
                            <Box sx={styles.tooltipItem}>
                                <KeyboardArrowRightIcon fontSize="small" />
                                {currentRootNetworkTag}
                            </Box>
                        )}
                    </Box>
                }
            >
                <MoreHoriz sx={{ display: 'flex', alignItems: 'center' }} />
            </Tooltip>
            <Box>{studyName}</Box>
            <Box>{currentNode?.data?.label}</Box>
            <Box display="flex" alignItems="center" gap={1}>
                {rootNetworks && rootNetworks.length > 1 && (
                    <RootNetworkSelect currentRootNetworkUuid={currentRootNetworkUuid} rootNetworks={rootNetworks} />
                )}
                <SyncToggle />
            </Box>
        </MuiBreadcrumbs>
    );
}
