/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UUID } from 'crypto';
import { backendFetch } from './utils';

const PREFIX_SHORT_CIRCUIT_ANALYSIS_SERVER_QUERIES = import.meta.env.VITE_API_GATEWAY + '/shortcircuit';

function getShotCircuitAnalysisUrl() {
    return `${PREFIX_SHORT_CIRCUIT_ANALYSIS_SERVER_QUERIES}/v1/`;
}

export function downloadDebugFileShortCircuitAnalysis(resultUuid: UUID): Promise<Response> {
    console.info(`Download short circuit analysis debug file of '${resultUuid}' ...`);

    const url = getShotCircuitAnalysisUrl() + `results/${resultUuid}/download-debug-file`;

    console.debug(url);
    return backendFetch(url, {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
    });
}
