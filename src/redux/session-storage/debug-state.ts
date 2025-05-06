/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { APP_NAME } from '../../utils/config-params';
import { UUID } from 'crypto';

const SESSION_STORAGE_DEBUG_MAP_STATE_KEY_PREFIX = APP_NAME.toUpperCase() + '_DEBUG_MAP_STATE_';

export function getDebugMap() {
    const objJson = sessionStorage.getItem(SESSION_STORAGE_DEBUG_MAP_STATE_KEY_PREFIX);
    if (objJson) {
        const obj = JSON.parse(objJson) as Record<string, boolean>;
        return new Map(Object.entries(obj));
    }
    return null;
}

export function saveDebugMap(newDebugMap: Map<string, boolean>) {
    const obj = Object.fromEntries(newDebugMap.entries());
    sessionStorage.setItem(SESSION_STORAGE_DEBUG_MAP_STATE_KEY_PREFIX, JSON.stringify(obj));
}
