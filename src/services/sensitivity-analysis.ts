/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetchJson } from '@gridsuite/commons-ui';
import { PREFIX_STUDY_QUERIES } from './study';

const PREFIX_SENSITIVITY_ANALYSIS_QUERIES = PREFIX_STUDY_QUERIES + '/v1/sensitivity-analysis';

export function getSensiUrl() {
    return `${PREFIX_SENSITIVITY_ANALYSIS_QUERIES}/`;
}

export function fetchSensitivityAnalysisProviders(): Promise<string[]> {
    console.info('fetch sensitivity analysis providers');
    const url = getSensiUrl() + 'providers';
    console.debug(url);
    return backendFetchJson(url);
}
