/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import type { NodeSelectionForCopy } from 'redux/reducer.type';
import type {
    NodeCreatedEventData,
    NodeMovedEventData,
    NodesColumnPositionsChangedEventData,
    TreeModelUpdateEventData,
} from 'types/notification-types';
import { NotificationType } from 'types/notification-types';
import {
    networkModificationHandleSubtree,
    networkModificationTreeNodeAdded,
    networkModificationTreeNodeMoved,
    networkModificationTreeNodesRemoved,
    networkModificationTreeNodesUpdated,
    reorderNetworkModificationTreeNodes,
    removeNotificationByNode,
    resetLogsFilter,
    resetLogsPagination,
} from '../redux/actions';
import type { AppDispatch } from '../redux/store';
import {
    fetchNetworkModificationSubtree,
    fetchNetworkModificationTreeNode,
    fetchStashedNodes,
} from '../services/study/tree-subtree';
import { CopyType } from './network-modification.type';
import { Dispatch, SetStateAction } from 'react';
import { NetworkModificationNodeData, RootNodeData } from './graph/tree-node.type';

export const isClipboardImpacted = (nodeIds: UUID[], nodeSelectionForCopy: NodeSelectionForCopy): boolean =>
    nodeIds.includes(nodeSelectionForCopy.nodeId!) ||
    ((nodeSelectionForCopy.copyType === CopyType.SUBTREE_COPY ||
        nodeSelectionForCopy.copyType === CopyType.SUBTREE_CUT) &&
        nodeIds.some((nodeId) => nodeSelectionForCopy.allChildren?.map((node) => node.id).includes(nodeId)));

export const invalidateClipboardIfImpacted = (
    nodeIds: UUID[],
    nodeSelectionForCopy: NodeSelectionForCopy,
    resetNodeClipboard: () => void
): void => {
    if (!Array.isArray(nodeIds) || nodeIds.length === 0) return;

    if (isClipboardImpacted(nodeIds, nodeSelectionForCopy)) {
        resetNodeClipboard();
    }
};

export const refreshStashedNodes = (studyUuid: UUID, setNodesToRestore: Dispatch<SetStateAction<unknown[]>>): void => {
    fetchStashedNodes(studyUuid).then((res) => {
        setNodesToRestore(res);
    });
};

const fetchAndDispatchAddedNode = (
    dispatch: AppDispatch,
    studyUuid: UUID,
    currentRootNetworkUuid: UUID,
    eventData: NodeCreatedEventData
): void => {
    fetchNetworkModificationTreeNode(studyUuid, eventData.headers.newNode, currentRootNetworkUuid).then(
        (node: NetworkModificationNodeData | RootNodeData) => {
            dispatch(
                networkModificationTreeNodeAdded(
                    node,
                    eventData.headers.parentNode,
                    eventData.headers.insertMode,
                    eventData.headers.referenceNodeUuid
                )
            );
        }
    );
};

const fetchAndDispatchMovedNode = (
    dispatch: AppDispatch,
    studyUuid: UUID,
    currentRootNetworkUuid: UUID,
    eventData: NodeMovedEventData
): void => {
    fetchNetworkModificationTreeNode(studyUuid, eventData.headers.movedNode, currentRootNetworkUuid).then(
        (node: NetworkModificationNodeData | RootNodeData) => {
            dispatch(
                networkModificationTreeNodeMoved(
                    node,
                    eventData.headers.parentNode,
                    eventData.headers.insertMode,
                    eventData.headers.referenceNodeUuid
                )
            );
        }
    );
};

const fetchAndHandleSubtree = (dispatch: AppDispatch, studyUuid: UUID, rootNodeId: UUID, parentNode: UUID): void => {
    fetchNetworkModificationSubtree(studyUuid, rootNodeId).then((nodes: NetworkModificationNodeData | RootNodeData) => {
        dispatch(networkModificationHandleSubtree(nodes, parentNode));
    });
};

const fetchAndDispatchUpdatedNodes = (
    dispatch: AppDispatch,
    studyUuid: UUID,
    rootNetworkUuid: UUID,
    nodeIds: UUID[]
): void => {
    Promise.allSettled(
        nodeIds.map((nodeId) => fetchNetworkModificationTreeNode(studyUuid, nodeId, rootNetworkUuid))
    ).then((results) => {
        const values = results.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []));
        if (values.length > 0) {
            dispatch(networkModificationTreeNodesUpdated(values));
        }
    });
};

export const handleTreeModelUpdate = (
    dispatch: AppDispatch,
    studyUuid: UUID,
    rootNetworkUuid: UUID,
    eventData: TreeModelUpdateEventData,
    currentNodeId?: UUID
): void => {
    switch (eventData.headers.updateType) {
        case NotificationType.NODE_BUILD_STATUS_UPDATED:
            if (eventData.headers.rootNetworkUuid !== rootNetworkUuid) break;
            fetchAndDispatchUpdatedNodes(dispatch, studyUuid, rootNetworkUuid, eventData.headers.nodes);
            if (currentNodeId && eventData.headers.nodes.includes(currentNodeId)) {
                dispatch(removeNotificationByNode([currentNodeId]));
                dispatch(resetLogsFilter());
                dispatch(resetLogsPagination());
            }
            break;
        case NotificationType.NODE_CREATED:
            fetchAndDispatchAddedNode(dispatch, studyUuid, rootNetworkUuid, eventData as NodeCreatedEventData);
            break;
        case NotificationType.SUBTREE_CREATED:
            fetchAndHandleSubtree(dispatch, studyUuid, eventData.headers.newNode, eventData.headers.parentNode);
            break;
        case NotificationType.NODE_MOVED:
            fetchAndDispatchMovedNode(dispatch, studyUuid, rootNetworkUuid, eventData as NodeMovedEventData);
            break;
        case NotificationType.SUBTREE_MOVED:
            fetchAndHandleSubtree(dispatch, studyUuid, eventData.headers.movedNode, eventData.headers.parentNode);
            break;
        case NotificationType.NODES_COLUMN_POSITION_CHANGED:
            dispatch(
                reorderNetworkModificationTreeNodes(
                    eventData.headers.parentNode,
                    JSON.parse((eventData as NodesColumnPositionsChangedEventData).payload)
                )
            );
            break;
        case NotificationType.NODES_DELETED:
            dispatch(networkModificationTreeNodesRemoved(eventData.headers.nodes));
            break;
        case NotificationType.NODES_UPDATED:
            fetchAndDispatchUpdatedNodes(dispatch, studyUuid, rootNetworkUuid, eventData.headers.nodes);
            if (currentNodeId && eventData.headers.nodes.includes(currentNodeId)) {
                dispatch(removeNotificationByNode([currentNodeId]));
            }
            break;
        case NotificationType.NODE_EDITED:
            fetchAndDispatchUpdatedNodes(dispatch, studyUuid, rootNetworkUuid, [eventData.headers.node]);
            break;
        default:
            break;
    }
};
