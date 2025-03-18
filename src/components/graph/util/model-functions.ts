/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UUID } from 'crypto';
import { BUILD_STATUS } from '../../network/constants';
import type NetworkModificationTreeModel from '../network-modification-tree-model';
import type { CurrentTreeNode, ReactFlowModificationNodeData, ReactFlowRootNodeData } from 'redux/reducer';
import { NetworkModificationNodeData, NodeType, RootNodeData } from '../tree-node.type';

export function getModificationNodeDataOrUndefined(node: NetworkModificationNodeData | RootNodeData) {
    if (isModificationNode(node)) {
        return node;
    }
    return undefined;
}

// type guard to check if the node is a modification node
export function isModificationNode(
    node: NetworkModificationNodeData | RootNodeData
): node is NetworkModificationNodeData {
    return node.type === NodeType.NETWORK_MODIFICATION;
}

export function isRootNode(node: NetworkModificationNodeData | RootNodeData): node is NetworkModificationNodeData {
    return node.type === NodeType.ROOT;
}

function convertRootNodeToReactFlowModelNode(node: NetworkModificationNodeData | RootNodeData): ReactFlowRootNodeData {
    return {
        label: node.name,
        description: node.description ?? undefined,
    };
}

function convertModificationNodeToReactFlowModelNode(node: NetworkModificationNodeData): ReactFlowModificationNodeData {
    const networkModificationNodeData = getModificationNodeDataOrUndefined(node);
    const globalBuildStatus = networkModificationNodeData?.nodeBuildStatus?.globalBuildStatus;
    const localBuildStatus = networkModificationNodeData?.nodeBuildStatus?.localBuildStatus;
    return {
        label: node.name,
        description: node.description ?? undefined,
        globalBuildStatus: globalBuildStatus,
        localBuildStatus: localBuildStatus,
    };
}

export function convertNodetoReactFlowModelNode(
    node: NetworkModificationNodeData | RootNodeData,
    parentId?: UUID
): CurrentTreeNode {
    return {
        id: node.id,
        type: node.type,
        position: { x: 0, y: 0 },
        parentId: parentId,
        data: isRootNode(node)
            ? convertRootNodeToReactFlowModelNode(node)
            : convertModificationNodeToReactFlowModelNode(node),
        draggable: isModificationNode(node),
    };
}

// Return the first node of type nodeType and specific buildStatus
// in the tree model
export function getFirstNodeOfType(
    elements: NetworkModificationNodeData | RootNodeData,
    nodeType: NodeType,
    buildStatusList?: string[]
) {
    return recursiveSearchFirstNodeOfType(
        elements,
        nodeType,
        undefined, // first is Root node without parent node
        buildStatusList
    );
}

// Recursive search of a node of type and buildStatus specified
export function recursiveSearchFirstNodeOfType(
    element: NetworkModificationNodeData | RootNodeData,
    nodeType: string,
    parentId?: UUID,
    buildStatusList?: string[]
): CurrentTreeNode | null {
    const modificationNode = getModificationNodeDataOrUndefined(element);
    const globalBuildStatus = modificationNode?.nodeBuildStatus?.globalBuildStatus;

    if (
        element.type === nodeType &&
        (buildStatusList === undefined ||
            (globalBuildStatus !== undefined && buildStatusList.includes(globalBuildStatus)))
    ) {
        return convertNodetoReactFlowModelNode(element, parentId);
    }

    for (const child of element.children ?? []) {
        const found = recursiveSearchFirstNodeOfType(child, nodeType, element.id, buildStatusList);
        if (found) {
            return found;
        }
    }
    return null;
}

export function isNodeReadOnly(node: CurrentTreeNode | null) {
    if (node?.type === NodeType.ROOT) {
        return true;
    }
    return node?.data?.readOnly ? true : false; // ternary operator because of potential undefined
}

export function isStatusBuilt(status: BUILD_STATUS | undefined) {
    return status?.startsWith('BUILT');
}

export function isNodeBuilt(node: CurrentTreeNode | null) {
    if (!node) {
        return false;
    }
    if (node.type === NodeType.ROOT) {
        return true;
    }
    return isStatusBuilt(node.data?.globalBuildStatus);
}

export function isSameNode(node1: CurrentTreeNode | null, node2: CurrentTreeNode | null) {
    return node1?.id === node2?.id;
}

export function isNodeRenamed(node1: CurrentTreeNode | null, node2: CurrentTreeNode | null) {
    if (!node1 || !node2) {
        return false;
    }
    return isSameNode(node1, node2) && node1?.data?.label !== node2?.data?.label;
}

export function isNodeInNotificationList(node: CurrentTreeNode, notificationIdList: UUID[]) {
    if (!node || !notificationIdList) {
        return false;
    }
    return notificationIdList.includes(node.id);
}

export function isSameNodeAndBuilt(node1: CurrentTreeNode | null, node2: CurrentTreeNode | null) {
    return isSameNode(node1, node2) && isNodeBuilt(node1);
}

export function getAllChildren(elements: NetworkModificationTreeModel | null, nodeId: UUID) {
    if (!elements) {
        return [];
    }
    const selectedNode = elements.treeNodes.find((node) => node.id === nodeId);
    if (!selectedNode) {
        return [];
    }
    const directChildren = elements.treeNodes.filter((node) => node.parentId === selectedNode.id);
    let allChildren = [...directChildren];
    directChildren.forEach((child) => {
        allChildren = allChildren.concat(getAllChildren(elements, child.id));
    });
    return allChildren;
}
