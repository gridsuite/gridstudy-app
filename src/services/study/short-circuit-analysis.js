/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrl, getStudyUrlWithNodeUuid } from './index';
import {
    getShortCircuitAnalysisTypeFromEnum,
    ShortCircuitAnalysisType,
} from '../../components/results/shortcircuit/shortcircuit-analysis-result.type';
import { backendFetch, backendFetchJson, backendFetchText } from '../utils';

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

export function stopShortCircuitAnalysis(studyUuid, currentNodeUuid) {
    console.info(
        `Stopping short circuit analysis on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const stopShortCircuitAnalysisUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/shortcircuit/stop';
    console.debug(stopShortCircuitAnalysisUrl);
    return backendFetch(stopShortCircuitAnalysisUrl, { method: 'put' });
}

export function fetchShortCircuitAnalysisStatus(
    studyUuid,
    currentNodeUuid,
    type = ShortCircuitAnalysisType.ALL_BUSES
) {
    const analysisType = getShortCircuitAnalysisTypeFromEnum(type);
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
        ShortCircuitAnalysisType.ONE_BUS
    );
}

export function fetchShortCircuitAnalysisResult({
    studyUuid,
    currentNodeUuid,
    type,
    mode,
}) {
    const analysisType = getShortCircuitAnalysisTypeFromEnum(type);

    console.info(
        `Fetching ${analysisType} short circuit analysis result on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );

    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('mode', mode);
    if (analysisType) {
        urlSearchParams.append('type', analysisType);
    }

    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/shortcircuit/result?' +
        urlSearchParams.toString();
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchShortCircuitAnalysisPagedResults({
    studyUuid,
    currentNodeUuid,
    selector = {},
    type = ShortCircuitAnalysisType.ALL_BUSES,
}) {
    const analysisType = getShortCircuitAnalysisTypeFromEnum(type);

    console.info(
        `Fetching ${analysisType} short circuit analysis result on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );

    const urlSearchParams = new URLSearchParams();

    urlSearchParams.append('paged', 'true');

    if (analysisType) {
        urlSearchParams.append('type', analysisType);
    }

    const { page = '0', sort, size, filter } = selector || {};

    urlSearchParams.append('page', page);

    if (sort) {
        const { colKey, sortValue } = sort;
        if (colKey && sortValue) {
            urlSearchParams.append('sort', `${colKey},${sortValue}`);
        }
    }
    // sort.map((s) => urlSearchParams.append('sort', `${s.colId},${s.sort}`));

    if (size) {
        urlSearchParams.append('size', size);
    }

    if (filter?.length) {
        urlSearchParams.append('filters', JSON.stringify(filter));
    }

    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/shortcircuit/result?' +
        urlSearchParams.toString();
    console.debug(url);
    return backendFetchJson(url);
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

export function fetchShortCircuitFaultTypes() {
    console.info('Fetch short-circuit fault types');
    const getShortCircuitParams =
        process.env.REACT_APP_API_GATEWAY + '/shortcircuit/v1/fault-types';
    console.debug(getShortCircuitParams);
    return backendFetchJson(getShortCircuitParams);
}

export function fetchShortCircuitLimitViolationTypes() {
    console.info('Fetch short-circuit limit violation types');
    const getShortCircuitParams =
        process.env.REACT_APP_API_GATEWAY +
        '/shortcircuit/v1/limit-violation-types';
    console.debug(getShortCircuitParams);
    return backendFetchJson(getShortCircuitParams);
}
