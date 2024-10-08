/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import dagre from 'dagre';
import { nodeWidth, nodeHeight, rootNodeWidth, rootNodeHeight } from './util/model-constants';
import { NodeType } from './network-modification-tree-model';
import { Edge, Position } from 'react-flow-renderer';
import { CurrentTreeNode } from 'redux/reducer';

export function getLayoutedNodes(nodes: CurrentTreeNode[], edges: Edge[]) {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'TB', align: 'UL' });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, {
            width: node?.type === NodeType.ROOT ? rootNodeWidth : nodeWidth,
            height: node?.type === NodeType.ROOT ? rootNodeHeight : nodeHeight,
        });
    });
    edges.forEach((edge: Edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    return nodes.map((el) => {
        const nodeWithPosition = dagreGraph.node(el.id);
        el.targetPosition = Position.Top;
        el.sourcePosition = Position.Bottom;
        const width = el?.type === NodeType.ROOT ? rootNodeWidth : nodeWidth;
        const height = el?.type === NodeType.ROOT ? rootNodeHeight : nodeHeight;

        el.position = {
            x: nodeWithPosition.x - width / 2,
            y: nodeWithPosition.y - height / 2,
        };
        // To init react flow node style
        el.style = {
            width: width,
            height: height,
        };
        return el;
    });
}
