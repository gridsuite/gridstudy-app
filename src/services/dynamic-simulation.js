/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetchJson } from '../utils/rest-api';

const PREFIX_DYNAMIC_SIMULATION_SERVER_QUERIES = `${process.env.REACT_APP_API_GATEWAY}/dynamic-simulation`;

// -- Parameters API - BEGIN
function getDynamicSimulationUrl() {
    return `${PREFIX_DYNAMIC_SIMULATION_SERVER_QUERIES}/v1/`;
}

export function fetchDynamicSimulationProviders() {
    console.info('fetch dynamic simulation providers');
    const url = `${getDynamicSimulationUrl()}providers`;
    console.debug(url);
    return backendFetchJson(url);
}
