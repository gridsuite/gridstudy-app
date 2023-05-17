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
    deleteSubtree,
    fetchNetworkModificationSubtree,
    cutSubtree,
    copySubtree,
} from '../utils/rest-api';
import {
    networkModificationTreeNodeAdded,
    networkModificationTreeNodeMoved,
    networkModificationTreeNodesRemoved,
    networkModificationTreeNodesUpdated,
    removeNotificationByNode,
    STUDY_DISPLAY_MODE,
    networkModificationHandleSubtree,
    setSelectionForCopy,
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
import { BUILD_STATUS, UPDATE_TYPE } from './network/constants';

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
    NODE_COPY: 'NODE_COPY',
    NODE_CUT: 'NODE_CUT',
    SUBTREE_COPY: 'SUBTREE_COPY',
    SUBTREE_CUT: 'SUBTREE_CUT',
};

const noSelectionForCopy = {
    sourceStudyId: null,
    nodeId: null,
    copyType: null,
    allChilddrenIds: null,
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
    const isInitiatingCopyTab = useRef(false);

    const dispatchSelectionForCopy = useCallback(
        (sourceStudyId, nodeId, copyType) => {
            dispatch(
                setSelectionForCopy({
                    sourceStudyId: sourceStudyId,
                    nodeId: nodeId,
                    copyType: copyType,
                })
            );
        },
        [dispatch]
    );

    const [broadcastChannel] = useState(() => {
        const broadcast = new BroadcastChannel('nodeCopyChannel');
        broadcast.onmessage = (event) => {
            console.info('message received from broadcast channel');
            console.info(event.data);
            isInitiatingCopyTab.current = false;
            if (
                JSON.stringify(noSelectionForCopy) ===
                JSON.stringify(event.data)
            ) {
                dispatch(setSelectionForCopy(noSelectionForCopy));
                snackInfo({
                    messageId: 'CopiedNodeInvalidationMessage',
                });
            } else {
                dispatchSelectionForCopy(
                    event.data.sourceStudyId,
                    event.data.nodeId,
                    CopyType.NODE_COPY
                );
            }
        };
        return broadcast;
    });

    useEffect(() => {
        //If the tab is closed we want to invalidate the copy on all tabs because we won't able to track the node modification
        window.addEventListener('beforeunload', (event) => {
            if (true === isInitiatingCopyTab.current) {
                broadcastChannel.postMessage(noSelectionForCopy);
            }
        });
        //broadcastChannel doesn't change
    }, [broadcastChannel]);

    const [activeNode, setActiveNode] = useState(null);

    const currentNode = useSelector((state) => state.currentTreeNode);
    const currentNodeRef = useRef();
    currentNodeRef.current = currentNode;

    const selectionForCopy = useSelector((state) => state.selectionForCopy);
    const selectionForCopyRef = useRef();
    selectionForCopyRef.current = selectionForCopy;

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

    const isSubtreeImpacted = useCallback(
        (headerName) => {
            const nodesImpacted = Array.isArray(
                studyUpdatedForce.eventData.headers[headerName]
            )
                ? studyUpdatedForce.eventData.headers[headerName]
                : Array(studyUpdatedForce.eventData.headers[headerName]);

            return (
                (selectionForCopyRef.current.copyType ===
                    CopyType.SUBTREE_COPY ||
                    selectionForCopyRef.current.copyType ===
                        CopyType.SUBTREE_CUT) &&
                nodesImpacted.some(
                    (nodeId) =>
                        nodeId === selectionForCopyRef.current.nodeId ||
                        selectionForCopyRef.current.allChildrenIds?.includes(
                            nodeId
                        )
                )
            );
        },
        [studyUpdatedForce.eventData.headers]
    );

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

                if (isSubtreeImpacted('parentNode')) {
                    dispatch(setSelectionForCopy(noSelectionForCopy));
                    snackInfo({
                        messageId: 'CopiedNodeInvalidationMessage',
                    });
                }
            } else if (
                studyUpdatedForce.eventData.headers['updateType'] ===
                'subtreeCreated'
            ) {
                fetchNetworkModificationSubtree(
                    studyUuid,
                    studyUpdatedForce.eventData.headers['newNode']
                ).then((nodes) => {
                    dispatch(
                        networkModificationHandleSubtree(
                            nodes,
                            studyUpdatedForce.eventData.headers['parentNode']
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
                'subtreeMoved'
            ) {
                fetchNetworkModificationSubtree(
                    studyUuid,
                    studyUpdatedForce.eventData.headers['movedNode']
                ).then((nodes) => {
                    dispatch(
                        networkModificationHandleSubtree(
                            nodes,
                            studyUpdatedForce.eventData.headers['parentNode']
                        )
                    );
                });
            } else if (
                studyUpdatedForce.eventData.headers['updateType'] ===
                'nodeDeleted'
            ) {
                //only the tab that initiated the copy should update through the websocket, all the other tabs will get the info through broadcast
                if (
                    (true === isInitiatingCopyTab.current &&
                        studyUpdatedForce.eventData.headers['nodes'].some(
                            (nodeId) =>
                                nodeId === selectionForCopyRef.current.nodeId
                        )) ||
                    isSubtreeImpacted('nodes')
                ) {
                    dispatch(setSelectionForCopy(noSelectionForCopy));
                    snackInfo({
                        messageId: 'CopiedNodeInvalidationMessage',
                    });
                    broadcastChannel.postMessage(noSelectionForCopy);
                }
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
                    (true === isInitiatingCopyTab.current &&
                        studyUpdatedForce.eventData.headers['nodes'].some(
                            (nodeId) =>
                                nodeId === selectionForCopyRef.current.nodeId
                        )) ||
                    isSubtreeImpacted('nodes')
                ) {
                    //only the tab that initiated the copy should update through the websocket, all the other tabs will get the info through broadcast
                    dispatch(setSelectionForCopy(noSelectionForCopy));
                    snackInfo({
                        messageId: 'CopiedNodeInvalidationMessage',
                    });
                    broadcastChannel.postMessage(noSelectionForCopy);
                }
            } else if (
                studyUpdatedForce.eventData.headers['updateType'] ===
                'nodeRenamed'
            ) {
                updateNodes([studyUpdatedForce.eventData.headers['node']]);
            } else if (
                studyUpdatedForce.eventData.headers['updateType'] ===
                'nodeBuildStatusUpdated'
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
                //creating, updating or deleting modifications must invalidate the node clipboard
            } else if (
                UPDATE_TYPE.includes(
                    studyUpdatedForce.eventData.headers['updateType']
                )
            ) {
                if (
                    (true === isInitiatingCopyTab.current &&
                        studyUpdatedForce.eventData.headers['parentNode'] ===
                            selectionForCopyRef.current.nodeId) ||
                    isSubtreeImpacted('parentNode')
                ) {
                    dispatch(setSelectionForCopy(noSelectionForCopy));
                    snackInfo({
                        messageId: 'CopiedNodeInvalidationMessage',
                    });
                }
            }
        }
    }, [
        studyUuid,
        studyUpdatedForce,
        updateNodes,
        snackInfo,
        dispatch,
        broadcastChannel,
        isSubtreeImpacted,
    ]);

    const handleCreateNode = useCallback(
        (element, type, insertMode) => {
            getUniqueNodeName(studyUuid)
                .then((response) =>
                    createTreeNode(studyUuid, element.id, insertMode, {
                        name: response,
                        type: type,
                        buildStatus: BUILD_STATUS.NOT_BUILT,
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
        isInitiatingCopyTab.current = true;
        dispatchSelectionForCopy(studyUuid, nodeId, CopyType.NODE_COPY);
        broadcastChannel.postMessage({
            sourceStudyId: studyUuid,
            nodeId: nodeId,
        });
    };

    const handleCutNode = (nodeId) => {
        nodeId
            ? dispatchSelectionForCopy(studyUuid, nodeId, CopyType.NODE_CUT)
            : dispatch(setSelectionForCopy(noSelectionForCopy));
    };

    const handlePasteNode = useCallback(
        (referenceNodeId, insertMode) => {
            if (CopyType.NODE_CUT === selectionForCopyRef.current.copyType) {
                cutTreeNode(
                    studyUuid,
                    selectionForCopyRef.current.nodeId,
                    referenceNodeId,
                    insertMode
                ).catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'NodeCreateError',
                    });
                });
                //Do not wait for the response, after the first CUT / PASTE operation, we can't paste anymore
                dispatch(setSelectionForCopy(noSelectionForCopy));
            } else if (
                CopyType.NODE_COPY === selectionForCopyRef.current.copyType
            ) {
                copyTreeNode(
                    selectionForCopyRef.current.sourceStudyId,
                    studyUuid,
                    selectionForCopyRef.current.nodeId,
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
        },
        [studyUuid, snackError]
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

    const handleRemoveSubtree = useCallback(
        (element) => {
            deleteSubtree(studyUuid, element.id).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'NodeDeleteError',
                });
            });
        },
        [snackError, studyUuid]
    );

    const handleCopySubtree = (nodeId) => {
        console.info(
            'node with id ' +
                nodeId +
                ' from study ' +
                studyUuid +
                ' selected for copy'
        );
        dispatchSelectionForCopy(studyUuid, nodeId, CopyType.SUBTREE_COPY);
    };

    const handleCutSubtree = (nodeId) => {
        nodeId
            ? dispatchSelectionForCopy(studyUuid, nodeId, CopyType.SUBTREE_CUT)
            : dispatch(setSelectionForCopy(noSelectionForCopy));
    };

    const handlePasteSubtree = useCallback(
        (referenceNodeId) => {
            if (CopyType.SUBTREE_CUT === selectionForCopyRef.current.copyType) {
                cutSubtree(
                    studyUuid,
                    selectionForCopyRef.current.nodeId,
                    referenceNodeId
                ).catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'NodeCreateError',
                    });
                });
                //Do not wait for the response, after the first CUT / PASTE operation, we can't paste anymore
                dispatch(setSelectionForCopy(noSelectionForCopy));
            } else if (
                CopyType.SUBTREE_COPY === selectionForCopyRef.current.copyType
            ) {
                copySubtree(
                    studyUuid,
                    selectionForCopyRef.current.nodeId,
                    referenceNodeId
                ).catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'NodeCreateError',
                    });
                });
                //In copy/paste, we can still paste the same node later
            }
        },
        [studyUuid, dispatch, snackError]
    );

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
                    selectionForCopy={selectionForCopyRef.current}
                    handleCopyNode={handleCopyNode}
                    handleCutNode={handleCutNode}
                    handlePasteNode={handlePasteNode}
                    handleRemovalSubtree={handleRemoveSubtree}
                    handleCutSubtree={handleCutSubtree}
                    handleCopySubtree={handleCopySubtree}
                    handlePasteSubtree={handlePasteSubtree}
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
