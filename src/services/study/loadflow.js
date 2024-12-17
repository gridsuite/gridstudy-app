/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrl, getStudyUrlWithNodeUuidAndRootNetworkUuid, PREFIX_STUDY_QUERIES } from './index';
import { backendFetch, backendFetchJson, backendFetchText } from '../utils';

export function getDefaultLoadFlowProvider() {
    console.info('get default load flow provier');
    const getDefaultLoadFlowProviderUrl = PREFIX_STUDY_QUERIES + '/v1/loadflow-default-provider';
    console.debug(getDefaultLoadFlowProviderUrl);
    return backendFetchText(getDefaultLoadFlowProviderUrl);
}

export function setLoadFlowParameters(studyUuid, newParams) {
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

export function getLoadFlowParameters(studyUuid) {
    console.info('get load flow parameters');
    const getLfParams = getStudyUrl(studyUuid) + '/loadflow/parameters';
    console.debug(getLfParams);
    return backendFetchJson(getLfParams);
}

export function setLoadFlowProvider(studyUuid, newProvider) {
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

export function startLoadFlow(studyUuid, currentNodeUuid, currentRootNetworkUuid, limitReduction) {
    console.info(
        'Running loadflow on ' + studyUuid + ' and node ' + currentNodeUuid + ' with limit reduction ' + limitReduction
    );
    const startLoadFlowUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid) +
        '/loadflow/run?limitReduction=' +
        limitReduction.toString();
    console.debug(startLoadFlowUrl);
    return backendFetch(startLoadFlowUrl, { method: 'put' });
}

export function stopLoadFlow(studyUuid, currentNodeUuid, currentRootNetworkUuid) {
    console.info(`Stopping loadFlow on '${studyUuid}' and node '${currentNodeUuid}' ...`);
    const stopLoadFlowUrl = getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid) + '/loadflow/stop';
    console.debug(stopLoadFlowUrl);
    return backendFetch(stopLoadFlowUrl, { method: 'put' });
}

export function fetchLoadFlowStatus(studyUuid, currentNodeUuid, currentRootNetworkUuid) {
    console.info(`Fetching loadFlow status on '${studyUuid}' and node '${currentNodeUuid}' ...`);
    const url =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/loadflow/status';
    console.debug(url);
    return backendFetchText(url);
}

export function fetchLoadFlowResult(studyUuid, currentNodeUuid, currentRootNetworkUuid, queryParams) {
    console.info(`Fetching loadflow result on '${studyUuid}' and node '${currentNodeUuid}' ...`);
    const { sort, filters } = queryParams || {};
    const params = new URLSearchParams({});

    sort?.map((value) => params.append('sort', `${value.colId},${value.sort}`));

    if (filters?.length) {
        params.append('filters', JSON.stringify(filters));
    }
    const url = getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid) + '/loadflow/result';
    const urlWithParams = `${url}?${params.toString()}`;
    console.debug(urlWithParams);
    return backendFetchJson(urlWithParams);
}

export function fetchLimitViolations(studyUuid, currentNodeUuid, currentRootNetworkUuid, queryParams) {
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

    const url = getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid) + '/limit-violations';
    const urlWithParams = `${url}?${params.toString()}`;
    console.debug(urlWithParams);
    return backendFetchJson(urlWithParams);
}

export function invalidateLoadFlowStatus(studyUuid) {
    console.info('invalidate loadflow status');
    const invalidateLoadFlowStatusUrl = getStudyUrl(studyUuid) + '/loadflow/invalidate-status';
    console.debug(invalidateLoadFlowStatusUrl);
    return backendFetch(invalidateLoadFlowStatusUrl, {
        method: 'PUT',
    });
}
