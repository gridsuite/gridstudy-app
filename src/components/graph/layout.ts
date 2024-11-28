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

type NodePlacement = {
    row: number;
    column: number;
};

class IdPlacementBiMap {
    private idToPlacement = new Map<string, string>();
    private placementToId = new Map<string, string>();

    stringToNodePlacement(placementString: string): NodePlacement {
        const [row, column] = placementString.split('_').map(Number);
        return { row, column };
    }

    nodePlacementToString(placement: NodePlacement): string {
        return placement.row + '_' + placement.column;
    }

    put(id: string, placement: NodePlacement) {
        this.internalSet(id, placement.row + '_' + placement.column);
    }

    internalSet(id: string, placement: string): void {
        // Remove any existing mappings to ensure bidirectionality
        if (this.idToPlacement.has(id)) {
            const oldPlacement = this.idToPlacement.get(id)!;
            this.placementToId.delete(oldPlacement);
        }
        if (this.placementToId.has(placement)) {
            const oldId = this.placementToId.get(placement)!;
            this.idToPlacement.delete(oldId);
        }

        this.idToPlacement.set(id, placement);
        this.placementToId.set(placement, id);
    }

    getPlacement(id: string): NodePlacement {
        return this.stringToNodePlacement(this.idToPlacement.get(id));
    }

    getId(placement: string): string | undefined {
        return this.placementToId.get(placement);
    }

    hasId(id: string): boolean {
        return this.idToPlacement.has(id);
    }

    hasPlacement(placement: string): boolean {
        return this.placementToId.has(placement);
    }

    isSpaceEmpty(placement: NodePlacement): boolean {
        return !this.hasPlacement(this.nodePlacementToString(placement));
    }
}

/**
 * Builds an array representing the placements of nodes for the tree.
 * This array is then used to compute each node's position before being used by ReactFlow.
 */
function getNodePlacementsFromTreeNodes(nodes: CurrentTreeNode[]) {
    const newPlacements = new IdPlacementBiMap();
    let currentMaxColumn = 0;

    nodes.forEach((node) => {
        if (!node.parentId) {
            // ROOT NODE
            newPlacements.put(node.id, { row: 0, column: 0 } as NodePlacement);
        } else {
            // CHILDREN NODE
            const parentPlacement = newPlacements.getPlacement(node.parentId);
            // Check if there is an empty space below the parent
            const tryRow = parentPlacement.row + 1;
            const tryColumn = parentPlacement.column;
            if (newPlacements.isSpaceEmpty({ row: tryRow, column: tryColumn } as NodePlacement)) {
                newPlacements.put(node.id, { row: tryRow, column: tryColumn } as NodePlacement);
            } else {
                // We check if there is an empty space on the right of the used space
                do {
                    currentMaxColumn++;
                } while (!newPlacements.isSpaceEmpty({ row: tryRow, column: currentMaxColumn } as NodePlacement));
                newPlacements.put(node.id, { row: tryRow, column: currentMaxColumn } as NodePlacement);
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
        const placement = nodePlacements.getPlacement(node.id);

        if (node.parentId) {
            // Reactflow draws its nodes with a position relative to the node's parent (the parent is in the node's parentId field).
            // To find the node's correct relative position using the absolute positions from nodePlacements, we need to substract
            // the parent's position from the current node's position, this gives us the relative position to the parent.
            const parentPlacement = nodePlacements.getPlacement(node.parentId);
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

export function findSiblings(nodes: CurrentTreeNode[], node: CurrentTreeNode) {
    return nodes.filter((n) => n.parentId === node.parentId && n.id !== node.id);
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
