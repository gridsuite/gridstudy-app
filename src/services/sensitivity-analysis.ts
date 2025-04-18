/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetchJson } from './utils';

const PREFIX_SENSITIVITY_ANALYSIS_SERVER_QUERIES = import.meta.env.VITE_API_GATEWAY + '/sensitivity-analysis';

export function getSensiUrl() {
    return `${PREFIX_SENSITIVITY_ANALYSIS_SERVER_QUERIES}/v1/`;
}

export function fetchSensitivityAnalysisProviders(): Promise<string[]> {
    console.info('fetch sensitivity analysis providers');
    const url = getSensiUrl() + 'providers';
    console.debug(url);
    return backendFetchJson(url);
}
