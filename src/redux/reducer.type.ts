/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UUID } from 'crypto';

export interface ReduxState {
    studyUpdated: StudyUpdated;
    shortCircuitNotif: boolean;
    studyUuid: UUID;
    currentTreeNode: CurrentTreeNode;
}

export interface StudyUpdatedEventDataHeader {
    studyUuid: UUID;
    parentNode: UUID;
    timestamp: number;
    updateType?: string;
    node?: UUID;
    nodes?: UUID[];
    error?: string;
    userId?: string;
}

export interface StudyUpdatedEventData {
    headers: StudyUpdatedEventDataHeader;
    payload: string;
}

export interface StudyUpdated {
    force: 0 | 1;
    eventData: StudyUpdatedEventData;
}

export interface CurrentTreeNodeData {
    parentNodeUuid: UUID;
    label: string;
    description: string;
    buildStatus: string;
    readonly: boolean;
}

export interface CurrentTreeNode {
    id: UUID;
    type: string;
    data: CurrentTreeNodeData;
    targetPosition: string;
    sourcePosition: string;
}
