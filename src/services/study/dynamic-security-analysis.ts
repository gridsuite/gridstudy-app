/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrl, getStudyUrlWithNodeUuid, PREFIX_STUDY_QUERIES } from './index';

import { backendFetch, backendFetchJson, backendFetchText } from '../utils';
import { UUID } from 'crypto';
import { DynamicSecurityAnalysisParametersInfos } from './dynamic-security-analysis.type';

const PREFIX_DYNAMIC_SECURITY_ANALYSIS_SERVER_QUERIES = import.meta.env.VITE_API_GATEWAY + '/dynamic-security-analysis';

function getDynamicSecurityAnalysisUrl() {
    return `${PREFIX_DYNAMIC_SECURITY_ANALYSIS_SERVER_QUERIES}/v1/`;
}

export function fetchDynamicSecurityAnalysisProviders() {
    console.info('fetch dynamic simulation providers');
    const url = getDynamicSecurityAnalysisUrl() + 'providers';
    console.debug(url);
    return backendFetchJson(url);
}

export function startDynamicSecurityAnalysis(studyUuid: UUID, currentNodeUuid: UUID) {
    console.info(`Running dynamic security analysis on '${studyUuid}' and node '${currentNodeUuid}' ...`);

    const startDynamicSecurityAnalysisUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}/dynamic-security-analysis/run`;

    console.debug({ startDynamicSecurityAnalysisUrl });

    return backendFetch(startDynamicSecurityAnalysisUrl, {
        method: 'post',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });
}

export function stopDynamicSecurityAnalysis(studyUuid: UUID, currentNodeUuid: UUID) {
    console.info(`Stopping dynamic security analysis on '${studyUuid}' and node '${currentNodeUuid}' ...`);
    const stopDynamicSecurityAnalysisUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) + '/dynamic-security-analysis/stop';
    console.debug(stopDynamicSecurityAnalysisUrl);
    return backendFetch(stopDynamicSecurityAnalysisUrl, { method: 'put' });
}

export function fetchDynamicSecurityAnalysisStatus(studyUuid: UUID, currentNodeUuid: UUID) {
    console.info(`Fetching dynamic security analysis status on '${studyUuid}' and node '${currentNodeUuid}' ...`);
    const url = getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) + '/dynamic-security-analysis/status';
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchDynamicSecurityAnalysisProvider(studyUuid: UUID) {
    console.info('fetch dynamic security analysis provider');
    const url = getStudyUrl(studyUuid) + '/dynamic-security-analysis/provider';
    console.debug(url);
    return backendFetchText(url);
}

export function fetchDefaultDynamicSecurityAnalysisProvider() {
    console.info('fetch default dynamic security analysis provider');
    const url = PREFIX_STUDY_QUERIES + '/v1/dynamic-security-analysis-default-provider';
    console.debug(url);
    return backendFetchText(url);
}

export function updateDynamicSecurityAnalysisProvider(studyUuid: UUID, newProvider: string) {
    console.info('update dynamic security analysis provider');
    const url = getStudyUrl(studyUuid) + '/dynamic-security-analysis-/provider';
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

export function fetchDynamicSecurityAnalysisParameters(
    studyUuid: UUID
): Promise<DynamicSecurityAnalysisParametersInfos> {
    console.info(`Fetching dynamic security analysis parameters on '${studyUuid}' ...`);
    const url = getStudyUrl(studyUuid) + '/dynamic-security-analysis/parameters';
    console.debug(url);
    return backendFetchJson(url);
}

export function updateDynamicSecurityAnalysisParameters(studyUuid: UUID, newParams: any) {
    console.info('set dynamic security analysis parameters');
    const url = getStudyUrl(studyUuid) + '/dynamic-security-analysis/parameters';
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
