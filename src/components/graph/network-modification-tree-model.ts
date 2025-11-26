/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { convertNodetoReactFlowModelNode, getModificationNodeDataOrUndefined } from './util/model-functions';
import { BUILD_STATUS } from '../network/constants';
import type { UUID } from 'node:crypto';
import { Edge } from '@xyflow/react';
import { AbstractNode, CurrentTreeNode, NetworkModificationNodeData, RootNodeData } from './tree-node.type';
import { isReactFlowRootNodeData } from '../../redux/utils';
import { NodeInsertModes } from 'types/notification-types';

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

    getAllChildren(parentNodeId: string): CurrentTreeNode[] {
        return this.getChildren(parentNodeId).flatMap((child) => [child, ...this.getAllChildren(child.id)]);
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

        // operate on a mutable copy to avoid mutating a frozen/readonly array
        const nodes = [...this.treeNodes];

        const justAfterParentIndex = 1 + nodes.findIndex((n) => n.id === parentNodeId);
        let insertedNodes = 0;

        for (const nodeId of orderedNodeIds) {
            const nodesToMoveIndex = nodes.findIndex((n) => n.id === nodeId);
            const subTreeSize = 1 + countNodes(nodes, nodeId as UUID);

            const nodesToMove = nodes.splice(nodesToMoveIndex, subTreeSize);
            nodes.splice(justAfterParentIndex + insertedNodes, 0, ...nodesToMove);
            insertedNodes += subTreeSize;
        }

        this.treeNodes = nodes;
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

        // Work on local mutable copies
        const nodes = [...this.treeNodes];
        const edges = [...this.treeEdges];

        switch (insertMode) {
            case NodeInsertModes.Before: {
                nodes.splice(referenceNodeIndex, 0, convertNodetoReactFlowModelNode(newNode, parentId));
                break;
            }
            case NodeInsertModes.After: {
                nodes.splice(referenceNodeIndex + 1, 0, convertNodetoReactFlowModelNode(newNode, parentId));
                break;
            }
            case NodeInsertModes.NewBranch: {
                if (!referenceNodeId) {
                    break;
                }
                const nbChildren = countNodes(nodes, referenceNodeId);
                nodes.splice(
                    referenceNodeIndex + nbChildren + 1,
                    0,
                    convertNodetoReactFlowModelNode(newNode, parentId)
                );
                break;
            }
            default: {
                nodes.push(convertNodetoReactFlowModelNode(newNode, parentId));
                break;
            }
        }

        // Add edge between node and its parent if missing
        const id = 'e' + parentId + '-' + newNode.id;
        if (!edges.some((value) => value.id === id)) {
            edges.push({
                id,
                source: parentId,
                target: newNode.id,
            });
        }

        if (insertMode === NodeInsertModes.Before || insertMode === NodeInsertModes.After) {
            // remove previous edges between parent and node children
            const filteredEdges = edges.filter((edge) => {
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

            // overwrite old children nodes parentUuid when inserting new nodes (operate on nodes copy)
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                if (newNode.childrenIds.includes(node.id)) {
                    nodes[i] = {
                        ...node,
                        parentId: newNode.id,
                    };
                }
            }

            // replace edges with filteredEdges
            this.treeEdges = filteredEdges;
        } else {
            this.treeEdges = edges;
        }

        this.treeNodes = nodes;

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
        const nodes = [...this.treeNodes];
        updatedNodes.forEach((node) => {
            const indexModifiedNode = this.treeNodes.findIndex((othernode) => othernode.id === node.id);
            if (indexModifiedNode !== -1) {
                const nodeToUpdate = this.treeNodes[indexModifiedNode];
                const modificationNodeData = getModificationNodeDataOrUndefined(node);
                const globalBuildStatus = modificationNodeData?.nodeBuildStatus?.globalBuildStatus;
                const localBuildStatus = modificationNodeData?.nodeBuildStatus?.localBuildStatus;

                nodes[indexModifiedNode] = {
                    ...nodeToUpdate,
                    data: {
                        ...this.treeNodes[indexModifiedNode].data,
                        label: node.name,
                        description: node.description,
                        globalBuildStatus: globalBuildStatus,
                        ...(!isReactFlowRootNodeData(nodeToUpdate) && { localBuildStatus }), // Only include the attribute if node is a modification node (localBuildStatus is not defined for root node)
                        readOnly: node.readOnly,
                    },
                };
            }
        });
        this.treeNodes = nodes;
    }

    setTreeElements(elements: RootNodeData | NetworkModificationNodeData) {
        const nodes = [...this.treeNodes];
        // handle root node
        nodes.push(convertNodetoReactFlowModelNode(elements));
        this.treeNodes = nodes;

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
}
