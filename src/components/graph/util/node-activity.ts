/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import type { NodeActivity } from '../../../types/node-activity.type';

function sharesARootNetwork(activity: NodeActivity, rootNetworkUuid: UUID | null): boolean {
    return rootNetworkUuid === null || activity.rootNetworkId === null || activity.rootNetworkId === rootNetworkUuid;
}

function isOnTheSameNode(activity: NodeActivity, nodeId: UUID): boolean {
    return activity.nodeId === nodeId;
}

function invalidatesTheNode(activity: NodeActivity, ancestors: Set<UUID> | undefined): boolean {
    return activity.invalidatesChildren && !!ancestors?.has(activity.nodeId);
}

function isBelowTheNode(activity: NodeActivity, ancestorsByNode: Map<UUID, Set<UUID>>, nodeId: UUID): boolean {
    return !!ancestorsByNode.get(activity.nodeId)?.has(nodeId);
}

export function findConflictingActivity(
    activities: NodeActivity[],
    ancestorsByNode: Map<UUID, Set<UUID>>,
    nodeId: UUID | undefined,
    rootNetworkUuid: UUID | null,
    requestInvalidatesChildren: boolean
): NodeActivity | undefined {
    if (!nodeId || activities.length === 0) {
        return undefined;
    }
    const ancestors = ancestorsByNode.get(nodeId);
    return activities.find(
        (activity) =>
            sharesARootNetwork(activity, rootNetworkUuid) &&
            (isOnTheSameNode(activity, nodeId) ||
                invalidatesTheNode(activity, ancestors) ||
                (requestInvalidatesChildren && isBelowTheNode(activity, ancestorsByNode, nodeId)))
    );
}

export function findActivityOnNode(
    activities: NodeActivity[],
    nodeId: UUID | undefined,
    rootNetworkUuid: UUID | null
): NodeActivity | undefined {
    return nodeId
        ? activities.find(
              (activity) => isOnTheSameNode(activity, nodeId) && sharesARootNetwork(activity, rootNetworkUuid)
          )
        : undefined;
}
