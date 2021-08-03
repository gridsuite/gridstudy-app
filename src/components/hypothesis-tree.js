import React, {useState} from 'react';
import Tree from './tree-graph/tree';
import G6 from '@antv/g6';
import RootNode from './tree-graph/root-node';
import HypoNode from './tree-graph/hypo-node';
import ModelNode from "./tree-graph/model-node";
import CreateNodeMenu from "./tree-graph/create-node-menu";


const HypothesisTree = (props) => {
    G6.registerNode('rootNode', RootNode);
    G6.registerNode('hypoNode', HypoNode);
    G6.registerNode('modelNode', ModelNode);

    G6.registerBehavior('add-node', {
        // Bind the event and its callback
        getEvents() {
            return {
                'node:contextmenu': 'onClick',
            };
        },
        /**
         * Handle the callback for node:click
         * @override
         * @param  {Object} evt The handler
         */
        onClick(evt) {
            setCreateNodeMenu({
                display: true,
                position: [evt.x, evt.y],
                item: evt.item,
                graph: this.graph,
            })
        },
    })

    const [hypoTreeData, setHypoTreeData] = useState({id: 'root', label: 'Root', type: 'rootNode', hypos: []});

    const [createNodeMenu, setCreateNodeMenu] = useState({
        position: [-1, -1],
        display: null,
        item: null,
        graph: null,
    }
    );

    function closeCreateNodeMenu() {
        setCreateNodeMenu({
            display: false,
        });
    }

    function createNode(graph, item, type) {
        graph.addChild({id: 'newHypo' + Math.random(), label: 'newHypo', type: type, hypos: []}, item);
    }

    function removeNode(graph, item) {
        graph.removeChild(item.id);
    }

    return (
        <>
            <Tree data={hypoTreeData}/>
            {createNodeMenu.display && <CreateNodeMenu position={createNodeMenu.position}
                                                       handleClose={closeCreateNodeMenu}
                                                       handleCreateNode={createNode}
                                                       handleRemoveNode={removeNode}
                                                       item={createNodeMenu.item}
                                                       graph={createNodeMenu.graph}
            />}
        </>
    );
};

export default HypothesisTree;
