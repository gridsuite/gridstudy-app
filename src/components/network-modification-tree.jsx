/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box } from '@mui/material';
import { Controls, MiniMap, ReactFlow, useEdgesState, useNodesState, useReactFlow, useStore } from '@xyflow/react';
import MapIcon from '@mui/icons-material/Map';
import CenterFocusIcon from '@mui/icons-material/CenterFocusStrong';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { reorderNetworkModificationTreeNodes, setCurrentTreeNode, setModificationsDrawerOpen } from '../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { isSameNode } from './graph/util/model-functions';
import { DRAWER_NODE_EDITOR_WIDTH } from '../utils/UIconstants';
import PropTypes from 'prop-types';
import CropFreeIcon from '@mui/icons-material/CropFree';
import { nodeTypes } from './graph/util/model-constants';
import { BUILD_STATUS } from './network/constants';
import { StudyDisplayMode } from './network-modification.type';
import {
    getAbsolutePosition,
    getFirstAncestorWithSibling,
    getTreeNodesWithUpdatedPositions,
    nodeHeight,
    nodeWidth,
    snapGrid,
} from './graph/layout';
import TreeControlButton from './graph/util/tree-control-button';
import RootNetworkPanel from './root-network-panel';
import { updateNodesColumnPositions } from '../services/study/tree-subtree.ts';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { PARAM_DEVELOPER_MODE } from 'utils/config-params';
import { useParameterState } from './dialogs/parameters/use-parameters-state';

