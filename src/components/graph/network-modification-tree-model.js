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

    addChild(element, parentId) {
        // Add node
        this.treeElements.push({
            id: element.id,
            type: element.type, // input node
            data: { label: element.name, description: element.description },
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

    removeNodes(deletedNodes) {
        deletedNodes.forEach((nodeId) => {
            const edgesOfSource = this.treeElements.filter(
                (element) => element.source === nodeId
            );
            const edgesOfTarget = this.treeElements.filter(
                (element) => element.target === nodeId
            );
            const filteredTreeElements = this.treeElements.filter(
                (element) =>
                    element.id !== nodeId &&
                    element.source !== nodeId &&
                    element.target !== nodeId
            );
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

    setTreeElements(elements) {
        // handle root node
        this.treeElements.push({
            id: elements.id,
            type: elements.type, // input node
            data: { label: elements.name, description: elements.description },
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
