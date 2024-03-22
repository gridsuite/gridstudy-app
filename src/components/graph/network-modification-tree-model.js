/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getLayoutedNodes } from './layout';
import { convertNodetoReactFlowModelNode } from './util/model-functions';
import { NodeInsertModes } from '../utils/node-insert-modes';

// Function to count children nodes for a given parentId recursively in an array of nodes.
// TODO refactoring when changing NetworkModificationTreeModel as it becomes an object containing nodes
const countNodes = (nodes, parentId) => {
    return nodes.reduce((acc, n) => {
        if (n.data.parentNodeUuid === parentId) {
            acc += 1 + countNodes(nodes, n.id); // this node + its children
        }
        return acc;
    }, 0);
};

export default class NetworkModificationTreeModel {
    treeNodes = [];
    treeEdges = [];

    isAnyNodeBuilding = false;

    updateLayout() {
        this.treeNodes = getLayoutedNodes(this.treeNodes, this.treeEdges);
        this.treeEdges = [...this.treeEdges]; //otherwise react-flow doesn't show new edges
    }

    addChild(newNode, parentId, insertMode, referenceNodeId) {
        // we have to keep a precise order of nodes in the array to avoid gettings children
        // nodes before their parents when building graph in dagre library which have uncontrolled results
        // We also need to do this to keep a correct order when inserting nodes and not loose the user.
        const referenceNodeIndex = this.treeNodes.findIndex(
            (node) => node.id === referenceNodeId
        );
        switch (insertMode) {
            case NodeInsertModes.Before: {
                // We need to insert the node just before the active(reference) node
                this.treeNodes.splice(
                    referenceNodeIndex,
                    0,
                    convertNodetoReactFlowModelNode(newNode, parentId)
                );
                break;
            }
            case NodeInsertModes.After: {
                // We need to insert the node just after the active(reference) node
                this.treeNodes.splice(
                    referenceNodeIndex + 1,
                    0,
                    convertNodetoReactFlowModelNode(newNode, parentId)
                );
                break;
            }
            case NodeInsertModes.NewBranch: {
                // We need to insert the node after all children of the active(reference) node
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
                this.treeNodes.push(
                    convertNodetoReactFlowModelNode(newNode, parentId)
                );
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
                type: 'smoothstep',
            });
        }
        if (
            insertMode === NodeInsertModes.Before ||
            insertMode === NodeInsertModes.After
        ) {
            // remove previous edges between parent and node children
            const filteredEdges = this.treeEdges.filter((edge) => {
                return (
                    (edge.source !== parentId ||
                        !newNode.childrenIds.includes(edge.target)) &&
                    (edge.target !== parentId ||
                        !newNode.childrenIds.includes(edge.source))
                );
            });
            // create new edges between node and its children
            newNode.childrenIds.forEach((childId) => {
                filteredEdges.push({
                    id: 'e' + newNode.id + '-' + childId,
                    source: newNode.id,
                    target: childId,
                    type: 'smoothstep',
                });
            });

            // overwrite old children nodes parentUuid when inserting new nodes
            const nextNodes = this.treeNodes.map((node) => {
                if (newNode.childrenIds.includes(node.id)) {
                    node.data = {
                        ...node.data,
                        parentNodeUuid: newNode.id,
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
    removeNodes(deletedNodes) {
        deletedNodes.forEach((nodeId) => {
            // get edges which have the deleted node as source or target
            const edges = this.treeEdges.filter(
                (edge) => edge.source === nodeId || edge.target === nodeId
            );
            // From the edges array
            // get edges which have the deleted node as source
            const edgesOfSource = edges.filter(
                (edge) => edge.source === nodeId
            );
            // get edges which have the deleted node as target
            const edgesOfTarget = edges.filter(
                (edge) => edge.target === nodeId
            );
            // Remove these edges and the node from the edges and nodes array
            const filteredEdges = this.treeEdges.filter(
                (edge) => edge.source !== nodeId && edge.target !== nodeId
            );
            const filteredNodes = this.treeNodes.filter(
                (node) => node.id !== nodeId
            );
            // Recreate edges by reparenting previously targeted nodes to previous source nodes
            edgesOfTarget.forEach((edgeOfTarget) => {
                edgesOfSource.forEach((edgeOfSource) => {
                    filteredEdges.push({
                        id:
                            'e' +
                            edgeOfTarget.source +
                            '-' +
                            edgeOfSource.target,
                        source: edgeOfTarget.source,
                        target: edgeOfSource.target,
                        type: 'smoothstep',
                    });
                });
            });
            this.treeEdges = filteredEdges;

            // fix parentNodeUuid of children
            const nodeToDelete = this.treeNodes.find((el) => el.id === nodeId);

            const nextTreeNodes = filteredNodes.map((node) => {
                if (node.data?.parentNodeUuid === nodeId) {
                    node.data = {
                        ...node.data,
                        parentNodeUuid: nodeToDelete.data?.parentNodeUuid,
                    };
                }
                return node;
            });

            this.treeNodes = nextTreeNodes;
        });
    }

    updateNodes(updatedNodes) {
        updatedNodes.forEach((node) => {
            const indexModifiedNode = this.treeNodes.findIndex(
                (othernode) => othernode.id === node.id
            );
            if (indexModifiedNode !== -1) {
                this.treeNodes[indexModifiedNode].data = {
                    ...this.treeNodes[indexModifiedNode].data,
                    label: node.name,
                    globalBuildStatus: node.nodeBuildStatus?.globalBuildStatus,
                    localBuildStatus: node.nodeBuildStatus?.localBuildStatus,
                    readOnly: node.readOnly,
                };
            }
        });
        this.treeNodes = [...this.treeNodes];
    }

    setTreeElements(elements) {
        // handle root node
        this.treeNodes.push(
            convertNodetoReactFlowModelNode(elements, undefined)
        );
        // handle root children
        elements.children.forEach((child) => {
            this.addChild(child, elements.id);
        });
        this.setBuildingStatus();
    }

    newSharedForUpdate() {
        /* shallow clone of the network https://stackoverflow.com/a/44782052 */
        let newTreeModel = Object.assign(
            Object.create(Object.getPrototypeOf(this)),
            this
        );
        return newTreeModel;
    }

    setBuildingStatus() {
        this.isAnyNodeBuilding =
            this.treeNodes.find(
                (node) => node?.data?.globalBuildStatus === 'BUILDING'
            ) !== undefined;
    }

    setCaseName(newCaseName) {
        if (
            this.treeNodes.length > 0 &&
            this.treeNodes[0].data &&
            newCaseName
        ) {
            this.treeNodes[0].data = {
                ...this.treeNodes[0].data,
                caseName: newCaseName,
            };
        }
    }
}
