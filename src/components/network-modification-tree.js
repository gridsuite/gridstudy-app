/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useStoreState } from 'react-flow-renderer';
import { useSelector } from 'react-redux';
import CreateNodeMenu from './graph/menus/create-node-menu';
import { Box } from '@mui/material';
import { createTreeNode, deleteTreeNode } from '../utils/rest-api';
import { displayErrorMessageWithSnackbar, useIntlRef } from '../utils/messages';
import { useSnackbar } from 'notistack';
import { useParams } from 'react-router-dom';
import NodeEditor from './graph/menus/node-editor';
import { StudyDrawer } from './study-drawer';
import makeStyles from '@mui/styles/makeStyles';
import { DRAWER_NODE_EDITOR_WIDTH } from './map-lateral-drawers';
import PropTypes from 'prop-types';
import { StudyDisplayMode } from './study-pane';
import ReactFlowTree from './react-flow-tree';

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

const NetworkModificationTree = ({ studyMapTreeDisplay }) => {
    const selectedNode = useSelector((state) => state.selectedTreeNode);

    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const classes = useStyles();

    const isModificationsDrawerOpen = useSelector(
        (state) => state.isModificationsDrawerOpen
    );

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

    const [createNodeMenu, setCreateNodeMenu] = useState({
        position: { x: -1, y: -1 },
        display: null,
        selectedNode: null,
    });

    const onNodeContextMenu = useCallback((event, element) => {
        setCreateNodeMenu({
            position: { x: event.pageX, y: event.pageY },
            display: true,
            selectedNode: element,
        });
    }, []);

    const closeCreateNodeMenu = useCallback(() => {
        setCreateNodeMenu({
            display: false,
            selectedNode: null,
        });
    }, []);

    const width = useStoreState((state) => state.width);

    const prevTreeDisplay = usePreviousTreeDisplay(studyMapTreeDisplay, width);

    return (
        <>
            <Box
                className={classes.container}
                display="flex"
                flexDirection="row"
            >
                <ReactFlowTree
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
                    activeNode={createNodeMenu.selectedNode}
                    handleNodeCreation={handleCreateNode}
                    handleNodeRemoval={handleRemoveNode}
                    handleClose={closeCreateNodeMenu}
                />
            )}
        </>
    );
};

export default NetworkModificationTree;

NetworkModificationTree.propTypes = {
    studyMapTreeDisplay: PropTypes.string.isRequired,
};
