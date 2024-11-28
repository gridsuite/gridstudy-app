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
} from '@xyflow/react';
import MapIcon from '@mui/icons-material/Map';
import CenterFocusIcon from '@mui/icons-material/CenterFocusStrong';
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
    findClosestSiblingInRange,
    getAbsolutePosition,
    getFirstAncestorIdWithSibling,
    getTreeNodesWithUpdatedPositions,
    nodeHeight,
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

    const { setViewport, fitView, setCenter, getZoom } = useReactFlow();

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
            if (model && model.treeNodes?.length > 0) {
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
    }, [isStudyDrawerOpen]);

    const handleNodesChange = (changes) => {
        // When dragging a node, we not only drag all of its children, but also all of it's ancestors up to
        // an ancestor which has siblings.
        // To do so, we force the dragged node's positition to stay the same and create a new change for the
        // ancestor, with the ancestor's positions updated by the dragged node's movement.
        // Because a node's position is relative to its parent, by "not moving" the dragged node and "moving"
        // the dragged node's ancestor, we effectively move the ancestor and all its children, including the
        // dragged node.
        if (changes.length === 1 && changes[0].type === 'position') {
            let movedNode; // Will be initialized either with the dragged node or its ancestor

            const currentChange = changes[0]; // corresponds to a list of changes affecting the dragged node
            const draggedNode = nodes.find((node) => node.id === currentChange.id);
            const initialDraggedNodeXPosition = draggedNode.position.x;
            const initialDraggedNodeYPosition = draggedNode.position.y;

            // We do not allow vertical movement, so we force the Y value of the dragged node to stays the same
            currentChange.position.y = initialDraggedNodeYPosition;

            // We test if the dragged node is the start of a branch. If this is not the case, we should find
            // the start of the branch and move this ancestor node instead.
            const firstAncestorIdWithSibling = getFirstAncestorIdWithSibling(nodes, draggedNode.id);
            if (firstAncestorIdWithSibling && firstAncestorIdWithSibling !== currentChange.id) {
                // We calculate the movement of the dragged node and apply it to its ancestor instead.
                const ancestorNode = nodes.find((node) => node.id === firstAncestorIdWithSibling);
                const initialAncestorXPosition = ancestorNode.position.x;
                const initialAncestorYPosition = ancestorNode.position.y;
                const draggedNodeDeltaX = currentChange.position.x - initialDraggedNodeXPosition;

                // We will move the ancestor instead of the dragged node, so we force the dragged node's X value
                // to its initial value.
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
                // After reverting the position changes of the dragged node, we add our custom change to the list, to be
                // processed by ReactFlow.
                changes.push(newChangeForAncestor);

                movedNode = ancestorNode;
            } else {
                movedNode = draggedNode;
            }

            // We test if the user stopped dragging the node. If yes, then we apply the new nodes placements.
            if (changes[0].dragging !== undefined && !changes[0].dragging) {
                // In the treeModel.treeNodes variable we can find the positions of the nodes before they are updated by
                // the end of drag handling (that is : what is happening right here, in this "if" clause), whereas in
                // the movedNode variable (which comes from the nodes variable), we can find the position of the node
                // which has been updated by ReactFlow's onNodesChanges function as the user kept on dragging the node.
                const movedNodeXPositionBeforeDrag = treeModel.treeNodes.find((n) => n.id === movedNode.id).position.x;
                const movedNodeXPositionAfterDrag = movedNode.position.x;

                const nodeToSwitchWith = findClosestSiblingInRange(
                    nodes,
                    movedNode,
                    movedNodeXPositionBeforeDrag,
                    movedNodeXPositionAfterDrag
                );
                if (nodeToSwitchWith) {
                    dispatch(networkModificationTreeSwitchNodes(movedNode.id, nodeToSwitchWith.id));
                }
            }
        }
        onNodesChange(changes);
    };

    const handleNodeDragStop = () => {
        // Note : this function triggers far too late to be usable for node positioning computation like we do in the handleNodesChange function.
        updateNodePositions(treeModel); // This is needed to "clean" the positions of nodes that were dragged without triggering a branch switch.
    };

    const handleFocusNode = () => {
        const currentNodeAbsolutePosition = getAbsolutePosition(nodes, currentNode);
        const x = currentNodeAbsolutePosition.x + nodeWidth * 0.5;
        const y = currentNodeAbsolutePosition.y + nodeHeight * 0.5;
        setCenter(x, y, { zoom: getZoom() });
    };

    const DisplayWholeTreeButton = () => {
        return (
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
        );
    };

    const CenterSelectedNodeButton = () => {
        return (
            <Tooltip
                placement="left"
                title={intl.formatMessage({ id: 'CenterSelectedNode' })}
                arrow
                enterDelay={TOOLTIP_DELAY}
                enterNextDelay={TOOLTIP_DELAY}
            >
                <span>
                    <ControlButton
                        onClick={() => {
                            handleFocusNode();
                        }}
                    >
                        <CenterFocusIcon />
                    </ControlButton>
                </span>
            </Tooltip>
        );
    };

    const ToggleMinimapButton = () => {
        return (
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
        );
    };

    return (
        <Box flexGrow={1}>
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
                onNodeDragStop={handleNodeDragStop}
                disableKeyboardA11y
                deleteKeyCode={null}
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
                <Controls
                    style={{ margin: '10px' }} // This component uses "style" instead of "sx"
                    position="top-right"
                    showZoom={false}
                    showInteractive={false}
                    showFitView={false}
                >
                    <DisplayWholeTreeButton />
                    <CenterSelectedNodeButton />
                    <ToggleMinimapButton />
                </Controls>
                {isMinimapOpen && <MiniMap nodeColor={nodeColor} pannable zoomable zoomStep={1} nodeStrokeWidth={0} />}
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
