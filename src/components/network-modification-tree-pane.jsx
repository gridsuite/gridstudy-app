/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { invalidateClipboardIfImpacted, refreshStashedNodes } from './network-modification-tree-pane-event-handlers';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import NetworkModificationTree from './network-modification-tree';
import CreateNodeMenu from './graph/menus/create-node-menu';
import {
    NotificationsUrlKeys,
    snackWithFallback,
    useNotificationsListener,
    useSnackMessage,
    BuildStatus,
} from '@gridsuite/commons-ui';
import { ExportNetworkDialog } from './dialogs/export-network/export-network-dialog';
import {
    copySubtree,
    copyTreeNode,
    createNodeSequence,
    createTreeNode,
    cutSubtree,
    cutTreeNode,
    fetchStashedNodes,
    stashSubtree,
    stashTreeNode,
} from '../services/study/tree-subtree';
import { buildNode, getUniqueNodeName, unbuildNode } from '../services/study/index';
import { RestoreNodesDialog } from './dialogs/restore-node-dialog';
import NetworkModificationNodeDialog from './graph/menus/network-modifications/network-modification-node-dialog';
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
import { fetchNetworkModificationsToExport } from 'services/study/network-modifications';

export const NetworkModificationTreePane = ({ panelId, studyUuid, currentRootNetworkUuid }) => {
    const { snackError } = useSnackMessage();
    const [nodesToRestore, setNodesToRestore] = useState([]);

    const { selectionForCopy, copyNode, cutNode, cleanClipboard, cleanOtherTabsClipboard } = useCopiedNodes();
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
            cleanOtherTabsClipboard('copiedNodeInvalidationMsgFromStudyClosure');
        });
        //broadcastChannel doesn't change
    }, [cleanOtherTabsClipboard]);

    const [activeNode, setActiveNode] = useState(null);

    const treeModel = useSelector((state) => state.networkModificationTreeModel);
    const treeModelRef = useRef();
    treeModelRef.current = treeModel;

    const { subscribeExport } = useExportSubscription();

    const resetNodeClipboard = useCallback(() => {
        cleanClipboard();
    }, [cleanClipboard]);

    const handleClipboardNotification = useCallback(
        (event) => {
            const eventData = parseEventData(event);
            if (!eventData.headers) return;

            switch (eventData.headers.updateType) {
                case NotificationType.NODE_CREATED: {
                    invalidateClipboardIfImpacted(
                        [eventData.headers.parentNode],
                        nodeSelectionForCopyRef.current,
                        resetNodeClipboard
                    );
                    refreshStashedNodes(studyUuid, setNodesToRestore);
                    break;
                }

                case NotificationType.SUBTREE_CREATED: {
                    invalidateClipboardIfImpacted(
                        [eventData.headers.parentNode],
                        nodeSelectionForCopyRef.current,
                        resetNodeClipboard
                    );
                    break;
                }

                case NotificationType.NODE_MOVED:
                case NotificationType.SUBTREE_MOVED: {
                    invalidateClipboardIfImpacted(
                        [eventData.headers.movedNode, eventData.headers.parentNode],
                        nodeSelectionForCopyRef.current,
                        resetNodeClipboard
                    );
                    break;
                }

                case NotificationType.NODES_DELETED: {
                    invalidateClipboardIfImpacted(
                        eventData.headers.nodes,
                        nodeSelectionForCopyRef.current,
                        resetNodeClipboard
                    );
                    refreshStashedNodes(studyUuid, setNodesToRestore);
                    break;
                }

                case NotificationType.NODES_UPDATED: {
                    invalidateClipboardIfImpacted(
                        eventData.headers.nodes,
                        nodeSelectionForCopyRef.current,
                        resetNodeClipboard
                    );
                    break;
                }
                //creating, updating or deleting modifications must invalidate the node clipboard
                default: {
                    if (PENDING_MODIFICATION_NOTIFICATION_TYPES.includes(eventData.headers.updateType)) {
                        invalidateClipboardIfImpacted(
                            [eventData.headers.parentNode],
                            nodeSelectionForCopyRef.current,
                            resetNodeClipboard
                        );
                    }
                    break;
                }
            }
        },
        [studyUuid, resetNodeClipboard]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: handleClipboardNotification,
    });

    const handleCreateNode = useCallback(
        (element, type, insertMode, networkModificationNodeType) => {
            getUniqueNodeName(studyUuid)
                .then((response) =>
                    createTreeNode(studyUuid, element.id, insertMode, {
                        name: response,
                        type: type,
                        localBuildStatus: BuildStatus.NOT_BUILT,
                        globalBuildStatus: BuildStatus.NOT_BUILT,
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

    const [openRenameNodeDialog, setOpenRenameNodeDialog] = useState(false);

    const handleRenameNode = useCallback(() => {
        setOpenRenameNodeDialog(true);
    }, []);

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
    const treeNodes = useSelector((state) => state.networkModificationTreeModel?.treeNodes);

    const handleExportNodeInfos = async (node) => {
        try {
            const data = await fetchNetworkModificationsToExport(studyUuid, node.id);
            let nodeName = treeNodes?.find((n) => n.id === node.id)?.data.label;
            const exportNodeInfos = {
                nodeName: nodeName,
                modifications: data.modifications,
                unexportedModifications: data.unexported,
            };

            const blob = new Blob([JSON.stringify(exportNodeInfos, null, 2)], { type: 'application/json' });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'exportNode.json';

            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error while exporting node Infos:', error);
        }
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
            <NetworkModificationTree panelId={panelId} onNodeContextMenu={onNodeContextMenu} studyUuid={studyUuid} />
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
                    handleExportNodeInfos={handleExportNodeInfos}
                    handleClose={closeCreateNodeMenu}
                    nodeSelectionForCopy={nodeSelectionForCopyRef.current}
                    handleCopyNode={handleCopyNode}
                    handleCutNode={handleCutNode}
                    handlePasteNode={handlePasteNode}
                    handleRemovalSubtree={handleRemoveSubtree}
                    handleCutSubtree={handleCutSubtree}
                    handleCopySubtree={handleCopySubtree}
                    handlePasteSubtree={handlePasteSubtree}
                    handleRenameNode={handleRenameNode}
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
            {openRenameNodeDialog && (
                <NetworkModificationNodeDialog
                    open={openRenameNodeDialog}
                    onClose={() => setOpenRenameNodeDialog(false)}
                    titleId="editNode"
                    node={activeNode}
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
    panelId: PropTypes.string.isRequired,
    studyUuid: PropTypes.string.isRequired,
    currentRootNetworkUuid: PropTypes.string.isRequired,
};
