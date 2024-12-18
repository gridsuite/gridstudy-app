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

const PREFIX_SHORT_CIRCUIT_SERVER_QUERIES = import.meta.env.VITE_API_GATEWAY + '/shortcircuit';

function getShortCircuitUrl() {
    return `${PREFIX_SHORT_CIRCUIT_SERVER_QUERIES}/v1/`;
}

export function startShortCircuitAnalysis(studyUuid, currentNodeUuid, busId) {
    console.info(`Running short circuit analysis on '${studyUuid}' and node '${currentNodeUuid}' ...`);

    const urlSearchParams = new URLSearchParams();
    busId && urlSearchParams.append('busId', busId);

    const startShortCircuitAnalysisUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) + '/shortcircuit/run?' + urlSearchParams.toString();
    console.debug(startShortCircuitAnalysisUrl);
    return backendFetch(startShortCircuitAnalysisUrl, { method: 'put' });
}

export function stopShortCircuitAnalysis(studyUuid, currentNodeUuid) {
    console.info(`Stopping short circuit analysis on '${studyUuid}' and node '${currentNodeUuid}' ...`);
    const stopShortCircuitAnalysisUrl = getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) + '/shortcircuit/stop';
    console.debug(stopShortCircuitAnalysisUrl);
    return backendFetch(stopShortCircuitAnalysisUrl, { method: 'put' });
}

export function fetchShortCircuitAnalysisStatus(studyUuid, currentNodeUuid, type = ShortCircuitAnalysisType.ALL_BUSES) {
    const analysisType = getShortCircuitAnalysisTypeFromEnum(type);
    console.info(
        `Fetching ${analysisType} short circuit analysis status on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('type', analysisType);
    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) + '/shortcircuit/status?' + urlSearchParams.toString();
    console.debug(url);
    return backendFetchText(url);
}

export function fetchOneBusShortCircuitAnalysisStatus(studyUuid, currentNodeUuid) {
    return fetchShortCircuitAnalysisStatus(studyUuid, currentNodeUuid, ShortCircuitAnalysisType.ONE_BUS);
}

export function fetchShortCircuitAnalysisResult({ studyUuid, currentNodeUuid, type }) {
    const analysisType = getShortCircuitAnalysisTypeFromEnum(type);

    console.info(
        `Fetching ${analysisType} short circuit analysis result on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const urlSearchParams = new URLSearchParams();
    if (analysisType) {
        urlSearchParams.append('type', analysisType);
    }

    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) + '/shortcircuit/result?' + urlSearchParams.toString();
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

    const { page = '0', sort, size, filter } = selector;

    urlSearchParams.append('page', page);

    sort?.map((value) => urlSearchParams.append('sort', `${value.colId},${value.sort}`));

    if (size) {
        urlSearchParams.append('size', size);
    }

    if (filter?.length) {
        urlSearchParams.append('filters', JSON.stringify(filter));
    }

    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) + '/shortcircuit/result?' + urlSearchParams.toString();
    console.debug(url);
    return backendFetchJson(url);
}

export function getShortCircuitParameters(studyUuid) {
    console.info('get short-circuit parameters');
    const getShortCircuitParams = getStudyUrl(studyUuid) + '/short-circuit-analysis/parameters';
    console.debug(getShortCircuitParams);
    return backendFetchJson(getShortCircuitParams);
}

export function setShortCircuitParameters(studyUuid, newParams) {
    console.info('set short-circuit parameters');
    const url = getStudyUrl(studyUuid) + '/short-circuit-analysis/parameters';
    console.debug(url);

    return backendFetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: newParams ? JSON.stringify(newParams) : null,
    });
}

export function fetchShortCircuitParameters(parameterUuid) {
    console.info('get short circuit analysis parameters');
    const url = getShortCircuitUrl() + 'parameters/' + encodeURIComponent(parameterUuid);
    return backendFetchJson(url);
}

export function invalidateShortCircuitStatus(studyUuid) {
    console.info('invalidate short circuit status');
    const invalidateShortCircuitStatusUrl = getStudyUrl(studyUuid) + '/short-circuit/invalidate-status';
    console.debug(invalidateShortCircuitStatusUrl);
    return backendFetch(invalidateShortCircuitStatusUrl, {
        method: 'PUT',
    });
}

export function downloadShortCircuitResultZippedCsv(
    studyUuid,
    currentNodeUuid,
    analysisType,
    headersCsv,
    enumValueTranslations
) {
    console.info(`Fetching short-circuit analysis export csv on ${studyUuid} and node ${currentNodeUuid} ...`);
    const url = `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}/shortcircuit/result/csv`;
    const type = getShortCircuitAnalysisTypeFromEnum(analysisType);
    const param = new URLSearchParams({ type });
    const urlWithParam = `${url}?${param.toString()}`;
    console.debug(urlWithParam);
    return backendFetch(urlWithParam, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ headersCsv, enumValueTranslations }),
    });
}
