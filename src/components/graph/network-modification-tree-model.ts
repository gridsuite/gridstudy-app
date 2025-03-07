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
import type { CurrentTreeNode } from '../../redux/reducer';
import { Edge } from '@xyflow/react';
import { AbstractNode, NetworkModificationNodeData, RootNodeData } from './tree-node.type';
import { isReactFlowRootNodeData } from '../../redux/utils';

// Function to count children nodes for a given parentId recursively in an array of nodes.
// TODO refactoring when changing NetworkModificationTreeModel as it becomes an object containing nodes
export const countNodes = (nodes: CurrentTreeNode[], parentId: UUID) => {
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

    // Will sort if columnPosition is defined, and not move the nodes if undefined
    childrenNodeSorter(a: AbstractNode, b: AbstractNode) {
        if (a.columnPosition !== undefined && b.columnPosition !== undefined) {
            return a.columnPosition - b.columnPosition;
        }
        return 0;
    }

    getChildren(parentNodeId: string): CurrentTreeNode[] {
        return this.treeNodes.filter((n) => n.parentId === parentNodeId);
    }

    needReorder(parentNodeId: string, orderedNodeIds: string[]): boolean {
        return (
            this.getChildren(parentNodeId)
                .map((child) => child.id)
                .join(',') !== orderedNodeIds.join(',')
        );
    }

    /**
     * Will reorganize treeNodes and put the children of parentNodeId in the order provided in nodeIds array.
     * @param parentNodeId parent ID of the to be reordered children nodes
     * @param orderedNodeIds array of children ID in the order we want
     * @returns true if the order was changed
     */
    reorderChildrenNodes(parentNodeId: string, orderedNodeIds: string[]) {
        if (!this.needReorder(parentNodeId, orderedNodeIds)) {
            return false;
        }

        // Let's reorder the children :
        // In orderedNodeIds order, we cut and paste the corresponding number of nodes in treeNodes.
        const justAfterParentIndex = 1 + this.treeNodes.findIndex((n) => n.id === parentNodeId); // we add 1 here to set the index just after the parent node
        let insertedNodes = 0;

        orderedNodeIds.forEach((nodeId) => {
            const nodesToMoveIndex = this.treeNodes.findIndex((n) => n.id === nodeId);
            const subTreeSize = 1 + countNodes(this.treeNodes, nodeId as UUID); // We add 1 here to include the current node in its subtree size

            // We remove from treeNodes the nodes that we want to move, (...)
            const nodesToMove = this.treeNodes.splice(nodesToMoveIndex, subTreeSize);

            // (...) and now we put them in their new position in the array
            this.treeNodes.splice(justAfterParentIndex + insertedNodes, 0, ...nodesToMove);
            insertedNodes += subTreeSize;
        });

        return true;
    }

    addChild(
        newNode: NetworkModificationNodeData | RootNodeData,
        parentId: UUID,
        insertMode?: NodeInsertModes,
        referenceNodeId?: UUID,
        skipChildren: boolean = false
    ) {
        /**
         * The layout algorithm used to draw the graph is dependant on the order of nodes in the array.
         * We have to keep a precise order of nodes in the array to always have a child node after its parent.
         *
         * Example tree :
         *     A
         *    / \
         *   B   D
         *  /   / \
         * C   E   F
         *
         * This tree should have its nodes in the array in this order : [A, B, C, D, E, F]
         */
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
            this.treeNodes = this.treeNodes.map((node) => {
                if (newNode.childrenIds.includes(node.id)) {
                    return {
                        ...node,
                        parentId: newNode.id,
                    };
                }
                return node;
            });
            this.treeEdges = filteredEdges;
        }

        if (!skipChildren) {
            // Add children of this node recursively
            if (newNode.children) {
                newNode.children.sort(this.childrenNodeSorter);
                newNode.children.forEach((child) => {
                    this.addChild(child, newNode.id, undefined, undefined);
                });
            }
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
            this.treeNodes = filteredNodes.map((node) => {
                if (node.parentId === nodeId) {
                    return {
                        ...node,
                        parentId: nodeToDelete.parentId,
                    };
                }
                return node;
            });
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
        elements.children.sort(this.childrenNodeSorter);
        elements.children.forEach((child) => {
            this.addChild(child, elements.id);
        });
        this.setBuildingStatus();
    }

    newSharedForUpdate() {
        /* shallow clone of the network https://stackoverflow.com/a/44782052 */
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
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
