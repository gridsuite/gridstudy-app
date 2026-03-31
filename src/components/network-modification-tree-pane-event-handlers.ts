/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import type { NodeSelectionForCopy } from 'redux/reducer.type';
import type { NodeCreatedEventData, NodeMovedEventData } from 'types/notification-types';
import {
    networkModificationHandleSubtree,
    networkModificationTreeNodeAdded,
    networkModificationTreeNodeMoved,
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

export const fetchAndDispatchAddedNode = (
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

export const fetchAndDispatchMovedNode = (
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

export const fetchAndHandleSubtree = (
    dispatch: AppDispatch,
    studyUuid: UUID,
    rootNodeId: UUID,
    parentNode: UUID
): void => {
    fetchNetworkModificationSubtree(studyUuid, rootNodeId).then((nodes: NetworkModificationNodeData | RootNodeData) => {
        dispatch(networkModificationHandleSubtree(nodes, parentNode));
    });
};
