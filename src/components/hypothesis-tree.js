import React from 'react';
import orgChartJson from '../data/poc-hypos-data.json';
import Tree from "./tree-graph/tree";

const HypothesisTree = (props) => {
    return (
        <Tree data={orgChartJson}/>
    );
};

export default HypothesisTree;