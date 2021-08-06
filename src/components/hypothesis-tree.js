/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useState } from 'react';
import ReactFlow, { removeElements } from 'react-flow-renderer';
import HypoNode from './graph-nodes/hypo-node';
import ModelNode from './graph-nodes/model-node';
import CreateNodeMenu from './graph-menus/create-node-menu';
import NodeEditor from './graph-menus/node-editor';
import { Box } from '@material-ui/core';

const HypothesisTree = (props) => {
    const [selectedNode, setSelectedNode] = useState(null);

    const style = {
        width: '100%',
        height: '100%',
    };

    const onNodeContextMenu = (event, element) => {
        setCreateNodeMenu({
            position: [event.pageX, event.pageY],
            display: true,
            selectedNode: element,
        });
    };

    const onSelectionChange = (selectedElements) => {
        if (selectedElements?.length > 0) {
            setSelectedNode(selectedElements[0]);
        }
    };

    const onPaneClick = () => {
        setSelectedNode(undefined);
    };

    // Used for poc, should use a uuid
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function createNode(element, type) {
        const newNodeId = getRandomInt(1, 200000000);
        setElements((es) =>
            es.concat(
                {
                    id: newNodeId.toString(),
                    type: type,
                    data: { label: 'New node' },
                    position: {
                        x: element.position.x,
                        y: element.position.y + 75,
                    },
                },
                {
                    id: 'e' + element.id + '-' + newNodeId,
                    source: element.id,
                    target: newNodeId.toString(),
                }
            )
        );
    }

    function removeNode(element) {
        setElements((es) => removeElements([element], es));
    }

    const [createNodeMenu, setCreateNodeMenu] = useState({
        position: [-1, -1],
        display: null,
        selectedNode: null,
    });

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
            <Box style={style} display="flex" flexDirection="row">
                <Box flexGrow={1}>
                    <ReactFlow
                        elements={elements}
                        onNodeContextMenu={onNodeContextMenu}
                        onSelectionChange={onSelectionChange}
                        onPaneClick={onPaneClick}
                        elementsSelectable
                        selectNodesOnDrag={false}
                        nodeTypes={nodeTypes}
                    />
                </Box>
                {selectedNode && (
                    <Box>
                        <NodeEditor selectedNode={selectedNode}></NodeEditor>
                    </Box>
                )}
            </Box>
            {createNodeMenu.display && (
                <CreateNodeMenu
                    position={createNodeMenu.position}
                    selectedNode={createNodeMenu.selectedNode}
                    handleNodeCreation={createNode}
                    handleNodeRemoval={removeNode}
                    handleClose={closeCreateNodeMenu}
                />
            )}
        </>
    );
};

export default HypothesisTree;
