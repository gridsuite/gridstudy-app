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

    addChild(newElement, parentId, insertMode) {
        // Add node
        this.treeElements.push({
            id: newElement.id,
            type: newElement.type, // input node
            data: {
                label: newElement.name,
                description: newElement.description,
                buildStatus: newElement.buildStatus,
                readOnly: newElement.readOnly,
            },
        });
        // Add edge between node and its parent
        this.treeElements.push({
            id: 'e' + parentId + '-' + newElement.id,
            source: parentId,
            target: newElement.id,
            type: 'smoothstep',
        });

        if (insertMode === 'BEFORE' || insertMode === 'AFTER') {
            // remove previous edges between parent and node children
            const filteredTreeElements = this.treeElements.filter((element) => {
                return (
                    (element.source !== parentId ||
                        !newElement.childrenIds.includes(element.target)) &&
                    (element.target !== parentId ||
                        !newElement.childrenIds.includes(element.source))
                );
            });
            // create new edges between node and its children
            newElement.childrenIds.forEach((childId) => {
                filteredTreeElements.push({
                    id: 'e' + newElement.id + '-' + childId,
                    source: newElement.id,
                    target: childId,
                    type: 'smoothstep',
                });
            });
            this.treeElements = filteredTreeElements;
        }
        if (newElement.children) {
            newElement.children.forEach((child) => {
                this.addChild(child, newElement.id);
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
                    readOnly: node.readOnly,
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
                readOnly: elements.readOnly,
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

    setCaseName(newCaseName) {
        if (
            this.treeElements.length > 0 &&
            this.treeElements[0].data &&
            newCaseName
        ) {
            this.treeElements[0].data.caseName = newCaseName;
        }
    }
}
