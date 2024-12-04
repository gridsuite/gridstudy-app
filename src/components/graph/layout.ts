/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CurrentTreeNode } from 'redux/reducer';
import { countNodes } from './network-modification-tree-model';
import { UUID } from 'crypto';

export const nodeWidth = 230;
export const nodeHeight = 110;
export const snapGrid = [10, nodeHeight]; // Used for drag and drop

type NodePlacement = {
    row: number;
    column: number;
};

/**
 * Uses a bidirectional map to match a node ID to a NodePlacement.
 */
class PlacementGrid {
    private readonly idToPlacement = new Map<string, NodePlacement>();
    private readonly placementToId = new Map<string, string>();

    private nodePlacementToString(placement: NodePlacement): string {
        return `${placement.row}_${placement.column}`;
    }

    setPlacement(nodeId: string, placement: NodePlacement) {
        // Remove any existing mappings to ensure bidirectionality
        if (this.idToPlacement.has(nodeId)) {
            const oldPlacement = this.idToPlacement.get(nodeId)!;
            this.placementToId.delete(this.nodePlacementToString(oldPlacement));
        }
        const placementString = this.nodePlacementToString(placement);
        if (this.placementToId.has(placementString)) {
            const oldId = this.placementToId.get(placementString)!;
            this.idToPlacement.delete(oldId);
        }
        // Add the new mappings
        this.idToPlacement.set(nodeId, placement);
        this.placementToId.set(placementString, nodeId);
    }

    getPlacement(nodeId: string): NodePlacement | undefined {
        const placement = this.idToPlacement.get(nodeId);
        // This ensure immutability to prevent external modifications on the returned value
        // from modifying this object's internal values.
        return placement ? { ...placement } : undefined;
    }

    isPlacementTaken(placement: NodePlacement): boolean {
        return this.placementToId.has(this.nodePlacementToString(placement));
    }
}

/**
 * Builds a bidirectional map representing the placements of nodes for the tree.
 * This map is then used to compute each node's x and y position before being used by ReactFlow.
 *
 * This algorithm relies on the fact that the nodes are ordered. Children nodes will always be
 * after their parents.
 *
 * Example tree :
 *     A
 *    / \
 *   B   D
 *  /   / \
 * C   E   F
 *
 * This tree should have its nodes in the array in this order : [A, B, C, D, E, F]
 *
 * For this tree, the returned PlacementGrid would be like this :
 * A = {row: 0, column: 0}
 * B = {row: 1, column: 0}
 * C = {row: 2, column: 0}
 * D = {row: 1, column: 1}
 * E = {row: 2, column: 1}
 * F = {row: 2, column: 2}
 */
function getNodePlacements(nodes: CurrentTreeNode[]): PlacementGrid {
    const nodePlacements = new PlacementGrid();
    let currentMaxColumn = 0;

    nodes.forEach((node) => {
        if (!node.parentId) {
            // First node, top left.
            nodePlacements.setPlacement(node.id, { row: 0, column: 0 });
        } else {
            const parentPlacement = nodePlacements.getPlacement(node.parentId);
            if (parentPlacement) {
                const potentialChildPlacement = {
                    // We try a placement just below the parent node
                    row: parentPlacement.row + 1,
                    column: parentPlacement.column,
                };
                if (nodePlacements.isPlacementTaken(potentialChildPlacement)) {
                    // The space directly below the parent is already taken. We will try a different columns to find an
                    // empty space. To do so, we use currentMaxColumn as it tracks the most-right used (yet) column of
                    // children (if any) of the current node's siblings.
                    // By incrementing currentMaxColumn and using it, we ensure the current node's placement is not
                    // above any other node.
                    currentMaxColumn++;
                    potentialChildPlacement.column = currentMaxColumn;
                }
                nodePlacements.setPlacement(node.id, potentialChildPlacement);
            }
        }
    });
    return nodePlacements;
}

/**
 * Finds the IDs of nodes that have a sibling but are not the first child of their parent.
 */
function getNonEldestSiblingsIds(nodes: CurrentTreeNode[]): string[] {
    const seenParentIds: string[] = [];
    const nonEldestSiblingsIds: string[] = [];
    nodes.forEach((node) => {
        if (node.parentId) {
            if (seenParentIds.includes(node.parentId)) {
                nonEldestSiblingsIds.push(node.id);
            }
            seenParentIds.push(node.parentId);
        }
    });
    return nonEldestSiblingsIds;
}

