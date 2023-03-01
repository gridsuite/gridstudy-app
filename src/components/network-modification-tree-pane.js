/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    createTreeNode,
    deleteTreeNode,
    fetchNetworkModificationTreeNode,
    getUniqueNodeName,
    buildNode,
    copyTreeNode,
    cutTreeNode,
    connectNotificationsWebsocket,
} from '../utils/rest-api';
import {
    networkModificationTreeNodeAdded,
    networkModificationTreeNodeMoved,
    networkModificationTreeNodesRemoved,
    networkModificationTreeNodesUpdated,
    removeNotificationByNode,
    setSelectedNodeForCopy,
    STUDY_DISPLAY_MODE,
} from '../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import NetworkModificationTree from './network-modification-tree';
import { StudyDrawer } from './study-drawer';
import NodeEditor from './graph/menus/node-editor';
import CreateNodeMenu from './graph/menus/create-node-menu';
import { useIntlRef, useSnackMessage } from '@gridsuite/commons-ui';
import { useStore } from 'react-flow-renderer';
import makeStyles from '@mui/styles/makeStyles';
import { DRAWER_NODE_EDITOR_WIDTH } from '../utils/UIconstants';
import ExportDialog from './dialogs/export-dialog';

const useStyles = makeStyles((theme) => ({
    nodeEditor: {
        width: DRAWER_NODE_EDITOR_WIDTH,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        // zIndex set to be below the loader with overlay
        // and above the network explorer, for mouse events on network modification tree
        // to be taken into account correctly
        zIndex: 51,
    },
    nodeEditorShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        pointerEvents: 'none',
        marginLeft: -DRAWER_NODE_EDITOR_WIDTH,
    },
    container: { width: '100%', height: '100%' },
}));

// We need the previous display and width to compute the transformation we will apply to the tree in order to keep the same focus.
// But the MAP display is neutral for this computation: We need to know what was the last HYBRID or TREE display and its width.
const usePreviousTreeDisplay = (display, width) => {
    const ref = useRef();
    useEffect(() => {
        if (display !== STUDY_DISPLAY_MODE.MAP) {
            ref.current = { display, width };
        }
    }, [display, width]);
    return ref.current;
};

export const CopyType = {
    COPY: 'COPY',
    CUT: 'CUT',
};

const noSelectionForCopy = {
    sourceStudyId: null,
    nodeId: null,
    copyType: null,
};

