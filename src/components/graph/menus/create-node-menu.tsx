/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';
import Menu from '@mui/material/Menu';
import { useIntl } from 'react-intl';
import { useIsAnyNodeBuilding } from '../../utils/is-any-node-building-hook';
import { useSelector } from 'react-redux';
import ChildMenuItem from './create-child-menu-item';
import { CustomDialog } from '../../utils/custom-dialog';
import { CustomNestedMenuItem } from '@gridsuite/commons-ui';
import { type AppState, type NodeSelectionForCopy } from 'redux/reducer';
import type { UUID } from 'node:crypto';
import NetworkModificationTreeModel from '../network-modification-tree-model';
import { CopyType } from 'components/network-modification.type';
import { CurrentTreeNode, isSecurityModificationNode, NetworkModificationNodeType, NodeType } from '../tree-node.type';
import { NodeInsertModes } from 'types/notification-types';
import { Divider } from '@mui/material';
import { BUILD_STATUS } from '@gridsuite/commons-ui/components/node/constant';

type SubMenuItem = {
    onRoot: boolean;
    action?: () => void;
    id: string;
    disabled?: boolean;
    hidden?: boolean;
    withDivider?: boolean;
};

type MenuItem = {
    onRoot: boolean;
    action?: () => void;
    id: string;
    disabled?: boolean;
    hidden?: boolean;
    subMenuItems?: Record<string, SubMenuItem>;
    sectionEnd?: boolean;
    withDivider?: boolean;
};
type NodeMenuItems = Record<string, MenuItem>;

interface CreateNodeMenuProps {
    position: { x: number; y: number };
    handleNodeCreation: (
        element: CurrentTreeNode,
        type: NodeType,
        insertMode: NodeInsertModes,
        networkModificationNodeType: NetworkModificationNodeType
    ) => void;
    handleSecuritySequenceCreation: (element: CurrentTreeNode) => void;
    handleNodeRemoval: (activeNode: CurrentTreeNode) => void;
    handleClose: () => void;
    handleBuildNode: (element: CurrentTreeNode) => void;
    handleUnbuildNode: (element: CurrentTreeNode) => void;
    handleExportCaseOnNode: (node: CurrentTreeNode) => void;
    activeNode: CurrentTreeNode;
    nodeSelectionForCopy: NodeSelectionForCopy;
    handleCopyNode: (nodeId: string) => void;
    handleCutNode: (nodeId: UUID | null) => void;
    handlePasteNode: (activeNode: string, insertMode: NodeInsertModes) => void;
    handleRemovalSubtree: (node: CurrentTreeNode) => void;
    handleCutSubtree: (nodeId: UUID | null) => void;
    handleCopySubtree: (nodeId: UUID) => void;
    handlePasteSubtree: (referenceNodeId: string) => void;
    handleOpenRestoreNodesDialog: (nodeId: UUID) => void;
    disableRestoreNodes: boolean;
}

const NodeActions = {
    REMOVE_NODE: 'REMOVE_NODE',
    REMOVE_SUBTREE: 'REMOVE_SUBTREE',
    NO_ACTION: 'NO_ACTION',
};

const getNodeChildren = (
    treeModel: NetworkModificationTreeModel,
    sourceNodeIds: UUID[],
    allChildren: CurrentTreeNode[]
) => {
    const children = treeModel.treeNodes.filter((node) => sourceNodeIds.includes(node.parentId as UUID));
    if (children.length > 0) {
        children.forEach((item) => {
            allChildren?.push({ ...item });
        });
        const ids = children.map((el) => el.id);
        // get next level of children
        getNodeChildren(treeModel, ids, allChildren);
    }
};

const getNodesFromSubTree = (treeModel: NetworkModificationTreeModel | null, id: UUID) => {
    if (treeModel?.treeNodes) {
        // get the top level children of the active node.
        const activeNodeDirectChildren = treeModel.treeNodes.filter((item) => item.parentId === id);
        const allChildren: CurrentTreeNode[] = [];
        activeNodeDirectChildren.forEach((child) => {
            allChildren.push(child);
            // get the children of each child
            getNodeChildren(treeModel, [child.id], allChildren);
        });
        return allChildren.length;
    }
};

