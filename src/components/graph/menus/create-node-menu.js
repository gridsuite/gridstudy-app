/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useState } from 'react';
import Menu from '@mui/material/Menu';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { useIsAnyNodeBuilding } from '../../utils/is-any-node-building-hook';
import { useSelector } from 'react-redux';
import { CopyType } from '../../network-modification-tree-pane';
import { NestedMenuItem } from 'mui-nested-menu';
import ChildMenuItem from './create-child-menu-item';
import { NodeInsertModes } from '../../utils/node-insert-modes';
import { CustomDialog } from '../../utils/custom-dialog';

export const NodeActions = {
    REMOVE_NODE: 'REMOVE_NODE',
    REMOVE_SUBTREE: 'REMOVE_SUBTREE',
    NO_ACTION: 'NO_ACTION',
};

export const getNodeChildren = (treeModel, sourceNodeIds, allChildren) => {
    const children = treeModel.treeNodes.filter((node) =>
        sourceNodeIds.includes(node.data.parentNodeUuid)
    );
    if (children.length > 0) {
        children.forEach((item) => {
            allChildren?.push({ ...item });
        });
        const ids = children.map((el) => el.id);
        // get next level of children
        getNodeChildren(treeModel, ids, allChildren);
    }
};

export const getNodesFromSubTree = (treeModel, id) => {
    if (treeModel?.treeNodes) {
        // get the top level children of the active node.
        const activeNodeDirectChildren = treeModel.treeNodes.filter(
            (item) => item.data.parentNodeUuid === id
        );
        const allChildren = [];
        activeNodeDirectChildren.forEach((child) => {
            allChildren.push(child);
            // get the children of each child
            getNodeChildren(treeModel, [child.id], allChildren);
        });
        return allChildren.length;
    }
};

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
    const intl = useIntl();
    const isAnyNodeBuilding = useIsAnyNodeBuilding();
    const isModificationsInProgress = useSelector(
        (state) => state.isModificationsInProgress
    );
    const treeModel = useSelector(
        (state) => state.networkModificationTreeModel
    );

    const [nodeAction, setNodeAction] = useState(NodeActions.NO_ACTION);

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
        setNodeAction(NodeActions.REMOVE_NODE);
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
        setNodeAction(NodeActions.REMOVE_SUBTREE);
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
                activeNode?.data?.globalBuildStatus?.startsWith('BUILT') ||
                activeNode?.data?.globalBuildStatus === 'BUILDING' ||
                isModificationsInProgress,
        },
        CREATE_MODIFICATION_NODE: {
            onRoot: true,
            id: 'createNetworkModificationNode',
            subMenuItems: {
                CREATE_MODIFICATION_NODE: {
                    onRoot: true,
                    action: () =>
                        createNetworkModificationNode(
                            NodeInsertModes.NewBranch
                        ),
                    id: 'createNetworkModificationNodeInNewBranch',
                },
                INSERT_MODIFICATION_NODE_BEFORE: {
                    onRoot: false,
                    action: () =>
                        createNetworkModificationNode(NodeInsertModes.Before),
                    id: 'insertNetworkModificationNodeAbove',
                },
                INSERT_MODIFICATION_NODE_AFTER: {
                    onRoot: true,
                    action: () =>
                        createNetworkModificationNode(NodeInsertModes.After),
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
                isNodeAlreadySelectedForCut()
                    ? cancelCutNetworkModificationNode()
                    : cutNetworkModificationNode(),
            id: isNodeAlreadySelectedForCut()
                ? 'cancelCutNetworkModificationNode'
                : 'cutNetworkModificationNode',
        },
        PASTE_MODIFICATION_NODE: {
            onRoot: true,
            id: 'pasteNetworkModificationNode',
            disabled: !isNodePastingAllowed(),
            subMenuItems: {
                PASTE_MODIFICATION_NODE: {
                    onRoot: true,
                    action: () =>
                        pasteNetworkModificationNode(NodeInsertModes.NewBranch),
                    id: 'pasteNetworkModificationNodeInNewBranch',
                    disabled: !isNodePastingAllowed(),
                },
                PASTE_MODIFICATION_NODE_BEFORE: {
                    onRoot: false,
                    action: () =>
                        pasteNetworkModificationNode(NodeInsertModes.Before),
                    id: 'pasteNetworkModificationNodeAbove',
                    disabled: !isNodePastingAllowed(),
                },
                PASTE_MODIFICATION_NODE_AFTER: {
                    onRoot: true,
                    action: () =>
                        pasteNetworkModificationNode(NodeInsertModes.After),
                    id: 'pasteNetworkModificationNodeBelow',
                    disabled: !isNodePastingAllowed(),
                },
            },
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
                !activeNode?.data?.globalBuildStatus?.startsWith('BUILT'),
        },
    };

    const renderMenuItems = useCallback(
        (nodeMenuItems) => {
            return Object.values(nodeMenuItems).map((item) => {
                if (activeNode?.type === 'ROOT' && !item.onRoot) {
                    return undefined; // do not show this item in menu
                }
                if (item.subMenuItems === undefined) {
                    return <ChildMenuItem key={item.id} item={item} />;
                }
                return (
                    <NestedMenuItem
                        key={item.id}
                        label={intl.formatMessage({ id: item.id })}
                        parentMenuOpen={true}
                        disabled={item.disabled}
                    >
                        {renderMenuItems(item.subMenuItems)}
                    </NestedMenuItem>
                );
            });
        },
        [intl, activeNode?.type]
    );

    const content = intl.formatMessage(
        {
            id:
                nodeAction === NodeActions.REMOVE_SUBTREE
                    ? 'deleteSubTreeConfirmation'
                    : 'deleteNodeConfirmation',
        },
        {
            nodeName: activeNode?.data?.label,
            nodesNumber: getNodesFromSubTree(treeModel, activeNode?.id),
        }
    );
    const handleOnClose = useCallback(() => {
        setNodeAction(NodeActions.NO_ACTION);
        handleClose();
    }, [handleClose]);

    const handleOnValidate = useCallback(() => {
        if (nodeAction === NodeActions.REMOVE_NODE) {
            handleNodeRemoval(activeNode);
        } else {
            handleRemovalSubtree(activeNode);
        }
        handleOnClose();
    }, [
        handleOnClose,
        handleNodeRemoval,
        handleRemovalSubtree,
        activeNode,
        nodeAction,
    ]);

    return (
        <>
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
                {renderMenuItems(NODE_MENU_ITEMS)}
            </Menu>
            {nodeAction !== NodeActions.NO_ACTION && (
                <CustomDialog
                    content={content}
                    onValidate={handleOnValidate}
                    onClose={handleOnClose}
                />
            )}
        </>
    );
};

CreateNodeMenu.propTypes = {
    position: PropTypes.object.isRequired,
    handleNodeCreation: PropTypes.func.isRequired,
    handleNodeRemoval: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
};

export default CreateNodeMenu;
