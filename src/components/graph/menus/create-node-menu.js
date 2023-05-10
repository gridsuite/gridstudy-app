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
import { NestedMenuItem } from 'mui-nested-menu';

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
    selectedNodeForCopy,
    handleCopyNode,
    handleCutNode,
    handlePasteNode,
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

    function isPastingAllowed() {
        return (
            selectedNodeForCopy &&
            selectedNodeForCopy.nodeId !== null &&
            (selectedNodeForCopy.nodeId !== activeNode.id ||
                selectedNodeForCopy.copyType !== CopyType.CUT)
        );
    }

    function isAlreadySelectedForCut() {
        return (
            selectedNodeForCopy?.nodeId === activeNode.id &&
            selectedNodeForCopy?.copyType === CopyType.CUT
        );
    }

    const NODE_MENU_ITEMS = {
        BUILD_NODE: {
            onRoot: false,
            action: () => buildNode(),
            id: 'buildNode',
            disabled:
                activeNode?.data?.buildStatus?.startsWith('BUILT') ||
                activeNode?.data?.buildStatus === 'BUILDING' ||
                isModificationsInProgress,
        },
        CREATE_MODIFICATION_NODE: {
            onRoot: true,
            id: 'createNetworkModificationNode',
            subMenuItems: {
                CREATE_MODIFICATION_NODE: {
                    onRoot: true,
                    action: () => createNetworkModificationNode('CHILD'),
                    id: 'createNetworkModificationNodeInNewBranch',
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
            },
        },
        COPY_MODIFICATION_NODE: {
            onRoot: false,
            action: () => copyNetworkModificationNode(),
            id: 'copyNetworkModificationNode',
        },
        CUT_MODIFICATION_NODE: {
            onRoot: false,
            action: () =>
                isAlreadySelectedForCut()
                    ? cancelCutNetworkModificationNode()
                    : cutNetworkModificationNode(),
            id: isAlreadySelectedForCut()
                ? 'cancelCutNetworkModificationNode'
                : 'cutNetworkModificationNode',
        },
        PASTE_MODIFICATION_NODE: {
            onRoot: true,
            id: 'pasteNetworkModificationNode',
            disabled: !isPastingAllowed(),
            subMenuItems: {
                PASTE_MODIFICATION_NODE: {
                    onRoot: true,
                    action: () => pasteNetworkModificationNode('CHILD'),
                    id: 'pasteNetworkModificationNodeInNewBranch',
                    disabled: !isPastingAllowed(),
                },
                PASTE_MODIFICATION_NODE_BEFORE: {
                    onRoot: false,
                    action: () => pasteNetworkModificationNode('BEFORE'),
                    id: 'pasteNetworkModificationNodeAbove',
                    disabled: !isPastingAllowed(),
                },
                PASTE_MODIFICATION_NODE_AFTER: {
                    onRoot: true,
                    action: () => pasteNetworkModificationNode('AFTER'),
                    id: 'pasteNetworkModificationNodeBelow',
                    disabled: !isPastingAllowed(),
                },
            },
        },
        REMOVE_NODE: {
            onRoot: false,
            action: () => removeNode(),
            id: 'removeNode',
            disabled: isAnyNodeBuilding,
        },
        EXPORT_NETWORK_ON_NODE: {
            onRoot: true,
            action: () => exportCaseOnNode(),
            id: 'exportCaseOnNode',
            disabled:
                activeNode?.type !== 'ROOT' &&
                !activeNode?.data?.buildStatus?.startsWith('BUILT'),
        },
    };

    const SubMenuItem = ({ item }) => {
        return (
            <>
                {item && (
                    <MenuItem
                        className={classes.menuItem}
                        onClick={item.action}
                        disabled={item.disabled}
                    >
                        <ListItemText
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
                )}
            </>
        );
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
                const hasSubMenuItem = item.subMenuItems !== undefined;
                return (
                    (activeNode?.type !== 'ROOT' || item.onRoot) && (
                        <div key={item.id}>
                            {!hasSubMenuItem && <SubMenuItem item={item} />}

                            {hasSubMenuItem && (
                                <NestedMenuItem
                                    label={intl.formatMessage({
                                        id: item.id,
                                    })}
                                    parentMenuOpen={true}
                                    disabled={item.disabled}
                                >
                                    {Object.values(item.subMenuItems).map(
                                        (item) => {
                                            return (
                                                <SubMenuItem
                                                    key={item.id}
                                                    item={item}
                                                />
                                            );
                                        }
                                    )}
                                </NestedMenuItem>
                            )}
                        </div>
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
