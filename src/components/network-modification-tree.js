/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useState } from 'react';
import ReactFlow, { Controls } from 'react-flow-renderer';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { workingTreeNode, selectTreeNode } from '../redux/actions';
import { useNodeSingleAndDoubleClick } from './graph/util/node-single-double-click-hook';
import NetworkModificationNode from './graph/nodes/network-modification-node';
import ModelNode from './graph/nodes/model-node';
import CreateNodeMenu from './graph/menus/create-node-menu';
import { Box } from '@material-ui/core';
import { createTreeNode, deleteTreeNode, buildNode } from '../utils/rest-api';
import { displayErrorMessageWithSnackbar, useIntlRef } from '../utils/messages';
import { useSnackbar } from 'notistack';
import CenterGraphButton from './graph/util/center-graph-button';

const nodeTypes = {
    ROOT: NetworkModificationNode,
    NETWORK_MODIFICATION: NetworkModificationNode,
    MODEL: ModelNode,
};

// snapGrid value set to [15, 15] which is the default value for ReactFlow
// it has to be explicitly set as prop of the ReactFlow component, even if snapToGrid option is set to false
// in order to avoid unwanted tree nodes rendering (react-flow bug ?)
const snapGrid = [15, 15];

const NetworkModificationTree = (props) => {
    const dispatch = useDispatch();

    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const [selectedNode, setSelectedNode] = useState(null);

    const [isMoving, setIsMoving] = useState(false);

    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const styles = {
        container: { width: '100%', height: '100%' },
        flow: { cursor: isMoving ? 'grabbing' : 'grab' },
        controls: {
            position: 'absolute',
            top: '10px',
            right: '10px',
            // Unset default properties of ReactFlow controls
            left: 'unset',
            bottom: 'unset',
        },
    };

    const onElementClick = useCallback(
        (event, element) => {
            console.log('NNO avant single', element.id);
            setSelectedNode(element);
            dispatch(selectTreeNode(element.id));
            if (
                element.type === 'ROOT' ||
                (element.type === 'NETWORK_MODIFICATION' &&
                    element.data.buildStatus === 'BUILT')
            ) {
                dispatch(workingTreeNode(element.id));
            }
        },
        [dispatch]
    );

    const onNodeDoubleClick = useCallback(
        (event, node) => {
            if (node.type === 'NETWORK_MODIFICATION') {
                buildNode(studyUuid, node.id)
                    .then((resp) => {
                        node.data.buildStatus = 'BUILDING';
                    })
                    .catch((errorMessage) => {
                        displayErrorMessageWithSnackbar({
                            errorMessage: errorMessage,
                            enqueueSnackbar: enqueueSnackbar,
                            headerMessage: {
                                headerMessageId: 'NodeCreateError',
                                intlRef: intlRef,
                            },
                        });
                    });
            }
        },
        [studyUuid, enqueueSnackbar, intlRef]
    );

    const nodeSingleOrDoubleClick = useNodeSingleAndDoubleClick(
        onElementClick,
        onNodeDoubleClick
    );

    const onPaneClick = useCallback(() => {
        setSelectedNode(undefined);
    }, []);

    const onMove = useCallback((flowTransform) => {
        setIsMoving(true);
    }, []);

    const onMoveEnd = useCallback((flowTransform) => {
        setIsMoving(false);
    }, []);

    const handleCreateNode = useCallback(
        (element, type) => {
            createTreeNode(element.id, {
                name: 'New node',
                type: type,
                buildStatus: 'NOT_BUILT',
            }).catch((errorMessage) => {
                displayErrorMessageWithSnackbar({
                    errorMessage: errorMessage,
                    enqueueSnackbar: enqueueSnackbar,
                    headerMessage: {
                        headerMessageId: 'NodeCreateError',
                        intlRef: intlRef,
                    },
                });
            });
        },
        [enqueueSnackbar, intlRef]
    );

    const handleRemoveNode = useCallback(
        (element) => {
            deleteTreeNode(element.id).catch((errorMessage) => {
                displayErrorMessageWithSnackbar({
                    errorMessage: errorMessage,
                    enqueueSnackbar: enqueueSnackbar,
                    headerMessage: {
                        headerMessageId: 'NodeDeleteError',
                        intlRef: intlRef,
                    },
                });
            });
        },
        [enqueueSnackbar, intlRef]
    );

    const [createNodeMenu, setCreateNodeMenu] = useState({
        position: { x: -1, y: -1 },
        display: null,
        selectedNode: null,
    });

    const onNodeContextMenu = useCallback((event, element) => {
        setCreateNodeMenu({
            position: { x: event.pageX, y: event.pageY },
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

    return (
        <>
            <Box style={styles.container} display="flex" flexDirection="row">
                <Box flexGrow={1}>
                    <ReactFlow
                        style={styles.flow}
                        elements={
                            props.treeModel ? props.treeModel.treeElements : []
                        }
                        onNodeContextMenu={onNodeContextMenu}
                        onElementClick={nodeSingleOrDoubleClick}
                        onPaneClick={onPaneClick}
                        onMove={onMove}
                        onMoveEnd={onMoveEnd}
                        elementsSelectable
                        selectNodesOnDrag={false}
                        nodeTypes={nodeTypes}
                        connectionLineType="smoothstep"
                        nodesDraggable={false}
                        nodesConnectable={false}
                        snapToGrid={false}
                        // Although snapToGrid is set to false, we have to set snapGrid constant
                        // value in order to avoid useless re-rendering
                        snapGrid={snapGrid}
                    >
                        <Controls
                            style={styles.controls}
                            showZoom={false}
                            showInteractive={false}
                        >
                            <CenterGraphButton selectedNode={selectedNode} />
                        </Controls>
                    </ReactFlow>
                </Box>
            </Box>
            {createNodeMenu.display && (
                <CreateNodeMenu
                    position={createNodeMenu.position}
                    activeNode={createNodeMenu.selectedNode}
                    handleNodeCreation={handleCreateNode}
                    handleNodeRemoval={handleRemoveNode}
                    handleClose={closeCreateNodeMenu}
                />
            )}
        </>
    );
};

export default NetworkModificationTree;
