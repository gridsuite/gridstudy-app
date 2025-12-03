/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
    networkModificationHandleSubtree,
    networkModificationTreeNodeAdded,
    networkModificationTreeNodeMoved,
    networkModificationTreeNodesRemoved,
    networkModificationTreeNodesUpdated,
    removeNotificationByNode,
    reorderNetworkModificationTreeNodes,
    resetLogsFilter,
    resetLogsPagination,
    setNodeSelectionForCopy,
} from '../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import NetworkModificationTree from './network-modification-tree';
import CreateNodeMenu from './graph/menus/create-node-menu';
import { snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
import { ExportNetworkDialog } from './dialogs/export-network-dialog';
import { BUILD_STATUS } from './network/constants';
import {
    copySubtree,
    copyTreeNode,
    createNodeSequence,
    createTreeNode,
    cutSubtree,
    cutTreeNode,
    fetchNetworkModificationSubtree,
    fetchNetworkModificationTreeNode,
    fetchStashedNodes,
    stashSubtree,
    stashTreeNode,
} from '../services/study/tree-subtree';
import { buildNode, getUniqueNodeName, unbuildNode } from '../services/study/index';
import { RestoreNodesDialog } from './dialogs/restore-node-dialog';
import { CopyType } from './network-modification.type';
import { NodeSequenceType, NotificationType, PENDING_MODIFICATION_NOTIFICATION_TYPES } from 'types/notification-types';
import useExportSubscription from '../hooks/use-export-subscription';
import { exportNetworkFile } from '../services/study/network.js';

const noNodeSelectionForCopy = {
    sourceStudyUuid: null,
    nodeId: null,
    copyType: null,
    nodeType: null,
    allChildrenIds: null,
};

export const HTTP_MAX_NODE_BUILDS_EXCEEDED_BUSINESS_CODE = 'study.maxNodeBuildsExceeded';

export const NetworkModificationTreePane = ({ studyUuid, currentRootNetworkUuid }) => {
    const dispatch = useDispatch();
    const { snackError, snackWarning, snackInfo } = useSnackMessage();
    const isInitiatingCopyTab = useRef(false);
    const [nodesToRestore, setNodesToRestore] = useState([]);

    const dispatchNodeSelectionForCopy = useCallback(
        (sourceStudyUuid, nodeId, copyType) => {
            dispatch(
                setNodeSelectionForCopy({
                    sourceStudyUuid: sourceStudyUuid,
                    nodeId: nodeId,
                    copyType: copyType,
                })
            );
        },
        [dispatch]
    );

    const dispatchNoNodeSelectionForCopy = useCallback(
        (snackInfoMessage = null) => {
            if (nodeSelectionForCopyRef.current.nodeId && snackInfoMessage) {
                snackInfo({
                    messageId: snackInfoMessage,
                });
            }
            dispatch(setNodeSelectionForCopy(noNodeSelectionForCopy));
        },
        [dispatch, snackInfo]
    );

    const [broadcastChannel] = useState(() => {
        const broadcast = new BroadcastChannel('nodeCopyChannel');
        broadcast.onmessage = (event) => {
            console.info('message received from broadcast channel: ', event.data);
            isInitiatingCopyTab.current = false;
            if (JSON.stringify(noNodeSelectionForCopy) === JSON.stringify(event.data.nodeToCopy)) {
                dispatchNoNodeSelectionForCopy(event.data.message);
            } else {
                dispatchNodeSelectionForCopy(
                    event.data.nodeToCopy.sourceStudyUuid,
                    event.data.nodeToCopy.nodeId,
                    event.data.nodeToCopy.copyType
                );
                snackInfo({ messageId: event.data.message });
            }
        };
        return broadcast;
    });
    useEffect(() => {
        fetchStashedNodes(studyUuid).then((res) => {
            setNodesToRestore(res);
        });
    }, [studyUuid]);
    useEffect(() => {
        //If the tab is closed we want to invalidate the copy on all tabs because we won't able to track the node modification
        window.addEventListener('beforeunload', () => {
            if (true === isInitiatingCopyTab.current) {
                broadcastChannel.postMessage({
                    nodeToCopy: noNodeSelectionForCopy,
                    message: 'copiedNodeInvalidationMsgFromStudyClosure',
                });
            }
        });
        //broadcastChannel doesn't change
    }, [broadcastChannel]);

    const [activeNode, setActiveNode] = useState(null);

    const treeModel = useSelector((state) => state.networkModificationTreeModel);
    const treeModelRef = useRef();
    treeModelRef.current = treeModel;

    const currentNode = useSelector((state) => state.currentTreeNode);
    const currentNodeRef = useRef();
    currentNodeRef.current = currentNode;
    const currentRootNetworkUuidRef = useRef();
    currentRootNetworkUuidRef.current = currentRootNetworkUuid;
    const selectionForCopy = useSelector((state) => state.nodeSelectionForCopy);
    const nodeSelectionForCopyRef = useRef();
    nodeSelectionForCopyRef.current = selectionForCopy;

    const studyUpdatedForce = useSelector((state) => state.studyUpdated);

    const { subscribeExport } = useExportSubscription();

    const updateNodes = useCallback(
        (updatedNodesIds) => {
            Promise.all(
                updatedNodesIds.map((nodeId) =>
                    fetchNetworkModificationTreeNode(studyUuid, nodeId, currentRootNetworkUuid)
                )
            ).then((values) => {
                dispatch(networkModificationTreeNodesUpdated(values));
            });
        },
        [studyUuid, currentRootNetworkUuid, dispatch]
    );

    const isSubtreeImpacted = useCallback(
        (nodes) =>
            (nodeSelectionForCopyRef.current.copyType === CopyType.SUBTREE_COPY ||
                nodeSelectionForCopyRef.current.copyType === CopyType.SUBTREE_CUT) &&
            nodes.some(
                (nodeId) =>
                    nodeId === nodeSelectionForCopyRef.current.nodeId ||
                    nodeSelectionForCopyRef.current.allChildrenIds?.includes(nodeId)
            ),

        []
    );

    const resetNodeClipboard = useCallback(() => {
        dispatchNoNodeSelectionForCopy('copiedNodeInvalidationMsg');

        //only the tab that initiated the copy should update through the websocket, all the other tabs will get the info through broadcast
        if (true === isInitiatingCopyTab.current) {
            broadcastChannel.postMessage({
                nodeToCopy: noNodeSelectionForCopy,
                message: 'copiedNodeInvalidationMsgFromOtherStudy',
            });

            //we need to reset isInitiatingCopyTab here otherwise it won't in the current tab thus next unrelated pasting actions will reset other tabs clipboard
            isInitiatingCopyTab.current = false;
        }
    }, [broadcastChannel, dispatchNoNodeSelectionForCopy]);

    const reorderSubtree = useCallback(
        (parentNodeId, orderedChildrenNodeIds) => {
            // We check that the received node order from the notification is coherent with what we have locally.
            const children = new Set(treeModelRef.current.getChildren(parentNodeId).map((c) => c.id));
            let isListsEqual =
                orderedChildrenNodeIds.length === children.size &&
                orderedChildrenNodeIds.every((id) => children.has(id));
            if (!isListsEqual) {
                snackWarning({
                    messageId: 'ReorderSubtreeInvalidNotifInfo',
                });
                console.warn('Subtree order update cancelled : the ordered children list is incompatible');
                return;
            }

            // dispatch reorder
            dispatch(reorderNetworkModificationTreeNodes(parentNodeId, orderedChildrenNodeIds));
        },
        [dispatch, snackWarning]
    );

    useEffect(() => {
        if (studyUpdatedForce.eventData.headers) {
            if (studyUpdatedForce.eventData.headers.updateType === NotificationType.NODE_CREATED) {
                fetchNetworkModificationTreeNode(
                    studyUuid,
                    studyUpdatedForce.eventData.headers.newNode,
                    currentRootNetworkUuid
                ).then((node) => {
                    dispatch(
                        networkModificationTreeNodeAdded(
                            node,
                            studyUpdatedForce.eventData.headers.parentNode,
                            studyUpdatedForce.eventData.headers.insertMode,
                            studyUpdatedForce.eventData.headers.referenceNodeUuid
                        )
                    );
                });

                if (isSubtreeImpacted([studyUpdatedForce.eventData.headers.parentNode])) {
                    resetNodeClipboard();
                }
                fetchStashedNodes(studyUuid).then((res) => {
                    setNodesToRestore(res);
                });
            } else if (studyUpdatedForce.eventData.headers.updateType === NotificationType.SUBTREE_CREATED) {
                if (isSubtreeImpacted([studyUpdatedForce.eventData.headers.parentNode])) {
                    resetNodeClipboard();
                }
                fetchNetworkModificationSubtree(studyUuid, studyUpdatedForce.eventData.headers.newNode).then(
                    (nodes) => {
                        dispatch(
                            networkModificationHandleSubtree(nodes, studyUpdatedForce.eventData.headers.parentNode)
                        );
                    }
                );
            } else if (
                studyUpdatedForce.eventData.headers.updateType === NotificationType.NODES_COLUMN_POSITION_CHANGED
            ) {
                reorderSubtree(
                    studyUpdatedForce.eventData.headers.parentNode,
                    JSON.parse(studyUpdatedForce.eventData.payload)
                );
            } else if (studyUpdatedForce.eventData.headers.updateType === NotificationType.NODE_MOVED) {
                fetchNetworkModificationTreeNode(
                    studyUuid,
                    studyUpdatedForce.eventData.headers.movedNode,
                    currentRootNetworkUuid
                ).then((node) => {
                    dispatch(
                        networkModificationTreeNodeMoved(
                            node,
                            studyUpdatedForce.eventData.headers.parentNode,
                            studyUpdatedForce.eventData.headers.insertMode,
                            studyUpdatedForce.eventData.headers.referenceNodeUuid
                        )
                    );
                });
                const movedNode = studyUpdatedForce.eventData.headers.movedNode;
                const parentNode = studyUpdatedForce.eventData.headers.parentNode;
                if (isSubtreeImpacted([movedNode, parentNode])) {
                    resetNodeClipboard();
                }
            } else if (studyUpdatedForce.eventData.headers.updateType === NotificationType.SUBTREE_MOVED) {
                fetchNetworkModificationSubtree(studyUuid, studyUpdatedForce.eventData.headers.movedNode).then(
                    (nodes) => {
                        dispatch(
                            networkModificationHandleSubtree(nodes, studyUpdatedForce.eventData.headers.parentNode)
                        );
                    }
                );
                const movedNode = studyUpdatedForce.eventData.headers.movedNode;
                const parentNode = studyUpdatedForce.eventData.headers.parentNode;

                if (isSubtreeImpacted([movedNode, parentNode])) {
                    resetNodeClipboard();
                }
            } else if (studyUpdatedForce.eventData.headers.updateType === NotificationType.NODES_DELETED) {
                if (
                    studyUpdatedForce.eventData.headers.nodes.some(
                        (nodeId) => nodeId === nodeSelectionForCopyRef.current.nodeId
                    ) ||
                    isSubtreeImpacted(studyUpdatedForce.eventData.headers.nodes)
                ) {
                    resetNodeClipboard();
                }
                dispatch(networkModificationTreeNodesRemoved(studyUpdatedForce.eventData.headers.nodes));
                fetchStashedNodes(studyUuid).then((res) => {
                    setNodesToRestore(res);
                });
            } else if (studyUpdatedForce.eventData.headers.updateType === NotificationType.NODES_UPDATED) {
                updateNodes(studyUpdatedForce.eventData.headers.nodes);
                if (studyUpdatedForce.eventData.headers.nodes.some((nodeId) => nodeId === currentNodeRef.current?.id)) {
                    dispatch(removeNotificationByNode([currentNodeRef.current?.id]));
                }
                if (
                    studyUpdatedForce.eventData.headers.nodes.some(
                        (nodeId) => nodeId === nodeSelectionForCopyRef.current.nodeId
                    ) ||
                    isSubtreeImpacted(studyUpdatedForce.eventData.headers.nodes)
                ) {
                    resetNodeClipboard();
                }
            } else if (studyUpdatedForce.eventData.headers.updateType === NotificationType.NODE_EDITED) {
                updateNodes([studyUpdatedForce.eventData.headers.node]);
            } else if (
                studyUpdatedForce.eventData.headers.updateType === NotificationType.NODE_BUILD_STATUS_UPDATED &&
                studyUpdatedForce.eventData.headers.rootNetworkUuid === currentRootNetworkUuidRef.current
            ) {
                // Note: The actual node updates are now handled globally in study-container.jsx
                // to ensure all workspaces open in other browser tabs (including those without tree panel) stay synchronized.
                // Here we only handle tree-specific cleanup operations.
                if (studyUpdatedForce.eventData.headers.nodes.some((nodeId) => nodeId === currentNodeRef.current?.id)) {
                    dispatch(removeNotificationByNode([currentNodeRef.current?.id]));
                    // when the current node is updated, we need to reset the logs filter
                    dispatch(resetLogsFilter());
                    dispatch(resetLogsPagination());
                }
                //creating, updating or deleting modifications must invalidate the node clipboard
            } else if (
                PENDING_MODIFICATION_NOTIFICATION_TYPES.includes(studyUpdatedForce.eventData.headers.updateType)
            ) {
                if (
                    studyUpdatedForce.eventData.headers.parentNode === nodeSelectionForCopyRef.current.nodeId ||
                    isSubtreeImpacted([studyUpdatedForce.eventData.headers.parentNode])
                ) {
                    resetNodeClipboard();
                }
            }
        }
    }, [
        studyUuid,
        studyUpdatedForce,
        updateNodes,
        reorderSubtree,
        snackInfo,
        dispatch,
        broadcastChannel,
        currentRootNetworkUuid,
        isSubtreeImpacted,
        resetNodeClipboard,
    ]);

    const handleCreateNode = useCallback(
        (element, type, insertMode, networkModificationNodeType) => {
            getUniqueNodeName(studyUuid)
                .then((response) =>
                    createTreeNode(studyUuid, element.id, insertMode, {
                        name: response,
                        type: type,
                        localBuildStatus: BUILD_STATUS.NOT_BUILT,
                        globalBuildStatus: BUILD_STATUS.NOT_BUILT,
                        nodeType: networkModificationNodeType,
                    }).catch((error) => {
                        snackWithFallback(snackError, error, { headerId: 'NodeCreateError' });
                    })
                )
                .catch((error) => {
                    snackWithFallback(snackError, error, { headerId: 'NodeCreateError' });
                });
        },
        [studyUuid, snackError]
    );

    const handleCreateSecuritySequence = useCallback(
        (element) => {
            createNodeSequence(studyUuid, element.id, NodeSequenceType.SECURITY_SEQUENCE).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'SequenceCreateError' });
            });
        },
        [studyUuid, snackError]
    );

    const handleCopyNode = (nodeId) => {
        console.info('node with id ' + nodeId + ' from study ' + studyUuid + ' selected for copy');
        isInitiatingCopyTab.current = true;
        dispatchNodeSelectionForCopy(studyUuid, nodeId, CopyType.NODE_COPY);
        broadcastChannel.postMessage({
            nodeToCopy: {
                sourceStudyUuid: studyUuid,
                nodeId: nodeId,
                copyType: CopyType.NODE_COPY,
            },
            message: 'copiedNodeUpdateMsg',
        });
    };

    const handleCutNode = (nodeId) => {
        if (nodeId) {
            dispatchNodeSelectionForCopy(studyUuid, nodeId, CopyType.NODE_CUT);
            broadcastChannel.postMessage({
                nodeToCopy: noNodeSelectionForCopy,
                message: 'copiedNodeInvalidationMsgFromOtherStudy',
            });
        } else {
            dispatchNoNodeSelectionForCopy();
            broadcastChannel.postMessage({
                nodeToCopy: noNodeSelectionForCopy,
                message: null,
            });
        }
        isInitiatingCopyTab.current = false;
    };

    const handlePasteNode = useCallback(
        (referenceNodeId, insertMode) => {
            if (CopyType.NODE_CUT === nodeSelectionForCopyRef.current.copyType) {
                cutTreeNode(studyUuid, nodeSelectionForCopyRef.current.nodeId, referenceNodeId, insertMode).catch(
                    (error) => {
                        snackWithFallback(snackError, error, { headerId: 'NodeCreateError' });
                    }
                );
                //Do not wait for the response, after the first CUT / PASTE operation, we can't paste anymore
                dispatchNoNodeSelectionForCopy();
            } else if (CopyType.NODE_COPY === nodeSelectionForCopyRef.current.copyType) {
                copyTreeNode(
                    nodeSelectionForCopyRef.current.sourceStudyUuid,
                    studyUuid,
                    nodeSelectionForCopyRef.current.nodeId,
                    referenceNodeId,
                    insertMode
                ).catch((error) => {
                    snackWithFallback(snackError, error, { headerId: 'NodeCreateError' });
                });
                //In copy/paste, we can still paste the same node later
            }
        },
        [studyUuid, dispatchNoNodeSelectionForCopy, snackError]
    );

    const handleRemoveNode = useCallback(
        (element) => {
            stashTreeNode(studyUuid, element.id).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'NodeDeleteError' });
            });
        },
        [studyUuid, snackError]
    );

    const handleUnbuildNode = useCallback(
        (element) => {
            unbuildNode(studyUuid, element.id, currentRootNetworkUuid).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'NodeUnbuildingError' });
            });
        },
        [studyUuid, currentRootNetworkUuid, snackError]
    );

    const handleBuildNode = useCallback(
        (element) => {
            buildNode(studyUuid, element.id, currentRootNetworkUuid).catch((error) =>
                snackWithFallback(snackError, error, { headerId: 'NodeBuildingError' })
            );
        },
        [studyUuid, currentRootNetworkUuid, snackError]
    );

    const [openExportDialog, setOpenExportDialog] = useState(false);

    const handleClickExportNodeNetwork = useCallback(
        (nodeUuid, params, selectedFormat, fileName) => {
            exportNetworkFile(studyUuid, nodeUuid, currentRootNetworkUuid, params, selectedFormat, fileName)
                .then((response) => {
                    subscribeExport(response, fileName);
                })
                .catch((error) => {
                    snackWithFallback(snackError, error);
                });
            setOpenExportDialog(false);
        },
        [studyUuid, currentRootNetworkUuid, subscribeExport, snackError]
    );

    const handleExportCaseOnNode = () => {
        setOpenExportDialog(true);
    };

    const [openRestoreDialog, setOpenRestoreDialog] = useState(false);

    const handleOpenRestoreNodesDialog = () => {
        setOpenRestoreDialog(true);
    };

    const [createNodeMenu, setCreateNodeMenu] = useState({
        position: { x: -1, y: -1 },
        display: null,
    });

    const onNodeContextMenu = useCallback((event, element) => {
        setActiveNode(element);
        setCreateNodeMenu({
            position: { x: event.pageX, y: event.pageY },
            display: true,
        });
    }, []);

    const closeCreateNodeMenu = useCallback(() => {
        setCreateNodeMenu({
            display: false,
        });
    }, []);

    const handleRemoveSubtree = useCallback(
        (element) => {
            stashSubtree(studyUuid, element.id).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'NodeDeleteError' });
            });
        },
        [snackError, studyUuid]
    );

    const handleCopySubtree = (nodeId) => {
        console.info('node with id ' + nodeId + ' from study ' + studyUuid + ' selected for copy');
        isInitiatingCopyTab.current = true;
        dispatchNodeSelectionForCopy(studyUuid, nodeId, CopyType.SUBTREE_COPY);
        broadcastChannel.postMessage({
            nodeToCopy: {
                sourceStudyUuid: studyUuid,
                nodeId: nodeId,
                copyType: CopyType.SUBTREE_COPY,
            },
            message: 'copiedNodeInvalidationMsgFromOtherStudy',
        });
    };

    const handleCutSubtree = (nodeId) => {
        if (nodeId) {
            dispatchNodeSelectionForCopy(studyUuid, nodeId, CopyType.SUBTREE_CUT);
            broadcastChannel.postMessage({
                nodeToCopy: noNodeSelectionForCopy,
                message: 'copiedNodeInvalidationMsgFromOtherStudy',
            });
        } else {
            dispatchNoNodeSelectionForCopy();
            broadcastChannel.postMessage({
                nodeToCopy: noNodeSelectionForCopy,
                message: null,
            });
        }
        isInitiatingCopyTab.current = false;
    };

    const handlePasteSubtree = useCallback(
        (referenceNodeId) => {
            if (CopyType.SUBTREE_CUT === nodeSelectionForCopyRef.current.copyType) {
                cutSubtree(studyUuid, nodeSelectionForCopyRef.current.nodeId, referenceNodeId).catch((error) => {
                    snackWithFallback(snackError, error, { headerId: 'NodeCreateError' });
                });
                //Do not wait for the response, after the first CUT / PASTE operation, we can't paste anymore
                dispatch(setNodeSelectionForCopy(noNodeSelectionForCopy));
            } else if (CopyType.SUBTREE_COPY === nodeSelectionForCopyRef.current.copyType) {
                copySubtree(
                    nodeSelectionForCopyRef.current.sourceStudyUuid,
                    studyUuid,
                    nodeSelectionForCopyRef.current.nodeId,
                    referenceNodeId
                ).catch((error) => {
                    snackWithFallback(snackError, error, { headerId: 'NodeCreateError' });
                });
                //In copy/paste, we can still paste the same node later
            }
        },
        [studyUuid, dispatch, snackError]
    );

    return (
        <>
            <NetworkModificationTree onNodeContextMenu={onNodeContextMenu} studyUuid={studyUuid} />
            {createNodeMenu.display && (
                <CreateNodeMenu
                    position={createNodeMenu.position}
                    activeNode={activeNode}
                    handleBuildNode={handleBuildNode}
                    handleUnbuildNode={handleUnbuildNode}
                    handleNodeCreation={handleCreateNode}
                    handleSecuritySequenceCreation={handleCreateSecuritySequence}
                    handleNodeRemoval={handleRemoveNode}
                    handleExportCaseOnNode={handleExportCaseOnNode}
                    handleClose={closeCreateNodeMenu}
                    nodeSelectionForCopy={nodeSelectionForCopyRef.current}
                    handleCopyNode={handleCopyNode}
                    handleCutNode={handleCutNode}
                    handlePasteNode={handlePasteNode}
                    handleRemovalSubtree={handleRemoveSubtree}
                    handleCutSubtree={handleCutSubtree}
                    handleCopySubtree={handleCopySubtree}
                    handlePasteSubtree={handlePasteSubtree}
                    handleOpenRestoreNodesDialog={handleOpenRestoreNodesDialog}
                    disableRestoreNodes={nodesToRestore.length === 0}
                />
            )}
            {openExportDialog && (
                <ExportNetworkDialog
                    open={openExportDialog}
                    onClose={() => setOpenExportDialog(false)}
                    onClick={handleClickExportNodeNetwork}
                    studyUuid={studyUuid}
                    nodeUuid={activeNode?.id}
                />
            )}
            {openRestoreDialog && (
                <RestoreNodesDialog
                    open={openRestoreDialog}
                    onClose={() => setOpenRestoreDialog(false)}
                    studyUuid={studyUuid}
                    anchorNodeId={activeNode?.id}
                />
            )}
        </>
    );
};

export default NetworkModificationTreePane;

NetworkModificationTreePane.propTypes = {
    studyUuid: PropTypes.string.isRequired,
    currentRootNetworkUuid: PropTypes.string.isRequired,
};
