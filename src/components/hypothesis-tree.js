import React from 'react';
import orgChartJson from '../data/poc-hypos-data.json';
import Tree from './tree-graph/tree';
import G6 from '@antv/g6';
import RootNode from './tree-graph/root-node';
import HypoNode from './tree-graph/hypo-node';

const HypothesisTree = (props) => {
    G6.registerNode('rootNode', RootNode);
    G6.registerNode('hypoNode', HypoNode);

    G6.registerBehavior('add-node', {
        getEvents() {
            return {
                'node:contextmenu': 'onNodeClick',
            };
        },
        onNodeClick(e) {
            const graph = this.graph;
            const item = e.item;
            this.graph.addChild({id: 'newHypo' + Math.random(), label: 'newHypo', type: 'hypoNode', hypos: ['toto 1', 'toto 2']}, item);
        },
    });

    return <Tree data={orgChartJson} />;
};

export default HypothesisTree;
