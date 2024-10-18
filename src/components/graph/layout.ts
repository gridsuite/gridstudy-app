/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { nodeWidth, nodeHeight, rootNodeWidth, rootNodeHeight } from './util/model-constants';
import { Edge } from '@xyflow/react';
import { CurrentTreeNode } from 'redux/reducer';
import { NodeType } from './tree-node.type';
import ELK from 'elkjs/lib/elk.bundled';
const elk = new ELK();
const layoutOptions = {
    'algorithm': 'layered',
    'elk.direction': 'DOWN',
    'mergeEdges': true,
    'spacing.nodeNode': 30.0,
    'spacing.edgeNodeBetweenLayers': 30.0,
    'nodePlacement.favorStraightEdges': true,
    'fixedAlignment': 'LEFTDOWN',
    'elk.padding': '[top=20.0,left=0.0,bottom=0.0,right=0.0]',
    'considerModelOrder.strategy':'NODES_AND_EDGES',
    'crossingMinimization.forceNodeModelOrder':true,
};

export function getLayoutedElements(nodes: CurrentTreeNode[], edges: Edge[]) {
    const graph = {
        id: 'root',
        layoutOptions: layoutOptions,
        children: nodes.map((node) => ({
            ...node,
            width: node?.type === NodeType.ROOT ? rootNodeWidth : nodeWidth,
            height: node?.type === NodeType.ROOT ? rootNodeHeight : nodeHeight,
        })),
        edges: edges,
    };
    const result = elk
        .layout(graph)
        .then((layoutedGraph) => ({
            nodes: layoutedGraph.children.map((node) => ({
                ...node,
                // React Flow expects a position property on the node instead of `x`
                // and `y` fields.
                position: { x: node.x, y: node.y },
            })),
            edges: layoutedGraph.edges,
        }))
        .catch(console.error);
    return result;
}
