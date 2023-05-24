/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetchJson, backendFetchText } from '../utils/rest-api';

const PREFIX_SENSITIVITY_ANALYSIS_SERVER_QUERIES = `${process.env.REACT_APP_API_GATEWAY}/sensitivity-analysis`;

function getSensiUrl() {
    return `${PREFIX_SENSITIVITY_ANALYSIS_SERVER_QUERIES}/v1/`;
}

export function fetchSensitivityAnalysisProviders() {
    console.info('fetch sensitivity analysis providers');
    const url = `${getSensiUrl()}providers`;
    console.debug(url);
    return backendFetchJson(url);
}

export function getSensiDefaultResultsThreshold() {
    console.info('get sensi default results threshold');
    const getSensiDefaultResultsThresholdUrl = `${getSensiUrl()}results-threshold-default-value`;
    console.debug(getSensiDefaultResultsThresholdUrl);
    return backendFetchText(getSensiDefaultResultsThresholdUrl, {
        method: 'get',
    });
}
