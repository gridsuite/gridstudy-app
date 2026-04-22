/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { backendFetch } from '@gridsuite/commons-ui';

const PREFIX_STATE_ESTIMATION_SERVER_QUERIES = import.meta.env.VITE_API_GATEWAY + '/state-estimation';

function getStateEstimationServerUrl() {
    return `${PREFIX_STATE_ESTIMATION_SERVER_QUERIES}/v1/`;
}

export function downloadDebugFileStateEstimationServer(resultUuid: UUID): Promise<Response> {
    console.info(`Download state estimation debug file of '${resultUuid}' ...`);

    const url = getStateEstimationServerUrl() + `results/${resultUuid}/download-debug-file`;

    console.debug(url);
    return backendFetch(url, {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
    });
}