const CreateNodeMenu: React.FC<CreateNodeMenuProps> = ({
    position,
    handleClose,
    handleBuildNode,
    handleUnbuildNode,
    handleNodeCreation,
    handleSecuritySequenceCreation,
    handleNodeRemoval,
    handleExportCaseOnNode,
    activeNode,
    nodeSelectionForCopy,
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
    const mapDataLoading = useSelector((state: AppState) => state.mapDataLoading);
    const treeModel = useSelector((state: AppState) => state.networkModificationTreeModel);

    const [nodeAction, setNodeAction] = useState(NodeActions.NO_ACTION);

    function buildNode() {
        handleBuildNode(activeNode);
        handleClose();
    }

    function createNetworkModificationNode(
        insertMode: NodeInsertModes,
        networkModificationNodeType: NetworkModificationNodeType
    ) {
        handleNodeCreation(activeNode, NodeType.NETWORK_MODIFICATION, insertMode, networkModificationNodeType);
        handleClose();
    }

    function pasteNetworkModificationNode(insertMode: NodeInsertModes) {
        handlePasteNode(activeNode.id, insertMode);
        handleClose();
    }

    function createSecuritySequence() {
        handleSecuritySequenceCreation(activeNode);
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
            ((nodeSelectionForCopy.nodeId !== activeNode.id && nodeSelectionForCopy.copyType === CopyType.NODE_CUT) ||
                nodeSelectionForCopy.copyType === CopyType.NODE_COPY)
        );
    }

    function isSubtreePastingAllowed() {
        return (
            !mapDataLoading &&
            ((nodeSelectionForCopy.nodeId !== activeNode.id &&
                !nodeSelectionForCopy.allChildren?.map((child) => child.id)?.includes(activeNode.id) &&
                nodeSelectionForCopy.copyType === CopyType.SUBTREE_CUT) ||
                nodeSelectionForCopy.copyType === CopyType.SUBTREE_COPY)
        );
    }

    function isSubtreeContentPasteable(): boolean {
        if (!nodeSelectionForCopy || !activeNode) {
            return false;
        }

        const allChildren = nodeSelectionForCopy.allChildren;

        const areAllOfType = (type: NetworkModificationNodeType) =>
            allChildren?.every((child) => child.nodeType === type) && nodeSelectionForCopy.nodeType === type;

        const isAllSecurity = areAllOfType(NetworkModificationNodeType.SECURITY);
        const isAllConstruction = areAllOfType(NetworkModificationNodeType.CONSTRUCTION);
        const isMixed = !isAllSecurity && !isAllConstruction;

        const isActiveNodeRoot = activeNode.type === NodeType.ROOT;
        const isActiveNodeConstruction = !isSecurityModificationNode(activeNode);

        if (isAllSecurity) {
            // Rule 1: SECURITY subtree can be inserted on new branch from any node type
            return true;
        }

        if (isAllConstruction || isMixed) {
            // Rule 2: CONSTRUCTION or mixed subtree can only be inserted on new branch from ROOT or CONSTRUCTION node
            return isActiveNodeRoot || isActiveNodeConstruction;
        }

        return false;
    }

    function isNodeInsertionForbidden(insertMode?: NodeInsertModes): boolean {
        const nodeType = nodeSelectionForCopy.nodeType;
        // Rule 1 : CONSTRUCTION cannot be inserted into SECURITY
        const isConstructionInsertionForbidden =
            nodeType === NetworkModificationNodeType.CONSTRUCTION && isSecurityModificationNode(activeNode);
        // Rule 2 : SECURITY can only be inserted in CHILD mode into CONSTRUCTION or ROOT
        const isSecurityInsertionForbidden =
            nodeType === NetworkModificationNodeType.SECURITY &&
            insertMode !== NodeInsertModes.NewBranch &&
            insertMode !== undefined &&
            !isSecurityModificationNode(activeNode);

        return isConstructionInsertionForbidden || isSecurityInsertionForbidden;
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
        return nodeSelectionForCopy?.nodeId === activeNode.id && nodeSelectionForCopy?.copyType === CopyType.NODE_CUT;
    }

    function isSubtreeAlreadySelectedForCut() {
        return (
            nodeSelectionForCopy?.nodeId === activeNode.id && nodeSelectionForCopy?.copyType === CopyType.SUBTREE_CUT
        );
    }
    function isNodeHasChildren(node: CurrentTreeNode, treeModel: NetworkModificationTreeModel | null): boolean {
        return treeModel?.treeNodes.some((item) => item.parentId === node.id) ?? false;
    }
    function isSubtreeRemovingAllowed() {
        // check if the subtree has children
        return !isAnyNodeBuilding && !mapDataLoading && isNodeHasChildren(activeNode, treeModel);
    }

    const SUBTREE_SUBMENU_ITEMS: Record<string, SubMenuItem> = {
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
        },
        PASTE_SUBTREE: {
            onRoot: true,
            action: () => pasteSubtree(),
            id: 'pasteNetworkModificationSubtree',
            disabled: !isSubtreePastingAllowed() || !isSubtreeContentPasteable(),
            withDivider: activeNode?.type !== NodeType.ROOT,
        },
        REMOVE_SUBTREE: {
            onRoot: false,
            action: () => removeSubtree(),
            id: 'removeNetworkModificationSubtree',
            disabled: !isSubtreeRemovingAllowed(),
        },
    };

    const NODE_MENU_ITEMS: NodeMenuItems = {
        BUILD_NODE: {
            onRoot: false,
            action: () => buildNode(),
            id: 'buildNode',
            disabled:
                activeNode?.data?.globalBuildStatus?.startsWith('BUILT') ||
                activeNode?.data?.globalBuildStatus === BUILD_STATUS.BUILDING,
        },
        UNBUILD_NODE: {
            onRoot: false,
            action: () => unbuildNode(),
            id: 'unbuildNode',
            disabled: !isNodeUnbuildingAllowed(),
            withDivider: true,
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
            disabled: !isNodePastingAllowed() || isNodeInsertionForbidden(),
            subMenuItems: {
                PASTE_NEW_BRANCH: {
                    onRoot: true,
                    action: () => pasteNetworkModificationNode(NodeInsertModes.NewBranch),
                    id: 'insertNodeInNewBranch',
                    disabled: !isNodePastingAllowed() || isNodeInsertionForbidden(NodeInsertModes.NewBranch),
                },
                PASTE_BEFORE: {
                    onRoot: false,
                    action: () => pasteNetworkModificationNode(NodeInsertModes.Before),
                    id: 'insertNodeAbove',
                    disabled: !isNodePastingAllowed() || isNodeInsertionForbidden(NodeInsertModes.Before),
                },
                PASTE_AFTER: {
                    onRoot: true,
                    action: () => pasteNetworkModificationNode(NodeInsertModes.After),
                    id: 'insertNodeBelow',
                    disabled: !isNodePastingAllowed() || isNodeInsertionForbidden(NodeInsertModes.After),
                },
            },
        },
        REMOVE_NODE: {
            onRoot: false,
            action: () => removeNode(),
            id: 'removeNode',
            disabled: !isNodeRemovingAllowed(),
            sectionEnd: true,
            withDivider: isSecurityModificationNode(activeNode),
        },
        RESTORE_NODES: {
            onRoot: true,
            hidden: isSecurityModificationNode(activeNode),
            action: () => restoreNodes(),
            id: 'restoreNodes',
            disabled: !isNodeRestorationAllowed(),
            withDivider: !isSecurityModificationNode(activeNode),
        },

        CONSTRUCTION_NODE: {
            onRoot: true,
            hidden: isSecurityModificationNode(activeNode),
            id: 'ConstructionNode',
            subMenuItems: {
                INSERT_NODE_NEW_BRANCH: {
                    onRoot: true,
                    action: () =>
                        createNetworkModificationNode(
                            NodeInsertModes.NewBranch,
                            NetworkModificationNodeType.CONSTRUCTION
                        ),
                    id: 'insertNodeInNewBranch',
                },
                INSERT_NODE_BEFORE: {
                    onRoot: false,

                    action: () =>
                        createNetworkModificationNode(NodeInsertModes.Before, NetworkModificationNodeType.CONSTRUCTION),
                    id: 'insertNodeAbove',
                },
                INSERT_NODE_AFTER: {
                    onRoot: true,
                    action: () =>
                        createNetworkModificationNode(NodeInsertModes.After, NetworkModificationNodeType.CONSTRUCTION),
                    id: 'insertNodeBelow',
                },
            },
        },
        SECURITY_NODE: {
            onRoot: true,
            id: 'SecurityNode',
            subMenuItems: {
                INSERT_NODE_NEW_BRANCH: {
                    onRoot: true,
                    action: () =>
                        createNetworkModificationNode(NodeInsertModes.NewBranch, NetworkModificationNodeType.SECURITY),
                    id: 'insertNodeInNewBranch',
                },
                INSERT_NODE_BEFORE: {
                    onRoot: false,
                    disabled: !isSecurityModificationNode(activeNode),
                    action: () =>
                        createNetworkModificationNode(NodeInsertModes.Before, NetworkModificationNodeType.SECURITY),
                    id: 'insertNodeAbove',
                },
                INSERT_NODE_AFTER: {
                    onRoot: true,
                    disabled: !isSecurityModificationNode(activeNode),
                    action: () =>
                        createNetworkModificationNode(NodeInsertModes.After, NetworkModificationNodeType.SECURITY),
                    id: 'insertNodeBelow',
                    withDivider: !isSecurityModificationNode(activeNode),
                },
                CREATE_SECURITY_SEQUENCE: {
                    onRoot: true,
                    hidden: isSecurityModificationNode(activeNode),
                    action: () => createSecuritySequence(),
                    id: 'SecuritySequence',
                },
            },
            withDivider: true,
        },
        SUBTREE: {
            onRoot: true,
            id: 'NetworkModificationSubtree',
            subMenuItems: SUBTREE_SUBMENU_ITEMS,
            withDivider: true,
        },

        EXPORT_NETWORK_ON_NODE: {
            onRoot: true,
            action: () => exportCaseOnNode(),
            id: 'exportCaseOnNode',
            disabled: activeNode?.type !== NodeType.ROOT && !activeNode?.data?.globalBuildStatus?.startsWith('BUILT'),
        },
    };

    const renderMenuItems = useCallback(
        (nodeMenuItems: NodeMenuItems) => {
            return Object.values(nodeMenuItems).flatMap((item) => {
                if ((activeNode?.type === NodeType.ROOT && !item.onRoot) || item.hidden) {
                    return [];
                }
                if (item.subMenuItems === undefined) {
                    const action = item.action ?? (() => {});
                    const disabled = item.disabled ?? false;
                    const child = <ChildMenuItem key={item.id} item={{ ...item, action, disabled }} />;
                    return item?.withDivider ? [child, <Divider key={`${item.id}-divider`} />] : [child];
                }
                const nested = (
                    <CustomNestedMenuItem
                        key={item.id}
                        label={intl.formatMessage({ id: item.id })}
                        disabled={item.disabled}
                    >
                        {renderMenuItems(item.subMenuItems)}
                    </CustomNestedMenuItem>
                );
                return item.withDivider ? [nested, <Divider key={`${item.id}-divider`} sx={{ my: 1 }} />] : [nested];
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
            nodesNumber: getNodesFromSubTree(treeModel, activeNode.id),
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
