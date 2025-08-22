/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo } from 'react';
import { validAlias } from '../../../hooks/use-node-aliases';
import { ROOT_NODE_LABEL } from '../../../../../constants/node.constant';
import { NotificationsUrlKeys, useNotificationsListener } from '@gridsuite/commons-ui';
import { isStudyNotification } from '../../../../../types/notification-types';
import { NodeType } from '../../../../graph/tree-node.type';
import { isStatusBuilt } from '../../../../graph/util/model-functions';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../../redux/reducer';
import { useFetchEquipment } from '../../../hooks/use-fetch-equipment';
import { SpreadsheetEquipmentType } from '../../../types/spreadsheet.type';
import { NodeAlias } from '../../../types/node-alias.type';

export function useNodeConfigNotificationsListener(
    tableType: SpreadsheetEquipmentType,
    nodeAliases: NodeAlias[] | undefined
) {
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const treeNodes = useSelector((state: AppState) => state.networkModificationTreeModel?.treeNodes);
    const { fetchNodesEquipmentData } = useFetchEquipment(tableType);

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

    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: (event: MessageEvent<string>) => {
            const eventData = JSON.parse(event.data);
            if (!isStudyNotification(eventData) || !currentNode?.id) {
                return;
            }
            const nodeId = eventData.headers.node;
            if (
                currentRootNetworkUuid === eventData.headers.rootNetworkUuid &&
                nodesToReload?.find((alias) => alias.id === nodeId)
            ) {
                fetchNodesEquipmentData(new Set([nodeId]), currentNode.id, currentRootNetworkUuid);
            }
        },
    });
}
