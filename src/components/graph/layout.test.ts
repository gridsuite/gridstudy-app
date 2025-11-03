/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CurrentTreeNode, ModificationNode, NetworkModificationNodeType, NodeType, RootNode } from './tree-node.type';
import { UUID } from 'node:crypto';
import { getTreeNodesWithUpdatedPositions, nodeHeight, nodeWidth } from './layout';
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

function testPosition(nodes: CurrentTreeNode[], id: string, relativeX: number, relativeY: number) {
    const realId = fakeUuid(id);
    const node = nodes.find((n) => n.id === realId);
    if (!node) {
        console.error('Node ' + id + ' not found');
        return false;
    }
    if (node.position?.x !== relativeX * nodeWidth) {
        console.warn(
            'Node ' + id + ': bad X position. Expected ' + relativeX * nodeWidth + ', got ' + node.position?.x
        );
        return false;
    }
    if (node.position?.y !== relativeY * nodeHeight) {
        console.warn(
            'Node ' + id + ': bad X position. Expected ' + relativeY * nodeHeight + ', got ' + node.position?.y
        );
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

test('layout.basic', () => {
    const nodes: CurrentTreeNode[] = [];
    nodes.push(
        buildRootNode('root'),
        buildNode('a', 'root'),
        buildNode('b', 'a'),
        buildNode('c', 'b'),
        buildNode('d', 'c'),
        buildNode('e', 'c'),
        buildNode('f', 'a'),
        buildNode('g', 'root')
    );

    const [updatedNodes] = getTreeNodesWithUpdatedPositions(nodes);

    expect(testPosition(updatedNodes, 'root', 0, 0)).toBeTruthy();
    expect(testPosition(updatedNodes, 'a', 0, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'b', 0, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'c', 0, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'd', 0, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'e', 1, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'f', 1, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'g', 2, 1)).toBeTruthy();
});

test('layout.securityNoOverride', () => {
    const nodes: CurrentTreeNode[] = [];
    nodes.push(
        buildRootNode('root'),
        buildNode('a', 'root'),
        buildNode('b', 'a'),
        buildNode('c', 'b'),
        buildSecurityNode('d', 'b'),
        buildNode('e', 'root'),
        buildNode('f', 'e'),
        buildSecurityNode('g', 'e'),
        buildSecurityNode('h', 'g')
    );

    const [updatedNodes, securityGroupsNodes] = getTreeNodesWithUpdatedPositions(nodes);

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

test('layout.securityInComplexTree', () => {
    const nodes: CurrentTreeNode[] = [];
    nodes.push(
        buildRootNode('root'),
        buildNode('a1', 'root'),
        buildNode('a2', 'a1'),
        buildNode('a3', 'a2'),
        buildNode('a4', 'a3'),
        buildNode('a5', 'a4'),
        buildNode('a6', 'a5'),
        buildNode('a7', 'a6'),
        buildNode('a8', 'a7'),
        buildNode('a8b', 'a7'),
        buildSecurityNode('a8c', 'a7'),
        buildNode('a6b', 'a5'),
        buildNode('a6c', 'a5'),
        buildNode('b1', 'root'),
        buildSecurityNode('b2', 'b1'),
        buildSecurityNode('s1', 'b1'),
        buildSecurityNode('s2', 's1'),
        buildSecurityNode('s3', 's1'),
        buildSecurityNode('s4', 's3'),
        buildSecurityNode('s5', 's4'),
        buildSecurityNode('s6', 's5'),
        buildSecurityNode('s7', 's5'),
        buildNode('c1', 'root'),
        buildNode('c2', 'c1'),
        buildNode('d1', 'root'),
        buildNode('d2', 'd1'),
        buildNode('d3', 'd2'),
        buildNode('d4', 'd3'),
        buildNode('d5', 'd4'),
        buildSecurityNode('d6', 'd5'),
        buildNode('d6b', 'd5'),
        buildNode('d6c', 'd5'),
        buildNode('e1', 'root'),
        buildSecurityNode('e2', 'e1'),
        buildSecurityNode('r1', 'e1'),
        buildSecurityNode('r2', 'r1'),
        buildSecurityNode('r3', 'r2'),
        buildSecurityNode('r4', 'r3'),
        buildSecurityNode('r5', 'r4'),
        buildSecurityNode('r5b', 'r4'),
        buildSecurityNode('r2b', 'r1'),
        buildSecurityNode('r3b', 'r2b'),
        buildSecurityNode('r3c', 'r2b'),
        buildSecurityNode('r4c', 'r3c'),
        buildSecurityNode('r4d', 'r3c'),
        buildSecurityNode('r5d', 'r4d'),
        buildSecurityNode('r5e', 'r4d'),
        buildSecurityNode('r2d', 'r1'),
        buildNode('f1', 'root'),
        buildNode('f2', 'f1')
    );

    const [updatedNodes, securityGroupsNodes] = getTreeNodesWithUpdatedPositions(nodes);

    expect(testPosition(updatedNodes, 'a1', 0, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'a5', 0, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'a6', 0, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'a6b', 1, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'a6c', 2, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'a8', 0, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'a8b', 1, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'a8c', 2, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'b1', 2, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'b2', 0, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 's1', 1, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 's2', 0, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 's3', 1, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 's4', 0, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 's6', 0, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 's7', 1, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'c1', 6, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'd1', 7, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'd6', 0, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'd6b', 1, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'd6c', 2, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'e1', 9, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'e2', 0, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'r1', 1, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'r2', 0, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'r2b', 1, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'r2d', 3, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'r3', 0, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'r3b', 0, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'r3c', 1, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'r4', 0, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'r4c', 0, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'r4d', 1, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'r5', 0, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'r5b', 1, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'r5d', 0, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'r5e', 1, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'f1', 15, 1)).toBeTruthy();
    expect(testPosition(updatedNodes, 'f2', 0, 1)).toBeTruthy();

    expect(testSecurityGroupPosition(securityGroupsNodes, 'a8c', 2, 8, 2, 8)).toBeTruthy();
    expect(testSecurityGroupPosition(securityGroupsNodes, 'b2', 2, 2, 2, 2)).toBeTruthy();
    expect(testSecurityGroupPosition(securityGroupsNodes, 's1', 3, 2, 5, 6)).toBeTruthy();
    expect(testSecurityGroupPosition(securityGroupsNodes, 'd6', 7, 6, 7, 6)).toBeTruthy();
    expect(testSecurityGroupPosition(securityGroupsNodes, 'e2', 9, 2, 9, 2)).toBeTruthy();
    expect(testSecurityGroupPosition(securityGroupsNodes, 'r1', 10, 2, 14, 6)).toBeTruthy();
});
