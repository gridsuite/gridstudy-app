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

export function nodeActivityLabelId(label: NodeActivityLabel): MessageId {
    return `nodeActivity.${label}`;
}

export function nodeActivityInProgressId(label: NodeActivityLabel): MessageId {
    return `nodeActivityInProgress.${label}`;
}

export type NodeActivity = {
    nodeId: UUID;
    rootNetworkId: UUID | null;
    label: NodeActivityLabel;
    invalidatesChildren: boolean;
};
