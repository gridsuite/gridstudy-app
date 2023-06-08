/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getLayoutedNodes } from './layout';
import { convertNodetoReactFlowModelNode } from './util/model-functions';

export default class NetworkModificationTreeModel {
    treeNodes = [];
    treeEdges = [];

    isAnyNodeBuilding = false;

    updateLayout() {
        this.treeNodes = getLayoutedNodes(this.treeNodes, this.treeEdges);
        this.treeEdges = [...this.treeEdges]; //otherwise react-flow doesn't show new edges
    }

    addChild(newNode, parentId, insertMode) {
        // Add node
        this.treeNodes.push(convertNodetoReactFlowModelNode(newNode, parentId));
        // Add edge between node and its parent
        this.treeEdges.push({
            id: 'e' + parentId + '-' + newNode.id,
            source: parentId,
            target: newNode.id,
            type: 'smoothstep',
        });

        if (insertMode === 'BEFORE' || insertMode === 'AFTER') {
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

            // fix old children nodes parentUuid when inserting new nodes
            const nextEdges = filteredEdges.map((edge) => {
                if (newNode.childrenIds.includes(edge.id)) {
                    edge.data = {
                        ...edge.data,
                        parentNodeUuid: newNode.id,
                    };
                }
                return edge;
            });

            this.treeEdges = nextEdges;
        }
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
                    buildStatusGlobal: node.nodeBuildStatus?.buildStatusGlobal,
                    buildStatusLocal: node.nodeBuildStatus?.buildStatusLocal,
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
                (node) => node?.data?.buildStatusGlobal === 'BUILDING'
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
