/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    nodeWidth,
    nodeHeight,
    rootNodeWidth,
    rootNodeHeight,
} from './util/model-constants';

import ELK from 'elkjs/lib/elk.bundled';
const elk = new ELK();
const layoutOptions = {
    'elk.algorithm': 'layered',
    'elk.direction': 'DOWN',
    'elk.spacing.nodeNode': 40,
};

export function getLayoutedNodes(nodes, edges) {
    // Créer le modèle ELK
    const elkGraph = {
        id: 'root',
        layoutOptions,
        children: [],
        edges: [],
    };

    //Ajouter les nœuds au modèle ELK
    nodes.forEach((node) => {
        const elkNode = {
            id: node.id,
            width: node?.type === 'ROOT' ? rootNodeWidth : nodeWidth,
            height: node?.type === 'ROOT' ? rootNodeHeight : nodeHeight,
        };
        elkGraph.children.push(elkNode);
    });

    //Ajouter les arêtes au modèle ELK
    edges.forEach((edge) => {
        elkGraph.edges.push({
            id: `${edge.source}-${edge.target}`,
            sources: [edge.source],
            targets: [edge.target],
        });
    });

    // Exécuter la mise en page avec ELK et gérer le résultat avec un callback
    return elk.layout(elkGraph).then((layoutResult) => {
        // Mettre à jour les positions des nœuds dans nodes
        nodes.map((el) => {
            const elkNode = layoutResult.children.find(
                (node) => node.id === el.id
            );
            el.targetPosition = 'top';
            el.sourcePosition = 'bottom';
            const width = el.type === 'ROOT' ? rootNodeWidth : nodeWidth;
            const height = el.type === 'ROOT' ? rootNodeHeight : nodeHeight;

            el.position = {
                x: elkNode.x - width / 2,
                y: elkNode.y - height / 2,
            };
            // Pour initialiser le style du nœud React Flow
            el.style = {
                width: width,
                height: height,
            };
            return el;
        });

        // Renvoyer les nœuds mis en page
        return nodes;
    });
}
