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

type PlacementArray = string[][];

function getPlacement(placementArray: PlacementArray, id: string) {
    for (let row = 0; row < placementArray.length; row++) {
        for (let column = 0; column < placementArray[row].length; column++) {
            if (placementArray[row][column] === id) {
                return { row: row, column: column };
            }
        }
    }
    return { row: -1, column: -1 };
}

function addValueAtPlacement(placementArray: PlacementArray, row: number, column: number, value: string) {
    while (placementArray.length <= row) {
        placementArray.push(['']);
    }
    while (placementArray[row].length <= column) {
        placementArray[row].push('');
    }
    placementArray[row][column] = value;
}

function isSpaceEmpty(placementArray: PlacementArray, row: number, column: number) {
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

/**
 * Builds an array representing the placements of nodes for the tree.
 * This array is then used to compute each node's position before being used by ReactFlow.
 */
function getNodePlacementsFromTreeNodes(nodes: CurrentTreeNode[]) {
    const newPlacements: PlacementArray = [];
    let currentMaxColumn = 0;

    nodes.forEach((node) => {
        if (!node.parentId) {
            // ORIGIN/PARENT NODE
            addValueAtPlacement(newPlacements, 0, 0, node.id);
        } else {
            // CHILDREN NODE
            const parentPlacement = getPlacement(newPlacements, node.parentId);
            // Check if there is an empty space below the parent
            const tryRow = parentPlacement.row + 1;
            const tryColumn = parentPlacement.column;
            if (isSpaceEmpty(newPlacements, tryRow, tryColumn)) {
                addValueAtPlacement(newPlacements, tryRow, tryColumn, node.id);
            } else {
                // We check if there is an empty space on the right of the used space
                do {
                    currentMaxColumn++;
                } while (!isSpaceEmpty(newPlacements, tryRow, currentMaxColumn));
                addValueAtPlacement(newPlacements, tryRow, currentMaxColumn, node.id);
            }
        }
    });
    return newPlacements;
}

/**
 * Updates the tree nodes' x and y positions for ReactFlow display in the tree
 */
export function getTreeNodesWithUpdatedPositions(nodes: CurrentTreeNode[]) {
    const newNodes = [...nodes];
    const nodePlacements = getNodePlacementsFromTreeNodes(newNodes);

    newNodes.forEach((node) => {
        const placement = getPlacement(nodePlacements, node.id);

        // TODO CHARLY commentaire pour expliquer cet ajout
        node.data = {
            ...node.data,
            absolutePosition: {
                x: placement.column * nodeWidth,
                y: placement.row * nodeHeight,
            },
        };

        if (node.parentId) {
            // Reactflow draws it's node with a position relative to the node's parent (the parent is in the node's parentId field).
            // To find the node's correct relative position using the absolute positions from nodePlacements, we need to substract
            // the parent's position from the current node's position, this gives us the relative position to the parent.
            const parentPlacement = getPlacement(nodePlacements, node.parentId);
            placement.row -= parentPlacement.row;
            placement.column -= parentPlacement.column;
        }

        node.position = {
            x: placement.column * nodeWidth,
            y: placement.row * nodeHeight,
        };
    });
    return [...newNodes];
}

/**
 * Check if nodeId has at least one sibling, meaning its parent has multiple children.
 */
export function isNodeASibling(nodes: CurrentTreeNode[], nodeId: string) {
    const parentNodeId = nodes.find((node) => node.id === nodeId)?.parentId;
    if (parentNodeId) {
        return nodes.filter((node) => node.parentId === parentNodeId).length > 1;
    }
    return false;
}

/**
 * Traverse the tree node hierarchy to find the first node that is an ancestor of nodeId and has a sibling.
 * This function is used to find the starting point of a branch in the tree.
 */
export function getFirstAncestorIdWithSibling(nodes: CurrentTreeNode[], nodeId: string): string | null {
    const node = nodes.find((node) => node.id === nodeId);
    if (node && node.parentId) {
        if (isNodeASibling(nodes, node.id)) {
            return nodeId;
        }
        return getFirstAncestorIdWithSibling(nodes, node.parentId);
    }
    return null;
}

// TODO CHARLY commentaire pour differencier les deux fonctions
export function getCurrentAbsolutePosition(nodes: CurrentTreeNode[], node: CurrentTreeNode) {
    let currentNode = node;
    let absolutePosition = { x: 0, y: 0 };
    while (currentNode) {
        absolutePosition.x += currentNode.position.x;
        absolutePosition.y += currentNode.position.y;

        if (!currentNode.parentId) {
            break;
        }
        currentNode = nodes.find((node) => node.id === currentNode.parentId);
    }
    return absolutePosition;
}
// TODO CHARLY commentaire pour differencier les deux fonctions
export function getStoredAbsolutePosition(node: CurrentTreeNode) {
    return node?.data?.absolutePosition;
}

/**
 * Will find all the nodes between the two X positions provided, then return only one node
 * whose X position is closer to xDestination.
 * If zero node is found, will return null.
 * @param nodes
 * @param xOrigin
 * @param xDestination
 */
export function findClosestNodeBetweenVerticalPositions(
    nodes: CurrentTreeNode[],
    xOrigin: number,
    xDestination: number
): CurrentTreeNode | null {
    const minX = Math.min(xOrigin, xDestination);
    const maxX = Math.max(xOrigin, xDestination);
    const nodesBetween = nodes.filter((n) => {
        const absolutePosition = getStoredAbsolutePosition(n);
        return absolutePosition?.x < maxX && absolutePosition?.x > minX;
    });
    if (nodesBetween.length > 0) {
        console.error(
            'CHARLY found nodes : ' +
                nodesBetween.map((n) => n.id.substring(0, 3) + '_' + getStoredAbsolutePosition(n)?.x)
        );
        const closestNode = nodesBetween.reduce((closest, current) =>
            Math.abs(getStoredAbsolutePosition(current)?.x - xDestination) <
            Math.abs(getStoredAbsolutePosition(closest)?.x - xDestination)
                ? current
                : closest
        );
        console.error('CHARLY closest node : ' + closestNode.id.substring(0, 3));
        return closestNode;
    }
    return null;
}

export function findSiblings(nodes: CurrentTreeNode[], node: CurrentTreeNode) {
    return nodes.filter((n) => n.parentId === node.parentId && n.id !== node.id);
}
