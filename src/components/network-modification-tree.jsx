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
import { getLayoutedElements } from './graph/layout';

const snapGrid = [230, 110]; // [Width, Height]

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

    function getPosition(placementArray, id) {
        for (let row = 0; row < placementArray.length; row++) {
            for (let column = 0; column < placementArray[row].length; column++) {
                if (placementArray[row][column] === id) {
                    return { row: row, column: column };
                }
            }
        }
        return { row: -1, column: -1 };
    }

    function addValueAtPosition(placementArray, row, column, value) {
        while (placementArray.length <= row) {
            placementArray.push(['']);
        }
        while (placementArray[row].length <= column) {
            placementArray[row].push('');
        }
        placementArray[row][column] = value;
    }

    function isSpaceEmpty(placementArray, row, column) {
        if (placementArray.length <= row) {
            return true;
        }
        if (placementArray[row].length <= column) {
            return true;
        }
        if (placementArray[row][column]?.length > 0) {
            return false;
        }
        return true;
    }

    // Node position initialization
    useLayoutEffect(() => {
        if (treeModel) {
            const newPlacements = [];
            let currentMaxColumn = 0;

            treeModel.treeNodes.forEach((node) => {
                if (!node.data?.parentNodeUuid) {
                    // ORIGIN/PARENT NODE
                    addValueAtPosition(newPlacements, 0, 0, node.id);
                } else {
                    // CHILDREN NODE
                    const parentPosition = getPosition(newPlacements, node.data.parentNodeUuid);
                    // Check if there is an empty space below the parent
                    const tryRow = parentPosition.row + 1;
                    const tryColumn = parentPosition.column;
                    if (isSpaceEmpty(newPlacements, tryRow, tryColumn)) {
                        addValueAtPosition(newPlacements, tryRow, tryColumn, node.id);
                    } else {
                        // We check if there is an empty space on the right of the used space
                        do {
                            currentMaxColumn++;
                        } while (!isSpaceEmpty(newPlacements, tryRow, currentMaxColumn));
                        addValueAtPosition(newPlacements, tryRow, currentMaxColumn, node.id);
                    }
                }
            });
            setNodePlacements([...newPlacements]);
        }
    }, [treeModel]);

    const updateNodePositions = useCallback(() => {
        if (treeModel) {
            const newNodes = [...treeModel.treeNodes];
            newNodes.forEach((node) => {
                const storedPosition = getPosition(nodePlacements, node.id);
                if (storedPosition !== null) {
                    node.position = {
                        x: storedPosition.column * snapGrid[0],
                        y: storedPosition.row * snapGrid[1],
                    };
                }
            });
            setNodes([...newNodes]);
            setEdges([...treeModel.treeEdges]);
            window.requestAnimationFrame(() => fitView());
        }
    }, [treeModel, nodePlacements]);

    useLayoutEffect(() => {
        updateNodePositions();
    }, [treeModel, nodePlacements]);

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
    const { setViewport, fitView, screenToFlowPosition } = useReactFlow();

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
    }, [isStudyDrawerOpen]);

    return (
        <Box flexGrow={1}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                snapToGrid
                snapGrid={snapGrid}
                onNodeContextMenu={onNodeContextMenu}
                onNodeClick={onNodeClick}
                elementsSelectable
                selectNodesOnDrag={false}
                nodeTypes={nodeTypes}
                minZoom={0.2} // Lower value allows for more zoom out
                //maxZoom={2} // Higher value allows for more zoom in
                nodesDraggable={true}
            >
                {isGridVisible && (
                    <Background
                        color={'#0ca78933'}
                        gap={snapGrid}
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
