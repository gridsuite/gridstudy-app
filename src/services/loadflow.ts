/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetchJson } from './utils';

const PREFIX_LOADFLOW_SERVER_QUERIES = import.meta.env.VITE_API_GATEWAY + '/loadflow';

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
    const getLoadFlowSpecificParametersUrl = getLoadFlowUrl() + 'specific-parameters';
    console.debug(getLoadFlowSpecificParametersUrl);
    return backendFetchJson(getLoadFlowSpecificParametersUrl);
}

export function getLoadFlowDefaultLimitReductions() {
    console.info('get load flow default limit reductions');
    const getLoadFlowDefaultLimitReductionsUrl = getLoadFlowUrl() + 'parameters/default-limit-reductions';
    console.debug(getLoadFlowDefaultLimitReductionsUrl);
    return backendFetchJson(getLoadFlowDefaultLimitReductionsUrl);
}

export function fetchLoadFlowParameters(parameterUuid: string) {
    console.info('fetch load flow parameters');
    const url = getLoadFlowUrl() + 'parameters/' + encodeURIComponent(parameterUuid);
    console.debug(url);
    return backendFetchJson(url);
}
