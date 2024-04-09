/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetchJson } from './utils';
import { getStudyUrlWithNodeUuid } from './study/index.js';

const PREFIX_LOADFLOW_SERVER_QUERIES =
    import.meta.env.VITE_API_GATEWAY + '/loadflow';

export function getLoadFlowUrl() {
    return `${PREFIX_LOADFLOW_SERVER_QUERIES}/v1/`;
}

export function getLoadFlowProviders() {
    console.info('get load flow providers');
    const getLoadFlowProvidersUrl = getLoadFlowUrl() + 'providers';
    console.debug(getLoadFlowProvidersUrl);
    return backendFetchJson(getLoadFlowProvidersUrl);
}

export function getLoadFlowSpecificParametersDescription() {
    console.info('get load flow specific parameters description');
    const getLoadFlowSpecificParametersUrl =
        getLoadFlowUrl() + 'specific-parameters';
    console.debug(getLoadFlowSpecificParametersUrl);
    return backendFetchJson(getLoadFlowSpecificParametersUrl);
}

export function fetchLoadflowAvailableLimitTypes(studyUuid, nodeUuid) {
    console.info('fetch available limit types');
    const url = `${getStudyUrlWithNodeUuid(studyUuid, nodeUuid)}/limit-types`;
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchLoadflowAvailableBranchSides(studyUuid, nodeUuid) {
    console.info('fetch available branch sides');

    const url = `${getStudyUrlWithNodeUuid(studyUuid, nodeUuid)}/branch-sides`;
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchLoadflowAvailableComputationStatus(studyUuid, nodeUuid) {
    console.info('fetch available computation status');
    const url = `${getStudyUrlWithNodeUuid(
        studyUuid,
        nodeUuid
    )}/computation-status`;
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchLoadFlowParameters(parameterUuid) {
    console.info('fetch load flow parameters');
    const url =
        getLoadFlowUrl() + 'parameters/' + encodeURIComponent(parameterUuid);
    console.debug(url);
    return backendFetchJson(url);
}
