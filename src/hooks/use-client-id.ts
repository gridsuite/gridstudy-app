/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useMemo } from 'react';

const CLIENT_ID_STORAGE_KEY = 'ws-client-id';

export function getClientId(): string {
    let clientId = sessionStorage.getItem(CLIENT_ID_STORAGE_KEY);

    if (!clientId) {
        clientId = crypto.randomUUID();
        sessionStorage.setItem(CLIENT_ID_STORAGE_KEY, clientId);
    }

    return clientId;
}

export function useClientId(): string {
    return useMemo(() => getClientId(), []);
}