/**
 * Create a Map using row number as keys and column number as value. The column value
 * for each row is the lowest value among column values of the same row, for the provided nodes.
 *
 * Example nodes and placements :
 * - NodeA {row:0, column:30}
 * - NodeB {row:1, column:10}
 * - NodeC {row:1, column:50}
 * - NodeD {row:2, column:40}
 * - NodeE {row:2, column:80}
 *
 * For these placements, the returned Map would be like this : {0 => 30, 1 => 10, 2 => 40}
 */
function getMinimumColumnByRows(nodes: CurrentTreeNode[], placements: PlacementGrid): Map<number, number> {
    const minColumnByRow: Map<number, number> = new Map();
    nodes.forEach((node) => {
        const nodePlacement = placements.getPlacement(node.id);
        if (nodePlacement) {
            if (
                !minColumnByRow.has(nodePlacement.row) ||
                nodePlacement.column < minColumnByRow.get(nodePlacement.row)!
            ) {
                minColumnByRow.set(nodePlacement.row, nodePlacement.column);
            }
        }
    });
    return minColumnByRow;
}

/**
 * Create a Map using row number as keys and column number as value. The column value
 * for each row is the highest value among column values of the same row, for the provided nodes.
 *
 * Example nodes and placements :
 * - NodeA {row:0, column:30}
 * - NodeB {row:1, column:10}
 * - NodeC {row:1, column:50}
 * - NodeD {row:2, column:40}
 * - NodeE {row:2, column:80}
 *
 * For these placements, the returned Map would be like this : {0 => 30, 1 => 50, 2 => 80}
 */
function getMaximumColumnByRows(nodes: CurrentTreeNode[], placements: PlacementGrid): Map<number, number> {
    const maxColumnByRow: Map<number, number> = new Map();
    nodes.forEach((node) => {
        const nodePlacement = placements.getPlacement(node.id);
        if (nodePlacement) {
            if (
                !maxColumnByRow.has(nodePlacement.row) ||
                nodePlacement.column > maxColumnByRow.get(nodePlacement.row)!
            ) {
                maxColumnByRow.set(nodePlacement.row, nodePlacement.column);
            }
        }
    });
    return maxColumnByRow;
}

/**
 * For each matching rows in the two provided maps, we compare their column values to calculate
 * the empty usable space between them.
 *
 * @param leftColumns Map produced by the getMaximumColumnByRows function
 * @param rightColumns Map produced by the getMinimumColumnByRows function
 */
function calculateAvailableSpace(leftColumns: Map<number, number>, rightColumns: Map<number, number>): number {
    if (leftColumns.size === 0 || rightColumns.size === 0) {
        return 0;
    }

    let availableSpace = Infinity;

    for (const [row, rightColumn] of rightColumns) {
        const leftColumnSameRow = leftColumns.get(row);
        if (leftColumnSameRow !== undefined) {
            const space = rightColumn - (leftColumnSameRow + 1);
            if (space < availableSpace) {
                availableSpace = space;
            }
        }
        // We want to keep an open space vertically between two different branches, so we also test the space
        // for the next row.
        const leftColumnRowBelow = leftColumns.get(row + 1);
        if (leftColumnRowBelow !== undefined) {
            const space = rightColumn - (leftColumnRowBelow + 1);
            if (space < availableSpace) {
                availableSpace = space;
            }
        }
        if (availableSpace <= 0) {
            return 0;
        }
    }

    return availableSpace;
}

/**
 * Will move the provided nodes' placements to the left by shiftValue amount.
 */
function shiftPlacementsToTheLeft(nodes: CurrentTreeNode[], placements: PlacementGrid, shiftValue: number) {
    nodes.forEach((node) => {
        const oldPlacement = placements.getPlacement(node.id);
        if (oldPlacement) {
            placements.setPlacement(node.id, { row: oldPlacement.row, column: oldPlacement.column - shiftValue });
        }
    });
}

/**
 * We will try to compress the tree, using the following rules :
 * - We move a branch to the left if the branch's starting node has a sibling to its left.
 * - We can move a branch above another branch if, for each nodes of those two branches, there is at least
 *   one empty space separating the branches vertically, for each overlaping columns.
 * - Edge should never cross each other.
 *
 * @param nodes
 * @param placements represents the nodes's placements in a grid after the algorithm's first pass, without compression
 */
