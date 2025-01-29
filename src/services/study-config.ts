/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetchJson } from '@gridsuite/commons-ui';
import { UUID } from 'crypto';

const PREFIX_STUDY_CONFIG_QUERIES = import.meta.env.VITE_API_GATEWAY + '/study-config';

function getSpreadsheetConfigUrl() {
    return `${PREFIX_STUDY_CONFIG_QUERIES}/v1/spreadsheet-configs`;
}

export function getSpreadsheetModel(spreadsheetModelUuid: UUID) {
    const fetchUrl = `${getSpreadsheetConfigUrl()}/${spreadsheetModelUuid}`;
    return backendFetchJson(fetchUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

function getNetworkVisualizationsParametersUrl() {
    return `${PREFIX_STUDY_CONFIG_QUERIES}/v1/network-visualizations-params`;
}

export function fetchNetworkVisualizationsParameters(paramsUuid: UUID) {
    const fetchUrl = `${getNetworkVisualizationsParametersUrl()}/${paramsUuid}`;
    return backendFetchJson(fetchUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
