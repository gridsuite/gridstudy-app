/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage } from 'react-intl';
import { Badge, Button, Theme, Tooltip } from '@mui/material';
import { NotificationsUrlKeys, useNotificationsListener, useStateBoolean } from '@gridsuite/commons-ui';
import { ROOT_NODE_LABEL } from '../../../../../constants/node.constant';
import { NodeAlias } from '../../../types/node-alias.type';
import { MouseEvent, useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../../redux/reducer';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import { useFetchEquipment } from '../../../hooks/use-fetch-equipment';
import { validAlias } from '../../../hooks/use-node-aliases';
import { NodeType } from '../../../../graph/tree-node.type';
import { isStatusBuilt } from '../../../../graph/util/model-functions';
import { SpreadsheetEquipmentType } from '../../../types/spreadsheet.type';
import NodesConfigDialog from './nodes-config-dialog';
import { PolylineOutlined } from '@mui/icons-material';
import { isStudyNotification, NetworkImpactsInfos } from '../../../../../types/notification-types';

const styles = {
    badgeStyle: (theme: Theme) => ({
        '& .MuiBadge-badge': {
            minWidth: theme.spacing(2),
            height: theme.spacing(2),
            fontSize: theme.typography.caption.fontSize,
            padding: theme.spacing(0, 0.5),
        },
    }),
    nodesConfigButton: (theme: Theme) => ({
        color: theme.palette.primary.main,
        minWidth: '100%',
    }),
};

enum NodesOptionId {
    CONFIG = 'CONFIG',
    REFRESH = 'REFRESH',
}

type NodesConfigButtonProps = {
    disabled?: boolean;
    tableType: SpreadsheetEquipmentType;
    nodeAliases: NodeAlias[] | undefined;
    updateNodeAliases: (newNodeAliases: NodeAlias[]) => void;
};

export default function NodesConfigButton({
    disabled,
    tableType,
    nodeAliases,
    updateNodeAliases,
}: Readonly<NodesConfigButtonProps>) {
    const dialogOpen = useStateBoolean(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const treeNodes = useSelector((state: AppState) => state.networkModificationTreeModel?.treeNodes);

    const { fetchNodesEquipmentData } = useFetchEquipment(tableType);

    const showWarning = useMemo(
        () => nodeAliases !== undefined && nodeAliases.length > 0 && nodeAliases.some((n) => !validAlias(n)),
        [nodeAliases]
    );

    const isBuilt = useCallback(
        (nodeId: string | undefined) =>
            treeNodes?.find(
                (node) =>
                    node.id === nodeId && (node.type === NodeType.ROOT || isStatusBuilt(node.data?.globalBuildStatus))
            ) !== undefined,
        [treeNodes]
    );

    const nodesToReload = useMemo(() => {
        // Get all valid aliased nodes ids, except for Root and current node (both are always up-to-date), and only the built ones
        return nodeAliases?.filter(
            (nodeAlias) =>
                validAlias(nodeAlias) &&
                nodeAlias.id !== currentNode?.id &&
                nodeAlias.name !== ROOT_NODE_LABEL &&
                isBuilt(nodeAlias.id)
        );
    }, [currentNode?.id, isBuilt, nodeAliases]);

    const handleClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: (event: MessageEvent<string>) => {
            const eventData = JSON.parse(event.data);
            if (!isStudyNotification(eventData) || !currentNode?.id) {
                return;
            }
            const payload: NetworkImpactsInfos = JSON.parse(eventData.payload as string);
            const nodeId = eventData.headers.node;
            if (
                currentRootNetworkUuid === eventData.headers.rootNetworkUuid &&
                payload.impactedElementTypes.includes(tableType) &&
                nodesToReload?.find((alias) => alias.id === nodeId)
            ) {
                fetchNodesEquipmentData(new Set([nodeId]), currentNode.id, currentRootNetworkUuid);
            }
        },
    });

    const badgeText = useMemo(() => {
        if (nodeAliases?.length && !showWarning) {
            return nodeAliases.length;
        } else if (showWarning) {
            return '!';
        } else {
            return undefined;
        }
    }, [nodeAliases, showWarning]);

    return (
        <>
            <Badge
                sx={styles.badgeStyle}
                max={99}
                color={showWarning ? 'warning' : 'secondary'}
                badgeContent={badgeText}
            >
                <Tooltip title={<FormattedMessage id="spreadsheet/parameter_aliases/button_tooltip" />}>
                    <span>
                        <Button sx={styles.nodesConfigButton} size={'small'} onClick={handleClick} disabled={disabled}>
                            <PolylineOutlined />
                        </Button>
                    </span>
                </Tooltip>
            </Badge>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                <MenuItem
                    key={NodesOptionId.CONFIG}
                    onClick={() => {
                        dialogOpen.setTrue();
                        handleClose();
                    }}
                >
                    <FormattedMessage id={'spreadsheet/custom_column/option/parameter'} />
                </MenuItem>
            </Menu>
            <NodesConfigDialog open={dialogOpen} nodeAliases={nodeAliases} updateNodeAliases={updateNodeAliases} />
        </>
    );
}
