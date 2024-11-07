/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CurrentTreeNode } from 'redux/reducer';

export const nodeWidth = 230;
export const nodeHeight = 110;
export const snapGrid = [nodeWidth / 4, nodeHeight];
export const nodeGrid = [nodeWidth, nodeHeight];

function getPosition(placementArray, id) {
    for (let row = 0; row < placementArray.length; row++) {
        for (let column = 0; column < placementArray[row].length; column++) {
            if (placementArray[row][column] === id) {
                return { row: row, column: column };
            }
        }
    }
    return { row: -1, column: -1 };
}

function addValueAtPosition(placementArray, row, column, value) {
    while (placementArray.length <= row) {
        placementArray.push(['']);
    }
    while (placementArray[row].length <= column) {
        placementArray[row].push('');
    }
    placementArray[row][column] = value;
}

function isSpaceEmpty(placementArray, row, column) {
    if (placementArray.length <= row) {
        return true;
    }
    if (placementArray[row].length <= column) {
        return true;
    }
    if (placementArray[row][column]?.length > 0) {
        return false;
    }
    return true;
}

export function getNodePositionsFromTreeNodes(nodes: CurrentTreeNode[]) {
    const newPlacements = [];
    let currentMaxColumn = 0;

    nodes.forEach((node) => {
        if (!node.parentId) {
            // ORIGIN/PARENT NODE
            addValueAtPosition(newPlacements, 0, 0, node.id);
        } else {
            // CHILDREN NODE
            const parentPosition = getPosition(newPlacements, node.parentId);
            // Check if there is an empty space below the parent
            const tryRow = parentPosition.row + 1;
            const tryColumn = parentPosition.column;
            if (isSpaceEmpty(newPlacements, tryRow, tryColumn)) {
                addValueAtPosition(newPlacements, tryRow, tryColumn, node.id);
            } else {
                // We check if there is an empty space on the right of the used space
                do {
                    currentMaxColumn++;
                } while (!isSpaceEmpty(newPlacements, tryRow, currentMaxColumn));
                addValueAtPosition(newPlacements, tryRow, currentMaxColumn, node.id);
            }
        }
    });
    return [...newPlacements];
}

export function getTreeNodesWithUpdatedPositions(nodes: CurrentTreeNode[], nodePlacements: []) {
    const newNodes = [...nodes];
    // Reactflow draws it's node with a position relative to the node's parent (the parent is in the node's parentId field).
    // To find the node's correct relative position using the absolute positions from nodePlacements, we need to substract
    // the parent's position from the current node's position, this gives us the relative position to the parent.
    newNodes.forEach((node) => {
        const storedPosition = getPosition(nodePlacements, node.id);
        const parentStoredPosition = getPosition(nodePlacements, node.parentId);
        const ajustedColumn = (storedPosition?.column || 0) - (parentStoredPosition?.column || 0);
        const ajustedRow = (storedPosition?.row || 0) - (parentStoredPosition?.row || 0);
        node.position = {
            x: ajustedColumn * nodeWidth,
            y: ajustedRow * nodeHeight,
        };
        node.data = {
            ...node.data,
            fixedY: ajustedRow * nodeHeight,
        };
    });
    return [...newNodes];
}

export function hasNodeMultipleChildren(nodes: CurrentTreeNode[], nodeId: string) {
    return nodes.filter((node) => node.parentId === nodeId).length > 1;
}

export function isNodeASibling(nodes: CurrentTreeNode[], nodeId: string) {
    const parentNode = nodes.find((node) => node.id === nodeId)?.parentId;
    if (parentNode) {
        return hasNodeMultipleChildren(nodes, parentNode);
    }
    // Root node has no parents
    return false;
}

export function getFirstAncestorIdWithSibling(nodes: CurrentTreeNode[], nodeId: string) {
    const node = nodes.find((node) => node.id === nodeId);
    if (node) {
        if (isNodeASibling(nodes, node.id)) {
            return nodeId;
        }
        return getFirstAncestorIdWithSibling(nodes, node.parentId);
    }
    return null;
}
