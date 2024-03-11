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
import { backendFetch, backendFetchJson, backendFetchText } from '../utils';

export function getDefaultLoadFlowProvider() {
    console.info('get default load flow provier');
    const getDefaultLoadFlowProviderUrl =
        PREFIX_STUDY_QUERIES + '/v1/loadflow-default-provider';
    console.debug(getDefaultLoadFlowProviderUrl);
    return backendFetchText(getDefaultLoadFlowProviderUrl);
}

export function setLoadFlowParameters(studyUuid, newParams) {
    console.info('set load flow parameters');
    const setLoadFlowParametersUrl =
        getStudyUrl(studyUuid) + '/loadflow/parameters';
    console.debug(setLoadFlowParametersUrl);
    return backendFetch(setLoadFlowParametersUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newParams),
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
    const setLoadFlowProviderUrl =
        getStudyUrl(studyUuid) + '/loadflow/provider';
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

export function startLoadFlow(studyUuid, currentNodeUuid, limitReduction) {
    console.info(
        'Running loadflow on ' +
            studyUuid +
            ' and node ' +
            currentNodeUuid +
            ' with limit reduction ' +
            limitReduction
    );
    const startLoadFlowUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/loadflow/run?limitReduction=' +
        limitReduction.toString();
    console.debug(startLoadFlowUrl);
    return backendFetch(startLoadFlowUrl, { method: 'put' });
}

export function stopLoadFlow(studyUuid, currentNodeUuid) {
    console.info(
        `Stopping loadFlow on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const stopLoadFlowUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) + '/loadflow/stop';
    console.debug(stopLoadFlowUrl);
    return backendFetch(stopLoadFlowUrl, { method: 'put' });
}

export function fetchLoadFlowStatus(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching loadFlow status on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/loadflow/status';
    console.debug(url);
    return backendFetchText(url);
}

export function fetchLoadFlowResult(studyUuid, currentNodeUuid, queryParams) {
    console.info(
        `Fetching loadflow result on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const { sort, filters } = queryParams || {};
    const params = new URLSearchParams({});

    if (sort?.colKey && sort?.sortWay) {
        params.append('sort', `${sort.colKey},${sort.sortWay}`);
    }

    if (filters?.length) {
        params.append('filters', JSON.stringify(filters));
    }
    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/loadflow/result';
    const urlWithParams = `${url}?${params.toString()}`;
    console.debug(urlWithParams);
    return backendFetchJson(urlWithParams);
}

export function fetchLimitViolations(studyUuid, currentNodeUuid, queryParams) {
    console.info(`Fetching limit violations ...`);
    const { sort, filters } = queryParams || {};
    const params = new URLSearchParams({});

    sort?.map((value) => params.append('sort', `${value.colId},${value.sort}`));

    if (filters?.length) {
        params.append('filters', JSON.stringify(filters));
    }

    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/limit-violations';
    const urlWithParams = `${url}?${params.toString()}`;
    console.debug(urlWithParams);
    return backendFetchJson(urlWithParams);
}

export function invalidateLoadFlowStatus(studyUuid) {
    console.info('invalidate loadflow status');
    const invalidateLoadFlowStatusUrl =
        getStudyUrl(studyUuid) + '/loadflow/invalidate-status';
    console.debug(invalidateLoadFlowStatusUrl);
    return backendFetch(invalidateLoadFlowStatusUrl, {
        method: 'PUT',
    });
}
