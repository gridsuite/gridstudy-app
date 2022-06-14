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
} from '../utils/rest-api';
import {
    networkModificationTreeNodeAdded,
    networkModificationTreeNodesRemoved,
    networkModificationTreeNodesUpdated,
    removeNotificationByNode,
} from '../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import NetworkModificationTree from './network-modification-tree';
import { StudyDrawer } from './study-drawer';
import { StudyDisplayMode } from './study-pane';
import NodeEditor from './graph/menus/node-editor';
import CreateNodeMenu from './graph/menus/create-node-menu';
import { displayErrorMessageWithSnackbar, useIntlRef } from '../utils/messages';
import { useSnackbar } from 'notistack';
import { useStoreState } from 'react-flow-renderer';
import makeStyles from '@mui/styles/makeStyles';
import { DRAWER_NODE_EDITOR_WIDTH } from './map-lateral-drawers';
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
        if (display !== StudyDisplayMode.MAP) {
            ref.current = { display, width };
        }
    }, [display, width]);
    return ref.current;
};

export const NetworkModificationTreePane = ({
    studyUuid,
    studyMapTreeDisplay,
}) => {
    const dispatch = useDispatch();
    const intlRef = useIntlRef();
    const { enqueueSnackbar } = useSnackbar();
    const classes = useStyles();
    const DownloadIframe = 'downloadIframe';

    const [activeNode, setActiveNode] = useState(null);
    const selectedNode = useSelector((state) => state.selectedTreeNode);

    const isModificationsDrawerOpen = useSelector(
        (state) => state.isModificationsDrawerOpen
    );
    const studyUpdatedForce = useSelector((state) => state.studyUpdated);

    const width = useStoreState((state) => state.width);
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
                        (n) => n === selectedNode?.id
                    )
                ) {
                    const notification = {
                        studyUuid:
                            studyUpdatedForce.eventData.headers['studyUuid'],
                        nodeUuid: selectedNode.id,
                    };
                    dispatch(removeNotificationByNode(notification));
                }
            }
        }
    }, [studyUuid, studyUpdatedForce, updateNodes, dispatch, selectedNode?.id]);

    const handleCreateNode = useCallback(
        (element, type, insertMode) => {
            createTreeNode(studyUuid, element.id, insertMode, {
                name: 'New node',
                type: type,
                buildStatus: 'NOT_BUILT',
            }).catch((errorMessage) => {
                displayErrorMessageWithSnackbar({
                    errorMessage: errorMessage,
                    enqueueSnackbar: enqueueSnackbar,
                    headerMessage: {
                        headerMessageId: 'NodeCreateError',
                        intlRef: intlRef,
                    },
                });
            });
        },
        [studyUuid, enqueueSnackbar, intlRef]
    );

    const handleRemoveNode = useCallback(
        (element) => {
            deleteTreeNode(studyUuid, element.id).catch((errorMessage) => {
                displayErrorMessageWithSnackbar({
                    errorMessage: errorMessage,
                    enqueueSnackbar: enqueueSnackbar,
                    headerMessage: {
                        headerMessageId: 'NodeDeleteError',
                        intlRef: intlRef,
                    },
                });
            });
        },
        [studyUuid, enqueueSnackbar, intlRef]
    );

    const [openExportDialog, setOpenExportDialog] = useState(false);

    const handleClickExportStudy = (url) => {
        window.open(url, DownloadIframe);
        setOpenExportDialog(false);
    };

    const handleExportCaseOnNode = (element) => {
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
        // setActiveNode(null);
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

                {selectedNode && selectedNode.type === 'NETWORK_MODIFICATION' && (
                    <StudyDrawer
                        open={isModificationsDrawerOpen}
                        drawerClassName={classes.nodeEditor}
                        drawerShiftClassName={classes.nodeEditorShift}
                        anchor={
                            prevTreeDisplay === StudyDisplayMode.TREE
                                ? 'right'
                                : 'left'
                        }
                    >
                        <NodeEditor />
                    </StudyDrawer>
                )}
            </Box>
            {createNodeMenu.display && (
                <CreateNodeMenu
                    position={createNodeMenu.position}
                    activeNode={activeNode}
                    handleNodeCreation={handleCreateNode}
                    handleNodeRemoval={handleRemoveNode}
                    handleExportCaseOnNode={handleExportCaseOnNode}
                    handleClose={closeCreateNodeMenu}
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
