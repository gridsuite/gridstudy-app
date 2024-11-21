/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { convertNodetoReactFlowModelNode, getModificationNodeDataOrUndefined } from './util/model-functions';
import { NodeInsertModes } from './nodes/node-insert-modes';
import { BUILD_STATUS } from '../network/constants';
import { UUID } from 'crypto';
import { CurrentTreeNode, isReactFlowRootNodeData } from '../../redux/reducer';
import { Edge } from '@xyflow/react';
import { NetworkModificationNodeData, RootNodeData } from './tree-node.type';

// Function to count children nodes for a given parentId recursively in an array of nodes.
// TODO refactoring when changing NetworkModificationTreeModel as it becomes an object containing nodes
const countNodes = (nodes: CurrentTreeNode[], parentId: UUID) => {
    return nodes.reduce((acc, n) => {
        if (n.parentId === parentId) {
            acc += 1 + countNodes(nodes, n.id); // this node + its children
        }
        return acc;
    }, 0);
};

export default class NetworkModificationTreeModel {
    treeNodes: CurrentTreeNode[] = [];
    treeEdges: Edge[] = [];

    isAnyNodeBuilding = false;

    /**
     * Will switch the order of two nodes in the tree.
     * The draggedNode will be moved, either to the left or right of the destinationNode, depending
     * on their initial positions.
     * Both nodes should have the same parent.
     */
    private switchSiblingsOrder(draggedNode: CurrentTreeNode, destinationNode: CurrentTreeNode) {
        if (!draggedNode.parentId || draggedNode.parentId !== destinationNode.parentId) {
            console.error('Both nodes should have the same parent to switch their order');
            return;
        }
        const draggedNodeIndex = this.treeNodes.findIndex((node) => node.id === draggedNode.id);
        const destinationNodeIndex = this.treeNodes.findIndex((node) => node.id === destinationNode.id);

        const numberOfNodesToMove: number = 1 + countNodes(this.treeNodes, draggedNode.id);
        const nodesToMove = this.treeNodes.splice(draggedNodeIndex, numberOfNodesToMove);

        if (draggedNodeIndex > destinationNodeIndex) {
            this.treeNodes.splice(destinationNodeIndex, 0, ...nodesToMove);
        } else {
            // When moving the draggedNode to the right, we have to take into account the splice that changed the nodes' indexes.
            // We also need to find the correct position of the dragged node, to the right of the destination node, meaning we need to find
            // how many children the destination node has and add all of them to the new index.
            const destinationNodeIndexAfterSplice = this.treeNodes.findIndex((node) => node.id === destinationNode.id);
            const destinationNodeFamilySize: number = 1 + countNodes(this.treeNodes, destinationNode.id);
            this.treeNodes.splice(destinationNodeIndexAfterSplice + destinationNodeFamilySize, 0, ...nodesToMove);
        }

        this.treeNodes = [...this.treeNodes];
    }

    /**
     * Finds the lowest common ancestor of two nodes in the tree.
     *
     * Example tree:
     *     A
     *    / \
     *   B   D
     *  /   / \
     * C   E   F
     *
     * Examples:
     * - getCommonAncestor(B, E) will return A
     * - getCommonAncestor(E, F) will return D
     */
    private getCommonAncestor(nodeA: CurrentTreeNode, nodeB: CurrentTreeNode): CurrentTreeNode | null {
        const getAncestors = (node: CurrentTreeNode) => {
            const ancestors = [];
            let current = node;
            while (current && current.parentId) {
                ancestors.push(current.parentId);
                current = this.treeNodes.find((n) => n.id === current.parentId);
            }
            return ancestors;
        };
        // We get the entire ancestors of one of the nodes in an array, then iterate over the other node's ancestors
        // until we find a node that is in the first array : this common node is an ancestor of both intial nodes.
        const ancestorsA: UUID[] = getAncestors(nodeA);
        let current: CurrentTreeNode = nodeB;
        while (current && current.parentId) {
            current = this.treeNodes.find((n) => n.id === current.parentId);
            if (ancestorsA.includes(current.id)) {
                return current;
            }
        }
        console.warn('No common ancestor found !');
        return null;
    }

