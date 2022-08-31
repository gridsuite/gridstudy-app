/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import dagre from 'dagre';
import { nodeWidth, nodeHeight, rootNodeWidth } from './util/model-constants';

export function getLayoutedNodes(nodes, edges) {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ direction: 'TB', align: 'UL' });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });
    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph, { debugTiming: true });

    return nodes.map((el) => {
        const nodeWithPosition = dagreGraph.node(el.id);
        el.targetPosition = 'top';
        el.sourcePosition = 'bottom';
        const width = el?.type === 'ROOT' ? rootNodeWidth : nodeWidth;

        el.position = {
            x: nodeWithPosition.x - width / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return el;
    });
}
