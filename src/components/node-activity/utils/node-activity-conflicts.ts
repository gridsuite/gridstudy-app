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
 * Mirrors only needed NodeActivityType in study-server : keep the flags in sync with it.
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

/** A null rootNetworkId means it affects every root network */
function hasSameRootNetwork(a: UUID | null, b: UUID | null): boolean {
    return a === null || b === null || a === b;
}

/** 'a' unbuilds its subtree, and 'b' sits inside it. */
function invalidates(a: Activity, b: Activity, ancestorsByNode: Map<UUID, Set<UUID>>): boolean {
    return a.invalidatesChildren && isDescendantOf(b.nodeId, a.nodeId, ancestorsByNode);
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
    rootNetworkUuid: UUID | null
): NodeActivity | undefined {
    return activities.find(
        (activity) => activity.nodeId === nodeId && hasSameRootNetwork(activity.rootNetworkId, rootNetworkUuid)
    );
}
