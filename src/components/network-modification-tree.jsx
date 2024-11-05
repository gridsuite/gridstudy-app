/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Tooltip } from '@mui/material';
import {
    ReactFlow,
    Controls,
    useStore,
    useReactFlow,
    ControlButton,
    MiniMap,
    useEdgesState,
    useNodesState,
    Background,
    BackgroundVariant,
} from '@xyflow/react';
import MapIcon from '@mui/icons-material/Map';
import Grid4x4Icon from '@mui/icons-material/Grid4x4';
import CenterGraphButton from './graph/util/center-graph-button';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { setModificationsDrawerOpen, setCurrentTreeNode } from '../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { isSameNode } from './graph/util/model-functions';
import { DRAWER_NODE_EDITOR_WIDTH, TOOLTIP_DELAY } from '../utils/UIconstants';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import CropFreeIcon from '@mui/icons-material/CropFree';
import { nodeTypes } from './graph/util/model-constants';
import { BUILD_STATUS } from './network/constants';
import { StudyDisplayMode } from './network-modification.type';
import {
    getNodePositionsFromTreeNodes,
    getTreeNodesWithUpdatedPositions,
    nodeGrid,
    nodeWidth,
    snapGrid,
} from './graph/layout';

const NetworkModificationTree = ({
    studyMapTreeDisplay,
    prevTreeDisplay,
    onNodeContextMenu,
    studyUuid,
    isStudyDrawerOpen,
}) => {
    const dispatch = useDispatch();

    const currentNode = useSelector((state) => state.currentTreeNode);

    const treeModel = useSelector((state) => state.networkModificationTreeModel);

    const [isMinimapOpen, setIsMinimapOpen] = useState(false);
    const [isGridVisible, setIsGridVisible] = useState(false);

    const [nodePlacements, setNodePlacements] = useState([]);
    const { setViewport, fitView } = useReactFlow();
    const [isDragging, setIsDragging] = useState(false);

    const nodeColor = useCallback(
        (node) => {
            if (!node) {
                return '#9196a1';
            }
            if (node.type === 'ROOT') {
                return 'rgba(0, 0, 0, 0.0)';
            }
            if (node.id === currentNode?.id) {
                return '#4287f5';
            }
            if (node.data?.localBuildStatus === BUILD_STATUS.BUILT) {
                return '#70d136';
            }
            if (node.data?.localBuildStatus === BUILD_STATUS.BUILT_WITH_WARNING) {
                return '#FFA500';
            }
            if (node.data?.localBuildStatus === BUILD_STATUS.BUILT_WITH_ERROR) {
                return '#DC143C';
            }
            return '#9196a1';
        },
        [currentNode]
    );
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Node position initialization
    useLayoutEffect(() => {
        if (treeModel) {
            setNodePlacements(getNodePositionsFromTreeNodes(treeModel.treeNodes));
        }
    }, [treeModel]);

    const updateNodePositions = useCallback(() => {
        if (treeModel) {
            setNodes(getTreeNodesWithUpdatedPositions(treeModel.treeNodes, nodePlacements));
            setEdges([...treeModel.treeEdges]);
            window.requestAnimationFrame(() => fitView());
        }
    }, [treeModel, nodePlacements, fitView, setNodes, setEdges]);

    useLayoutEffect(() => {
        updateNodePositions();
    }, [updateNodePositions]);

    const onNodeClick = useCallback(
        (event, node) => {
            dispatch(setModificationsDrawerOpen(node.type === 'NETWORK_MODIFICATION'));
            if (!isSameNode(currentNode, node)) {
                dispatch(setCurrentTreeNode(node));
            }
        },
        [dispatch, currentNode]
    );

    const toggleMinimap = useCallback(() => {
        setIsMinimapOpen((isMinimapOpen) => !isMinimapOpen);
    }, []);
    const toggleShowGrid = useCallback(() => {
        setIsGridVisible((isGridVisible) => !isGridVisible);
    }, []);

    const [x, y, zoom] = useStore((state) => state.transform);

    //We want to trigger the following useEffect that manage the modification tree focus only when we change the study map/tree display.
    //So we use this useRef to avoid to trigger on those depedencies.
    const focusParams = useRef();
    focusParams.current = {
        x,
        y,
        zoom,
        setViewport,
        prevTreeDisplay,
    };
    const intl = useIntl();

    useEffect(() => {
        const nodeEditorShift = isStudyDrawerOpen ? DRAWER_NODE_EDITOR_WIDTH : 0;
        const { x, y, zoom, setViewport, prevTreeDisplay } = focusParams.current;
        if (prevTreeDisplay) {
            if (prevTreeDisplay.display === StudyDisplayMode.TREE && studyMapTreeDisplay === StudyDisplayMode.HYBRID) {
                setViewport({
                    x: x - (prevTreeDisplay.width + nodeEditorShift) / 4,
                    y: y,
                    zoom: zoom,
                });
            } else if (
                prevTreeDisplay.display === StudyDisplayMode.HYBRID &&
                studyMapTreeDisplay === StudyDisplayMode.TREE
            ) {
                setViewport({
                    x: x + (prevTreeDisplay.width + nodeEditorShift) / 2,
                    y: y,
                    zoom: zoom,
                });
            }
        }
    }, [studyMapTreeDisplay, isStudyDrawerOpen]);

    useEffect(() => {
        const { x, y, zoom, setViewport } = focusParams.current;
        if (isStudyDrawerOpen) {
            setViewport({
                x: x - DRAWER_NODE_EDITOR_WIDTH / 2,
                y: y,
                zoom: zoom,
            });
        } else {
            setViewport({
                x: x + DRAWER_NODE_EDITOR_WIDTH / 2,
                y: y,
                zoom: zoom,
            });
        }
        window.requestAnimationFrame(() => fitView());
    }, [isStudyDrawerOpen, fitView]);

    const handleNodeDragStop = (event, node) => {
        setIsDragging(false);
        console.error('CHARLY DRAGGED node ' + node.id + ' to X position ' + node.position?.x);

        // TODO : avec node.position.x, on a la nouvelle position de la node.
        // il faut trouver les nodes dans le placement qui sont à gauche et à droite de cette position.
    };

    const handleNodeDrag = (event, node) => {
        setIsDragging(true);
    };

    const handleNodesChange = (changes) => {
        // Restrict the node movement (with drag) to only the X axis.
        // We force the Y position to stay the same while moving the node.
        changes
            .filter((change) => change.type === 'position')
            .map((change) => {
                const initialYPosition = nodes.find((node) => node.id === change.id)?.position?.y || 0;
                const newPosition = {
                    ...change.position,
                    y: initialYPosition,
                };
                change.position = newPosition;
                return change;
            });
        return onNodesChange(changes);
    };

    const NodePlacementsDisplay = ({ nodePlacements }) => {
        const squareSize = 30;
        return (
            <Box>
                {nodePlacements.map((array, row) => (
                    <Box key={row}>
                        {array.map((value, columns) => (
                            <Box
                                key={`${row}-${columns}`}
                                sx={{
                                    position: 'absolute',
                                    display: 'block',
                                    top: (row * squareSize) / 2 + 'px',
                                    left: columns * squareSize + 'px',
                                    border: 'solid 1px red',
                                    backgroundColor: 'gold',
                                    width: squareSize + 'px',
                                    height: squareSize / 2 + 'px',
                                    zIndex: 199,
                                    fontSize: '10px',
                                    color: 'red',
                                }}
                            >
                                {value.substring(0, 3)}
                            </Box>
                        ))}
                    </Box>
                ))}
            </Box>
        );
    };
    const debug = true; // TODO remove this before merge
    return (
        <Box flexGrow={1}>
            {debug && ( // TODO Remove this before merge
                <NodePlacementsDisplay nodePlacements={nodePlacements} />
            )}
            {debug && isDragging && ( // TODO Remove this before merge
                <Box
                    sx={{
                        display: 'block',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        backgroundColor: 'red',
                        color: 'white',
                    }}
                >
                    DRAGGING
                </Box>
            )}
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={handleNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                snapToGrid
                snapGrid={snapGrid}
                onNodeContextMenu={onNodeContextMenu}
                onNodeClick={onNodeClick}
                elementsSelectable
                selectNodesOnDrag={false}
                nodeTypes={nodeTypes}
                minZoom={0.1} // Lower value allows for more zoom out
                //maxZoom={2} // Higher value allows for more zoom in
                nodesDraggable={true}
                onNodeDrag={handleNodeDrag}
                onNodeDragStop={handleNodeDragStop}
            >
                {isGridVisible && (
                    <Background
                        id="gridBackground"
                        color={'#0ca78933'}
                        gap={nodeGrid}
                        variant={BackgroundVariant.Lines}
                        offset={[140, 80]}
                    />
                )}
                {isDragging && (
                    <Background
                        id="gridDragBackground"
                        color={'#8ec7f633'}
                        gap={[nodeWidth, 10000000]} // Only display the vertical grid lines
                        variant={BackgroundVariant.Lines}
                        offset={[140, 80]}
                    />
                )}
                <Controls
                    style={{ margin: '10px' }} // This component uses "style" instead of "sx"
                    position="top-right"
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
                    <span>
                        <ControlButton onClick={() => toggleShowGrid()}>
                            <Grid4x4Icon />
                        </ControlButton>
                    </span>
                </Controls>
                {isMinimapOpen && (
                    <MiniMap nodeColor={nodeColor} pannable inversePan zoomable zoomStep={1} nodeStrokeWidth={0} />
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
    isStudyDrawerOpen: PropTypes.bool.isRequired,
};
