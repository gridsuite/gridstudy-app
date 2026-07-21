/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { backendFetch } from '@gridsuite/commons-ui';
import { PREFIX_STUDY_SERVER_QUERIES } from './study';

const PREFIX_VOLTAGE_INIT_SERVER_QUERIES = PREFIX_STUDY_SERVER_QUERIES + '/v1/voltage-init';

function getVoltageInitUrl() {
    return `${PREFIX_VOLTAGE_INIT_SERVER_QUERIES}/`;
}

export function downloadDebugFileVoltageInit(resultUuid: UUID): Promise<Response> {
    console.info(`Download voltage init debug file of '${resultUuid}' ...`);

    const url = getVoltageInitUrl() + `results/${resultUuid}/download-debug-file`;

    console.debug(url);
    return backendFetch(url, {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
    });
}
