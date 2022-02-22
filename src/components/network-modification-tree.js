/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
    Controls,
    useStoreState,
    useZoomPanHelper,
} from 'react-flow-renderer';
import { useDispatch, useSelector } from 'react-redux';
import {
    workingTreeNode,
    selectTreeNode,
    setModificationsDrawerOpen,
} from '../redux/actions';
import { useNodeSingleAndDoubleClick } from './graph/util/node-single-double-click-hook';
import NetworkModificationNode from './graph/nodes/network-modification-node';
import ModelNode from './graph/nodes/model-node';
import CreateNodeMenu from './graph/menus/create-node-menu';
import { Box } from '@material-ui/core';
import { createTreeNode, deleteTreeNode, buildNode } from '../utils/rest-api';
import { displayErrorMessageWithSnackbar, useIntlRef } from '../utils/messages';
import { useSnackbar } from 'notistack';
import CenterGraphButton from './graph/util/center-graph-button';
import { useParams } from 'react-router-dom';
import NodeEditor from './graph/menus/node-editor';
import { StudyDrawer } from './study-drawer';
import { makeStyles } from '@material-ui/core/styles';
import { DRAWER_NODE_EDITOR_WIDTH } from './map-lateral-drawers';
import PropTypes from 'prop-types';
import { StudyDisplayMode } from './study-pane';

const nodeTypes = {
    ROOT: ModelNode,
    NETWORK_MODIFICATION: NetworkModificationNode,
    MODEL: ModelNode,
};

// snapGrid value set to [15, 15] which is the default value for ReactFlow
// it has to be explicitly set as prop of the ReactFlow component, even if snapToGrid option is set to false
// in order to avoid unwanted tree nodes rendering (react-flow bug ?)
const snapGrid = [15, 15];

const useStyles = makeStyles((theme) => ({
    nodeEditor: {
        width: DRAWER_NODE_EDITOR_WIDTH,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        // zIndex set to be below the loader with overlay
        // and above the network explorer, for mouse events on network modification tree
        // to be taken into account correctly
        zIndex: 51,
    },
    nodeEditorShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        pointerEvents: 'none',
        marginLeft: -DRAWER_NODE_EDITOR_WIDTH,
    },
    container: { width: '100%', height: '100%' },
    controls: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        // Unset default properties of ReactFlow controls
        left: 'unset',
        bottom: 'unset',
    },
}));

// We need the previous display and width to compute the transformation we will apply to the tree in order to keep the same focus.
// But the MAP display is neutral for this computation: We need to know what was the last HYBRID or TREE display and its width.
const usePreviousTreeDisplay = (display, width) => {
    const ref = useRef();
    useEffect(() => {
        if (display !== StudyDisplayMode.MAP) {
            ref.current = { display, width };
        }
    }, [display, width]);
    return ref.current;
};

const NetworkModificationTree = ({ treeModel, studyMapTreeDisplay }) => {
    const dispatch = useDispatch();

    const [selectedNode, setSelectedNode] = useState(null);

    const [isMoving, setIsMoving] = useState(false);

    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const classes = useStyles();

    const isModificationsDrawerOpen = useSelector(
        (state) => state.isModificationsDrawerOpen
    );

    const onElementClick = useCallback(
        (event, element) => {
            setSelectedNode(element);
            dispatch(setModificationsDrawerOpen(true));
            dispatch(selectTreeNode(element.id));
            if (
                element.type === 'ROOT' ||
                (element.type === 'MODEL' &&
                    element.data.buildStatus === 'BUILT')
            ) {
                dispatch(workingTreeNode(element.id));
            }
        },
        [dispatch]
    );

    const onNodeDoubleClick = useCallback(
        (event, node) => {
            if (node.type === 'MODEL' && node.data.buildStatus !== 'BUILT') {
                buildNode(studyUuid, node.id)
                    .then((resp) => {
                        node.data.buildStatus = 'BUILDING';
                    })
                    .catch((errorMessage) => {
                        displayErrorMessageWithSnackbar({
                            errorMessage: errorMessage,
                            enqueueSnackbar: enqueueSnackbar,
                            headerMessage: {
                                headerMessageId: 'NodeBuildingError',
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
        (element, type, insertMode) => {
            createTreeNode(studyUuid, element.id, insertMode, {
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
        [studyUuid, enqueueSnackbar, intlRef]
    );

    const handleRemoveNode = useCallback(
        (element) => {
            deleteTreeNode(studyUuid, element.id).catch((errorMessage) => {
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
        [studyUuid, enqueueSnackbar, intlRef]
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

    const [x, y, zoom] = useStoreState((state) => state.transform);

    const { transform } = useZoomPanHelper();

    const width = useStoreState((state) => state.width);

    const prevTreeDisplay = usePreviousTreeDisplay(studyMapTreeDisplay, width);

    //We want to trigger the following useEffect that manage the modification tree focus only when we change the study map/tree display.
    //So we use this useRef to avoid to trigger on those depedencies.
    const focusParams = useRef();
    focusParams.current = {
        x,
        y,
        zoom,
        transform,
        prevTreeDisplay,
    };

    useEffect(() => {
        const nodeEditorShift = isModificationsDrawerOpen
            ? DRAWER_NODE_EDITOR_WIDTH
            : 0;
        const { x, y, zoom, transform, prevTreeDisplay } = focusParams.current;
        if (prevTreeDisplay) {
            if (
                prevTreeDisplay.display === StudyDisplayMode.TREE &&
                studyMapTreeDisplay === StudyDisplayMode.HYBRID
            ) {
                transform({
                    x: x - (prevTreeDisplay.width + nodeEditorShift) / 4,
                    y: y,
                    zoom: zoom,
                });
            } else if (
                prevTreeDisplay.display === StudyDisplayMode.HYBRID &&
                studyMapTreeDisplay === StudyDisplayMode.TREE
            ) {
                transform({
                    x: x + (prevTreeDisplay.width + nodeEditorShift) / 2,
                    y: y,
                    zoom: zoom,
                });
            }
        }
    }, [studyMapTreeDisplay, isModificationsDrawerOpen]);

    return (
        <>
            <Box
                className={classes.container}
                display="flex"
                flexDirection="row"
            >
                <Box flexGrow={1}>
                    <ReactFlow
                        style={{ cursor: isMoving ? 'grabbing' : 'grab' }}
                        elements={treeModel ? treeModel.treeElements : []}
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
                            className={classes.controls}
                            showZoom={false}
                            showInteractive={false}
                        >
                            <CenterGraphButton selectedNode={selectedNode} />
                        </Controls>
                    </ReactFlow>
                </Box>
                <StudyDrawer
                    open={isModificationsDrawerOpen}
                    drawerClassName={classes.nodeEditor}
                    drawerShiftClassName={classes.nodeEditorShift}
                    anchor={
                        prevTreeDisplay === StudyDisplayMode.TREE
                            ? 'right'
                            : 'left'
                    }
                >
                    <NodeEditor />
                </StudyDrawer>
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

NetworkModificationTree.propTypes = {
    treeModel: PropTypes.object.isRequired,
    studyMapTreeDisplay: PropTypes.string.isRequired,
};
