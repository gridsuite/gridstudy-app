import React from 'react';
import orgChartJson from '../data/poc-hypos-data.json';
import Tree from './tree-graph/tree';
import G6 from '@antv/g6';
import RootNode from './tree-graph/root-node';
import HypoNode from './tree-graph/hypo-node';

const HypothesisTree = (props) => {
    G6.registerNode('rootNode', RootNode);
    G6.registerNode('hypoNode', HypoNode);

    return <Tree data={orgChartJson} />;
};

export default HypothesisTree;
