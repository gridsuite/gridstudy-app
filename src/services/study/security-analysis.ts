/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrl, getStudyUrlWithNodeUuidAndRootNetworkUuid, PREFIX_STUDY_QUERIES } from './index';
import { getRequestParamFromList } from '../utils';
import type { UUID } from 'node:crypto';
import { backendFetch, backendFetchFile, backendFetchJson, backendFetchText, GsLangUser } from '@gridsuite/commons-ui';
import { SecurityAnalysisQueryParams } from '../../components/results/securityanalysis/security-analysis.type';

export function startSecurityAnalysis(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    contingencyListUuids: UUID[]
): Promise<Response> {
    console.info(
        `Running security analysis on ${studyUuid} on root network ${currentRootNetworkUuid} and node ${currentNodeUuid} ...`
    );
    // Add params to Url
    const contingencyListsQueryParams = getRequestParamFromList(contingencyListUuids, 'contingencyListName');
    const urlSearchParams = new URLSearchParams(contingencyListsQueryParams);

    const url = `${getStudyUrlWithNodeUuidAndRootNetworkUuid(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid
    )}/security-analysis/run?${urlSearchParams}`;

    console.debug(url);
    return backendFetch(url, { method: 'post' });
}

export function stopSecurityAnalysis(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID) {
    console.info('Stopping security analysis on ' + studyUuid + ' and node ' + currentNodeUuid + ' ...');
    const stopSecurityAnalysisUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/security-analysis/stop';
    console.debug(stopSecurityAnalysisUrl);
    return backendFetch(stopSecurityAnalysisUrl, { method: 'put' });
}

export function fetchSecurityAnalysisResult(
    studyUuid: string,
    currentNodeUuid: string,
    currentRootNetworkUuid: string,
    queryParams: SecurityAnalysisQueryParams
) {
    console.info(`Fetching security analysis on ${studyUuid} and node ${currentNodeUuid} ...`);
    const url = `${getStudyUrlWithNodeUuidAndRootNetworkUuid(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid
    )}/security-analysis/result`;
    const params = getSecurityAnalysisQueryParams(queryParams);

    const { page, size } = queryParams || {};
    if (typeof page === 'number' && typeof size === 'number') {
        params.append('page', page.toString());
        params.append('size', size.toString());
    }

    const urlWithParams = `${url}?${params.toString()}`;
    console.debug(urlWithParams);
    return backendFetchJson(urlWithParams);
}

export function downloadSecurityAnalysisResultZippedCsv(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    queryParams: SecurityAnalysisQueryParams,
    headers: string[] | undefined,
    enumValueTranslations: Record<string, string>,
    language: GsLangUser
) {
    console.info(
        `Fetching security analysis zipped csv on ${studyUuid} on root network  ${currentRootNetworkUuid} and node ${currentNodeUuid} ...`
    );
    const url = `${getStudyUrlWithNodeUuidAndRootNetworkUuid(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid
    )}/security-analysis/result/csv`;
    const params = getSecurityAnalysisQueryParams(queryParams);

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
            language: language,
        }),
    });
}

export function fetchSecurityAnalysisStatus(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID) {
    console.info(
        `Fetching security analysis status on ${studyUuid} on root network '${currentRootNetworkUuid}' and node ${currentNodeUuid} ...`
    );
    const url =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/security-analysis/status';
    console.debug(url);
    return backendFetchText(url);
}

export function updateSecurityAnalysisProvider(studyUuid: UUID, newProvider: string) {
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

export function getSecurityAnalysisParameters(studyUuid: UUID) {
    console.info('get security analysis parameters');
    const url = getStudyUrl(studyUuid) + '/security-analysis/parameters';
    console.debug(url);
    return backendFetchJson(url);
}

export function setSecurityAnalysisParameters(studyUuid: UUID, newParams: any) {
    console.info('set security analysis parameters');
    const url = getStudyUrl(studyUuid) + '/security-analysis/parameters';
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

function getSecurityAnalysisQueryParams(queryParams: SecurityAnalysisQueryParams) {
    const { resultType, globalFilters, filters, sort } = queryParams;
    const params = new URLSearchParams({ resultType });

    sort?.forEach((value: any) => params.append('sort', `${value.colId},${value.sort}`));
    if (filters?.length) {
        params.append('filters', JSON.stringify(filters));
    }
    if (globalFilters && Object.keys(globalFilters).length > 0) {
        params.append('globalFilters', JSON.stringify(globalFilters));
    }

    return params;
}