export const NetworkModificationTreePane = ({
    studyUuid,
    studyMapTreeDisplay,
}) => {
    const dispatch = useDispatch();
    const intlRef = useIntlRef();
    const { snackError, snackInfo } = useSnackMessage();
    const classes = useStyles();
    const DownloadIframe = 'downloadIframe';
    const [notifListenedStudyId, setNotifListenedStudyId] = useState(null);
    const [ws, setWs] = useState(null);
    const broadcastChannel = useSelector((state) => state.broadcastChannel);
    const dispatchSelectedNodeForCopy = useCallback(
        (sourceStudyId, nodeId, copyType) => {
            dispatch(
                setSelectedNodeForCopy({
                    sourceStudyId: sourceStudyId,
                    nodeId: nodeId,
                    copyType: copyType,
                })
            );
        },
        [dispatch]
    );

    useEffect(() => {
        //initialise channel onmessage
        if (typeof broadcastChannel.onmessage !== 'function') {
            broadcastChannel.onmessage = (event) => {
                console.info('message received from broadcast channel');
                console.info(event.data);
                setNotifListenedStudyId(event.data.sourceStudyId);
                dispatchSelectedNodeForCopy(
                    event.data.sourceStudyId,
                    event.data.nodeId,
                    CopyType.COPY
                );
            };
        }
    });

    useEffect(() => {
        //The first time we initialise the websocket
        if (ws === null && notifListenedStudyId !== null) {
            const initWs = connectNotificationsWebsocket(notifListenedStudyId);
            initWs.onmessage = function (event) {
                //If the study we are on is the one that updated the node we don't need to handle it with this ws as it's already handled in a useEffect
                if (event.data.sourceStudyId !== studyUuid) {
                    let eventData = JSON.parse(event.data);
                    if (
                        eventData.headers &&
                        eventData.headers.updateType === 'nodeUpdated'
                    ) {
                        if (
                            eventData.headers.nodes.some(
                                (nodeId) =>
                                    nodeId ===
                                    selectedNodeForCopyRef.current.nodeId
                            )
                        ) {
                            dispatch(
                                setSelectedNodeForCopy(noSelectionForCopy)
                            );
                            snackInfo({
                                messageId: 'CopiedNodeInvalidationMessage',
                            });
                        }
                    }
                    if (
                        eventData.headers &&
                        eventData.headers.updateType === 'nodeDeleted'
                    ) {
                        if (
                            eventData.headers.nodes.some(
                                (nodeId) =>
                                    nodeId ===
                                    selectedNodeForCopyRef.current.nodeId
                            )
                        ) {
                            dispatch(
                                setSelectedNodeForCopy(noSelectionForCopy)
                            );
                            snackInfo({
                                messageId: 'CopiedNodeInvalidationMessage',
                            });
                        }
                    }
                }
            };
            initWs.onerror = function (event) {
                console.error('Unexpected Notification WebSocket error', event);
            };
            setWs(initWs);
        }
    }, [studyUuid, notifListenedStudyId, ws, dispatch, snackInfo]);

    const [activeNode, setActiveNode] = useState(null);

    const currentNode = useSelector((state) => state.currentTreeNode);
    const currentNodeRef = useRef();
    currentNodeRef.current = currentNode;

    const selectedNodeForCopy = useSelector(
        (state) => state.selectedNodeForCopy
    );
    const selectedNodeForCopyRef = useRef();
    selectedNodeForCopyRef.current = selectedNodeForCopy;

    const isModificationsDrawerOpen = useSelector(
        (state) => state.isModificationsDrawerOpen
    );
    const studyUpdatedForce = useSelector((state) => state.studyUpdated);

    const width = useStore((state) => state.width);
    const prevTreeDisplay = usePreviousTreeDisplay(studyMapTreeDisplay, width);

    const updateNodes = useCallback(
        (updatedNodesIds) => {
            Promise.all(
                updatedNodesIds.map((nodeId) =>
                    fetchNetworkModificationTreeNode(studyUuid, nodeId)
                )
            ).then((values) => {
                dispatch(networkModificationTreeNodesUpdated(values));
            });
        },
        [studyUuid, dispatch]
    );

    useEffect(() => {
        if (ws != null && notifListenedStudyId !== null) {
            const filters = {
                studyUuid: notifListenedStudyId,
            };
            ws.send(JSON.stringify(filters));
        }
    }, [notifListenedStudyId, ws]);

    useEffect(() => {
        if (studyUpdatedForce.eventData.headers) {
            if (
                studyUpdatedForce.eventData.headers['updateType'] ===
                'nodeCreated'
            ) {
                fetchNetworkModificationTreeNode(
                    studyUuid,
                    studyUpdatedForce.eventData.headers['newNode']
                ).then((node) => {
                    dispatch(
                        networkModificationTreeNodeAdded(
                            node,
                            studyUpdatedForce.eventData.headers['parentNode'],
                            studyUpdatedForce.eventData.headers['insertMode']
                        )
                    );
                });
            } else if (
                studyUpdatedForce.eventData.headers['updateType'] ===
                'nodeMoved'
            ) {
                fetchNetworkModificationTreeNode(
                    studyUuid,
                    studyUpdatedForce.eventData.headers['movedNode']
                ).then((node) => {
                    dispatch(
                        networkModificationTreeNodeMoved(
                            node,
                            studyUpdatedForce.eventData.headers['parentNode'],
                            studyUpdatedForce.eventData.headers['insertMode']
                        )
                    );
                });
            } else if (
                studyUpdatedForce.eventData.headers['updateType'] ===
                'nodeDeleted'
            ) {
                dispatch(
                    networkModificationTreeNodesRemoved(
                        studyUpdatedForce.eventData.headers['nodes']
                    )
                );
            } else if (
                studyUpdatedForce.eventData.headers['updateType'] ===
                'nodeUpdated'
            ) {
                updateNodes(studyUpdatedForce.eventData.headers['nodes']);
                if (
                    studyUpdatedForce.eventData.headers['nodes'].some(
                        (nodeId) => nodeId === currentNodeRef.current?.id
                    )
                ) {
                    dispatch(
                        removeNotificationByNode([currentNodeRef.current?.id])
                    );
                }
                if (
                    studyUpdatedForce.eventData.headers['nodes'].some(
                        (nodeId) =>
                            nodeId === selectedNodeForCopyRef.current.nodeId
                    )
                ) {
                    dispatch(setSelectedNodeForCopy(noSelectionForCopy));
                    snackInfo({
                        messageId: 'CopiedNodeInvalidationMessage',
                    });
                }
            }
        }
    }, [studyUuid, studyUpdatedForce, updateNodes, dispatch, snackInfo]);

    const handleCreateNode = useCallback(
        (element, type, insertMode) => {
            getUniqueNodeName(studyUuid)
                .then((response) =>
                    createTreeNode(studyUuid, element.id, insertMode, {
                        name: response,
                        type: type,
                        buildStatus: 'NOT_BUILT',
                    }).catch((error) => {
                        snackError({
                            messageTxt: error.message,
                            headerId: 'NodeCreateError',
                        });
                    })
                )
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'NodeCreateError',
                    });
                });
        },
        [studyUuid, snackError]
    );

    const handleCopyNode = (nodeId) => {
        console.info(
            'node with id ' +
                nodeId +
                ' from study ' +
                studyUuid +
                ' selected for copy'
        );
        dispatchSelectedNodeForCopy(studyUuid, nodeId, CopyType.COPY);
        broadcastChannel.postMessage({
            sourceStudyId: studyUuid,
            nodeId: nodeId,
        });
    };

    const handleCutNode = (nodeId) => {
        nodeId
            ? dispatchSelectedNodeForCopy(nodeId, CopyType.CUT)
            : dispatch(setSelectedNodeForCopy(noSelectionForCopy));
    };

    const handlePasteNode = useCallback(
        (referenceNodeId, insertMode) => {
            if (CopyType.CUT === selectedNodeForCopyRef.current.copyType) {
                cutTreeNode(
                    studyUuid,
                    selectedNodeForCopyRef.current.nodeId,
                    referenceNodeId,
                    insertMode
                ).catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'NodeCreateError',
                    });
                });
                //Do not wait for the response, after the first CUT / PASTE operation, we can't paste anymore
                dispatch(setSelectedNodeForCopy(noSelectionForCopy));
            } else {
                copyTreeNode(
                    selectedNodeForCopyRef.current.sourceStudyId,
                    studyUuid,
                    selectedNodeForCopyRef.current.nodeId,
                    referenceNodeId,
                    insertMode
                ).catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'NodeCreateError',
                    });
                });
                //In copy/paste, we can still paste the same node later
            }
        },
        [studyUuid, snackError, dispatch]
    );

    const handleRemoveNode = useCallback(
        (element) => {
            deleteTreeNode(studyUuid, element.id).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'NodeDeleteError',
                });
            });
            if (element.id === selectedNodeForCopyRef.current.nodeId) {
                dispatch(setSelectedNodeForCopy(noSelectionForCopy));
            }
        },
        [studyUuid, snackError, dispatch]
    );

    const handleBuildNode = useCallback(
        (element) => {
            buildNode(studyUuid, element.id).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'NodeBuildingError',
                });
            });
        },
        [studyUuid, snackError]
    );

    const [openExportDialog, setOpenExportDialog] = useState(false);

    const handleClickExportStudy = (url) => {
        window.open(url, DownloadIframe);
        setOpenExportDialog(false);
    };

    const handleExportCaseOnNode = () => {
        setOpenExportDialog(true);
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

    return (
        <>
            <Box
                className={classes.container}
                display="flex"
                flexDirection="row"
            >
                <NetworkModificationTree
                    onNodeContextMenu={onNodeContextMenu}
                    studyUuid={studyUuid}
                    studyMapTreeDisplay={studyMapTreeDisplay}
                    isModificationsDrawerOpen={isModificationsDrawerOpen}
                    prevTreeDisplay={prevTreeDisplay}
                />

                <StudyDrawer
                    open={isModificationsDrawerOpen}
                    drawerClassName={classes.nodeEditor}
                    drawerShiftClassName={classes.nodeEditorShift}
                    anchor={
                        prevTreeDisplay === STUDY_DISPLAY_MODE.TREE
                            ? 'right'
                            : 'left'
                    }
                >
                    <NodeEditor />
                </StudyDrawer>
            </Box>
            {createNodeMenu.display && (
                <CreateNodeMenu
                    position={createNodeMenu.position}
                    activeNode={activeNode}
                    handleBuildNode={handleBuildNode}
                    handleNodeCreation={handleCreateNode}
                    handleNodeRemoval={handleRemoveNode}
                    handleExportCaseOnNode={handleExportCaseOnNode}
                    handleClose={closeCreateNodeMenu}
                    selectedNodeForCopy={selectedNodeForCopyRef.current}
                    handleCopyNode={handleCopyNode}
                    handleCutNode={handleCutNode}
                    handlePasteNode={handlePasteNode}
                />
            )}
            {openExportDialog && (
                <ExportDialog
                    open={openExportDialog}
                    onClose={() => setOpenExportDialog(false)}
                    onClick={handleClickExportStudy}
                    studyUuid={studyUuid}
                    nodeUuid={activeNode.id}
                    title={intlRef.current.formatMessage({
                        id: 'exportNetwork',
                    })}
                />
            )}
            <iframe
                id={DownloadIframe}
                name={DownloadIframe}
                title={DownloadIframe}
                style={{ display: 'none' }}
            />
        </>
    );
};

export default NetworkModificationTreePane;

NetworkModificationTreePane.propTypes = {
    studyUuid: PropTypes.string.isRequired,
    studyMapTreeDisplay: PropTypes.string.isRequired,
};
