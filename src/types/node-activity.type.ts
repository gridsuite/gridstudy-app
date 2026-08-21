/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';

export enum NodeActivityLabel {
    UPDATING = 'UPDATING',
    DELETING = 'DELETING',
    BUILDING = 'BUILDING',
    UNBUILDING = 'UNBUILDING',
    COMPUTING = 'COMPUTING',
}

type MessageId = keyof (typeof import('translations/messages-en'))['default'];

export const NODE_ACTIVITY_LABEL_IDS: Record<NodeActivityLabel, MessageId> = {
    [NodeActivityLabel.UPDATING]: 'nodeActivity.UPDATING',
    [NodeActivityLabel.DELETING]: 'nodeActivity.DELETING',
    [NodeActivityLabel.BUILDING]: 'nodeActivity.BUILDING',
    [NodeActivityLabel.UNBUILDING]: 'nodeActivity.UNBUILDING',
    [NodeActivityLabel.COMPUTING]: 'nodeActivity.COMPUTING',
};

export const NODE_ACTIVITY_IN_PROGRESS_IDS: Record<NodeActivityLabel, MessageId> = {
    [NodeActivityLabel.UPDATING]: 'nodeActivityInProgress.UPDATING',
    [NodeActivityLabel.DELETING]: 'nodeActivityInProgress.DELETING',
    [NodeActivityLabel.BUILDING]: 'nodeActivityInProgress.BUILDING',
    [NodeActivityLabel.UNBUILDING]: 'nodeActivityInProgress.UNBUILDING',
    [NodeActivityLabel.COMPUTING]: 'nodeActivityInProgress.COMPUTING',
};

export type NodeActivity = {
    nodeId: UUID;
    /** null when the activity spans every root network of the study. */
    rootNetworkId: UUID | null;
    label: NodeActivityLabel;
    invalidatesChildren: boolean;
};
