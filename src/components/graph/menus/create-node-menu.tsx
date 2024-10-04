/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useState } from 'react';
import Menu from '@mui/material/Menu';
import { useIntl } from 'react-intl';
import { useIsAnyNodeBuilding } from '../../utils/is-any-node-building-hook';
import { useSelector } from 'react-redux';
import ChildMenuItem from './create-child-menu-item';
import { NodeInsertModes } from '../nodes/node-insert-modes';
import { CustomDialog } from '../../utils/custom-dialog';
import { CustomNestedMenuItem } from '../../utils/custom-nested-menu';
import { BUILD_STATUS } from '../../network/constants';
import { AppState, CurrentTreeNode } from 'redux/reducer';
import { UUID } from 'crypto';
import { CopyType } from 'components/network-modification-tree-pane';
import NetworkModificationTreeModel from '../network-modification-tree-model';

export const NodeActions = {
    REMOVE_NODE: 'REMOVE_NODE',
    REMOVE_SUBTREE: 'REMOVE_SUBTREE',
    NO_ACTION: 'NO_ACTION',
};

export const getNodeChildren = (treeModel: NetworkModificationTreeModel, sourceNodeIds: any, allChildren: any) => {
    const children = treeModel.treeNodes.filter((node: any) => sourceNodeIds.includes(node.data.parentNodeUuid));
    if (children.length > 0) {
        children.forEach((item: any) => {
            allChildren?.push({ ...item });
        });
        const ids = children.map((el: any) => el.id);
        // get next level of children
        getNodeChildren(treeModel, ids, allChildren);
    }
};

export const getNodesFromSubTree = (treeModel: NetworkModificationTreeModel, id: any) => {
    if (treeModel?.treeNodes) {
        // get the top level children of the active node.
        const activeNodeDirectChildren = treeModel.treeNodes.filter((item: any) => item.data.parentNodeUuid === id);
        const allChildren: any[] = [];
        activeNodeDirectChildren.forEach((child: any) => {
            allChildren.push(child);
            // get the children of each child
            getNodeChildren(treeModel, [child.id], allChildren);
        });
        return allChildren.length;
    }
};

interface Identifiable {
    id: string;
    [key: string]: any; // Allows any other fields
}

interface CreateNodeMenuProps {
    position: { x: number; y: number };
    handleNodeCreation: (element: any, type: string, insertMode: any) => void;
    handleNodeRemoval: (activeNode: any) => void;
    handleClose: () => void;
    handleBuildNode: (element: CurrentTreeNode) => void;
    handleUnbuildNode: (element: Identifiable) => void;
    handleExportCaseOnNode: (node: CurrentTreeNode) => void;
    activeNode: CurrentTreeNode;
    selectionForCopy: { sourceStudyUuid: string; nodeId: UUID; copyType: string; allChildrenIds: string[] }; //TODO(jamal): change copyType to enum
    handleCopyNode: (nodeId: string) => void;
    handleCutNode: (nodeId: UUID | null) => void;
    handlePasteNode: (activeNode: string, insertMode: NodeInsertModes) => void;
    handleRemovalSubtree: (element: Identifiable) => void;
    handleCutSubtree: (nodeId: UUID | null) => void;
    handleCopySubtree: (nodeId: UUID) => void;
    handlePasteSubtree: (referenceNodeId: string) => void;
    handleOpenRestoreNodesDialog: (nodeId: UUID) => void;
    disableRestoreNodes: boolean;
}

