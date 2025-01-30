/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetchJson } from './utils';

const PREFIX_SHORT_CIRCUIT_SERVER_QUERIES = import.meta.env.VITE_API_GATEWAY + '/shortcircuit';

function getShortCircuitUrl() {
    return `${PREFIX_SHORT_CIRCUIT_SERVER_QUERIES}/v1/`;
}

export function fetchShortCircuitParameters(parameterUuid: string) {
    console.info('get short circuit analysis parameters');
    const url = getShortCircuitUrl() + 'parameters/' + encodeURIComponent(parameterUuid);
    return backendFetchJson(url);
}
