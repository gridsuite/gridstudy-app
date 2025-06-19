/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { APP_NAME } from '../../utils/config-params';

const SESSION_STORAGE_DEBUG_STATE_KEY_PREFIX = APP_NAME.toUpperCase() + '_DEBUG_STATE_';

export function getDebugState() {
    const objJson = sessionStorage.getItem(SESSION_STORAGE_DEBUG_STATE_KEY_PREFIX);
    if (objJson) {
        const array = JSON.parse(objJson) as string[];
        return new Set(array);
    }
    return undefined;
}

export function saveDebugState(newDebugState: Set<string>) {
    const array = Array.from(newDebugState);
    sessionStorage.setItem(SESSION_STORAGE_DEBUG_STATE_KEY_PREFIX, JSON.stringify(array));
}
