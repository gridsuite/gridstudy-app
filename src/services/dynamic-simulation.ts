/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetch, backendFetchJson } from './utils';
import { UUID } from 'crypto';

const PREFIX_DYNAMIC_SIMULATION_SERVER_QUERIES = import.meta.env.VITE_API_GATEWAY + '/dynamic-simulation';

function getDynamicSimulationUrl() {
    return `${PREFIX_DYNAMIC_SIMULATION_SERVER_QUERIES}/v1/`;
}

export function fetchDynamicSimulationProviders() {
    console.info('fetch dynamic simulation providers');
    const url = getDynamicSimulationUrl() + 'providers';
    console.debug(url);
    return backendFetchJson(url);
}

export function downloadDebugFileDynamicSimulation(resultUuid: UUID): Promise<Response> {
    console.info(`Download dynamic simulation debug file of '${resultUuid}' ...`);

    const url = getDynamicSimulationUrl() + `results/${resultUuid}/download-debug-file`;

    console.debug(url);
    return backendFetch(url, {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
    });
}
