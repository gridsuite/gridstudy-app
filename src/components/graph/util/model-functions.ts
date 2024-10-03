/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UUID } from 'crypto';
import NetworkModificationTreeModel, { NetworkModificationNode } from '../network-modification-tree-model';

export function convertNodetoReactFlowModelNode(
    node: NetworkModificationNode | null,
    parentNodeUuid: UUID | undefined
) {
    if (!node) {
        return undefined;
    }
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
        data: {
            parentNodeUuid: parentNodeUuid,
            label: node.name,
            description: node.description,
            globalBuildStatus: node.nodeBuildStatus?.globalBuildStatus,
            localBuildStatus: node.nodeBuildStatus?.localBuildStatus,
            readOnly: node.readOnly,
        },
    };
}

// Return the first node of type nodeType and specific buildStatus
// in the tree model
export function getFirstNodeOfType(elements: any, nodeType: string, buildStatusList: string[]) {
    return recursiveSearchFirstNodeOfType(
        elements,
        undefined, // first is Root node without parent node
        nodeType,
        buildStatusList
    );
}

// Recursive search of a node of type and buildStatus specified
export function recursiveSearchFirstNodeOfType(
    elements: any,
    parentNodeUuid: UUID | undefined,
    nodeType: string,
    buildStatusList: string[]
): any {
    if (
        elements.type === nodeType &&
        (buildStatusList === undefined || buildStatusList.includes(elements.nodeBuildStatus?.globalBuildStatus))
    ) {
        return convertNodetoReactFlowModelNode(elements, parentNodeUuid);
    }

    for (const child of elements.children) {
        const found = recursiveSearchFirstNodeOfType(child, elements.id, nodeType, buildStatusList);
        if (found) {
            return found;
        }
    }
}

export function isNodeReadOnly(node: any) {
    if (node?.type === 'ROOT') {
        return true;
    }
    return node?.data?.readOnly ? true : false; // ternary operator because of potential undefined
}

export function isNodeBuilt(node: any) {
    if (!node) {
        return false;
    }
    if (node.type === 'ROOT') {
        return true;
    }
    return node.data?.globalBuildStatus?.startsWith('BUILT');
}

export function isSameNode(node1: any, node2: any) {
    return node1?.id === node2?.id;
}

export function isNodeRenamed(node1: any, node2: any) {
    if (!node1 || !node2) {
        return false;
    }
    return isSameNode(node1, node2) && node1?.data?.label !== node2?.data?.label;
}

export function isNodeInNotificationList(node: any, notificationIdList: any) {
    if (!node || !notificationIdList) {
        return false;
    }
    return notificationIdList.includes(node.id);
}

export function isSameNodeAndBuilt(node1: any, node2: any) {
    return isSameNode(node1, node2) && isNodeBuilt(node1);
}

export function getAllChildren(elements: NetworkModificationTreeModel | null, nodeId: string) {
    if (!elements) {
        return [];
    }
    const selectedNode = elements.treeNodes.find((node: any) => node.id === nodeId);
    const directChildren = elements.treeNodes.filter((node: any) => node.data.parentNodeUuid === selectedNode.id);
    let allChildren = [...directChildren];
    directChildren.forEach((child: any) => {
        allChildren = allChildren.concat(getAllChildren(elements, child.id));
    });
    return allChildren;
}
