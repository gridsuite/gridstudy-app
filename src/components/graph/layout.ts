/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { NodeMap, SecurityGroupMembersMap } from './layout.type';
import { NODE_HEIGHT, NODE_WIDTH } from './nodes/constants';
import { groupIdSuffix, LABELED_GROUP_TYPE } from './nodes/labeled-group-node.type';
import { CurrentTreeNode, isSecurityModificationNode } from './tree-node.type';
import { addMember, getSecurityGroupRows, PlacementGrid } from './layout-utils';

const widthSpacing = 70;
const heightSpacing = 90;
export const nodeWidth = NODE_WIDTH + widthSpacing;
export const nodeHeight = NODE_HEIGHT + heightSpacing;
export const snapGrid = [10, nodeHeight]; // Used for drag and drop

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

    for (const node of nodes) {
        if (node.parentId) {
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
        } else {
            // First node, top left.
            nodePlacements.setPlacement(node.id, { row: 0, column: 0 });
        }
    }
    return nodePlacements;
}

/**
 * Create a Map using row number as keys and column number as value. The column value for each row is either
 * the lowest or highest (extreme) value among column values of the same row for the provided nodes.
 *
 * Example nodes and placements :
 * - NodeA {row:0, column:30}
 * - NodeB {row:1, column:10}
 * - NodeC {row:1, column:50}
 * - NodeD {row:2, column:40}
 * - NodeE {row:2, column:80}
 *
 * For these placements, the returned Map would be, with getMax=false, like this : {0 => 30, 1 => 10, 2 => 40}
 * and with getMax=true, like this : {0 => 30, 1 => 50, 2 => 80}
 *
 * If there are security nodes in the tree, we consider that each group of security nodes share the
 * same lowest or highest value for each of their rows.
 *
 * @param nodes The nodes to process
 * @param placements The grid placements
 * @param nodeMap The map used to find a node's parent
 * @param securityGroupMembersMap The map used to find members of a security group
 * @param currentSecurityNode The current (if not null) security group of the node we are calling this function for
 * @param getMax If true, returns maximum columns, if false returns minimum columns
 */
function getColumnsByRows(
    nodes: CurrentTreeNode[],
    placements: PlacementGrid,
    nodeMap: NodeMap,
    securityGroupMembersMap: SecurityGroupMembersMap,
    currentSecurityNode: string | null,
    getMax: boolean
): Map<number, number> {
    const columnsByRow: Map<number, number> = new Map();

    for (const node of nodes) {
        const nodePlacement = placements.getPlacement(node.id);
        if (!nodePlacement || !node.parentId) {
            continue;
        }

        const contender = nodePlacement.column;
        if (isExtreme(getMax, contender, columnsByRow.get(nodePlacement.row))) {
            const securityGroupToUpdate = nodeMap.get(node.id)?.belongsToSecurityGroupId;

            // Security groups should be treated as a whole, and if we find a new extreme, the whole group should be updated.
            if (
                securityGroupToUpdate != null &&
                (securityGroupToUpdate === node.id || securityGroupToUpdate !== currentSecurityNode)
            ) {
                // We update all the security group's rows
                updateSecurityGroupRows(
                    securityGroupToUpdate,
                    contender,
                    columnsByRow,
                    placements,
                    securityGroupMembersMap,
                    getMax
                );
            } else {
                // We only update the current row.
                columnsByRow.set(nodePlacement.row, contender);
            }
        }
    }
    return columnsByRow;
}

function isExtreme(getMax: boolean, contender: number, competition: number | undefined): boolean {
    if (competition === undefined) {
        return true;
    }
    return getMax ? contender > competition : contender < competition;
}

function updateSecurityGroupRows(
    securityGroupToUpdate: string,
    contender: number,
    columnsByRow: Map<number, number>,
    placements: PlacementGrid,
    securityGroupMembersMap: SecurityGroupMembersMap,
    getMax: boolean
) {
    const rowsToUpdate = getSecurityGroupRows(securityGroupToUpdate, securityGroupMembersMap, placements);
    for (const row of rowsToUpdate) {
        // We test each row with isExtreme to prevent overwriting a previously set valid value
        if (isExtreme(getMax, contender, columnsByRow.get(row))) {
            columnsByRow.set(row, contender);
        }
    }
}

function getMinimumColumnByRows(
    nodes: CurrentTreeNode[],
    placements: PlacementGrid,
    nodeMap: NodeMap,
    securityGroupMembersMap: SecurityGroupMembersMap,
    currentSecurityNode: string | null
): Map<number, number> {
    return getColumnsByRows(nodes, placements, nodeMap, securityGroupMembersMap, currentSecurityNode, false);
}

