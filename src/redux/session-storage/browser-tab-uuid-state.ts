/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { APP_NAME } from '../../utils/config-params';
import { UUID } from 'crypto';

const SESSION_STORAGE_BROWSER_TAB_UUID_STATE_KEY_PREFIX = APP_NAME.toUpperCase() + '_SESSION_UUID_STATE_';

export function getBrowserTabUuid() {
    const rawValue = sessionStorage.getItem(SESSION_STORAGE_BROWSER_TAB_UUID_STATE_KEY_PREFIX);
    return (rawValue && JSON.parse(rawValue)) as UUID | null;
}

export function saveBrowserTabUuid(newBrowserTabUuid: UUID) {
    sessionStorage.setItem(SESSION_STORAGE_BROWSER_TAB_UUID_STATE_KEY_PREFIX, JSON.stringify(newBrowserTabUuid));
}

export function removeBrowserTabUuid() {
    sessionStorage.removeItem(SESSION_STORAGE_BROWSER_TAB_UUID_STATE_KEY_PREFIX);
}
