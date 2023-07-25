/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    backendFetch,
    backendFetchJson,
    backendFetchText,
} from '../../utils/rest-api';
import { getStudyUrl, getStudyUrlWithNodeUuid } from './index';
import {
    getShortcircuitAnalysisTypeFromEnum,
    ShortcircuitAnalysisType,
} from '../../components/results/shortcircuit/shortcircuit-analysis-result.type';

export function startShortCircuitAnalysis(studyUuid, currentNodeUuid, busId) {
    console.info(
        `Running short circuit analysis on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );

    const urlSearchParams = new URLSearchParams();
    busId && urlSearchParams.append('busId', busId);

    const startShortCircuitAnanysisUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/shortcircuit/run?' +
        urlSearchParams.toString();
    console.debug(startShortCircuitAnanysisUrl);
    return backendFetch(startShortCircuitAnanysisUrl, { method: 'put' });
}

export function fetchShortCircuitAnalysisStatus(
    studyUuid,
    currentNodeUuid,
    type = ShortcircuitAnalysisType.ALL_BUSES
) {
    const analysisType = getShortcircuitAnalysisTypeFromEnum(type);
    console.info(
        `Fetching ${analysisType} short circuit analysis status on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('type', analysisType);
    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/shortcircuit/status?' +
        urlSearchParams.toString();
    console.debug(url);
    return backendFetchText(url);
}

export function fetchOneBusShortCircuitAnalysisStatus(
    studyUuid,
    currentNodeUuid
) {
    return fetchShortCircuitAnalysisStatus(
        studyUuid,
        currentNodeUuid,
        ShortcircuitAnalysisType.ONE_BUS
    );
}

export function fetchShortCircuitAnalysisResult(
    studyUuid,
    currentNodeUuid,
    type = getShortcircuitAnalysisTypeFromEnum(
        ShortcircuitAnalysisType.ALL_BUSES
    )
) {
    console.info(
        `Fetching ${type} short circuit analysis result on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );

    const urlSearchParams = new URLSearchParams();
    type && urlSearchParams.append('type', type);

    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/shortcircuit/result?' +
        urlSearchParams.toString();
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchOneBusShortCircuitAnalysisResult(
    studyUuid,
    currentNodeUuid
) {
    return fetchShortCircuitAnalysisResult(
        studyUuid,
        currentNodeUuid,
        getShortcircuitAnalysisTypeFromEnum(ShortcircuitAnalysisType.ONE_BUS)
    );
}

export function getShortCircuitParameters(studyUuid) {
    console.info('get short-circuit parameters');
    const getShortCircuitParams =
        getStudyUrl(studyUuid) + '/short-circuit-analysis/parameters';
    console.debug(getShortCircuitParams);
    return backendFetchJson(getShortCircuitParams);
}

export function setShortCircuitParameters(studyUuid, newParams) {
    console.info('set short-circuit parameters');
    const setShortCircuitParametersUrl =
        getStudyUrl(studyUuid) + '/short-circuit-analysis/parameters';
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
