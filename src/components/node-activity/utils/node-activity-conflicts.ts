/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { isDescendantOf } from 'components/graph/util/model-functions';
import type { NodeActivity } from '../types/node-activity.type';

/**
 * Conflict flags of the activity the UI is about to request, mirroring the study-server NodeActivityType : must be kept in sync
 * Types with the same flags reuse one entry. UNBUILD uses BUILD, EDIT_TREE and DELETE_NODES use EDIT_MODIFICATIONS.
 */
export const REQUESTED_ACTIVITY = {
    BUILD: { invalidatesChildren: false, affectsAllRootNetworks: false },
    UNBUILD_CHILDREN: { invalidatesChildren: true, affectsAllRootNetworks: false },
    UNBUILD_ALL: { invalidatesChildren: true, affectsAllRootNetworks: true },
    COMPUTE: { invalidatesChildren: false, affectsAllRootNetworks: false },
    COMPUTE_AND_UNBUILD_CHILDREN: { invalidatesChildren: true, affectsAllRootNetworks: false },
    EDIT_MODIFICATIONS: { invalidatesChildren: true, affectsAllRootNetworks: true },
    EDIT_EVENTS: { invalidatesChildren: false, affectsAllRootNetworks: true },
    /** Not a server type : it is here to ask whether a node is usable at all. */
    ANY: { invalidatesChildren: true, affectsAllRootNetworks: true },
} as const;

export type RequestedActivity = (typeof REQUESTED_ACTIVITY)[keyof typeof REQUESTED_ACTIVITY];

type Activity = Pick<NodeActivity, 'nodeId' | 'rootNetworkId' | 'invalidatesChildren'>;

/** A null rootNetworkId means the activity affects every root network of the study. */
function hasSameRootNetwork(rootNetworkId: UUID | null, otherRootNetworkId: UUID | null): boolean {
    return rootNetworkId === null || otherRootNetworkId === null || rootNetworkId === otherRootNetworkId;
}

/** The ancestor unbuilds its subtree, and the descendant sits inside it. Called both ways round. */
function invalidates(ancestor: Activity, descendant: Activity, ancestorsByNode: Map<UUID, Set<UUID>>): boolean {
    return ancestor.invalidatesChildren && isDescendantOf(descendant.nodeId, ancestor.nodeId, ancestorsByNode);
}

function hasConflictWith(activity: Activity, other: Activity, ancestorsByNode: Map<UUID, Set<UUID>>): boolean {
    return (
        hasSameRootNetwork(activity.rootNetworkId, other.rootNetworkId) &&
        (activity.nodeId === other.nodeId ||
            invalidates(activity, other, ancestorsByNode) ||
            invalidates(other, activity, ancestorsByNode))
    );
}

export function findConflictingActivity(
    activities: NodeActivity[],
    ancestorsByNode: Map<UUID, Set<UUID>>,
    requested: Activity
): NodeActivity | undefined {
    return activities.find((activity) => hasConflictWith(activity, requested, ancestorsByNode));
}

export function findActivityOnNode(
    activities: NodeActivity[],
    nodeId: UUID,
    rootNetworkId: UUID | null
): NodeActivity | undefined {
    return activities.find(
        (activity) => activity.nodeId === nodeId && hasSameRootNetwork(activity.rootNetworkId, rootNetworkId)
    );
}
