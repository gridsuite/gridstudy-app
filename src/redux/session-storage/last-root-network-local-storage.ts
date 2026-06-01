/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { LOCAL_STORAGE_KEY_PREFIX } from '../../utils/config-params';

const LAST_ROOT_NETWORK_KEY = `${LOCAL_STORAGE_KEY_PREFIX}:last-root-network`;

export function saveLastRootNetworkUuid(studyUuid: UUID, rootNetworkUuid: UUID): void {
    try {
        localStorage.setItem(`${LAST_ROOT_NETWORK_KEY}:${studyUuid}`, rootNetworkUuid);
    } catch (err) {
        console.warn('Failed to save last root network uuid:', err);
    }
}

export function getLastRootNetworkUuid(studyUuid: UUID): UUID | null {
    const stored = localStorage.getItem(`${LAST_ROOT_NETWORK_KEY}:${studyUuid}`);
    return stored ? (stored as UUID) : null;
}
