﻿/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export function convertNodetoReactFlowModelNode(node, parentNodeUuid) {
    if (!node) return undefined;
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
            variantId: node.variantId,
            reportUuid: node.reportUuid,
            modificationGroupUuid: node.networkModification,
            label: node.name,
            description: node.description,
            buildStatus: node.buildStatus,
            readOnly: node.readOnly,
        },
    };
}

// Return the first node of type nodeType and specific buildStatus
// in the tree model
export function getFirstNodeOfType(elements, nodeType, buildStatus) {
    return recursiveSearchFirstNodeOfType(
        elements,
        undefined, // first is Root node without parent node
        nodeType,
        buildStatus
    );
}

// Recursive search of a node of type and buildStatus specified
export function recursiveSearchFirstNodeOfType(
    elements,
    parentNodeUuid,
    nodeType,
    buildStatus
) {
    if (
        elements.type === nodeType &&
        (buildStatus === undefined || elements.buildStatus === buildStatus)
    ) {
        return convertNodetoReactFlowModelNode(elements, parentNodeUuid);
    }

    for (const child of elements.children) {
        const found = recursiveSearchFirstNodeOfType(
            child,
            elements.id,
            nodeType,
            buildStatus
        );
        if (found) {
            return found;
        }
    }
}

export function isNodeReadOnly(node) {
    if (node?.type === 'ROOT') return true;
    return node?.data?.readOnly ? true : false; // ternary operator because of potential undefined
}

export function isNodeBuilt(node) {
    if (node?.type === 'ROOT') return true;
    return node?.data?.buildStatus === 'BUILT';
}
