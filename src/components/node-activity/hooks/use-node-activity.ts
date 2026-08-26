/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createSelector } from '@reduxjs/toolkit';
import type { UUID } from 'node:crypto';
import { useSelector } from 'react-redux';
import { getAncestorsByNode, isStatusBuilt } from 'components/graph/util/model-functions';
import {
    findActivityOnNode,
    findConflictingActivity,
    REQUESTED_ACTIVITY,
    type RequestedActivity,
} from '../utils/node-activity-conflicts';
import {
    NetworkModificationNodeType,
    NodeType,
    type ReactFlowModificationNodeData,
} from 'components/graph/tree-node.type';
import { AppState } from 'redux/reducer.type';
import { NodeActivityLabel, type NodeActivity } from '../types/node-activity.type';

type NodeBuildData = Pick<ReactFlowModificationNodeData, 'nodeType' | 'localBuildStatus'>;

function isSecurityNode(nodeData: NodeBuildData | undefined): boolean {
    return nodeData?.nodeType === NetworkModificationNodeType.SECURITY;
}

const selectAncestorsByNode = createSelector(
    (state: AppState) => state.networkModificationTreeModel,
    getAncestorsByNode
);

const selectRootNodeId = createSelector(
    (state: AppState) => state.networkModificationTreeModel,
    (treeModel) => treeModel?.treeNodes.find((treeNode) => treeNode.type === NodeType.ROOT)?.id
);

function useConflictingActivity(
    nodeId: UUID | null | undefined,
    requested: RequestedActivity
): NodeActivity | undefined {
    return useSelector((state: AppState) => {
        if (!nodeId || state.nodeActivities.length === 0) {
            return undefined;
        }
        return findConflictingActivity(state.nodeActivities, selectAncestorsByNode(state), {
            nodeId,
            // null when the activity affects every root network of the study
            rootNetworkId: requested.affectsAllRootNetworks ? null : state.currentRootNetworkUuid,
            invalidatesChildren: requested.invalidatesChildren,
        });
    });
}

export function useBlockingActivity(nodeId: UUID | null | undefined): NodeActivity | undefined {
    return useConflictingActivity(nodeId, REQUESTED_ACTIVITY.ANY);
}

export function useIsEditBlocked(nodeId: UUID | null | undefined): boolean {
    return !!useConflictingActivity(nodeId, REQUESTED_ACTIVITY.EDIT_MODIFICATIONS);
}

export function useIsEventEditBlocked(nodeId: UUID | null | undefined): boolean {
    return !!useConflictingActivity(nodeId, REQUESTED_ACTIVITY.EDIT_EVENTS);
}

/** UNBUILD and BUILD have the same rules, except on a built security node where the unbuild invalidates the children. */
export function useIsBuildBlocked(nodeId: UUID | null | undefined, nodeData: NodeBuildData | undefined): boolean {
    const unbuildsChildren = isSecurityNode(nodeData) && isStatusBuilt(nodeData?.localBuildStatus);
    return !!useConflictingActivity(
        nodeId,
        unbuildsChildren ? REQUESTED_ACTIVITY.UNBUILD_CHILDREN : REQUESTED_ACTIVITY.BUILD
    );
}

export function useIsComputationBlocked(nodeId: UUID | null | undefined): boolean {
    return !!useConflictingActivity(nodeId, REQUESTED_ACTIVITY.COMPUTE);
}

/** A loadflow on a security node writes solved values onto its variant, so its children are invalidated. */
export function useIsLoadFlowBlocked(nodeId: UUID | null | undefined, nodeData: NodeBuildData | undefined): boolean {
    return !!useConflictingActivity(
        nodeId,
        isSecurityNode(nodeData) ? REQUESTED_ACTIVITY.COMPUTE_AND_UNBUILD_CHILDREN : REQUESTED_ACTIVITY.COMPUTE
    );
}

export function useIsUnbuildAllBlocked(): boolean {
    const rootNodeId = useSelector(selectRootNodeId);
    return !!useConflictingActivity(rootNodeId, REQUESTED_ACTIVITY.UNBUILD_ALL);
}

export function useNodeActivity(nodeId: UUID | null | undefined): NodeActivity | undefined {
    return useSelector((state: AppState) =>
        nodeId ? findActivityOnNode(state.nodeActivities, nodeId, state.currentRootNetworkUuid) : undefined
    );
}

export function useIsNodeUpdating(nodeId: UUID | null | undefined): boolean {
    return useNodeActivity(nodeId)?.label === NodeActivityLabel.UPDATING;
}
