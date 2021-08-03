import React from 'react';
import ReactFlow from 'react-flow-renderer';
import HypoNode from './graph-nodes/hypo-node';
import ModelNode from "./graph-nodes/model-node";

const HypothesisTree = (props) => {
    const style = {
        width: '100%',
        height: '100%',
    };

    const onElementClick = (event, element) => console.log('click', element, event);

    const nodeTypes = {
        hypoNode: HypoNode,
        modelNode: ModelNode,
    };

    const elements = [
        {
            id: '1',
            type: 'input', // input node
            data: { label: 'Input Node' },
            position: { x: 250, y: 25 },
        },
        // hypo node
        {
            id: '2',
            type: 'hypoNode',
            position: { x: 100, y: 125 },
        },
        {
            id: '3',
            type: 'modelNode', // output node
            data: { label: 'Output Node' },
            position: { x: 250, y: 250 },
        },
        {
            id: '4',
            type: 'output', // output node
            data: { label: 'Output Node' },
            position: { x: 250, y: 350 },
        },
        // animated edge
        { id: 'e1-2', source: '1', target: '2', animated: true },
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e3-4', source: '3', target: '4' },
    ];

    return (
        <div style={{ height: 1200 }}>
            <ReactFlow elements={elements}
                       onElementClick={onElementClick}
                       nodeTypes={nodeTypes}
                       style={style} />
        </div>
    );
};

export default HypothesisTree;
