/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetch, backendFetchJson } from './utils';
import type { UUID } from 'node:crypto';

const PREFIX_DYNAMIC_SECURITY_ANALYSIS_SERVER_QUERIES = import.meta.env.VITE_API_GATEWAY + '/dynamic-security-analysis';

function getDynamicSecurityAnalysisUrl() {
    return `${PREFIX_DYNAMIC_SECURITY_ANALYSIS_SERVER_QUERIES}/v1/`;
}

export function fetchDynamicSecurityAnalysisProviders() {
    console.info('fetch dynamic security analysis providers');
    const url = getDynamicSecurityAnalysisUrl() + 'providers';
    console.debug(url);
    return backendFetchJson(url);
}

export function downloadDebugFileDynamicSecurityAnalysis(resultUuid: UUID): Promise<Response> {
    console.info(`Download dynamic security analysis debug file of '${resultUuid}' ...`);

    const url = getDynamicSecurityAnalysisUrl() + `results/${resultUuid}/download-debug-file`;

    console.debug(url);
    return backendFetch(url, {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
    });
}
