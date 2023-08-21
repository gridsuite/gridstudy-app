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

export function fetchSecurityAnalysisResult(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching security analysis on ${studyUuid} and node ${currentNodeUuid} ...`
    );
    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/security-analysis/result';
    console.debug(url);
    return backendFetchJson(url);
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

export function fetchSecurityAnalysisProvider(studyUuid) {
    console.info('fetch security analysis provider');
    const url = getStudyUrl(studyUuid) + '/security-analysis/provider';
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
