/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrl, getStudyUrlWithNodeUuidAndRootNetworkUuid, PREFIX_STUDY_QUERIES } from './index';
import { backendFetch, backendFetchJson, backendFetchText } from '@gridsuite/commons-ui';
import type { UUID } from 'node:crypto';
import { ResultsQueryParams } from '../../components/results/common/global-filter/global-filter-types';

export function getDefaultLoadFlowProvider() {
    console.info('get default load flow provier');
    const getDefaultLoadFlowProviderUrl = PREFIX_STUDY_QUERIES + '/v1/loadflow-default-provider';
    console.debug(getDefaultLoadFlowProviderUrl);
    return backendFetchText(getDefaultLoadFlowProviderUrl);
}

export function setLoadFlowParameters(studyUuid: UUID, newParams: any) {
    console.info('set load flow parameters');
    const setLoadFlowParametersUrl = getStudyUrl(studyUuid) + '/loadflow/parameters';
    console.debug(setLoadFlowParametersUrl);
    return backendFetch(setLoadFlowParametersUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: newParams ? JSON.stringify(newParams) : null,
    });
}

export function getLoadFlowParameters(studyUuid: UUID) {
    console.info('get load flow parameters');
    const getLfParams = getStudyUrl(studyUuid) + '/loadflow/parameters';
    console.debug(getLfParams);
    return backendFetchJson(getLfParams);
}

export function getLoadFlowProvider(studyUuid: UUID) {
    console.info('get load flow provider');
    const getLfParams = getStudyUrl(studyUuid) + '/loadflow/provider';
    console.debug(getLfParams);
    return backendFetchText(getLfParams);
}

export function getLoadFlowParametersId(studyUuid: UUID) {
    console.info('get load flow parameters id');
    const getLoadFlowParametersIdUrl = getStudyUrl(studyUuid) + '/loadflow/parameters/id';
    console.debug(getLoadFlowParametersIdUrl);
    return backendFetchText(getLoadFlowParametersIdUrl).then((response) => {
        // Remove quotes if present to return clean UUID string
        return response.replace(/(^"|"$)/g, '');
    });
}

export function setLoadFlowProvider(studyUuid: UUID, newProvider: string) {
    console.info('set load flow provider');
    const setLoadFlowProviderUrl = getStudyUrl(studyUuid) + '/loadflow/provider';
    console.debug(setLoadFlowProviderUrl);
    return backendFetch(setLoadFlowProviderUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: newProvider,
    });
}

export function startLoadFlow(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    withRatioTapChangers: boolean
): Promise<Response> {
    console.info(
        'Running loadflow on study ' +
            studyUuid +
            ', on root network ' +
            currentRootNetworkUuid +
            ' and node ' +
            currentNodeUuid
    );
    const startLoadFlowUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/loadflow/run?withRatioTapChangers=' +
        withRatioTapChangers;
    console.debug(startLoadFlowUrl);
    return backendFetch(startLoadFlowUrl, { method: 'put' });
}

export function stopLoadFlow(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    withRatioTapChangers: boolean
) {
    console.info(
        `Stopping loadFlow on study '${studyUuid}', on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' ...`
    );
    const stopLoadFlowUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/loadflow/stop?withRatioTapChangers=' +
        withRatioTapChangers;
    console.debug(stopLoadFlowUrl);
    return backendFetch(stopLoadFlowUrl, { method: 'put' });
}

export function fetchLoadFlowStatus(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID) {
    console.info(
        `Fetching loadFlow status on study '${studyUuid}', on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' ...`
    );
    const url =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/loadflow/status';
    console.debug(url);
    return backendFetchText(url);
}

export function fetchLoadFlowComputationInfos(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID) {
    console.info(
        `Fetching loadFlow computation infos on '${studyUuid}' on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' ...`
    );
    const url =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/loadflow/computation-infos';
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchLoadFlowResult(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    queryParams: ResultsQueryParams
) {
    console.info(
        `Fetching loadflow result on study '${studyUuid}', on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' ...`
    );
    const { sort, filters } = queryParams || {};
    const params = new URLSearchParams({});

    sort?.map((value) => params.append('sort', `${value.colId},${value.sort}`));

    if (filters?.length) {
        params.append('filters', JSON.stringify(filters));
    }
    const url =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/loadflow/result';
    const urlWithParams = `${url}?${params.toString()}`;
    console.debug(urlWithParams);
    return backendFetchJson(urlWithParams);
}

export function fetchLoadFlowModifications(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID) {
    console.info(
        `Fetching loadflow modifications on study '${studyUuid}', on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' ...`
    );

    const url =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/loadflow/modifications';
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchLimitViolations(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    queryParams: ResultsQueryParams
) {
    console.info(`Fetching limit violations ...`);
    const { sort, filters, globalFilters } = queryParams || {};
    const params = new URLSearchParams({});

    sort?.map((value) => params.append('sort', `${value.colId},${value.sort}`));

    if (filters?.length) {
        params.append('filters', JSON.stringify(filters));
    }

    if (globalFilters && Object.keys(globalFilters).length > 0) {
        params.append('globalFilters', JSON.stringify(globalFilters));
    }

    const url =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/limit-violations';
    const urlWithParams = `${url}?${params.toString()}`;
    console.debug(urlWithParams);
    return backendFetchJson(urlWithParams);
}