function getMaximumColumnByRows(
    nodes: CurrentTreeNode[],
    placements: PlacementGrid,
    nodeMap: NodeMap,
    securityGroupMembersMap: SecurityGroupMembersMap,
    currentSecurityNode: string | null
): Map<number, number> {
    return getColumnsByRows(nodes, placements, nodeMap, securityGroupMembersMap, currentSecurityNode, true);
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
    for (const node of nodes) {
        const oldPlacement = placements.getPlacement(node.id);
        if (oldPlacement) {
            placements.setPlacement(node.id, { row: oldPlacement.row, column: oldPlacement.column - shiftValue });
        }
    }
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
 * @param nodeMap nodeId to index in tree and node info map
 * @param childrenMap nodeId to list of children map
 * @param securityGroupMembersMap The map used to find members of a security group
 */
function compressTreePlacements(
    nodes: CurrentTreeNode[],
    placements: PlacementGrid,
    nodeMap: NodeMap,
    childrenMap: Map<string, CurrentTreeNode[]>,
    securityGroupMembersMap: SecurityGroupMembersMap
) {
    // Calculate subtree sizes in a single pass (bottom-up) to have the children nodes sizes ready
    const subTreeSizeMap = new Map<string, number>();

    for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i];
        const children = childrenMap.get(node.id) || [];
        const childrenSize = children.reduce((sum, child) => sum + (subTreeSizeMap.get(child.id) ?? 0), 0);
        subTreeSizeMap.set(node.id, 1 + childrenSize);
    }

    // We find all the nodes that start a branch and that have a sibling to their left.
    const nonEldestSiblingsIds = nodes
        .filter((node) => node.parentId && childrenMap.get(node.parentId)![0].id !== node.id)
        .map((node) => node.id);

    // For each of those nodes's branches, we will calculate how much space available there is to
    // the left, for each row of the branch.
    for (const currentNodeId of nonEldestSiblingsIds) {
        // We have to find the minimum column placement values (per row) for the current branch, and compare them
        // to the maximum column placement values (per row) of the nodes on the left.
        // The resulting space we find represents how much we can shift the current column to the left.

        const currentNodeIndex = nodeMap.get(currentNodeId)!.index;
        const currentSubTreeSize = subTreeSizeMap.get(currentNodeId)!;
        const currentSecurityNode = nodeMap.get(currentNodeId)!.belongsToSecurityGroupId;

        const currentBranchNodes = nodes.slice(currentNodeIndex, currentNodeIndex + currentSubTreeSize);

        // We have to compare with all the left nodes, not only the current branch's left neighbor, because in some
        // cases other branches could go under the left neighbor and make edges cross.
        const leftNodes = nodes.slice(0, currentNodeIndex);

        const leftBranchMaximumColumnByRow = getMaximumColumnByRows(
            leftNodes,
            placements,
            nodeMap,
            securityGroupMembersMap,
            currentSecurityNode
        );

        const currentBranchMinimumColumnByRow = getMinimumColumnByRows(
            currentBranchNodes,
            placements,
            nodeMap,
            securityGroupMembersMap,
            currentSecurityNode
        );

        const availableSpace = calculateAvailableSpace(leftBranchMaximumColumnByRow, currentBranchMinimumColumnByRow);

        if (availableSpace > 0) {
            shiftPlacementsToTheLeft(currentBranchNodes, placements, availableSpace);
        }
    }
    return placements;
}

function createMapsForLayoutAlgorithm(nodes: CurrentTreeNode[]) {
    // Create a node lookup map
    const nodeMap = new Map<
        string,
        { index: number; node: CurrentTreeNode; belongsToSecurityGroupId: string | null }
    >();
    // Create a parent/children relationship map
    const childrenMap = new Map<string, CurrentTreeNode[]>();
    // Create a security group/member of the group map
    const securityGroupMembersMap = new Map<string, string[]>();

    let currentSecurityGroupFirstNodeId: string | null = null;
    for (const [index, node] of nodes.entries()) {
        if (node.parentId) {
            const children = childrenMap.get(node.parentId) || [];
            children.push(node);
            childrenMap.set(node.parentId, children);

            if (isSecurityModificationNode(node)) {
                if (nodeMap.get(node.parentId)?.belongsToSecurityGroupId === null || !currentSecurityGroupFirstNodeId) {
                    // We entered a new security group
                    currentSecurityGroupFirstNodeId = node.id;
                }
                addMember(securityGroupMembersMap, currentSecurityGroupFirstNodeId, node.id);
            } else {
                currentSecurityGroupFirstNodeId = null;
            }
        }
        nodeMap.set(node.id, { index, node, belongsToSecurityGroupId: currentSecurityGroupFirstNodeId });
    }
    return [nodeMap, childrenMap, securityGroupMembersMap] as const;
}