    /**
     * Finds the child of the ancestor node that is on the path to the descendant node.
     *
     * Example tree:
     *     A
     *    / \
     *   B   D
     *  /   / \
     * C   E   F
     *
     * Examples:
     * - getChildOfAncestorInLineage(A, E) will return D
     * - getChildOfAncestorInLineage(D, F) will return F
     *
     * @param ancestor node, must be an ancestor of descendant node
     * @param descendant node, must be a descendant of ancestor
     * @returns The child of the ancestor node in the lineage or null if not found.
     * @private
     */
    private getChildOfAncestorInLineage(
        ancestor: CurrentTreeNode,
        descendant: CurrentTreeNode
    ): CurrentTreeNode | null {
        let current = descendant;
        while (current && current.parentId) {
            if (current.parentId === ancestor.id) {
                return current;
            }
            current = this.treeNodes.find((n) => n.id === current.parentId);
        }
        console.warn('The ancestor and descendant do not share the same branch !');
        return null;
    }

    switchBranches(draggedNode: CurrentTreeNode, destinationNode: CurrentTreeNode) {
        // We find the nodes from the two branches that share the same parent
        const commonAncestor = this.getCommonAncestor(draggedNode, destinationNode);
        if (commonAncestor) {
            const siblingFromDraggedNodeBranch = this.getChildOfAncestorInLineage(commonAncestor, draggedNode);
            const siblingFromDestinationNodeBranch = this.getChildOfAncestorInLineage(commonAncestor, destinationNode);
            if (siblingFromDraggedNodeBranch && siblingFromDestinationNodeBranch) {
                this.switchSiblingsOrder(siblingFromDraggedNodeBranch, siblingFromDestinationNodeBranch);
            }
        }
    }

    addChild(
        newNode: NetworkModificationNodeData | RootNodeData,
        parentId: UUID,
        insertMode?: NodeInsertModes,
        referenceNodeId?: UUID
    ) {
        // We have to keep a precise order of nodes in the array to avoid gettings children nodes before
        // their parents when building the graph's layout.
        const referenceNodeIndex = this.treeNodes.findIndex((node) => node.id === referenceNodeId);
        switch (insertMode) {
            case NodeInsertModes.Before: {
                // We need to insert the node just before the active(reference) node
                this.treeNodes.splice(referenceNodeIndex, 0, convertNodetoReactFlowModelNode(newNode, parentId));
                break;
            }
            case NodeInsertModes.After: {
                // We need to insert the node just after the active(reference) node
                this.treeNodes.splice(referenceNodeIndex + 1, 0, convertNodetoReactFlowModelNode(newNode, parentId));
                break;
            }
            case NodeInsertModes.NewBranch: {
                // We need to insert the node after all children of the active(reference) node
                if (!referenceNodeId) {
                    break;
                }
                const nbChildren = countNodes(this.treeNodes, referenceNodeId);
                this.treeNodes.splice(
                    referenceNodeIndex + nbChildren + 1,
                    0,
                    convertNodetoReactFlowModelNode(newNode, parentId)
                );
                break;
            }
            default: {
                // Just push nodes in order
                this.treeNodes.push(convertNodetoReactFlowModelNode(newNode, parentId));
                break;
            }
        }
        // Add edge between node and its parent
        // We only add the edge if it's not already added
        let id = 'e' + parentId + '-' + newNode.id;
        if (this.treeEdges.filter((value) => value.id === id).length === 0) {
            this.treeEdges.push({
                id: 'e' + parentId + '-' + newNode.id,
                source: parentId,
                target: newNode.id,
            });
        }
        if (insertMode === NodeInsertModes.Before || insertMode === NodeInsertModes.After) {
            // remove previous edges between parent and node children
            const filteredEdges = this.treeEdges.filter((edge) => {
                return (
                    (edge.source !== parentId || !newNode.childrenIds.includes(edge.target as UUID)) &&
                    (edge.target !== parentId || !newNode.childrenIds.includes(edge.source as UUID))
                );
            });
            // create new edges between node and its children
            newNode.childrenIds.forEach((childId) => {
                filteredEdges.push({
                    id: 'e' + newNode.id + '-' + childId,
                    source: newNode.id,
                    target: childId,
                });
            });

            // overwrite old children nodes parentUuid when inserting new nodes
            const nextNodes = this.treeNodes.map((node) => {
                if (newNode.childrenIds.includes(node.id)) {
                    return {
                        ...node,
                        parentId: newNode.id,
                    };
                }
                return node;
            });

            this.treeNodes = nextNodes;
            this.treeEdges = filteredEdges;
        }

        // Add children of this node recursively
        if (newNode.children) {
            newNode.children.forEach((child) => {
                this.addChild(child, newNode.id);
            });
        }
    }

