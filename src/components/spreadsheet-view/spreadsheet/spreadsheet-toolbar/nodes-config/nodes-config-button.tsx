/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage } from 'react-intl';
import { Badge, Button, Theme, Tooltip } from '@mui/material';
import { useStateBoolean } from '@gridsuite/commons-ui';
import BuildIcon from '@mui/icons-material/Build';
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
import { spreadsheetStyles } from '../../../spreadsheet.style';

const styles = {
    icon: {
        height: '20px',
        width: '20px',
    },
    badgeStyle: (theme: Theme) => ({
        '& .MuiBadge-badge': {
            minWidth: theme.spacing(2),
            height: theme.spacing(2),
            fontSize: theme.typography.caption.fontSize,
            padding: theme.spacing(0, 0.5),
        },
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

    const handleRefresh = useCallback(() => {
        if (currentNode?.id && currentRootNetworkUuid && nodesToReload?.length) {
            const nodesIdsToReload = new Set<string>(nodesToReload.map((n) => n.id as string));
            fetchNodesEquipmentData(nodesIdsToReload, currentNode.id, currentRootNetworkUuid);
        }
    }, [currentNode?.id, currentRootNetworkUuid, fetchNodesEquipmentData, nodesToReload]);

    return (
        <>
            <Badge
                sx={styles.badgeStyle}
                max={99}
                color="secondary"
                badgeContent={nodeAliases?.length && !showWarning ? nodeAliases.length : undefined}
            >
                <Button
                    sx={spreadsheetStyles.spreadsheetButton}
                    size={'small'}
                    onClick={handleClick}
                    disabled={disabled}
                >
                    <BuildIcon sx={styles.icon} />
                    <FormattedMessage id="spreadsheet/custom_column/nodes" />
                    {showWarning && (
                        <Badge
                            badgeContent="!"
                            color="warning"
                            overlap="circular"
                            style={{ transform: 'translate(10px, -15px)' }}
                        ></Badge>
                    )}
                </Button>
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
                <Tooltip
                    title={
                        <FormattedMessage
                            id={'spreadsheet/custom_column/option/refresh/tooltip'}
                            values={{
                                aliases: nodesToReload?.map((node) => node.alias).join(', '),
                            }}
                        />
                    }
                >
                    <MenuItem
                        key={NodesOptionId.REFRESH}
                        onClick={() => {
                            handleClose();
                            handleRefresh();
                        }}
                        disabled={tableType && nodesToReload ? nodesToReload.length === 0 : true}
                    >
                        <FormattedMessage id={'spreadsheet/custom_column/option/refresh'} />
                    </MenuItem>
                </Tooltip>
            </Menu>
            <NodesConfigDialog open={dialogOpen} nodeAliases={nodeAliases} updateNodeAliases={updateNodeAliases} />
        </>
    );
}
