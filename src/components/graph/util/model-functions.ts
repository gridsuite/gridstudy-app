/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UUID } from 'crypto';
import NetworkModificationTreeModel from '../network-modification-tree-model';
import { CurrentTreeNode } from 'redux/reducer';
import { NetworkModificationNodeData, RootNodeData, NodeType } from '../tree-node.type';

export function convertNodetoReactFlowModelNode(
    node: NetworkModificationNodeData | RootNodeData,
    parentNodeUuid?: UUID
): CurrentTreeNode {
    // Use the type guard to safely access nodeBuildStatus
    const globalBuildStatus = isNetworkModificationNode(node) ? node.nodeBuildStatus?.globalBuildStatus : undefined;
    const localBuildStatus = isNetworkModificationNode(node) ? node.nodeBuildStatus?.localBuildStatus : undefined;

    const data = {
        parentNodeUuid: parentNodeUuid!,
        label: node.name,
        description: node.description ?? null,
        globalBuildStatus: globalBuildStatus,
        localBuildStatus: localBuildStatus,
    };

    // This is the ReactFlow format (Cf documentation)
    // {
    //  id: '1',
    //  type: 'input',
    //  data: { label: 'Node 1' }, <- use data for customization
    //  position: { x: 250, y: 5 }
    // }

    return {
        id: node.id,
        type: node.type,
        position: { x: 0, y: 0 },
        data: data,
    };
}

// Return the first node of type nodeType and specific buildStatus
// in the tree model
export function getFirstNodeOfType(
    elements: NetworkModificationNode | RootNode,
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
export function isNetworkModificationNode(n: NetworkModificationNode | RootNode): n is NetworkModificationNode {
    return 'nodeBuildStatus' in n;
}

// Recursive search of a node of type and buildStatus specified
export function recursiveSearchFirstNodeOfType(
    elements: NetworkModificationNode | RootNode,
    nodeType: string,
    parentNodeUuid?: UUID,
    buildStatusList?: string[]
): CurrentTreeNode | null {
    const globalBuildStatus = isNetworkModificationNode(elements)
        ? elements.nodeBuildStatus?.globalBuildStatus
        : undefined;

    if (
        elements.type === nodeType &&
        (buildStatusList === undefined ||
            (globalBuildStatus !== undefined && buildStatusList.includes(globalBuildStatus)))
    ) {
        return convertNodetoReactFlowModelNode(elements, parentNodeUuid);
    }

    for (const child of elements.children ?? []) {
        const found = recursiveSearchFirstNodeOfType(child, nodeType, elements.id, buildStatusList);
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

export function isNodeBuilt(node: CurrentTreeNode | null) {
    if (!node) {
        return false;
    }
    if (node.type === NodeType.ROOT) {
        return true;
    }
    return node.data?.globalBuildStatus?.startsWith('BUILT');
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
    const directChildren = elements.treeNodes.filter((node) => node.data.parentNodeUuid === selectedNode.id);
    let allChildren = [...directChildren];
    directChildren.forEach((child) => {
        allChildren = allChildren.concat(getAllChildren(elements, child.id));
    });
    return allChildren;
}
