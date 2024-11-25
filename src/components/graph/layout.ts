/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CurrentTreeNode } from 'redux/reducer';

export const nodeWidth = 230;
export const nodeHeight = 110;
export const snapGrid = [1, nodeHeight];

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
            // ROOT NODE
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

export function getAbsolutePosition(nodes: CurrentTreeNode[], node: CurrentTreeNode) {
    let current: CurrentTreeNode | undefined = node;
    let absolutePosition = { x: 0, y: 0 };
    while (current) {
        absolutePosition.x += current.position.x;
        absolutePosition.y += current.position.y;
        const parentId: string | undefined = current.parentId;
        if (!parentId) {
            break;
        }
        current = nodes.find((node) => node.id === parentId);
    }
    return absolutePosition;
}