const CreateNodeMenu: React.FC<CreateNodeMenuProps> = ({
    position,
    handleClose,
    handleBuildNode,
    handleUnbuildNode,
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
    handleOpenRestoreNodesDialog,
    disableRestoreNodes,
}) => {
    const intl = useIntl();
    const isAnyNodeBuilding = useIsAnyNodeBuilding();
    const isModificationsInProgress = useSelector((state: AppState) => state.isModificationsInProgress);
    const mapDataLoading = useSelector((state: AppState) => state.mapDataLoading);
    const treeModel = useSelector((state: AppState) => state.networkModificationTreeModel);

    const [nodeAction, setNodeAction] = useState(NodeActions.NO_ACTION);

    function buildNode() {
        handleBuildNode(activeNode);
        handleClose();
    }

    function createNetworkModificationNode(insertMode: NodeInsertModes) {
        handleNodeCreation(activeNode, 'NETWORK_MODIFICATION', insertMode);
        handleClose();
    }

    function pasteNetworkModificationNode(insertMode: NodeInsertModes) {
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

    function unbuildNode() {
        handleUnbuildNode(activeNode);
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

    function restoreNodes() {
        handleClose();
        handleOpenRestoreNodesDialog(activeNode.id);
    }

    function removeSubtree() {
        setNodeAction(NodeActions.REMOVE_SUBTREE);
    }

    function isNodePastingAllowed() {
        return (
            !mapDataLoading &&
            ((selectionForCopy.nodeId !== activeNode.id && selectionForCopy.copyType === CopyType.NODE_CUT) ||
                selectionForCopy.copyType === CopyType.NODE_COPY)
        );
    }

    function isSubtreePastingAllowed() {
        return (
            !mapDataLoading &&
            ((selectionForCopy.nodeId !== activeNode.id &&
                !selectionForCopy.allChildrenIds?.includes(activeNode.id) &&
                selectionForCopy.copyType === CopyType.SUBTREE_CUT) ||
                selectionForCopy.copyType === CopyType.SUBTREE_COPY)
        );
    }

    function isNodeRemovingAllowed() {
        return !isAnyNodeBuilding && !mapDataLoading;
    }

    function isNodeUnbuildingAllowed() {
        return !isAnyNodeBuilding && !mapDataLoading && activeNode?.data?.globalBuildStatus?.startsWith('BUILT');
    }

    function isNodeRestorationAllowed() {
        return !isAnyNodeBuilding && !disableRestoreNodes;
    }

    function isNodeAlreadySelectedForCut() {
        return selectionForCopy?.nodeId === activeNode.id && selectionForCopy?.copyType === CopyType.NODE_CUT;
    }

    function isSubtreeAlreadySelectedForCut() {
        return selectionForCopy?.nodeId === activeNode.id && selectionForCopy?.copyType === CopyType.SUBTREE_CUT;
    }
    function isNodeHasChildren(node: any, treeModel: NetworkModificationTreeModel): boolean {
        return treeModel.treeNodes.some((item: any) => item.data.parentNodeUuid === node.id);
    }
    function isSubtreeRemovingAllowed() {
        // check if the subtree has children
        return !isAnyNodeBuilding && !mapDataLoading && isNodeHasChildren(activeNode, treeModel!);
    }
    const NODE_MENU_ITEMS = {
        BUILD_NODE: {
            onRoot: false,
            action: () => buildNode(),
            id: 'buildNode',
            disabled:
                activeNode?.data?.globalBuildStatus?.startsWith('BUILT') ||
                activeNode?.data?.globalBuildStatus === BUILD_STATUS.BUILDING ||
                isModificationsInProgress,
        },
        CREATE_MODIFICATION_NODE: {
            onRoot: true,
            id: 'createNetworkModificationNode',
            subMenuItems: {
                CREATE_MODIFICATION_NODE: {
                    onRoot: true,
                    action: () => createNetworkModificationNode(NodeInsertModes.NewBranch),
                    id: 'createNetworkModificationNodeInNewBranch',
                },
                INSERT_MODIFICATION_NODE_BEFORE: {
                    onRoot: false,
                    action: () => createNetworkModificationNode(NodeInsertModes.Before),
                    id: 'insertNetworkModificationNodeAbove',
                },
                INSERT_MODIFICATION_NODE_AFTER: {
                    onRoot: true,
                    action: () => createNetworkModificationNode(NodeInsertModes.After),
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
                isNodeAlreadySelectedForCut() ? cancelCutNetworkModificationNode() : cutNetworkModificationNode(),
            id: isNodeAlreadySelectedForCut() ? 'cancelCutNetworkModificationNode' : 'cutNetworkModificationNode',
        },
        PASTE_MODIFICATION_NODE: {
            onRoot: true,
            id: 'pasteNetworkModificationNode',
            disabled: !isNodePastingAllowed(),
            subMenuItems: {
                PASTE_MODIFICATION_NODE: {
                    onRoot: true,
                    action: () => pasteNetworkModificationNode(NodeInsertModes.NewBranch),
                    id: 'pasteNetworkModificationNodeInNewBranch',
                    disabled: !isNodePastingAllowed(),
                },
                PASTE_MODIFICATION_NODE_BEFORE: {
                    onRoot: false,
                    action: () => pasteNetworkModificationNode(NodeInsertModes.Before),
                    id: 'pasteNetworkModificationNodeAbove',
                    disabled: !isNodePastingAllowed(),
                },
                PASTE_MODIFICATION_NODE_AFTER: {
                    onRoot: true,
                    action: () => pasteNetworkModificationNode(NodeInsertModes.After),
                    id: 'pasteNetworkModificationNodeBelow',
                    disabled: !isNodePastingAllowed(),
                },
            },
        },
        UNBUILD_NODE: {
            onRoot: false,
            action: () => unbuildNode(),
            id: 'unbuildNode',
            disabled: !isNodeUnbuildingAllowed(),
        },
        REMOVE_NODE: {
            onRoot: false,
            action: () => removeNode(),
            id: 'removeNode',
            disabled: !isNodeRemovingAllowed(),
            sectionEnd: true,
        },
        COPY_SUBTREE: {
            onRoot: false,
            action: () => copySubtree(),
            id: 'copyNetworkModificationSubtree',
            disabled: isAnyNodeBuilding || !isNodeHasChildren(activeNode, treeModel),
        },
        CUT_SUBTREE: {
            onRoot: false,
            action: () => (isSubtreeAlreadySelectedForCut() ? cancelCutSubtree() : cutSubtree()),
            id: isSubtreeAlreadySelectedForCut()
                ? 'cancelCutNetworkModificationSubtree'
                : 'cutNetworkModificationSubtree',
            disabled: isAnyNodeBuilding || !isNodeHasChildren(activeNode, treeModel),
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
            disabled: !isSubtreeRemovingAllowed(),
        },
        RESTORE_NODES: {
            onRoot: true,
            action: () => restoreNodes(),
            id: 'restoreNodes',
            disabled: !isNodeRestorationAllowed(),
        },
        EXPORT_NETWORK_ON_NODE: {
            onRoot: true,
            action: () => exportCaseOnNode(),
            id: 'exportCaseOnNode',
            disabled: activeNode?.type !== 'ROOT' && !activeNode?.data?.globalBuildStatus?.startsWith('BUILT'),
        },
    };

    const renderMenuItems = useCallback(
        (nodeMenuItems: any) => {
            //TODO(jamal): fix type
            return Object.values(nodeMenuItems).map((item: any) => {
                if (activeNode?.type === 'ROOT' && !item.onRoot) {
                    return undefined; // do not show this item in menu
                }
                if (item.subMenuItems === undefined) {
                    return <ChildMenuItem key={item.id} item={item} />;
                }
                return (
                    <CustomNestedMenuItem
                        key={item.id}
                        label={intl.formatMessage({ id: item.id })}
                        disabled={item.disabled}
                    >
                        {renderMenuItems(item.subMenuItems)}
                    </CustomNestedMenuItem>
                );
            });
        },
        [intl, activeNode?.type]
    );

    const content = intl.formatMessage(
        {
            id: nodeAction === NodeActions.REMOVE_SUBTREE ? 'deleteSubTreeConfirmation' : 'deleteNodeConfirmation',
        },
        {
            nodeName: activeNode?.data?.label,
            nodesNumber: getNodesFromSubTree(treeModel!, activeNode?.id),
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
    }, [handleOnClose, handleNodeRemoval, handleRemovalSubtree, activeNode, nodeAction]);

    return (
        <>
            <Menu
                anchorReference="anchorPosition"
                anchorPosition={{
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
                    validateButtonLabel="button.delete"
                    onClose={handleOnClose}
                />
            )}
        </>
    );
};

export default CreateNodeMenu;
