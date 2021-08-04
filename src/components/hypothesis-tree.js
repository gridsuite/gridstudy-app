import React, {useState} from 'react';
import ReactFlow, {removeElements} from 'react-flow-renderer';
import HypoNode from './graph-nodes/hypo-node';
import ModelNode from "./graph-nodes/model-node";
import CreateNodeMenu from "./graph-menus/create-node-menu";

const HypothesisTree = (props) => {

    const style = {
        width: '100%',
        height: '100%',
    };

    const onNodeContextMenu = (event, element) => {
        setCreateNodeMenu({
            position: [event.pageX, event.pageY],
            display: true,
            selectedNode: element,
        })
    };

    // Used for poc, should use a uuid
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function createNode(element, type) {
        const newNodeId = getRandomInt(1, 200000000);
        setElements((es) => es.concat({
            id: newNodeId.toString(),
            type: type,
            position: { x: element.position.x, y: element.position.y + 75 },
        },{ id: 'e' + element.id + '-' + newNodeId, source: element.id, target: newNodeId.toString() },
            ));
    }

    function removeNode(element) {
        setElements((es) => removeElements([element], es));
    }

    const [createNodeMenu, setCreateNodeMenu] = useState({
            position: [-1, -1],
            display: null,
            selectedNode: null,
        }
    );

    function closeCreateNodeMenu() {
        setCreateNodeMenu({
            display: false,
            selectedNode: null,
        });
    }

    const nodeTypes = {
        hypoNode: HypoNode,
        modelNode: ModelNode,
    };

    const initialElements = [
        {
            id: '0',
            type: 'input', // input node
            data: { label: 'Root' },
            position: { x: 250, y: 25 },
        },
    ];

    const [elements, setElements] = useState(initialElements);

    return (
        <>
        <div style={style}>
            <ReactFlow elements={elements}
                       onNodeContextMenu={onNodeContextMenu}
                       nodeTypes={nodeTypes}
                       style={style} />
        </div>
        {createNodeMenu.display && <CreateNodeMenu position={createNodeMenu.position}
                                                   selectedNode={createNodeMenu.selectedNode}
                                                   handleNodeCreation={createNode}
                                                   handleNodeRemoval={removeNode}
                                                   handleClose={closeCreateNodeMenu} />}
        </>
    );
};

export default HypothesisTree;