    // Remove nodes AND reparent their children
    // TODO: support the case where children are deleted too (no reparenting)
    removeNodes(deletedNodesUUIDs: UUID[]) {
        deletedNodesUUIDs.forEach((nodeId) => {
            // get edges which have the deleted node as source or target
            const edges = this.treeEdges.filter((edge) => edge.source === nodeId || edge.target === nodeId);
            // From the edges array
            // get edges which have the deleted node as source
            const edgesOfSource = edges.filter((edge) => edge.source === nodeId);
            // get edges which have the deleted node as target
            const edgesOfTarget = edges.filter((edge) => edge.target === nodeId);
            // Remove these edges and the node from the edges and nodes array
            const filteredEdges = this.treeEdges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId);
            const filteredNodes = this.treeNodes.filter((node) => node.id !== nodeId);
            // Recreate edges by reparenting previously targeted nodes to previous source nodes
            edgesOfTarget.forEach((edgeOfTarget) => {
                edgesOfSource.forEach((edgeOfSource) => {
                    filteredEdges.push({
                        id: 'e' + edgeOfTarget.source + '-' + edgeOfSource.target,
                        source: edgeOfTarget.source,
                        target: edgeOfSource.target,
                    });
                });
            });
            this.treeEdges = filteredEdges;

            // fixes the parentId of children
            const nodeToDelete = this.treeNodes.find((el) => el.id === nodeId);
            if (!nodeToDelete) {
                return;
            }
            const nextTreeNodes = filteredNodes.map((node) => {
                if (node.parentId === nodeId) {
                    return {
                        ...node,
                        parentId: nodeToDelete.parentId,
                    };
                }
                return node;
            });

            this.treeNodes = nextTreeNodes;
        });
    }

    updateNodes(updatedNodes: (NetworkModificationNodeData | RootNodeData)[]) {
        updatedNodes.forEach((node) => {
            const indexModifiedNode = this.treeNodes.findIndex((othernode) => othernode.id === node.id);
            if (indexModifiedNode !== -1) {
                const nodeToUpdate = this.treeNodes[indexModifiedNode];
                const modificationNodeData = getModificationNodeDataOrUndefined(node);
                const globalBuildStatus = modificationNodeData?.nodeBuildStatus?.globalBuildStatus;
                const localBuildStatus = modificationNodeData?.nodeBuildStatus?.localBuildStatus;

                this.treeNodes[indexModifiedNode] = {
                    ...nodeToUpdate,
                    data: {
                        ...this.treeNodes[indexModifiedNode].data,
                        label: node.name,
                        globalBuildStatus: globalBuildStatus,
                        ...(!isReactFlowRootNodeData(nodeToUpdate) && { localBuildStatus }), // Only include the attribute if node is a modification node (localBuildStatus is not defined for root node)
                        readOnly: node.readOnly,
                    },
                };
            }
        });
        this.treeNodes = [...this.treeNodes];
    }

    setTreeElements(elements: RootNodeData | NetworkModificationNodeData) {
        // handle root node
        this.treeNodes.push(convertNodetoReactFlowModelNode(elements));
        // handle root children
        elements.children.forEach((child) => {
            this.addChild(child, elements.id);
        });
        this.setBuildingStatus();
    }

    newSharedForUpdate() {
        /* shallow clone of the network https://stackoverflow.com/a/44782052 */
        let newTreeModel = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
        return newTreeModel;
    }

    setBuildingStatus() {
        this.isAnyNodeBuilding =
            this.treeNodes.find((node) => node?.data?.globalBuildStatus === BUILD_STATUS.BUILDING) !== undefined;
    }

    setCaseName(newCaseName: string) {
        if (this.treeNodes.length > 0 && this.treeNodes[0].data && newCaseName) {
            const nodeWithOldName = this.treeNodes[0];
            //check if the node we are modifying is a ROOT node
            if (isReactFlowRootNodeData(nodeWithOldName)) {
                this.treeNodes[0] = {
                    ...nodeWithOldName,
                    data: {
                        ...nodeWithOldName.data,
                        caseName: newCaseName,
                    },
                };
            }
        }
    }
}
