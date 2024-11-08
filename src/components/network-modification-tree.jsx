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
import GridOnIcon from '@mui/icons-material/GridOn';
import GridOffIcon from '@mui/icons-material/GridOff';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import MobiledataOffIcon from '@mui/icons-material/MobiledataOff';
import WaterfallChartIcon from '@mui/icons-material/WaterfallChart';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
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
    getFirstAncestorIdWithSibling,
    getNodePositionsFromTreeNodes,
    getTreeNodesWithUpdatedPositions,
    isNodeASibling,
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
    const [enableFreeVerticalMovement, setEnableFreeVerticalMovement] = useState(false);
    const [dragWholeColumn, setDragWholeColumn] = useState(true);

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
    const toggleEnableFreeVerticalMovement = useCallback(() => {
        setEnableFreeVerticalMovement((enableFreeVerticalMovement) => !enableFreeVerticalMovement);
    }, []);
    const toggleDragWholeColumn = useCallback(() => {
        setDragWholeColumn((dragWholeColumn) => !dragWholeColumn);
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
        console.error('DRAGGED NODE ' + node.id + ' to X position ' + node.position?.x);

        // TODO With node.position.x, we have the node's new position. EDIT : Maybe this value was changed by the dragWholeColumn algorithm
        // We need to find the adjacent columns positions and switch them.
        // For that we need to implement the index system for the treeModel.treeNodes.
    };

    const handleNodeDrag = (event, node) => {
        setIsDragging(true);
    };

    const handleNodesChange = (changes) => {
        if (!enableFreeVerticalMovement) {
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
        }

        if (dragWholeColumn) {
            // When dragging a node, we not only drag all of its children, but also all of it's ancestors up to
            // an ancestor which has siblings.
            // To do so, we force the dragged node's positition to stay the same and create a new change for the
            // ancestor, with the ancestor's positions updated by the dragged node's movement.
            // Because a node's position is relative to its parent, by "not moving" the dragged node and "moving"
            // the dragged node's ancestor, we effectively move the ancestor and all its children, including the
            // dragged node.
            if (changes.length === 1 && changes[0].type === 'position') {
                const currentChange = changes[0]; // corresponds to the dragged node
                const firstAncestorIdWithSibling = getFirstAncestorIdWithSibling(nodes, changes[0].id);

                // We test if we should move the ancestor instead of the currently moving node
                if (firstAncestorIdWithSibling && firstAncestorIdWithSibling !== currentChange.id) {
                    // We find the movement of the dragged node and apply it to its ancestor instead.
                    const ancestorNode = nodes.find((node) => node.id === firstAncestorIdWithSibling);
                    const initialAncestorXPosition = ancestorNode.position.x;
                    const initialAncestorYPosition = ancestorNode.position.y;
                    const draggedNode = nodes.find((node) => node.id === currentChange.id);
                    const initialDraggedNodeXPosition = draggedNode.position.x;
                    const initialDraggedNodeYPosition = draggedNode.position.y;
                    const draggedNodeDeltaX = currentChange.position.x - initialDraggedNodeXPosition;
                    const draggedNodeDeltaY = currentChange.position.y - initialDraggedNodeYPosition;

                    currentChange.position = {
                        // this updates the entry in "changes"
                        x: initialDraggedNodeXPosition,
                        y: initialDraggedNodeYPosition,
                    };

                    const newChangeForAncestor = {
                        id: firstAncestorIdWithSibling,
                        type: currentChange.type,
                        dragging: currentChange.dragging,
                        position: {
                            x: initialAncestorXPosition + draggedNodeDeltaX,
                            y: initialAncestorYPosition + draggedNodeDeltaY,
                        },
                    };

                    changes.push(newChangeForAncestor);
                }
            }
        }
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
                                    color: isNodeASibling(nodes, value) ? 'green' : 'red',
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
    const debug = false; // TODO remove this before merge
    return (
        <Box flexGrow={1}>
            {debug && ( // TODO Remove this before merge
                <NodePlacementsDisplay nodePlacements={nodePlacements} />
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
                defaultEdgeOptions={{
                    type: 'smoothstep',
                    pathOptions: {
                        // TODO This negative offset and borderRadius values are needed to have round corners on the edge,
                        // but because the nodes are not totally opaque, we can see the edges behind the nodes.
                        // When the nodes are redesigned and hopefully the colors are set without transparency, we can use
                        // the round edges by un-commenting the two lines below.
                        //offset: -24,
                        //borderRadius: 48,
                    },
                }}
            >
                {isGridVisible && (
                    <Background
                        id="gridBackground"
                        color={'#0ca78933'}
                        gap={isDragging && !enableFreeVerticalMovement ? [nodeWidth, 10000000] : nodeGrid}
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
                    <Box sx={{ backgroundColor: '#5ba3ef', padding: '5px', left: '-5px', position: 'relative' }}>
                        <span
                            style={{
                                top: '82px',
                                left: '-18px',
                                color: '#5ba3ef',
                                position: 'absolute',
                                width: 0,
                                height: 0,
                                transform: 'rotate(270deg)',
                                display: 'inline-block',
                                fontSize: 'smaller',
                            }}
                        >
                            PROTOTYPE
                        </span>
                        <span>
                            <ControlButton onClick={() => toggleShowGrid()}>
                                {isGridVisible ? <GridOnIcon /> : <GridOffIcon />}
                            </ControlButton>
                        </span>
                        <span>
                            <ControlButton onClick={() => toggleEnableFreeVerticalMovement()}>
                                {enableFreeVerticalMovement ? <ImportExportIcon /> : <MobiledataOffIcon />}
                            </ControlButton>
                        </span>
                        <span>
                            <ControlButton onClick={() => toggleDragWholeColumn()}>
                                {dragWholeColumn ? <SignalCellularAltIcon /> : <WaterfallChartIcon />}
                            </ControlButton>
                        </span>
                    </Box>
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
