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
import CenterGraphButton from './graph/util/center-graph-button';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { setModificationsDrawerOpen, setCurrentTreeNode, networkModificationTreeSwitchNodes } from '../redux/actions';
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
    getCurrentAbsolutePosition,
    getFirstAncestorIdWithSibling,
    getStoredAbsolutePosition,
    getTreeNodesWithUpdatedPositions,
    nodeGrid,
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

    const updateNodePositions = useCallback(
        (model) => {
            if (model && model.treeNodes?.length > 0 && model.treeEdges?.length > 0) {
                setNodes(getTreeNodesWithUpdatedPositions(model.treeNodes));
                setEdges([...model.treeEdges]);
                window.requestAnimationFrame(() => fitView());
            }
        },
        [fitView, setNodes, setEdges]
    );

    useLayoutEffect(() => {
        updateNodePositions(treeModel);
    }, [updateNodePositions, treeModel]);

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
        // NOTE : This is triggered too late to be useful for real position management.

        setIsDragging(false);
        //console.error('DRAGGED NODE ' + node.id.substring(0, 3) + ' position.x=' + node.position?.x + ', data.absolutePosition.x=' + node.data?.absolutePosition?.x+ ', data.absolutePosition.y=' + node.data?.absolutePosition?.y);
        //console.error('END OF DRAG NODE', node);
        //updateNodePositions(treeModel);
    };

    const handleNodeDrag = (event, node) => {
        // NOTE : This is triggered too late to be useful for real position management.

        setIsDragging(true);
    };

    const handleNodesChange = (changes) => {
        // When dragging a node, we not only drag all of its children, but also all of it's ancestors up to
        // an ancestor which has siblings.
        // To do so, we force the dragged node's positition to stay the same and create a new change for the
        // ancestor, with the ancestor's positions updated by the dragged node's movement.
        // Because a node's position is relative to its parent, by "not moving" the dragged node and "moving"
        // the dragged node's ancestor, we effectively move the ancestor and all its children, including the
        // dragged node.
        if (changes.length === 1 && changes[0].type === 'position') {
            const currentChange = changes[0]; // corresponds to the dragged node

            const draggedNode = nodes.find((node) => node.id === currentChange.id);
            const initialDraggedNodeXPosition = draggedNode.position.x;
            const initialDraggedNodeYPosition = draggedNode.position.y;
            const firstAncestorIdWithSibling = getFirstAncestorIdWithSibling(nodes, draggedNode.id);

            // We do not allow vertical movement, so we force the Y value of the dragged node to stays the same
            currentChange.position.y = initialDraggedNodeYPosition;

            // We test if we should move the ancestor instead of the currently moving node
            if (firstAncestorIdWithSibling && firstAncestorIdWithSibling !== currentChange.id) {
                // We find the movement of the dragged node and apply it to its ancestor instead.
                const ancestorNode = nodes.find((node) => node.id === firstAncestorIdWithSibling);
                const initialAncestorXPosition = ancestorNode.position.x;
                const initialAncestorYPosition = ancestorNode.position.y;
                const draggedNodeDeltaX = currentChange.position.x - initialDraggedNodeXPosition;

                // We move the ancestor instead of the dragged node, so we force it's X value to its initial value.
                currentChange.position.x = initialDraggedNodeXPosition;

                const newChangeForAncestor = {
                    id: firstAncestorIdWithSibling,
                    type: currentChange.type,
                    dragging: currentChange.dragging,
                    position: {
                        x: initialAncestorXPosition + draggedNodeDeltaX,
                        y: initialAncestorYPosition, // We do not allow vertical movement, so the Y value stays the same
                    },
                };
                changes.push(newChangeForAncestor);
            }

            // TODO CHARLY description de cette partie. Maybe refactoring pour qu'on s'y retrouve dans cette méga fonction
            if (changes[0].dragging !== undefined && !changes[0].dragging) {
                console.error('CHARLY DRAGGING END');
                console.error('CHARLY dragged node ' + changes[0].id.substring(0, 3));
                console.error(
                    'CHARLY dragged node absolute position (computed) ',
                    getCurrentAbsolutePosition(nodes, draggedNode)
                );
                console.error(
                    'CHARLY dragged node absolute position (stored) ',
                    getStoredAbsolutePosition(draggedNode)
                );
            }
        }
        return onNodesChange(changes);
    };
    const handleDebug = () => {
        dispatch(
            networkModificationTreeSwitchNodes(
                '0f6d31a0-8c39-4c2f-8bda-f7480f484744',
                '75e593b5-a2cf-4d11-b521-43a7ea98fdbf'
            )
        );
        updateNodePositions(treeModel);
    };
    const debug = true; // TODO REMOVE THIS
    return (
        <Box flexGrow={1}>
            {debug && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        backgroundColor: 'red',
                        color: 'white',
                        display: 'block',
                    }}
                    onClick={handleDebug}
                >
                    CLICK
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
                {isDragging && (
                    <Background
                        id="gridBackground"
                        color={'#0ca78933'}
                        gap={nodeGrid}
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
