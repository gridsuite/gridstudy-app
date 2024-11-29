/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CurrentTreeNode } from 'redux/reducer';

export const nodeWidth = 230;
export const nodeHeight = 110;
export const snapGrid = [1, nodeHeight]; // Used for drag and drop

type NodePlacement = {
    row: number;
    column: number;
};

/**
 * Bidirectional map to match a node ID to a NodePlacement.
 */
class IdPlacementBiMap {
    private readonly idToPlacement = new Map<string, NodePlacement>();
    private readonly placementToId = new Map<string, string>();

    private nodePlacementToString(placement: NodePlacement): string {
        return `${placement.row}_${placement.column}`;
    }

    setPlacement(id: string, placement: NodePlacement) {
        // Remove any existing mappings to ensure bidirectionality
        if (this.idToPlacement.has(id)) {
            const oldPlacement = this.idToPlacement.get(id)!;
            this.placementToId.delete(this.nodePlacementToString(oldPlacement));
        }
        const placementString = this.nodePlacementToString(placement);
        if (this.placementToId.has(placementString)) {
            const oldId = this.placementToId.get(placementString)!;
            this.idToPlacement.delete(oldId);
        }
        // Add the new mappings
        this.idToPlacement.set(id, placement);
        this.placementToId.set(placementString, id);
    }

    getPlacement(id: string): NodePlacement | undefined {
        const placement = this.idToPlacement.get(id);
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
 */
function getNodePlacementsFromTreeNodes(nodes: CurrentTreeNode[]): IdPlacementBiMap {
    const nodePlacements = new IdPlacementBiMap();
    let currentMaxColumn = 0;

    nodes.forEach((node) => {
        if (!node.parentId) {
            // First node, top left.
            nodePlacements.setPlacement(node.id, { row: 0, column: 0 } as NodePlacement);
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

function compressTree(nodes: CurrentTreeNode[], placements: IdPlacementBiMap) {

    // On doit identifier les noeuds qui ont de l'espace à leur gauche.
    // Ces noeuds doivent être des frères, mais pas des ainés.
    // Il doit y avoir au moins une case de libre entre le frère et son frère de gauche.
    // La liste de ces noeuds identifiés est le point de départ de la boucle d'algo : on va tourner sur chacun de ces noeuds.

    // Pour chaque noeud identifié de la sorte :

    // On regarde pour chaque ligne de la famille courante : combien de cases vides on a a gauche.
    // A chaque ligne, on test les X cases à gauche, X est le plus petit des espaces qu'on a trouvé jusque là.
    // Si on arrive à zero, on stop et on peut pas se déplacer.
    // Si on est arrivé en bas de la famille (on s'arrête quand le parent du prochain noeud est le même parent que le noeud
    // de début de branche (donc un de ses fères) et on skip le calcul si le numéro de ligne a déjà été traité),
    // alors on a X le nombre de cases qu'on peut déplacer à gauche pour toute cette famille.

    // On déplace de ce nombre de cases la famille courante vers la gauche, et on marque l'index de colonne comme déjà traité.

    return placements;
}

/**
 * Updates the tree nodes' x and y positions for ReactFlow display in the tree
 */
export function getTreeNodesWithUpdatedPositions(nodes: CurrentTreeNode[]) {
    const newNodes = [...nodes];
    const uncompressedNodePlacements = getNodePlacementsFromTreeNodes(newNodes);

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
