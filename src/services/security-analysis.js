/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetchJson } from './utils';

const PREFIX_SECURITY_ANALYSIS_SERVER_QUERIES =
    import.meta.env.VITE_API_GATEWAY + '/security-analysis';

function getSecurityAnalysisUrl() {
    return `${PREFIX_SECURITY_ANALYSIS_SERVER_QUERIES}/v1/`;
}

export function fetchSecurityAnalysisProviders() {
    console.info('fetch security analysis providers');
    const url = getSecurityAnalysisUrl() + 'providers';
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchSecurityAnalysisAvailableLimitTypes(studyUuid, nodeUuid) {
    console.info('fetch available limit types');
    const url = getSecurityAnalysisUrl() + 'limit-types';
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchSecurityAnalysisAvailableBranchSides(studyUuid, nodeUuid) {
    console.info('fetch available branch sides');
    const url = getSecurityAnalysisUrl() + 'branch-sides';
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchSecurityAnalysisAvailableComputationStatus(
    studyUuid,
    nodeUuid
) {
    console.info('fetch available computation status');
    const url = getSecurityAnalysisUrl() + 'computation-status';
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchSecurityAnalysisParameters(parameterUuid) {
    console.info('fetch security analysis parameters');
    const url =
        getSecurityAnalysisUrl() +
        'parameters/' +
        encodeURIComponent(parameterUuid);
    console.debug(url);
    return backendFetchJson(url);
}
