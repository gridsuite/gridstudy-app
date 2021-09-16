/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useState } from 'react';
import ReactFlow from 'react-flow-renderer';
import NetworkModificationNode from './graph/nodes/network-modification-node';
import ModelNode from './graph/nodes/model-node';
import CreateNodeMenu from './graph/menus/create-node-menu';
import NodeEditor from './graph/menus/node-editor';
import { Box } from '@material-ui/core';
import { createTreeNode, deleteTreeNode } from '../utils/rest-api';

const NetworkModificationTree = (props) => {
    const [selectedNode, setSelectedNode] = useState(null);

    const style = {
        width: '100%',
        height: '100%',
    };

    const onSelectionChange = (selectedElements) => {
        if (selectedElements?.length > 0) {
            setSelectedNode(selectedElements[0]);
        }
    };

    const onPaneClick = () => {
        setSelectedNode(undefined);
    };

    const handleCreateNode = useCallback((element, type) => {
        createTreeNode(element.id, { name: 'New node', type: type }).then(
            (response) => {
                if (response.status !== 200) {
                    console.log('Error creating node');
                }
            }
        );
    }, []);

    const handleRemoveNode = useCallback((element) => {
        deleteTreeNode(element.id).then((response) => {
            if (response.status !== 200) {
                console.log('Error creating node');
            }
        });
    }, []);

    const [createNodeMenu, setCreateNodeMenu] = useState({
        position: [-1, -1],
        display: null,
        selectedNode: null,
    });

    const onNodeContextMenu = useCallback((event, element) => {
        setCreateNodeMenu({
            position: [event.pageX, event.pageY],
            display: true,
            selectedNode: element,
        });
    }, []);

    const closeCreateNodeMenu = useCallback(() => {
        setCreateNodeMenu({
            display: false,
            selectedNode: null,
        });
    }, []);

    const nodeTypes = {
        ROOT: NetworkModificationNode,
        NETWORK_MODIFICATION: NetworkModificationNode,
        MODEL: ModelNode,
    };

    return (
        <>
            <Box style={style} display="flex" flexDirection="row">
                <Box flexGrow={1}>
                    <ReactFlow
                        elements={
                            props.treeModel ? props.treeModel.treeElements : []
                        }
                        onNodeContextMenu={onNodeContextMenu}
                        onSelectionChange={onSelectionChange}
                        onPaneClick={onPaneClick}
                        elementsSelectable
                        selectNodesOnDrag={false}
                        nodeTypes={nodeTypes}
                        connectionLineType="smoothstep"
                        nodesDraggable={false}
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
                    handleNodeCreation={handleCreateNode}
                    handleNodeRemoval={handleRemoveNode}
                    handleClose={closeCreateNodeMenu}
                />
            )}
        </>
    );
};

export default NetworkModificationTree;