function compressTree(nodes: CurrentTreeNode[], placements: PlacementGrid) {
    // First, we find all the nodes that start a branch and that have a sibling to their left.
    const nonEldestSiblingsIds = getNonEldestSiblingsIds(nodes);

    // For each of those nodes's branches, we will calculate how much space available there is to
    // the left, for each row of the branch.
    nonEldestSiblingsIds.forEach((currentNodeId) => {
        // We have to find the minimum column placement values (per row) for the current branch, and compare them
        // to the maximum column placement values (per row) of the nodes on the left.
        // The resulting space we find represents how much we can shift the current column to the left.

        const currentNodeFamilySize = 1 + countNodes(nodes, currentNodeId as UUID);
        const indexOfCurrentNode = nodes.findIndex((n) => n.id === currentNodeId);
        const nodesOfTheCurrentBranch = nodes.slice(indexOfCurrentNode, indexOfCurrentNode + currentNodeFamilySize);
        const currentBranchMinimumColumnByRow = getMinimumColumnByRows(nodesOfTheCurrentBranch, placements);

        // We have to compare with all the left nodes, not only the current branch's left neighbor, because in some cases,
        // other branches could go under the left neighbor and make edges cross.
        const nodesOnTheLeft = nodes.slice(0, indexOfCurrentNode);
        const leftBranchMaximumColumnByRow = getMaximumColumnByRows(nodesOnTheLeft, placements);

        const availableSpace = calculateAvailableSpace(leftBranchMaximumColumnByRow, currentBranchMinimumColumnByRow);

        if (availableSpace > 0) {
            shiftPlacementsToTheLeft(nodesOfTheCurrentBranch, placements, availableSpace);
        }
    });
    return placements;
}

/**
 * Updates the tree nodes' x and y positions for ReactFlow display in the tree
 */
export function getTreeNodesWithUpdatedPositions(nodes: CurrentTreeNode[]) {
    const newNodes = [...nodes];
    const uncompressedNodePlacements = getNodePlacements(newNodes);

    const nodePlacements = compressTree(newNodes, uncompressedNodePlacements);

    newNodes.forEach((node) => {
        const placement = nodePlacements.getPlacement(node.id);
        if (placement) {
            if (node.parentId) {
                // Reactflow draws its nodes with a position relative to the node's parent (the parent is in the node's parentId field).
                // To find the node's correct relative position using the absolute positions from nodePlacements, we need to substract
                // the parent's position from the current node's position, this gives us the relative position to the parent.
                const parentPlacement = nodePlacements.getPlacement(node.parentId);
                if (parentPlacement) {
                    placement.row -= parentPlacement.row;
                    placement.column -= parentPlacement.column;
                }
            }

            node.position = {
                x: placement.column * nodeWidth,
                y: placement.row * nodeHeight,
            };
        }
    });
    return [...newNodes];
}

/**
 * Check if node has at least one sibling, meaning its parent has multiple children.
 */
function isNodeASibling(nodes: CurrentTreeNode[], node: CurrentTreeNode): boolean {
    return node.parentId ? nodes.some((n) => n.parentId === node.parentId && n.id !== node.id) : false;
}

/**
 * Traverse the tree node hierarchy to find the first node that is an ancestor of descendantNode and has a sibling.
 * This function is used to find the starting point of a branch in the tree.
 */
export function getFirstAncestorWithSibling(
    nodes: CurrentTreeNode[],
    descendantNode: CurrentTreeNode | undefined
): CurrentTreeNode | undefined {
    if (descendantNode && descendantNode.parentId) {
        if (isNodeASibling(nodes, descendantNode)) {
            return descendantNode;
        }
        const parentOfDescendantNode = nodes.find((node) => node.id === descendantNode.parentId);
        return getFirstAncestorWithSibling(nodes, parentOfDescendantNode);
    }
    return undefined;
}

/**
 * Will find the sibling node whose X position is closer to xDestination in the X range provided.
 */
export function findClosestSiblingInRange(
    nodes: CurrentTreeNode[],
    movedNode: CurrentTreeNode,
    xOrigin: number,
    xDestination: number
): CurrentTreeNode | null {
    const minX = Math.min(xOrigin, xDestination);
    const maxX = Math.max(xOrigin, xDestination);
    const siblingNodes = findSiblings(nodes, movedNode);
    const nodesBetween = siblingNodes.filter((n) => n.position.x < maxX && n.position.x > minX);
    if (nodesBetween.length > 0) {
        const closestNode = nodesBetween.reduce(
            (closest, current) =>
                Math.abs(current.position.x - xDestination) < Math.abs(closest.position.x - xDestination)
                    ? current
                    : closest,
            nodesBetween[0]
        );
        return closestNode;
    }
    return null;
}

/**
 * Will find the siblings of a provided node (all siblings have the same parent).
 */
function findSiblings(nodes: CurrentTreeNode[], node: CurrentTreeNode): CurrentTreeNode[] {
    return nodes.filter((n) => n.parentId === node.parentId && n.id !== node.id);
}

/**
 * Computes the absolute position of a node by calculating the sum of all the relative positions of
 * the node's lineage.
 */
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
