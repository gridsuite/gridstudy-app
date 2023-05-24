/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetch, backendFetchJson } from '../../utils/rest-api';
import { getStudyUrl, STUDY_PATHS } from './index';

export function setShortCircuitParameters(studyUuid, newParams) {
    console.info('set short-circuit parameters');
    const setShortCircuitParametersUrl = `${getStudyUrl(studyUuid)}${
        STUDY_PATHS.shortCircuitAnalysis
    }/parameters`;
    console.debug(setShortCircuitParametersUrl);
    return backendFetch(setShortCircuitParametersUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newParams),
    });
}

export function getShortCircuitParameters(studyUuid) {
    console.info('get short-circuit parameters');
    const getShortCircuitParams = `${getStudyUrl(studyUuid)}${
        STUDY_PATHS.shortCircuitAnalysis
    }/parameters`;
    console.debug(getShortCircuitParams);
    return backendFetchJson(getShortCircuitParams);
}
