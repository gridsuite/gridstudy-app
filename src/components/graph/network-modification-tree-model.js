/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { getLayoutedElements } from './layout';

export default class NetworkModificationTreeModel {
    treeElements = [];

    updateLayout() {
        this.treeElements = getLayoutedElements(this.treeElements);
    }

    // TODO: support the cases where node is inserted between two existing nodes
    addChild(element, parentId) {
        // Add node
        this.treeElements.push({
            id: element.id,
            type: element.type, // input node
            data: {
                label: element.name,
                description: element.description,
                buildStatus: element.buildStatus,
            },
        });
        // Add edge between node and its parent
        this.treeElements.push({
            id: 'e' + parentId + '-' + element.id,
            source: parentId,
            target: element.id,
            type: 'smoothstep',
        });
        if (element.children) {
            element.children.forEach((child) => {
                this.addChild(child, element.id);
            });
        }
    }

    // Remove nodes AND reparent their children
    // TODO: support the case where children are deleted too (no reparenting)
    removeNodes(deletedNodes) {
        deletedNodes.forEach((nodeId) => {
            // get edges which have the deleted node as source or target
            const edges = this.treeElements.filter(
                (element) =>
                    element.source === nodeId || element.target === nodeId
            );
            // From the edges array
            // get edges which have the deleted node as source
            const edgesOfSource = edges.filter(
                (element) => element.source === nodeId
            );
            // get edges which have the deleted node as target
            const edgesOfTarget = edges.filter(
                (element) => element.target === nodeId
            );
            // Remove these edges and the node from the treeElements array
            const filteredTreeElements = this.treeElements.filter(
                (element) =>
                    element.id !== nodeId &&
                    element.source !== nodeId &&
                    element.target !== nodeId
            );
            // Recreate edges by reparenting previously targeted nodes to previous source nodes
            edgesOfTarget.forEach((edgeOfTarget) => {
                edgesOfSource.forEach((edgeOfSource) => {
                    filteredTreeElements.push({
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
            this.treeElements = filteredTreeElements;
        });
    }

    updateNodes(updatedNodes) {
        updatedNodes.forEach((node) => {
            const indexModifiedNode = this.treeElements.findIndex(
                (element) => element.id === node.id
            );
            if (indexModifiedNode !== -1) {
                this.treeElements[indexModifiedNode].data = {
                    ...this.treeElements[indexModifiedNode].data,
                    label: node.name,
                    buildStatus: node.buildStatus,
                };
            }
        });
        this.treeElements = [...this.treeElements];
    }

    setTreeElements(elements) {
        // handle root node
        this.treeElements.push({
            id: elements.id,
            type: elements.type, // input node
            data: {
                label: elements.name,
                description: elements.description,
                buildStatus: elements.buildStatus,
            },
        });
        // handle root children
        elements.children.forEach((child) => {
            this.addChild(child, elements.id);
        });
    }

    newSharedForUpdate() {
        /* shallow clone of the network https://stackoverflow.com/a/44782052 */
        let newTreeModel = Object.assign(
            Object.create(Object.getPrototypeOf(this)),
            this
        );
        return newTreeModel;
    }
}
