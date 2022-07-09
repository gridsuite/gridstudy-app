/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Tooltip } from '@mui/material';
import ReactFlow, {
    Controls,
    useStoreState,
    useZoomPanHelper,
    ControlButton,
    MiniMap,
} from 'react-flow-renderer';
import MapIcon from '@mui/icons-material/Map';
import CenterGraphButton from './graph/util/center-graph-button';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    setModificationsDrawerOpen,
    setCurrentTreeNode,
} from '../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { isSameNode } from './graph/util/model-functions';
import makeStyles from '@mui/styles/makeStyles';
import { DRAWER_NODE_EDITOR_WIDTH } from '../utils/UIconstants';
import { StudyDisplayMode } from './study-pane';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import CropFreeIcon from '@mui/icons-material/CropFree';
import { TOOLTIP_DELAY } from '../utils/UIconstants';
import { nodeTypes } from './graph/util/model-constants';

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
    const classes = useStyles();

    const currentNode = useSelector((state) => state.currentTreeNode);

    const treeModel = useSelector(
        (state) => state.networkModificationTreeModel
    );

    const [isMoving, setIsMoving] = useState(false);
    const [isMinimapOpen, setIsMinimapOpen] = useState(false);

    const nodeColor = (node) => {
        if (node.type === 'ROOT') {
            return 'rgba(0, 0, 0, 0.0)';
        } else {
            if (node.id === currentNode?.id) {
                return '#4287f5';
            }
            switch (
                node.data.buildStatus // TODO replace the switch with a simpler if/else ?
            ) {
                case 'BUILT':
                    return '#70d136';
                case 'NOT_BUILT':
                    return '#9196a1';
                default:
                    return '#9196a1';
            }
        }
    };

    const onElementClick = useCallback(
        (event, element) => {
            dispatch(
                setModificationsDrawerOpen(
                    element.type === 'NETWORK_MODIFICATION'
                )
            );
            if (!isSameNode(currentNode, element))
                dispatch(setCurrentTreeNode(element));
        },
        [dispatch, currentNode]
    );

    const toggleMinimap = useCallback(() => {
        setIsMinimapOpen((isMinimapOpen) => !isMinimapOpen);
    }, []);

    const onMove = useCallback((flowTransform) => {
        setIsMoving(true);
    }, []);

    const onMoveEnd = useCallback((flowTransform) => {
        setIsMoving(false);
    }, []);

    const [x, y, zoom] = useStoreState((state) => state.transform);

    const { transform, fitView } = useZoomPanHelper();

    const onLoad = useCallback((reactFlowInstance) => {
        reactFlowInstance.fitView();
    }, []);

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

    const intl = useIntl();

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

    return (
        <Box flexGrow={1}>
            <ReactFlow
                style={{
                    cursor: isMoving ? 'grabbing' : 'grab',
                }}
                elements={treeModel ? treeModel.treeElements : []}
                onNodeContextMenu={onNodeContextMenu}
                onElementClick={onElementClick}
                onMove={onMove}
                onLoad={onLoad}
                onMoveEnd={onMoveEnd}
                elementsSelectable
                selectNodesOnDrag={false}
                nodeTypes={nodeTypes}
                connectionLineType="default"
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
                    showFitView={false}
                >
                    <Tooltip
                        placement="left"
                        title={intl.formatMessage({
                            id: 'DisplayTheWholeTree',
                        })}
                        arrow
                        enterDelay={TOOLTIP_DELAY}
                        enterNextDelay={TOOLTIP_DELAY}
                    >
                        <span>
                            <ControlButton onClick={fitView}>
                                <CropFreeIcon />
                            </ControlButton>
                        </span>
                    </Tooltip>
                    <CenterGraphButton currentNode={currentNode} />
                    <Tooltip
                        placement="left"
                        title={
                            isMinimapOpen
                                ? intl.formatMessage({ id: 'HideMinimap' })
                                : intl.formatMessage({
                                      id: 'DisplayMinimap',
                                  })
                        }
                        arrow
                        enterDelay={TOOLTIP_DELAY}
                        enterNextDelay={TOOLTIP_DELAY}
                    >
                        <span>
                            <ControlButton onClick={() => toggleMinimap()}>
                                <MapIcon />
                            </ControlButton>
                        </span>
                    </Tooltip>
                </Controls>

                {isMinimapOpen && (
                    <MiniMap nodeColor={nodeColor} nodeStrokeWidth={0} />
                )}
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
