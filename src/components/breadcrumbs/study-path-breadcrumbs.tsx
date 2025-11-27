/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { MoreHoriz } from '@mui/icons-material';
import { Box, Breadcrumbs as MuiBreadcrumbs, Tooltip } from '@mui/material';
import { type MuiStyles } from '@gridsuite/commons-ui';
import { CurrentTreeNode, NodeType } from '../graph/tree-node.type';
import { useSelector } from 'react-redux';
import { AppState } from '../../redux/reducer';
import { RootNetworkMetadata } from '../graph/menus/network-modifications/network-modification-menu.type';
import type { UUID } from 'node:crypto';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import RootNetworkSelect from './root-network-select';
import { useIntl } from 'react-intl';

const styles = {
    tooltipItem: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'nowrap',
    },
} as const satisfies MuiStyles;

export interface StudyPathBreadcrumbsProps {
    studyName: string | undefined;
    parentDirectoriesNames: string[];
}

export default function StudyPathBreadcrumbs({
    studyName,
    parentDirectoriesNames,
}: Readonly<StudyPathBreadcrumbsProps>) {
    const intl = useIntl();
    const currentNode: CurrentTreeNode | null = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid: UUID | null = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const rootNetworks: RootNetworkMetadata[] = useSelector((state: AppState) => state.rootNetworks);
    const currentRootNetworkTag = rootNetworks.find((item) => item.rootNetworkUuid === currentRootNetworkUuid)?.tag;
    const isRootNode = currentNode?.type === NodeType.ROOT;
    const nodeLabel = isRootNode ? intl.formatMessage({ id: 'root' }) : currentNode?.data.label;

    return (
        <MuiBreadcrumbs
            aria-label="breadcrumb"
            color="text"
            separator={<KeyboardArrowRightIcon fontSize="small" />}
            sx={{ p: 0.25 }}
        >
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
                        <Box sx={styles.tooltipItem}>{nodeLabel}</Box>
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
            <Box>{nodeLabel}</Box>
            {rootNetworks && rootNetworks.length > 1 && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <RootNetworkSelect currentRootNetworkUuid={currentRootNetworkUuid} rootNetworks={rootNetworks} />
                </Box>
            )}
        </MuiBreadcrumbs>
    );
}
