/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export function convertNodetoReactFlowModelNode(node, parentNodeUuid) {
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
            buildStatus: node.buildStatus,
            readOnly: node.readOnly,
        },
    };
}

// Return the first node of type nodeType and specific buildStatus
// in the tree model
export function getFirstNodeOfType(elements, nodeType, buildStatusList) {
    return recursiveSearchFirstNodeOfType(
        elements,
        undefined, // first is Root node without parent node
        nodeType,
        buildStatusList
    );
}

// Recursive search of a node of type and buildStatus specified
export function recursiveSearchFirstNodeOfType(
    elements,
    parentNodeUuid,
    nodeType,
    buildStatusList
) {
    if (
        elements.type === nodeType &&
        (buildStatusList === undefined ||
            buildStatusList.includes(elements.buildStatus))
    ) {
        return convertNodetoReactFlowModelNode(elements, parentNodeUuid);
    }

    for (const child of elements.children) {
        const found = recursiveSearchFirstNodeOfType(
            child,
            elements.id,
            nodeType,
            buildStatusList
        );
        if (found) {
            return found;
        }
    }
}

export function isNodeReadOnly(node) {
    if (node?.type === 'ROOT') {
        return true;
    }
    return node?.data?.readOnly ? true : false; // ternary operator because of potential undefined
}

export function isNodeBuilt(node) {
    if (!node) {
        return false;
    }
    if (node.type === 'ROOT') {
        return true;
    }
    return node.data?.buildStatus?.startsWith('BUILT');
}

export function isSameNode(node1, node2) {
    return node1?.id === node2?.id;
}

export function isNodeRenamed(node1, node2) {
    if (!node1 || !node2) {
        return false;
    }
    return (
        isSameNode(node1, node2) && node1?.data?.label !== node2?.data?.label
    );
}

export function isNodeInNotificationList(node, notificationIdList) {
    if (!node || !notificationIdList) {
        return false;
    }
    return notificationIdList.includes(node.id);
}

export function isSameNodeAndBuilt(node1, node2) {
    return isSameNode(node1, node2) && isNodeBuilt(node1);
}

export function getAllChildren(elements, nodeId) {
    const selectedNode = elements.treeNodes.find((node) => node.id === nodeId);
    const directChildren = elements.treeNodes.filter(
        (node) => node.data.parentNodeUuid === selectedNode.id
    );
    let allChildren = [...directChildren];
    directChildren.forEach((child) => {
        allChildren = allChildren.concat(getAllChildren(elements, child.id));
    });
    return allChildren;
}
