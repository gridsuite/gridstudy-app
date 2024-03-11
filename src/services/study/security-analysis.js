/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    getStudyUrl,
    getStudyUrlWithNodeUuid,
    PREFIX_STUDY_QUERIES,
} from './index';
import {
    backendFetch,
    backendFetchFile,
    backendFetchJson,
    backendFetchText,
    getRequestParamFromList,
} from '../utils';

export function startSecurityAnalysis(
    studyUuid,
    currentNodeUuid,
    contingencyListNames
) {
    console.info(
        `Running security analysis on ${studyUuid} and node ${currentNodeUuid} ...`
    );

    // Add params to Url
    const contingencyListsQueryParams = getRequestParamFromList(
        contingencyListNames,
        'contingencyListName'
    );
    const urlSearchParams = new URLSearchParams(contingencyListsQueryParams);

    const url = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}/security-analysis/run?${urlSearchParams}`;

    console.debug(url);
    return backendFetch(url, { method: 'post' });
}

export function stopSecurityAnalysis(studyUuid, currentNodeUuid) {
    console.info(
        'Stopping security analysis on ' +
            studyUuid +
            ' and node ' +
            currentNodeUuid +
            ' ...'
    );
    const stopSecurityAnalysisUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/security-analysis/stop';
    console.debug(stopSecurityAnalysisUrl);
    return backendFetch(stopSecurityAnalysisUrl, { method: 'put' });
}

export function fetchSecurityAnalysisResult(
    studyUuid,
    currentNodeUuid,
    queryParams
) {
    console.info(
        `Fetching security analysis on ${studyUuid} and node ${currentNodeUuid} ...`
    );
    const url = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}/security-analysis/result`;

    const { resultType, page, size, sort, filters } = queryParams || {};

    const params = new URLSearchParams({ resultType });

    sort?.map((value) => params.append('sort', `${value.colId},${value.sort}`));

    if (filters?.length) {
        params.append('filters', JSON.stringify(filters));
    }

    if (typeof page === 'number') {
        params.append('page', page);
        params.append('size', size);
    }

    const urlWithParams = `${url}?${params.toString()}`;
    console.debug(urlWithParams);
    return backendFetchJson(urlWithParams);
}

export function downloadSecurityAnalysisResultZippedCsv(
    studyUuid,
    currentNodeUuid,
    queryParams,
    headers,
    enumValueTranslations
) {
    console.info(
        `Fetching security analysis zipped csv on ${studyUuid} and node ${currentNodeUuid} ...`
    );
    const url = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}/security-analysis/result/csv`;

    const { resultType } = queryParams || {};

    const params = new URLSearchParams({ resultType });

    const urlWithParams = `${url}?${params.toString()}`;
    console.debug(urlWithParams);
    return backendFetchFile(urlWithParams, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            headers,
            enumValueTranslations: enumValueTranslations,
        }),
    });
}

export function fetchSecurityAnalysisStatus(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching security analysis status on ${studyUuid} and node ${currentNodeUuid} ...`
    );

    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/security-analysis/status';
    console.debug(url);
    return backendFetchText(url);
}

export function updateSecurityAnalysisProvider(studyUuid, newProvider) {
    console.info('update security analysis provider');
    const url = getStudyUrl(studyUuid) + '/security-analysis/provider';
    console.debug(url);
    return backendFetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: newProvider,
    });
}

export function fetchDefaultSecurityAnalysisProvider() {
    console.info('fetch default security analysis provider');
    const url = PREFIX_STUDY_QUERIES + '/v1/security-analysis-default-provider';
    console.debug(url);
    return backendFetchText(url);
}

export function getSecurityAnalysisParameters(studyUuid) {
    console.info('get security analysis parameters');
    const url = getStudyUrl(studyUuid) + '/security-analysis/parameters';
    console.debug(url);
    return backendFetchJson(url);
}

export function setSecurityAnalysisParameters(studyUuid, newParams) {
    console.info('set security analysis parameters');
    const url = getStudyUrl(studyUuid) + '/security-analysis/parameters';
    console.debug(url);
    return backendFetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newParams),
    });
}
