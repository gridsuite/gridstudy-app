/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createSelector } from '@reduxjs/toolkit';
import type { UUID } from 'node:crypto';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { getAncestorsByNode, isStatusBuilt } from 'components/graph/util/model-functions';
import { findActivityOnNode, findConflictingActivity } from 'components/graph/util/node-activity';
import { NetworkModificationNodeType, NodeType } from 'components/graph/tree-node.type';
import { AppState } from 'redux/reducer.type';
import type { BuildStatus } from '@gridsuite/commons-ui';
import { NODE_ACTIVITY_LABEL_IDS, type NodeActivity } from 'types/node-activity.type';

type NodeBuildData = {
    nodeType?: NetworkModificationNodeType;
    localBuildStatus?: BuildStatus;
};

function isSecurityNode(nodeData: NodeBuildData | undefined): boolean {
    return nodeData?.nodeType === NetworkModificationNodeType.SECURITY;
}

type RequestedWork = {
    invalidatesChildren: boolean;
    affectsAllRootNetworks: boolean;
};

const RUN_ON_NODE: RequestedWork = { invalidatesChildren: false, affectsAllRootNetworks: false };
const RUN_AND_UNBUILD_CHILDREN: RequestedWork = { invalidatesChildren: true, affectsAllRootNetworks: false };
const EDIT_ON_NODE: RequestedWork = { invalidatesChildren: false, affectsAllRootNetworks: true };
const EDIT_AND_UNBUILD_CHILDREN: RequestedWork = { invalidatesChildren: true, affectsAllRootNetworks: true };

const selectAncestorsByNode = createSelector(
    (state: AppState) => state.networkModificationTreeModel,
    getAncestorsByNode
);

const selectRootNodeId = createSelector(
    (state: AppState) => state.networkModificationTreeModel,
    (treeModel) => treeModel?.treeNodes.find((treeNode) => treeNode.type === NodeType.ROOT)?.id as UUID | undefined
);

function useConflictingActivity(
    nodeId: UUID | undefined,
    { invalidatesChildren, affectsAllRootNetworks }: RequestedWork
): NodeActivity | undefined {
    return useSelector((state: AppState) => {
        if (state.nodeActivities.length === 0) {
            return undefined;
        }
        return findConflictingActivity(
            state.nodeActivities,
            selectAncestorsByNode(state),
            nodeId,
            affectsAllRootNetworks ? null : state.currentRootNetworkUuid,
            invalidatesChildren
        );
    });
}

export function useBlockingActivity(nodeId: UUID | undefined): NodeActivity | undefined {
    return useConflictingActivity(nodeId, EDIT_AND_UNBUILD_CHILDREN);
}

export function useCanEditNode(nodeId: UUID | undefined): boolean {
    return !useBlockingActivity(nodeId);
}

export function useCanUnbuildAllNodes(): boolean {
    return useCanEditNode(useSelector(selectRootNodeId));
}

export function useCanBuildOrComputeOnNode(nodeId: UUID | undefined): boolean {
    return !useConflictingActivity(nodeId, RUN_ON_NODE);
}

/** Unbuilding reaches children only on a built security node; building never does. */
export function useCanBuildOrUnbuildNode(nodeId: UUID | undefined, nodeData: NodeBuildData | undefined): boolean {
    const cascades = isSecurityNode(nodeData) && !!isStatusBuilt(nodeData?.localBuildStatus);
    return !useConflictingActivity(nodeId, cascades ? RUN_AND_UNBUILD_CHILDREN : RUN_ON_NODE);
}

/** A loadflow on a security node writes solved values onto its variant, so its children are invalidated. */
export function useCanRunLoadFlow(nodeId: UUID | undefined, nodeData: NodeBuildData | undefined): boolean {
    return !useConflictingActivity(nodeId, isSecurityNode(nodeData) ? RUN_AND_UNBUILD_CHILDREN : RUN_ON_NODE);
}

export function useCanEditEvents(nodeId: UUID | undefined): boolean {
    return !useConflictingActivity(nodeId, EDIT_ON_NODE);
}

export function useNodeActivity(nodeId: UUID | undefined): NodeActivity | undefined {
    return useSelector((state: AppState) =>
        findActivityOnNode(state.nodeActivities, nodeId, state.currentRootNetworkUuid)
    );
}

export function useNodeActivityLabel(activity: NodeActivity | undefined): string | undefined {
    const intl = useIntl();
    return activity && intl.formatMessage({ id: NODE_ACTIVITY_LABEL_IDS[activity.label] });
}
