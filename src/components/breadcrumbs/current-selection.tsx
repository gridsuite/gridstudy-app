/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Paper, Tooltip } from '@mui/material';
import { BuildStatusChip, type MuiStyles } from '@gridsuite/commons-ui';
import type { UUID } from 'node:crypto';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { CurrentTreeNode, NodeType } from '../graph/tree-node.type';
import { RootNetworkMetadata } from '../graph/menus/network-modifications/network-modification-menu.type';
import { AppState } from '../../redux/reducer.type';
import { BlockedByActivityIndicator, NodeActivityChip } from 'components/node-activity/node-activity-display';
import { useNodeActivity } from 'components/node-activity/hooks/use-node-activity';
import RootNetworkSelect from './root-network-select';

const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        borderRadius: '8px',
        minHeight: 32,
        px: 1,
    },
    label: (theme) => ({
        display: { xs: 'none', lg: 'block' },
        mr: 1,
        fontSize: theme.typography.fontSize,
    }),
    rootNetworkSlot: {
        display: 'flex',
        alignItems: 'center',
        mr: 1,
    },
    nodeLabel: (theme) => ({
        maxWidth: 500,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontSize: theme.typography.fontSize,
    }),
    chipSlot: {
        display: 'flex',
        alignItems: 'center',
        ml: 1,
    },
    blockedSpinner: {
        ml: 1,
    },
} as const satisfies MuiStyles;

export default function CurrentSelection() {
    const intl = useIntl();
    const currentNode: CurrentTreeNode | null = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid: UUID | null = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const rootNetworks: RootNetworkMetadata[] = useSelector((state: AppState) => state.rootNetworks);
    const isRootNode = currentNode?.type === NodeType.ROOT;
    const nodeLabel = isRootNode ? intl.formatMessage({ id: 'root' }) : currentNode?.data.label;
    const activity = useNodeActivity(currentNode?.id);

    return (
        <Paper elevation={1} sx={styles.container}>
            {rootNetworks.length > 1 && (
                <>
                    <Box sx={styles.label}>{intl.formatMessage({ id: 'root' })}</Box>
                    <Box sx={styles.rootNetworkSlot}>
                        <RootNetworkSelect
                            currentRootNetworkUuid={currentRootNetworkUuid}
                            rootNetworks={rootNetworks}
                        />
                    </Box>
                </>
            )}
            <Box sx={styles.label}>{intl.formatMessage({ id: 'node' })}</Box>
            <Tooltip title={nodeLabel || ''}>
                <Box sx={styles.nodeLabel}>{nodeLabel}</Box>
            </Tooltip>
            <Box sx={styles.chipSlot}>
                {activity && <NodeActivityChip activity={activity} />}
                {!activity && currentNode && !isRootNode && (
                    <BuildStatusChip buildStatus={currentNode.data.globalBuildStatus} />
                )}
            </Box>
            <BlockedByActivityIndicator
                nodeId={currentNode?.id}
                ownActivity={activity}
                size={20}
                sx={styles.blockedSpinner}
                placement="bottom"
            />
        </Paper>
    );
}
