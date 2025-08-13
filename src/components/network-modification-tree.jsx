/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box } from '@mui/material';
import { Controls, MiniMap, ReactFlow, useEdgesState, useNodesState, useReactFlow } from '@xyflow/react';
import MapIcon from '@mui/icons-material/Map';
import CenterFocusIcon from '@mui/icons-material/CenterFocusStrong';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { reorderNetworkModificationTreeNodes, setCurrentTreeNode, setModificationsDrawerOpen } from '../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { isSameNode } from './graph/util/model-functions';
import PropTypes from 'prop-types';
import CropFreeIcon from '@mui/icons-material/CropFree';
import { nodeTypes } from './graph/util/model-constants';
import { BUILD_STATUS } from './network/constants';
import {
    getAbsolutePosition,
    getFirstAncestorWithSibling,
    getTreeNodesWithUpdatedPositions,
    nodeHeight,
    nodeWidth,
    snapGrid,
} from './graph/layout';
import TreeControlButton from './graph/util/tree-control-button';
import RootNetworkPanel from './graph/menus/root-network/root-network-panel';
import { updateNodesColumnPositions } from '../services/study/tree-subtree.ts';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { groupIdSuffix } from './graph/nodes/labeled-group-node.type';

const styles = (theme) => ({
    flexGrow: 1,
    height: '100%',
    backgroundColor: theme.reactflow.backgroundColor,
    '.react-flow__attribution a': {
        color: theme.palette.text.primary,
    },
    '.react-flow__attribution': {
        backgroundColor: theme.palette.background.paper,
    },
});

const NetworkModificationTree = ({ onNodeContextMenu, studyUuid, onTreePanelResize }) => {
    const dispatch = useDispatch();
    const { snackError } = useSnackMessage();

    const currentNode = useSelector((state) => state.currentTreeNode);

    const treeModel = useSelector((state) => state.networkModificationTreeModel);

    const [isMinimapOpen, setIsMinimapOpen] = useState(false);

    const { fitView, setCenter, getZoom } = useReactFlow();

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
            const [treeNodeWithUpdatedPosition, securityGroupNodes] = getTreeNodesWithUpdatedPositions(
                treeModel.treeNodes
            );
            setNodes([...treeNodeWithUpdatedPosition, ...securityGroupNodes]);
            setEdges([...treeModel.treeEdges]);
        }
    }, [treeModel, setNodes, setEdges]);

    useLayoutEffect(() => {
        updateNodePositions();
    }, [updateNodePositions]);

    const onNodeClick = useCallback(
        (event, node) => {
            if (node.type === 'NETWORK_MODIFICATION') {
                dispatch(setModificationsDrawerOpen());
            }
            if (!isSameNode(currentNode, node)) {
                dispatch(setCurrentTreeNode(node));
            }
        },
        [dispatch, currentNode]
    );

    const toggleMinimap = useCallback(() => {
        setIsMinimapOpen((isMinimapOpen) => !isMinimapOpen);
    }, []);

    /**
     * When dragging a node, we not only drag all of its children, but also all of it's ancestors up to
     * an ancestor which has siblings, as well as linked labeled groups.
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

            const draggedNodeDeltaX = currentChange.position.x - initialDraggedNodeXPosition;
            if (!firstAncestorWithSibling || firstAncestorWithSibling.id === currentChange.id) {
                draggedBranchIdRef.current = draggedNode.id;
            } else {
                // We calculate the movement of the dragged node and apply it to its ancestor instead.
                const initialAncestorXPosition = firstAncestorWithSibling.position.x;
                const initialAncestorYPosition = firstAncestorWithSibling.position.y;

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

            /**
             * Move labeled groups with dragged nodes
             */

            // get all moving nodes due to dragNdrop
            const movingNode = [firstAncestorWithSibling, ...treeModel.getAllChildren(firstAncestorWithSibling.id)];

            // for each of those nodes, check if there is a labeled group attached to it
            // if there is one, apply the same translation
            changes.push(
                ...movingNode
                    .map((child) => nodesMap.get(child.id + groupIdSuffix))
                    .filter((securityGroup) => !!securityGroup)
                    .map((sg) => ({
                        id: sg.id,
                        type: currentChange.type,
                        dragging: currentChange.dragging,
                        position: {
                            x: sg.position.x + draggedNodeDeltaX,
                            y: sg.position.y,
                        },
                    }))
            );
        },
        [nodes, nodesMap, treeModel]
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

    const handleFocusNode = useCallback(() => {
        if (!currentNode) {
            return;
        }

        // Get the current node from the nodes array (with updated position)
        const nodeInFlow = nodes.find((n) => n.id === currentNode.id);
        if (!nodeInFlow) {
            return;
        }

        const absolutePosition = getAbsolutePosition(nodes, nodeInFlow);

        // Center on the middle of the node
        const centerX = absolutePosition.x + nodeWidth / 2;
        const centerY = absolutePosition.y + nodeHeight / 2;

        // Use current zoom level to maintain zoom while centering
        setCenter(centerX, centerY, { zoom: getZoom() });
    }, [currentNode, nodes, setCenter, getZoom]);

    useEffect(() => {
        if (onTreePanelResize) {
            onTreePanelResize.current = handleFocusNode;
        }
    }, [onTreePanelResize, handleFocusNode]);

    return (
        <Box sx={styles}>
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
                nodeClickDistance={5} // to avoid triggering onNodeDragStop instead of onNodeClick sometimes
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
                <RootNetworkPanel />
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
    onTreePanelResize: PropTypes.func,
};
