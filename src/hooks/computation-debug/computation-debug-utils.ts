/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import type { UUID } from 'node:crypto';
import { getDebugState, saveDebugState } from '../../redux/session-storage/debug-state';
import { ComputingType } from '@gridsuite/commons-ui';

export function buildDebugIdentifier({
    studyUuid,
    nodeUuid,
    rootNetworkUuid,
    computingType,
}: {
    studyUuid: UUID;
    nodeUuid: UUID;
    rootNetworkUuid: UUID;
    computingType: ComputingType;
}) {
    return `${studyUuid}|${rootNetworkUuid}|${nodeUuid}|${computingType}`;
}

export function setDebug(identifier: string) {
    const debugState = getDebugState() ?? new Set();
    debugState.add(identifier);
    saveDebugState(debugState);
}

export function isDebug(identifier: string) {
    const debugState = getDebugState();
    return debugState?.has(identifier);
}

export function unsetDebug(identifier: string) {
    const debugState = getDebugState();
    if (debugState) {
        debugState.delete(identifier);
        saveDebugState(debugState);
    }
}
