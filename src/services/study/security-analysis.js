/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrl, getStudyUrlWithNodeUuid, STUDY_PATHS } from './index';
import {
    backendFetch,
    backendFetchJson,
    backendFetchText,
    getRequestParamFromList,
} from '../../utils/rest-api';

export function stopSecurityAnalysis(studyUuid, currentNodeUuid) {
    console.info(
        `Stopping security analysis on ${studyUuid} and node ${currentNodeUuid} ...`
    );
    const stopSecurityAnalysisUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.securityAnalysis}/stop`;
    console.debug(stopSecurityAnalysisUrl);
    return backendFetch(stopSecurityAnalysisUrl, { method: 'put' });
}

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

    const url = `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
        STUDY_PATHS.securityAnalysis
    }/run?${urlSearchParams}`;

    console.debug(url);
    return backendFetch(url, { method: 'post' });
}

export function fetchSecurityAnalysisResult(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching security analysis on ${studyUuid} and node ${currentNodeUuid} ...`
    );
    const url = `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
        STUDY_PATHS.securityAnalysis
    }/result`;
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchSecurityAnalysisStatus(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching security analysis status on ${studyUuid} and node ${currentNodeUuid} ...`
    );
    const url = `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
        STUDY_PATHS.securityAnalysis
    }/status`;
    console.debug(url);
    return backendFetchText(url);
}

export function fetchSecurityAnalysisProvider(studyUuid) {
    console.info('fetch security analysis provider');
    const url = `${getStudyUrl(studyUuid)}${
        STUDY_PATHS.securityAnalysis
    }/provider`;
    console.debug(url);
    return backendFetchText(url);
}

export function updateSecurityAnalysisProvider(studyUuid, newProvider) {
    console.info('update security analysis provider');
    const url = `${getStudyUrl(studyUuid)}${
        STUDY_PATHS.securityAnalysis
    }/provider`;
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
    const url = `${getStudyUrl()}${
        STUDY_PATHS.securityAnalysisDefaultProvider
    }`;
    console.debug(url);
    return backendFetchText(url);
}
