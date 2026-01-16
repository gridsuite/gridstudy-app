/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { backendFetch, backendFetchJson } from '@gridsuite/commons-ui';
import type { UUID } from 'node:crypto';

const PREFIX_DYNAMIC_MARGIN_CALCULATION_SERVER_QUERIES =
    import.meta.env.VITE_API_GATEWAY + '/dynamic-margin-calculation';

function getDynamicMarginCalculationUrl() {
    return `${PREFIX_DYNAMIC_MARGIN_CALCULATION_SERVER_QUERIES}/v1/`;
}

export function fetchDynamicMarginCalculationProviders() {
    console.info('fetch dynamic margin calculation providers');
    const url = getDynamicMarginCalculationUrl() + 'providers';
    console.debug(url);
    return backendFetchJson(url);
}

export function downloadDebugFileDynamicMarginCalculation(resultUuid: UUID): Promise<Response> {
    console.info(`Download dynamic margin calculation debug file of '${resultUuid}' ...`);

    const url = getDynamicMarginCalculationUrl() + `results/${resultUuid}/download-debug-file`;

    console.debug(url);
    return backendFetch(url, {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
    });
}
