/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { PREFIX_STUDY_QUERIES, getStudyUrl, getStudyUrlWithNodeUuid } from './index';
import { backendFetch, backendFetchJson, backendFetchText } from '../utils';
import { UUID } from 'crypto';
import { SensitivityAnalysisParametersInfos } from './sensitivity-analysis.type';

const GET_PARAMETERS_PREFIX = import.meta.env.VITE_API_GATEWAY + '/sensitivity-analysis/v1/parameters';

interface SelectorFilterOptions {
    tabSelection: string;
    functionType: string;
}

interface SensitivityAnalysisFactorsCountParameters {
    injections?: string[];
    monitoredBranches?: string[];
    contingencies?: string[];
    hvdcs?: string[];
    psts?: string[];
}

interface CsvConfig {
    csvHeaders: string[];
    resultTab: string;
    sensitivityFunctionType: string;
}

export function startSensitivityAnalysis(studyUuid: UUID, currentNodeUuid: UUID) {
    console.info(`Running sensi on ${studyUuid} and node ${currentNodeUuid} ...`);
    const startSensiAnalysisUrl = getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) + '/sensitivity-analysis/run';

    console.debug(startSensiAnalysisUrl);
    return backendFetch(startSensiAnalysisUrl, { method: 'post' });
}

export function stopSensitivityAnalysis(studyUuid: UUID, currentNodeUuid: UUID) {
    console.info(`Stopping sensitivity analysis on ${studyUuid} and node ${currentNodeUuid} ...`);
    const stopSensitivityAnalysisUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}/sensitivity-analysis/stop`;
    console.debug(stopSensitivityAnalysisUrl);
    return backendFetch(stopSensitivityAnalysisUrl, { method: 'put' });
}

export function fetchSensitivityAnalysisStatus(studyUuid: UUID, currentNodeUuid: UUID) {
    console.info(`Fetching sensitivity analysis status on ${studyUuid} and node ${currentNodeUuid} ...`);
    const url = `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}/sensitivity-analysis/status`;
    console.debug(url);
    return backendFetchText(url);
}

export function fetchSensitivityAnalysisResult(studyUuid: UUID, currentNodeUuid: UUID, selector: any) {
    console.info(`Fetching sensitivity analysis on ${studyUuid} and node ${currentNodeUuid}  ...`);

    // Add params to Url
    const urlSearchParams = new URLSearchParams();
    const jsoned = JSON.stringify(selector);
    urlSearchParams.append('selector', jsoned);

    const url = `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}/sensitivity-analysis/result?${urlSearchParams}`;
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchSensitivityAnalysisFilterOptions(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    selector: SelectorFilterOptions
) {
    console.info(`Fetching sensitivity analysis filter options on ${studyUuid} and node ${currentNodeUuid}  ...`);

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

export function fetchDefaultSensitivityAnalysisProvider() {
    console.info('fetch default sensitivity analysis provider');
    const url = `${PREFIX_STUDY_QUERIES}/v1/sensitivity-analysis-default-provider`;
    console.debug(url);
    return backendFetchText(url);
}

export function getSensitivityAnalysisParameters(studyUuid: UUID) {
    console.info('get sensitivity analysis parameters');
    const url = getStudyUrl(studyUuid) + '/sensitivity-analysis/parameters';
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchSensitivityAnalysisParameters(parameterUuid: string) {
    console.info('get sensitivity analysis parameters');
    const url = `${GET_PARAMETERS_PREFIX}/${parameterUuid}`;
    console.debug(url);
    return backendFetchJson(url);
}

export function setSensitivityAnalysisParameters(
    studyUuid: UUID | null,
    newParams: SensitivityAnalysisParametersInfos | null
) {
    console.info('set sensitivity analysis parameters');
    const url = getStudyUrl(studyUuid) + '/sensitivity-analysis/parameters';
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

export function getSensitivityAnalysisFactorsCount(
    studyUuid: UUID | null,
    currentNodeUuid: UUID,
    isInjectionsSet: boolean,
    newParams: SensitivityAnalysisFactorsCountParameters
) {
    console.info('get sensitivity analysis parameters computing count');
    const urlSearchParams = new URLSearchParams();
    const jsoned = JSON.stringify(isInjectionsSet);
    urlSearchParams.append('isInjectionsSet', jsoned);
    Object.keys(newParams)
        // @ts-ignore
        .filter((key) => newParams[key])
        // @ts-ignore
        .forEach((key) => urlSearchParams.append(`ids[${key}]`, newParams[key]));

    const url = `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}
      /sensitivity-analysis/factors-count?${urlSearchParams}`;
    console.debug(url);
    return backendFetch(url, {
        method: 'GET',
    });
}

export function exportSensitivityResultsAsCsv(studyUuid: UUID, currentNodeUuid: UUID, csvConfig: CsvConfig) {
    console.info(`Exporting sensitivity analysis on ${studyUuid} and node ${currentNodeUuid} as CSV ...`);

    const url = `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}/sensitivity-analysis/result/csv`;
    console.debug(url);
    return backendFetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(csvConfig),
    });
}
