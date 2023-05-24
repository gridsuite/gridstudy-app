/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetchJson } from '../utils/rest-api';

const PREFIX_LOADFLOW_SERVER_QUERIES = `${process.env.REACT_APP_API_GATEWAY}/loadflow`;

function getLoadFlowUrl() {
    return `${PREFIX_LOADFLOW_SERVER_QUERIES}/v1/`;
}

export function getLoadFlowSpecificParametersDescription() {
    console.info('get load flow specific parameters description');
    const getLoadFlowSpecificParametersUrl = `${getLoadFlowUrl()}specific-parameters`;
    console.debug(getLoadFlowSpecificParametersUrl);
    return backendFetchJson(getLoadFlowSpecificParametersUrl);
}

export function getLoadFlowProviders() {
    console.info('get load flow providers');
    const getLoadFlowProvidersUrl = `${getLoadFlowUrl()}providers`;
    console.debug(getLoadFlowProvidersUrl);
    return backendFetchJson(getLoadFlowProvidersUrl);
}
