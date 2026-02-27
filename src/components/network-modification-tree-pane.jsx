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
} from '../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import NetworkModificationTree from './network-modification-tree';
import CreateNodeMenu from './graph/menus/create-node-menu';
import {
    NotificationsUrlKeys,
    snackWithFallback,
    useNotificationsListener,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { ExportNetworkDialog } from './dialogs/export-network/export-network-dialog';
import { BUILD_STATUS } from '@gridsuite/commons-ui/components/node/constant';
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
import {
    NodeSequenceType,
    NotificationType,
    parseEventData,
    PENDING_MODIFICATION_NOTIFICATION_TYPES,
} from 'types/notification-types';
import useExportSubscription from '../hooks/use-export-subscription';
import { exportNetworkFile } from '../services/study/network.js';
import { useCopiedNodes } from 'hooks/copy-paste/use-copied-nodes';

export const NetworkModificationTreePane = ({ studyUuid, currentRootNetworkUuid }) => {
    const dispatch = useDispatch();
    const { snackError, snackWarning } = useSnackMessage();
    const [nodesToRestore, setNodesToRestore] = useState([]);

    const { selectionForCopy, copyNode, cutNode, cleanClipboard } = useCopiedNodes();
    const nodeSelectionForCopyRef = useRef();
    nodeSelectionForCopyRef.current = selectionForCopy;

    useEffect(() => {
        fetchStashedNodes(studyUuid).then((res) => {
            setNodesToRestore(res);
        });
    }, [studyUuid]);
    useEffect(() => {
        //If the tab is closed we want to invalidate the copy on all tabs because we won't able to track the node modification
        window.addEventListener('beforeunload', () => {
            cleanClipboard('copiedNodeInvalidationMsgFromStudyClosure');
        });
        //broadcastChannel doesn't change
    }, [cleanClipboard]);

    const [activeNode, setActiveNode] = useState(null);

    const treeModel = useSelector((state) => state.networkModificationTreeModel);
    const treeModelRef = useRef();
    treeModelRef.current = treeModel;

    const currentNode = useSelector((state) => state.currentTreeNode);
    const currentNodeRef = useRef();
    currentNodeRef.current = currentNode;
    const currentRootNetworkUuidRef = useRef();
    currentRootNetworkUuidRef.current = currentRootNetworkUuid;

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
                    nodeSelectionForCopyRef.current.allChildren?.map((node) => node.id).includes(nodeId)
            ),

        []
    );

    const resetNodeClipboard = useCallback(() => {
        cleanClipboard();
    }, [cleanClipboard]);

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

    const handleEvent = useCallback(
        (event) => {
            const eventData = parseEventData(event);
            if (eventData.headers) {
                if (eventData.headers.updateType === NotificationType.NODE_CREATED) {
                    fetchNetworkModificationTreeNode(studyUuid, eventData.headers.newNode, currentRootNetworkUuid).then(
                        (node) => {
                            dispatch(
                                networkModificationTreeNodeAdded(
                                    node,
                                    eventData.headers.parentNode,
                                    eventData.headers.insertMode,
                                    eventData.headers.referenceNodeUuid
                                )
                            );
                        }
                    );

                    if (isSubtreeImpacted([eventData.headers.parentNode])) {
                        resetNodeClipboard();
                    }
                    fetchStashedNodes(studyUuid).then((res) => {
                        setNodesToRestore(res);
                    });
                } else if (eventData.headers.updateType === NotificationType.SUBTREE_CREATED) {
                    if (isSubtreeImpacted([eventData.headers.parentNode])) {
                        resetNodeClipboard();
                    }
                    fetchNetworkModificationSubtree(studyUuid, eventData.headers.newNode).then((nodes) => {
                        dispatch(networkModificationHandleSubtree(nodes, eventData.headers.parentNode));
                    });
                } else if (eventData.headers.updateType === NotificationType.NODES_COLUMN_POSITION_CHANGED) {
                    reorderSubtree(eventData.headers.parentNode, JSON.parse(eventData.payload));
                } else if (eventData.headers.updateType === NotificationType.NODE_MOVED) {
                    fetchNetworkModificationTreeNode(
                        studyUuid,
                        eventData.headers.movedNode,
                        currentRootNetworkUuid
                    ).then((node) => {
                        dispatch(
                            networkModificationTreeNodeMoved(
                                node,
                                eventData.headers.parentNode,
                                eventData.headers.insertMode,
                                eventData.headers.referenceNodeUuid
                            )
                        );
                    });
                    const movedNode = eventData.headers.movedNode;
                    const parentNode = eventData.headers.parentNode;
                    if (isSubtreeImpacted([movedNode, parentNode])) {
                        resetNodeClipboard();
                    }
                } else if (eventData.headers.updateType === NotificationType.SUBTREE_MOVED) {
                    fetchNetworkModificationSubtree(studyUuid, eventData.headers.movedNode).then((nodes) => {
                        dispatch(networkModificationHandleSubtree(nodes, eventData.headers.parentNode));
                    });
                    const movedNode = eventData.headers.movedNode;
                    const parentNode = eventData.headers.parentNode;

                    if (isSubtreeImpacted([movedNode, parentNode])) {
                        resetNodeClipboard();
                    }
                } else if (eventData.headers.updateType === NotificationType.NODES_DELETED) {
                    if (
                        eventData.headers.nodes.some((nodeId) => nodeId === nodeSelectionForCopyRef.current.nodeId) ||
                        isSubtreeImpacted(eventData.headers.nodes)
                    ) {
                        resetNodeClipboard();
                    }
                    dispatch(networkModificationTreeNodesRemoved(eventData.headers.nodes));
                    fetchStashedNodes(studyUuid).then((res) => {
                        setNodesToRestore(res);
                    });
                } else if (eventData.headers.updateType === NotificationType.NODES_UPDATED) {
                    updateNodes(eventData.headers.nodes);
                    if (eventData.headers.nodes.some((nodeId) => nodeId === currentNodeRef.current?.id)) {
                        dispatch(removeNotificationByNode([currentNodeRef.current?.id]));
                    }
                    if (
                        eventData.headers.nodes.some((nodeId) => nodeId === nodeSelectionForCopyRef.current.nodeId) ||
                        isSubtreeImpacted(eventData.headers.nodes)
                    ) {
                        resetNodeClipboard();
                    }
                } else if (eventData.headers.updateType === NotificationType.NODE_EDITED) {
                    updateNodes([eventData.headers.node]);
                } else if (
                    eventData.headers.updateType === NotificationType.NODE_BUILD_STATUS_UPDATED &&
                    eventData.headers.rootNetworkUuid === currentRootNetworkUuidRef.current
                ) {
                    // Note: The actual node updates are now handled globally in study-container.jsx
                    // to ensure all workspaces open in other browser tabs (including those without tree panel) stay synchronized.
                    // Here we only handle tree-specific cleanup operations.
                    if (eventData.headers.nodes.some((nodeId) => nodeId === currentNodeRef.current?.id)) {
                        dispatch(removeNotificationByNode([currentNodeRef.current?.id]));
                        // when the current node is updated, we need to reset the logs filter
                        dispatch(resetLogsFilter());
                        dispatch(resetLogsPagination());
                    }
                    //creating, updating or deleting modifications must invalidate the node clipboard
                } else if (PENDING_MODIFICATION_NOTIFICATION_TYPES.includes(eventData.headers.updateType)) {
                    if (
                        eventData.headers.parentNode === nodeSelectionForCopyRef.current.nodeId ||
                        isSubtreeImpacted([eventData.headers.parentNode])
                    ) {
                        resetNodeClipboard();
                    }
                }
            }
        },
        [
            studyUuid,
            updateNodes,
            reorderSubtree,
            dispatch,
            currentRootNetworkUuid,
            isSubtreeImpacted,
            resetNodeClipboard,
        ]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: handleEvent,
    });

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
        copyNode(studyUuid, nodeId, CopyType.NODE_COPY);
    };

    const handleCutNode = (nodeId) => {
        if (nodeId) {
            cutNode(studyUuid, nodeId, CopyType.NODE_CUT);
        } else {
            cleanClipboard();
        }
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
                cleanClipboard(false);
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
        [studyUuid, cleanClipboard, snackError]
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
        (nodeUuid, params, exportInfos) => {
            exportNetworkFile(studyUuid, nodeUuid, currentRootNetworkUuid, params, exportInfos)
                .then((response) => {
                    subscribeExport(response, exportInfos.fileName);
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
        copyNode(studyUuid, nodeId, CopyType.SUBTREE_COPY);
    };

    const handleCutSubtree = (nodeId) => {
        if (nodeId) {
            cutNode(studyUuid, nodeId, CopyType.SUBTREE_CUT);
        } else {
            cleanClipboard();
        }
    };

    const handlePasteSubtree = useCallback(
        (referenceNodeId) => {
            if (CopyType.SUBTREE_CUT === nodeSelectionForCopyRef.current.copyType) {
                cutSubtree(studyUuid, nodeSelectionForCopyRef.current.nodeId, referenceNodeId).catch((error) => {
                    snackWithFallback(snackError, error, { headerId: 'NodeCreateError' });
                });
                //Do not wait for the response, after the first CUT / PASTE operation, we can't paste anymore
                cleanClipboard(false);
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
        [studyUuid, cleanClipboard, snackError]
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
