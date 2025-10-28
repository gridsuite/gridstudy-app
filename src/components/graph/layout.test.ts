/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CurrentTreeNode, ModificationNode, NetworkModificationNodeType, NodeType, RootNode } from './tree-node.type';
import { UUID } from 'node:crypto';
import { getTreeNodesWithUpdatedPositions, nodeHeight, nodeWidth } from './layout';
import { Node } from '@xyflow/react';
import { groupIdSuffix } from './nodes/labeled-group-node.type';

function fakeUuid(input: string): UUID {
    const repeated = input.repeat(36).slice(0, 32);
    return `${repeated.slice(0, 8)}-${repeated.slice(8, 12)}-${repeated.slice(12, 16)}-${repeated.slice(16, 20)}-${repeated.slice(20, 32)}`;
}

function buildRootNode(name: string): RootNode {
    return {
        id: fakeUuid(name),
        type: NodeType.ROOT,
        data: {
            label: name,
        },
        position: { x: -1, y: -1 },
    };
}

function buildNode(name: string, parent: string): ModificationNode {
    return {
        id: fakeUuid(name),
        parentId: fakeUuid(parent),
        type: NodeType.NETWORK_MODIFICATION,
        data: {
            label: name,
            nodeType: NetworkModificationNodeType.CONSTRUCTION,
        },
        position: { x: -1, y: -1 },
    };
}

function buildSecurityNode(name: string, parent: string): ModificationNode {
    return {
        id: fakeUuid(name),
        parentId: fakeUuid(parent),
        type: NodeType.NETWORK_MODIFICATION,
        data: {
            label: name,
            nodeType: NetworkModificationNodeType.SECURITY,
        },
        position: { x: -1, y: -1 },
    };
}

function testPosition(nodes: CurrentTreeNode[], id: string, x: number, y: number) {
    const realId = fakeUuid(id);
    const node = nodes.find((n) => n.id === realId);
    if (!node) {
        console.error('Node ' + id + ' not found');
        return false;
    }
    if (node.position?.x !== x * nodeWidth) {
        console.warn('Node ' + id + ': bad X position. Expected ' + x * nodeWidth + ', got ' + node.position?.x);
        return false;
    }
    if (node.position?.y !== y * nodeHeight) {
        console.warn('Node ' + id + ': bad X position. Expected ' + y * nodeHeight + ', got ' + node.position?.y);
        return false;
    }
    return true;
}

function testSecurityGroupPosition(
    securityGroupsNodes: any,
    id: string,
    topLeftColumn: number,
    topLeftRow: number,
    bottomRightColumn: number,
    bottomRightRow: number
) {
    const readId = fakeUuid(id) + groupIdSuffix;
    const group = securityGroupsNodes.find((g: any) => g.id === readId);
    if (!group) {
        console.error('Security group ' + id + ' not found');
        return false;
    }
    if (group.data?.position?.topLeft?.column !== topLeftColumn) {
        console.warn(
            'Security group ' +
                id +
                ': bad top left column position. Expected ' +
                topLeftColumn +
                ', got ' +
                group.data?.position?.topLeft?.column
        );
        return false;
    }
    if (group.data?.position?.topLeft?.row !== topLeftRow) {
        console.warn(
            'Security group ' +
                id +
                ': bad top left row position. Expected ' +
                topLeftRow +
                ', got ' +
                group.data?.position?.topLeft?.row
        );
        return false;
    }
    if (group.data?.position?.bottomRight?.column !== bottomRightColumn) {
        console.warn(
            'Security group ' +
                id +
                ': bad bottom right column position. Expected ' +
                bottomRightColumn +
                ', got ' +
                group.data?.position?.bottomRight?.column
        );
        return false;
    }
    if (group.data?.position?.bottomRight?.row !== bottomRightRow) {
        console.warn(
            'Security group ' +
                id +
                ': bad bottom right row position. Expected ' +
                bottomRightRow +
                ', got ' +
                group.data?.position?.bottomRight?.row
        );
        return false;
    }
    return true;
}

/*
 * In these tests, the X and Y positions are relative to the parent.
 * Therefor, in a grid like this :
 *
 * [R][_][_][_]
 * [A][B][_][_]
 * [_][C][_][F]
 * [_][D][E][_]
 *
 * Here are the relative positions :
 * R: x=0 y=0
 * A: x=0 y=1 (same column as R, one row below)
 * B: x=1 y=1 (one column after R's, on row below)
 * C: x=0 y=1 (same column as B, one row below)
 * D: x=0 y=1 (same column as C, one row below)
 * E: x=1 y=1 (one column after C's, one row below)
 * F: x=2 y=1 (two columns after B's, one row below)
 *
 * On the contrary, the security groups use the global columns and rows to define their top left and bottom right positions.
 */

test('layout.securityNoOverride', () => {
    const nodes: CurrentTreeNode[] = [];
    nodes.push(buildRootNode('root'));
    nodes.push(buildNode('a', 'root'));
    nodes.push(buildNode('b', 'a'));
    nodes.push(buildNode('c', 'b'));
    nodes.push(buildSecurityNode('d', 'b'));
    nodes.push(buildNode('e', 'root'));
    nodes.push(buildNode('f', 'e'));
    nodes.push(buildSecurityNode('g', 'e'));
    nodes.push(buildSecurityNode('h', 'g'));

    const [updatedNodes, securityGroupsNodes] = getTreeNodesWithUpdatedPositions(nodes);

    // Note : the X and Y positions are relative to the node's parent.
    expect(testPosition(updatedNodes, 'root', 0, 0)).toBeTruthy();
    expect(testPosition(updatedNodes, 'a', 0, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'b', 0, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'c', 0, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'd', 1, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'e', 2, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'f', 0, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'g', 1, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'h', 0, 1)).toBeTruthy();

    expect(testSecurityGroupPosition(securityGroupsNodes, 'd', 1, 3, 1, 3)).toBeTruthy();
    expect(testSecurityGroupPosition(securityGroupsNodes, 'g', 3, 2, 3, 3)).toBeTruthy();
});
