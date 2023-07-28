/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    backendFetch,
    backendFetchJson,
    backendFetchText,
} from '../../utils/rest-api';
import {
    getStudyUrl,
    getStudyUrlWithNodeUuid,
    PREFIX_STUDY_QUERIES,
} from './index';

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

export function getLoadFlowProvider(studyUuid) {
    console.info('get load flow provider');
    const getLoadFlowProviderUrl =
        getStudyUrl(studyUuid) + '/loadflow/provider';
    console.debug(getLoadFlowProviderUrl);
    return backendFetchText(getLoadFlowProviderUrl);
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

export function startLoadFlow(studyUuid, currentNodeUuid) {
    console.info(
        'Running loadflow on ' +
            studyUuid +
            ' and node ' +
            currentNodeUuid +
            '...'
    );
    const startLoadFlowUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) + '/loadflow/run';
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

export function fetchLoadFlowResult(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching loadflow result on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/loadflow/result';
    console.debug(url);
    return backendFetchJson(url);
}
