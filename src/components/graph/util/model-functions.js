/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export function getFirstNodeOfType(elements, nodeType, buildStatus) {
    if (
        elements.type === nodeType &&
        (buildStatus === undefined || elements.buildStatus === buildStatus)
    ) {
        return {
            id: elements.id,
            type: elements.type,
            data: {
                label: elements.name,
                description: elements.description,
                buildStatus: elements.buildStatus,
                readOnly: elements.readOnly,
            },
        };
    }

    for (const child of elements.children) {
        const found = getFirstNodeOfType(child, nodeType, buildStatus);
        if (found) {
            return found;
        }
    }
}

export function isNodeValid(workingNode, selectedNode) {
    const readOnlyNode = workingNode?.readOnly;
    const builtWorkingNode = workingNode?.buildStatus === 'BUILT';
    const workingNodeIsSelectedNode =
        selectedNode === null ||
        selectedNode === undefined ||
        workingNode?.id === selectedNode?.id;

    return !readOnlyNode && builtWorkingNode && workingNodeIsSelectedNode;
}

export function isNodeDisabled(node) {
    // only one node can be named like this... maybe it should be mark as built from backend
    if (node?.name === 'Root') return false;
    return node?.buildStatus !== 'BUILT';
}

export function getRootNode(elements) {
    if (elements.type === 'ROOT')
        return {
            id: elements.id,
            type: elements.type,
            data: {
                label: elements.data.label,
                description: elements.data.description,
                buildStatus: elements.data.buildStatus,
                readOnly: elements.data.readOnly,
            },
            targetPosition: elements?.targetPosition,
            position: elements?.position,
        };
}
