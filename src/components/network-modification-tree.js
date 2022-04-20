/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box } from '@mui/material';
import ReactFlow, {
    Controls,
    useStoreState,
    useZoomPanHelper,
} from 'react-flow-renderer';
import CenterGraphButton from './graph/util/center-graph-button';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    selectTreeNode,
    setModificationsDrawerOpen,
    workingTreeNode,
} from '../redux/actions';
import { buildNode } from '../utils/rest-api';
import { displayErrorMessageWithSnackbar, useIntlRef } from '../utils/messages';
import { useNodeSingleAndDoubleClick } from './graph/util/node-single-double-click-hook';
import { useDispatch, useSelector } from 'react-redux';
import RootNode from './graph/nodes/root-node';
import NetworkModificationNode from './graph/nodes/network-modification-node';
import ModelNode from './graph/nodes/model-node';
import { useSnackbar } from 'notistack';
import makeStyles from '@mui/styles/makeStyles';
import { DRAWER_NODE_EDITOR_WIDTH } from './map-lateral-drawers';
import { StudyDisplayMode } from './study-pane';
import PropTypes from 'prop-types';

const nodeTypes = {
    ROOT: RootNode,
    NETWORK_MODIFICATION: NetworkModificationNode,
    MODEL: ModelNode,
};

// snapGrid value set to [15, 15] which is the default value for ReactFlow
// it has to be explicitly set as prop of the ReactFlow component, even if snapToGrid option is set to false
// in order to avoid unwanted tree nodes rendering (react-flow bug ?)
const snapGrid = [15, 15];

const useStyles = makeStyles((theme) => ({
    controls: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        // Unset default properties of ReactFlow controls
        left: 'unset',
        bottom: 'unset',
    },
}));

const NetworkModificationTree = ({
    studyMapTreeDisplay,
    prevTreeDisplay,
    onNodeContextMenu,
    studyUuid,
    isModificationsDrawerOpen,
}) => {
    const dispatch = useDispatch();
    const intlRef = useIntlRef();
    const { enqueueSnackbar } = useSnackbar();
    const classes = useStyles();

    const selectedNode = useSelector((state) => state.selectedTreeNode);

    const treeModel = useSelector(
        (state) => state.networkModificationTreeModel
    );

    const [isMoving, setIsMoving] = useState(false);

    const onElementClick = useCallback(
        (event, element) => {
            dispatch(
                setModificationsDrawerOpen(
                    element.type === 'NETWORK_MODIFICATION'
                )
            );
            dispatch(selectTreeNode(element));
            if (
                element.type === 'ROOT' ||
                (element.type === 'MODEL' &&
                    element.data.buildStatus === 'BUILT')
            ) {
                dispatch(workingTreeNode(element));
            }
        },
        [dispatch]
    );

    const onNodeDoubleClick = useCallback(
        (event, node) => {
            if (
                node.type === 'MODEL' &&
                node.data.buildStatus !== 'BUILT' &&
                node.data.buildStatus !== 'BUILDING'
            ) {
                buildNode(studyUuid, node.id).catch((errorMessage) => {
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
        dispatch(selectTreeNode(null));
    }, [dispatch]);

    const onMove = useCallback((flowTransform) => {
        setIsMoving(true);
    }, []);

    const onMoveEnd = useCallback((flowTransform) => {
        setIsMoving(false);
    }, []);

    const [x, y, zoom] = useStoreState((state) => state.transform);

    const { transform } = useZoomPanHelper();

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

    useEffect(() => {
        const { x, y, zoom, transform } = focusParams.current;
        if (isModificationsDrawerOpen) {
            transform({
                x: x - DRAWER_NODE_EDITOR_WIDTH / 2,
                y: y,
                zoom: zoom,
            });
        } else {
            transform({
                x: x + DRAWER_NODE_EDITOR_WIDTH / 2,
                y: y,
                zoom: zoom,
            });
        }
    }, [isModificationsDrawerOpen]);

    const onLoad = useCallback((reactFlowInstance) => {
        reactFlowInstance.fitView();
    }, []);

    return (
        <Box flexGrow={1}>
            <ReactFlow
                style={{ cursor: isMoving ? 'grabbing' : 'grab' }}
                elements={treeModel ? treeModel.treeElements : []}
                onNodeContextMenu={onNodeContextMenu}
                onElementClick={nodeSingleOrDoubleClick}
                onPaneClick={onPaneClick}
                onMove={onMove}
                onLoad={onLoad}
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
    );
};

export default NetworkModificationTree;

NetworkModificationTree.propTypes = {
    studyMapTreeDisplay: PropTypes.string.isRequired,
    prevTreeDisplay: PropTypes.object,
    onNodeContextMenu: PropTypes.func.isRequired,
    studyUuid: PropTypes.string.isRequired,
    isModificationsDrawerOpen: PropTypes.bool.isRequired,
};
