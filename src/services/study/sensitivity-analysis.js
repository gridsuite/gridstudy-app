/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    PREFIX_STUDY_QUERIES,
    getStudyUrl,
    getStudyUrlWithNodeUuid,
} from './index';
import { backendFetch, backendFetchJson, backendFetchText } from '../utils';

export function startSensitivityAnalysis(studyUuid, currentNodeUuid) {
    console.info(
        `Running sensi on ${studyUuid} and node ${currentNodeUuid} ...`
    );
    const startSensiAnalysisUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/sensitivity-analysis/run';

    console.debug(startSensiAnalysisUrl);
    return backendFetch(startSensiAnalysisUrl, { method: 'post' });
}

export function stopSensitivityAnalysis(studyUuid, currentNodeUuid) {
    console.info(
        `Stopping sensitivity analysis on ${studyUuid} and node ${currentNodeUuid} ...`
    );
    const stopSensitivityAnalysisUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}/sensitivity-analysis/stop`;
    console.debug(stopSensitivityAnalysisUrl);
    return backendFetch(stopSensitivityAnalysisUrl, { method: 'put' });
}

export function fetchSensitivityAnalysisStatus(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching sensitivity analysis status on ${studyUuid} and node ${currentNodeUuid} ...`
    );
    const url = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}/sensitivity-analysis/status`;
    console.debug(url);
    return backendFetchText(url);
}

export function fetchSensitivityAnalysisResult(
    studyUuid,
    currentNodeUuid,
    selector
) {
    console.info(
        `Fetching sensitivity analysis on ${studyUuid} and node ${currentNodeUuid}  ...`
    );

    // Add params to Url
    const urlSearchParams = new URLSearchParams();
    const jsoned = JSON.stringify(selector);
    urlSearchParams.append('selector', jsoned);

    const url = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}/sensitivity-analysis/result?${urlSearchParams}`;
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchSensitivityAnalysisFilterOptions(
    studyUuid,
    currentNodeUuid,
    selector
) {
    console.info(
        `Fetching sensitivity analysis filter options on ${studyUuid} and node ${currentNodeUuid}  ...`
    );

    // Add params to Url
    const urlSearchParams = new URLSearchParams();
    const jsoned = JSON.stringify(selector);
    urlSearchParams.append('selector', jsoned);

    const url = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}/sensitivity-analysis/result/filter-options?${urlSearchParams}`;
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchSensitivityAnalysisProvider(studyUuid) {
    console.info('fetch sensitivity analysis provider');
    const url = `${getStudyUrl(studyUuid)}/sensitivity-analysis/provider`;
    console.debug(url);
    return backendFetchText(url);
}

export function updateSensitivityAnalysisProvider(studyUuid, newProvider) {
    console.info('update sensitivity analysis provider');
    const url = `${getStudyUrl(studyUuid)}/sensitivity-analysis/provider`;
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

export function fetchDefaultSensitivityAnalysisProvider() {
    console.info('fetch default sensitivity analysis provider');
    const url = `${PREFIX_STUDY_QUERIES}/v1/sensitivity-analysis-default-provider`;
    console.debug(url);
    return backendFetchText(url);
}

export function getSensitivityAnalysisParameters(studyUuid) {
    console.info('get sensitivity analysis parameters');
    const url = getStudyUrl(studyUuid) + '/sensitivity-analysis/parameters';
    console.debug(url);
    return backendFetchJson(url);
}

export function setSensitivityAnalysisParameters(studyUuid, newParams) {
    console.info('set sensitivity analysis parameters');
    const url = getStudyUrl(studyUuid) + '/sensitivity-analysis/parameters';
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

export function getSensitivityAnalysisFactorsCount(
    studyUuid,
    isInjectionsSet,
    newParams
) {
    console.info('get sensitivity analysis parameters computing count');
    const urlSearchParams = new URLSearchParams();
    const jsoned = JSON.stringify(isInjectionsSet);
    urlSearchParams.append('isInjectionsSet', jsoned);

    const url =
        getStudyUrl(studyUuid) +
        `/sensitivity-analysis/factors-count?${urlSearchParams}`;
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

export function exportSensitivityResultsAsCsv3(
    studyUuid,
    currentNodeUuid,
    selector
) {
    console.info(
        `Exporting sensitivity analysis on ${studyUuid} and node ${currentNodeUuid} as CSV ...`
    );

    // Add params to Url
    const urlSearchParams = new URLSearchParams();
    const jsoned = JSON.stringify(selector);
    urlSearchParams.append('selector', jsoned);

    const url = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}/sensitivity-analysis/result/csv-StreamingResponseBody?${urlSearchParams}`;
    console.debug(url);
    return backendFetch(url, {
        method: 'GET',
        headers: {
            Accept: 'application/octet-stream',
            'Content-Type': 'application/octet-stream',
        },
    });
}
