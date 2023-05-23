/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { useIsAnyNodeBuilding } from '../../utils/is-any-node-building-hook';
import { useSelector } from 'react-redux';
import { CopyType } from '../../network-modification-tree-pane';

const useStyles = makeStyles((theme) => ({
    menuItem: {
        padding: '0px',
        margin: '7px',
    },
    listItemText: {
        fontSize: 12,
        padding: '0px',
        margin: '4px',
    },
}));

const CreateNodeMenu = ({
    position,
    handleClose,
    handleBuildNode,
    handleNodeCreation,
    handleNodeRemoval,
    handleExportCaseOnNode,
    activeNode,
    selectionForCopy,
    handleCopyNode,
    handleCutNode,
    handlePasteNode,
    handleRemovalSubtree,
    handleCutSubtree,
    handleCopySubtree,
    handlePasteSubtree,
}) => {
    const classes = useStyles();
    const intl = useIntl();
    const isAnyNodeBuilding = useIsAnyNodeBuilding();
    const isModificationsInProgress = useSelector(
        (state) => state.isModificationsInProgress
    );

    function buildNode() {
        handleBuildNode(activeNode);
        handleClose();
    }

    function createNetworkModificationNode(insertMode) {
        handleNodeCreation(activeNode, 'NETWORK_MODIFICATION', insertMode);
        handleClose();
    }

    function pasteNetworkModificationNode(insertMode) {
        handlePasteNode(activeNode.id, insertMode);
        handleClose();
    }

    function copyNetworkModificationNode() {
        handleCopyNode(activeNode.id);
        handleClose();
    }

    function cutNetworkModificationNode() {
        handleCutNode(activeNode.id);
        handleClose();
    }

    function cancelCutNetworkModificationNode() {
        handleCutNode(null);
        handleClose();
    }

    function removeNode() {
        handleNodeRemoval(activeNode);
        handleClose();
    }

    function exportCaseOnNode() {
        handleExportCaseOnNode(activeNode);
        handleClose();
    }

    function copySubtree() {
        handleCopySubtree(activeNode.id);
        handleClose();
    }

    function pasteSubtree() {
        handlePasteSubtree(activeNode.id);
        handleClose();
    }

    function cutSubtree() {
        handleCutSubtree(activeNode.id);
        handleClose();
    }

    function cancelCutSubtree() {
        handleCutSubtree(null);
        handleClose();
    }

    function removeSubtree() {
        handleRemovalSubtree(activeNode);
        handleClose();
    }

    function isNodePastingAllowed() {
        return (
            (selectionForCopy.nodeId !== activeNode.id &&
                selectionForCopy.copyType === CopyType.NODE_CUT) ||
            selectionForCopy.copyType === CopyType.NODE_COPY
        );
    }

    function isSubtreePastingAllowed() {
        return (
            (selectionForCopy.nodeId !== activeNode.id &&
                !selectionForCopy.allChildrenIds?.includes(activeNode.id) &&
                selectionForCopy.copyType === CopyType.SUBTREE_CUT) ||
            selectionForCopy.copyType === CopyType.SUBTREE_COPY
        );
    }

    function isNodeAlreadySelectedForCut() {
        return (
            selectionForCopy?.nodeId === activeNode.id &&
            selectionForCopy?.copyType === CopyType.NODE_CUT
        );
    }

    function isSubtreeAlreadySelectedForCut() {
        return (
            selectionForCopy?.nodeId === activeNode.id &&
            selectionForCopy?.copyType === CopyType.SUBTREE_CUT
        );
    }

    const NODE_MENU_ITEMS = {
        BUILD_NODE: {
            onRoot: false,
            action: () => buildNode(),
            id: 'buildNode',
            disabled:
                activeNode?.data?.buildStatusGlobal?.startsWith('BUILT') ||
                activeNode?.data?.buildStatusGlobal === 'BUILDING' ||
                isModificationsInProgress,
        },
        CREATE_MODIFICATION_NODE: {
            onRoot: true,
            action: () => createNetworkModificationNode('CHILD'),
            id: 'createNetworkModificationNode',
        },
        INSERT_MODIFICATION_NODE_BEFORE: {
            onRoot: false,
            action: () => createNetworkModificationNode('BEFORE'),
            id: 'insertNetworkModificationNodeAbove',
        },
        INSERT_MODIFICATION_NODE_AFTER: {
            onRoot: true,
            action: () => createNetworkModificationNode('AFTER'),
            id: 'insertNetworkModificationNodeBelow',
        },
        COPY_MODIFICATION_NODE: {
            onRoot: false,
            action: () => copyNetworkModificationNode(),
            id: 'copyNetworkModificationNode',
        },
        CUT_MODIFICATION_NODE: {
            onRoot: false,
            action: () =>
                isNodeAlreadySelectedForCut()
                    ? cancelCutNetworkModificationNode()
                    : cutNetworkModificationNode(),
            id: isNodeAlreadySelectedForCut()
                ? 'cancelCutNetworkModificationNode'
                : 'cutNetworkModificationNode',
        },
        PASTE_MODIFICATION_NODE: {
            onRoot: true,
            action: () => pasteNetworkModificationNode('CHILD'),
            id: 'pasteNetworkModificationNodeOnNewBranch',
            disabled: !isNodePastingAllowed(),
        },
        PASTE_MODIFICATION_NODE_BEFORE: {
            onRoot: false,
            action: () => pasteNetworkModificationNode('BEFORE'),
            id: 'pasteNetworkModificationNodeAbove',
            disabled: !isNodePastingAllowed(),
        },
        PASTE_MODIFICATION_NODE_AFTER: {
            onRoot: true,
            action: () => pasteNetworkModificationNode('AFTER'),
            id: 'pasteNetworkModificationNodeBelow',
            disabled: !isNodePastingAllowed(),
        },
        REMOVE_NODE: {
            onRoot: false,
            action: () => removeNode(),
            id: 'removeNode',
            disabled: isAnyNodeBuilding,
            sectionEnd: true,
        },
        COPY_SUBTREE: {
            onRoot: false,
            action: () => copySubtree(),
            id: 'copyNetworkModificationSubtree',
            disabled: isAnyNodeBuilding,
        },
        CUT_SUBTREE: {
            onRoot: false,
            action: () =>
                isSubtreeAlreadySelectedForCut()
                    ? cancelCutSubtree()
                    : cutSubtree(),
            id: isSubtreeAlreadySelectedForCut()
                ? 'cancelCutNetworkModificationSubtree'
                : 'cutNetworkModificationSubtree',
            disabled: isAnyNodeBuilding,
            sectionEnd: true,
        },
        PASTE_SUBTREE: {
            onRoot: true,
            action: () => pasteSubtree(),
            id: 'pasteNetworkModificationSubtree',
            disabled: !isSubtreePastingAllowed(),
        },
        REMOVE_SUBTREE: {
            onRoot: false,
            action: () => removeSubtree(),
            id: 'removeNetworkModificationSubtree',
            disabled: isAnyNodeBuilding,
        },
        EXPORT_NETWORK_ON_NODE: {
            onRoot: true,
            action: () => exportCaseOnNode(),
            id: 'exportCaseOnNode',
            disabled:
                activeNode?.type !== 'ROOT' &&
                !activeNode?.data?.buildStatusGlobal?.startsWith('BUILT'),
        },
    };

    return (
        <Menu
            anchorReference="anchorPosition"
            anchorPosition={{
                position: 'absolute',
                left: position.x,
                top: position.y,
            }}
            id="create-node-menu"
            open={true}
            onClose={handleClose}
        >
            {Object.values(NODE_MENU_ITEMS).map((item) => {
                return (
                    (activeNode?.type !== 'ROOT' || item.onRoot) && (
                        <MenuItem
                            className={classes.menuItem}
                            onClick={item.action}
                            key={item.id}
                            disabled={item.disabled}
                        >
                            <ListItemText
                                key={item.id}
                                className={classes.listItemText}
                                primary={
                                    <Typography noWrap>
                                        {intl.formatMessage({
                                            id: item.id,
                                        })}
                                    </Typography>
                                }
                            />
                        </MenuItem>
                    )
                );
            })}
        </Menu>
    );
};

CreateNodeMenu.propTypes = {
    position: PropTypes.object.isRequired,
    handleNodeCreation: PropTypes.func.isRequired,
    handleNodeRemoval: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
};

export default CreateNodeMenu;
