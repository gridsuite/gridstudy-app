/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetchJson } from './utils';

const PREFIX_LOADFLOW_SERVER_QUERIES = `${process.env.REACT_APP_API_GATEWAY}/loadflow`;

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

export function fetchLoadflowAvailableLimitTypes() {
    console.info('fetch available limit types');
    const url = getLoadFlowUrl() + 'limit-types';
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchLoadflowAvailableBranchSides() {
    console.info('fetch available branch sides');
    const url = getLoadFlowUrl() + 'branch-sides';
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchLoadflowAvailableComputationStatus() {
    console.info('fetch available computation status');
    const url = getLoadFlowUrl() + 'computation-status';
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
