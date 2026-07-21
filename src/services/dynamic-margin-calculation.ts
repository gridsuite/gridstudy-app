/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { backendFetch } from '@gridsuite/commons-ui';
import type { UUID } from 'node:crypto';
import { PREFIX_STUDY_SERVER_QUERIES } from './study';

const PREFIX_DYNAMIC_MARGIN_CALCULATION_SERVER_QUERIES =
    PREFIX_STUDY_SERVER_QUERIES + '/v1/dynamic-margin-calculation';

function getDynamicMarginCalculationUrl() {
    return `${PREFIX_DYNAMIC_MARGIN_CALCULATION_SERVER_QUERIES}/`;
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
