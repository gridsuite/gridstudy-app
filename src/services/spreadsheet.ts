/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetchJson } from '@gridsuite/commons-ui';
import { UUID } from 'crypto';

const PREFIX_SPREADSHEET_CONFIG_QUERIES = import.meta.env.VITE_API_GATEWAY + '/study-config';

export function getSpreadsheetModel(spreadsheetModelUuid: UUID) {
    const fetchUrl = `${PREFIX_SPREADSHEET_CONFIG_QUERIES}/v1/spreadsheet-configs/${spreadsheetModelUuid}`;

    return backendFetchJson(fetchUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
