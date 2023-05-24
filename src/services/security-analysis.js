/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetchJson } from '../utils/rest-api';

const PREFIX_SECURITY_ANALYSIS_SERVER_QUERIES = `${process.env.REACT_APP_API_GATEWAY}/security-analysis`;

function getSecurityAnalysisUrl() {
    return `${PREFIX_SECURITY_ANALYSIS_SERVER_QUERIES}/v1/`;
}

export function fetchSecurityAnalysisProviders() {
    console.info('fetch security analysis providers');
    const url = `${getSecurityAnalysisUrl()}providers`;
    console.debug(url);
    return backendFetchJson(url);
}
