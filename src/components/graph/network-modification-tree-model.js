/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export default class NetworkModificationTreeModel {
    treeElements = [];

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

        this.treeElements = [...this.treeElements];
    }

    removeNodes(deletedNodes) {
        deletedNodes.forEach((nodeId) => {
            const filteredTreeElements = this.treeElements.filter(
                (element) =>
                    element.id !== nodeId &&
                    element.source !== nodeId &&
                    element.target !== nodeId
            );
            this.treeElements = filteredTreeElements;
        });
        this.treeElements = [...this.treeElements];
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
}