/**
 * In order to draw labeled group borders, we need to compute SECURITY node groups positions (top-left corner and bottom-right corner since it's a rectangle)
 */
function createSecurityGroupNodes(placementGrid: PlacementGrid, securityGroupMembersMap: SecurityGroupMembersMap) {
    return Array.from(securityGroupMembersMap.entries()).map(([group, members]) => {
        let bottomRightRow = 0;
        let bottomRightColumn = 0;
        for (const member of members) {
            const memberPlacement = placementGrid.getPlacement(member);
            if (memberPlacement) {
                if (memberPlacement.row > bottomRightRow) {
                    bottomRightRow = memberPlacement.row;
                }
                if (memberPlacement.column > bottomRightColumn) {
                    bottomRightColumn = memberPlacement.column;
                }
            }
        }
        return {
            id: group + groupIdSuffix,
            type: LABELED_GROUP_TYPE,
            data: {
                position: {
                    topLeft: placementGrid.getPlacement(group) ?? { row: 0, column: 0 },
                    bottomRight: { row: bottomRightRow, column: bottomRightColumn },
                },
            },
            style: {
                pointerEvents: 'none',
                zIndex: -1,
            },
            position: { x: 0, y: 0 },
            draggable: false,
            selectable: false,
        };
    });
}

/**
 * Updates the tree nodes' x and y positions for ReactFlow display in the tree
 */
export function getTreeNodesWithUpdatedPositions(nodes: CurrentTreeNode[]) {
    const newNodes = [...nodes];
    const [nodeMap, childrenMap, securityGroupMembersMap] = createMapsForLayoutAlgorithm(newNodes);

    const uncompressedNodePlacements = getNodePlacements(newNodes);

    const nodePlacements = compressTreePlacements(
        newNodes,
        uncompressedNodePlacements,
        nodeMap,
        childrenMap,
        securityGroupMembersMap
    );

    const securityGroupsNodes = createSecurityGroupNodes(nodePlacements, securityGroupMembersMap);

    const nodesWithUpdatedPositions = newNodes.map((node) => {
        const placement = nodePlacements.getPlacement(node.id);
        if (placement) {
            // Reactflow draws its nodes with a position relative to the node's parent (the parent is in the node's parentId field).
            // To find the node's correct relative position using the absolute positions from nodePlacements, we need to substract
            // the parent's position from the current node's position, this gives us the relative position to the parent.
            const parentPlacement = node.parentId ? nodePlacements.getPlacement(node.parentId) : undefined;

            // compute relative placement without mutating the placement object
            const relativeRow = parentPlacement ? placement.row - parentPlacement.row : placement.row;
            const relativeColumn = parentPlacement ? placement.column - parentPlacement.column : placement.column;

            return {
                ...node,
                position: {
                    x: relativeColumn * nodeWidth,
                    y: relativeRow * nodeHeight,
                },
            };
        }
        return {
            ...node,
            position: {
                x: node.position.x,
                y: node.position.y,
            },
        };
    });

    return [nodesWithUpdatedPositions, securityGroupsNodes] as const;
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
    nodesMap: Map<string, CurrentTreeNode>,
    descendantNode: CurrentTreeNode | undefined
): CurrentTreeNode | undefined {
    if (descendantNode && descendantNode.parentId) {
        if (isNodeASibling(nodes, descendantNode)) {
            return descendantNode;
        }
        return getFirstAncestorWithSibling(nodes, nodesMap, nodesMap.get(descendantNode.parentId));
    }
    return undefined;
}

/**
 * Computes the absolute position of a node by calculating the sum of all the relative positions of
 * the node's lineage.
 */
export function getAbsolutePosition(nodes: CurrentTreeNode[], node: CurrentTreeNode): { x: number; y: number } {
    if (!node.parentId) {
        return { x: node.position.x, y: node.position.y };
    }

    const parent = nodes.find((n) => n.id === node.parentId);
    if (!parent) {
        return { x: node.position.x, y: node.position.y };
    }

    const parentAbsolutePosition = getAbsolutePosition(nodes, parent);
    return {
        x: parentAbsolutePosition.x + node.position.x,
        y: parentAbsolutePosition.y + node.position.y,
    };
}
