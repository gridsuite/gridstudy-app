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
// Those offset values are uses to fix the snap to grid behavior when moving nodes
const X_OFFSET_FIX = -40.0;
const Y_OFFSET_FIX = -20.0;

export function getLayoutedElements(nodes: CurrentTreeNode[], edges: Edge[], layoutOptions) {
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
                position: { x: node.x + X_OFFSET_FIX, y: node.y + Y_OFFSET_FIX },
            })),
            edges: [...layoutedGraph.edges],
        }))
        .catch(console.error);
    return result;
}