const NetworkModificationTree = ({
    studyMapTreeDisplay,
    prevTreeDisplay,
    onNodeContextMenu,
    studyUuid,
    isStudyDrawerOpen,
}) => {
    const dispatch = useDispatch();
    const { snackError } = useSnackMessage();

    const currentNode = useSelector((state) => state.currentTreeNode);

    const treeModel = useSelector((state) => state.networkModificationTreeModel);

    const [isMinimapOpen, setIsMinimapOpen] = useState(false);

    const { setViewport, fitView, setCenter, getZoom } = useReactFlow();
    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    const draggedBranchIdRef = useRef(null);

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

    const nodesMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

    const updateNodePositions = useCallback(() => {
        if (treeModel && treeModel.treeNodes?.length > 0) {
            setNodes(getTreeNodesWithUpdatedPositions(treeModel.treeNodes));
            setEdges([...treeModel.treeEdges]);
        }
    }, [treeModel, setNodes, setEdges]);

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

    /**
     * When dragging a node, we not only drag all of its children, but also all of it's ancestors up to
     * an ancestor which has siblings.
     * To do so, we force the dragged node's positition to stay the same and create a new change for the
     * ancestor, with the ancestor's positions updated by the dragged node's movement.
     * Because a node's position is relative to its parent, by "not moving" the dragged node and "moving"
     * the dragged node's ancestor, we effectively move the ancestor and all its children, including the
     * dragged node.
     *
     * @param changes the original changes provided by ReactFlow. These changes will be modified by reference.
     * @return the node that will move, either the original dragged node, or its ancestor.
     */
    const handleNodeDragging = useCallback(
        (changes) => {
            const currentChange = changes[0]; // corresponds to a list of changes affecting the dragged node

            const draggedNode = nodesMap.get(currentChange.id);
            const initialDraggedNodeXPosition = draggedNode.position.x;

            // We do not allow vertical movement, so we force the Y value of the dragged node to stays the same
            currentChange.position.y = draggedNode.position.y;

            // We test if the dragged node is the start of a branch. If this is not the case, we should find
            // the start of the branch and move this ancestor node instead.
            // If we already put a node ID in the ref, we use it and skip the ancestor testing part.
            const firstAncestorWithSibling = draggedBranchIdRef.current
                ? nodesMap.get(draggedBranchIdRef.current)
                : getFirstAncestorWithSibling(nodes, nodesMap, draggedNode);

            if (!firstAncestorWithSibling || firstAncestorWithSibling.id === currentChange.id) {
                draggedBranchIdRef.current = draggedNode.id;
            } else {
                // We calculate the movement of the dragged node and apply it to its ancestor instead.
                const initialAncestorXPosition = firstAncestorWithSibling.position.x;
                const initialAncestorYPosition = firstAncestorWithSibling.position.y;
                const draggedNodeDeltaX = currentChange.position.x - initialDraggedNodeXPosition;

                // We will move the ancestor instead of the dragged node, so we force the dragged node's X value
                // to its initial value.
                currentChange.position.x = initialDraggedNodeXPosition;

                const newChangeForAncestor = {
                    id: firstAncestorWithSibling.id,
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

                draggedBranchIdRef.current = firstAncestorWithSibling.id;
            }
        },
        [nodes, nodesMap]
    );

    /**
     * Saves the new order of parentNode's children in the backend
     */
    const saveChildrenColumnPositions = useCallback(
        (parentNodeId) => {
            const children = treeModel.getChildren(parentNodeId).map((node, index) => ({
                id: node.id,
                type: node.type,
                columnPosition: index,
            }));
            updateNodesColumnPositions(studyUuid, parentNodeId, children).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'NodeUpdateColumnPositions',
                });
            });
        },
        [studyUuid, treeModel, snackError]
    );

    /**
     * When the user stops dragging a node and releases it to its new position, we check if we need
     * to reorder the nodes
     */
    const handleEndNodeDragging = useCallback(() => {
        let movedNode = nodesMap.get(draggedBranchIdRef.current);
        if (movedNode?.parentId) {
            // In the treeModel.treeNodes variable we can find the positions of the nodes before the user started
            // dragging something, whereas in the movedNode variable (which comes from the nodes variable), we can
            // find the position of the node which has been updated by ReactFlow's onNodesChanges function as the
            // user kept on dragging the node.
            // We want the new positions post-drag, so we get the original positions, remove the moved node from them,
            // and add the updated movedNode to the list.

            const childrenWithUpdatedPositions = treeModel
                .getChildren(movedNode.parentId)
                .filter((n) => n.id !== movedNode.id);
            childrenWithUpdatedPositions.push(movedNode);
            // We want the ids in the correct order, so we sort by the nodes' X position.
            childrenWithUpdatedPositions.sort((a, b) => a.position.x - b.position.x);
            const orderedChildrenIds = childrenWithUpdatedPositions.map((node) => node.id);

            if (treeModel.needReorder(movedNode.parentId, orderedChildrenIds)) {
                dispatch(reorderNetworkModificationTreeNodes(movedNode.parentId, orderedChildrenIds));
            } else {
                draggedBranchIdRef.current = null;
            }
        }
    }, [nodesMap, treeModel, dispatch]);

    // Note : this function triggers far too late to be usable for node positioning computation like we do in the handleNodesChange function.
    const handlePostNodeDragging = useCallback(() => {
        if (draggedBranchIdRef.current) {
            let movedNode = nodesMap.get(draggedBranchIdRef.current);
            saveChildrenColumnPositions(movedNode.parentId);
        } else {
            // Need re layout because tree model has not been changed
            updateNodePositions();
        }
        draggedBranchIdRef.current = null;
    }, [nodesMap, saveChildrenColumnPositions, updateNodePositions]);

    const handleNodesChange = useCallback(
        (changes) => {
            // Is the user dragging a node ?
            if (changes.length === 1 && changes[0].dragging !== undefined) {
                if (changes[0].dragging) {
                    handleNodeDragging(changes);
                } else {
                    handleEndNodeDragging();
                }
            }
            onNodesChange(changes);
        },
        [handleNodeDragging, handleEndNodeDragging, onNodesChange]
    );

    const handleFocusNode = () => {
        const currentNodeAbsolutePosition = getAbsolutePosition(nodes, currentNode);
        const x = currentNodeAbsolutePosition.x + nodeWidth * 0.5;
        const y = currentNodeAbsolutePosition.y + nodeHeight * 0.5;
        setCenter(x, y, { zoom: getZoom() });
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
                onNodeDragStop={handlePostNodeDragging}
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
                    <TreeControlButton titleId="DisplayTheWholeTree" onClick={fitView}>
                        <CropFreeIcon />
                    </TreeControlButton>
                    <TreeControlButton titleId="CenterSelectedNode" onClick={handleFocusNode}>
                        <CenterFocusIcon />
                    </TreeControlButton>
                    <TreeControlButton
                        titleId={isMinimapOpen ? 'HideMinimap' : 'DisplayMinimap'}
                        onClick={toggleMinimap}
                    >
                        <MapIcon />
                    </TreeControlButton>
                </Controls>
                {isMinimapOpen && <MiniMap nodeColor={nodeColor} pannable zoomable zoomStep={1} nodeStrokeWidth={0} />}
                {enableDeveloperMode && <RootNetworkPanel />}
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
