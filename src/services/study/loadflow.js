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
} from '../../utils/rest-api';

function getLoadFlowPath(studyUuid, currentNodeUuid) {
    return `${
        currentNodeUuid
            ? getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)
            : getStudyUrl(studyUuid)
    }${STUDY_PATHS.loadflow}`;
}

export function startLoadFlow(studyUuid, currentNodeUuid) {
    console.info(
        `Running loadflow on ${studyUuid} and node ${currentNodeUuid}...`
    );
    const startLoadFlowUrl = `${getLoadFlowPath(
        studyUuid,
        currentNodeUuid
    )}/run`;
    console.debug(startLoadFlowUrl);
    return backendFetch(startLoadFlowUrl, { method: 'put' });
}

export function setLoadFlowParameters(studyUuid, newParams) {
    console.info('set load flow parameters');
    const setLoadFlowParametersUrl = `${getLoadFlowPath(studyUuid)}/parameters`;
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
    const getLfParams = `${getLoadFlowPath(studyUuid)}/parameters`;
    console.debug(getLfParams);
    return backendFetchJson(getLfParams);
}

export function getLoadFlowProvider(studyUuid) {
    console.info('get load flow provider');
    const getLoadFlowProviderUrl = `${getLoadFlowPath(studyUuid)}/provider`;
    console.debug(getLoadFlowProviderUrl);
    return backendFetchText(getLoadFlowProviderUrl);
}

export function setLoadFlowProvider(studyUuid, newProvider) {
    console.info('set load flow provider');
    const setLoadFlowProviderUrl = `${getLoadFlowPath(studyUuid)}/provider`;
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

export function fetchLoadFlowInfos(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching loadflow infos (status and result) for '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const fetchLoadFlowInfosUrl = `${getLoadFlowPath(
        studyUuid,
        currentNodeUuid
    )}/infos`;
    return backendFetchJson(fetchLoadFlowInfosUrl);
}

export function getDefaultLoadFlowProvider() {
    console.info('get default load flow provider');
    const getDefaultLoadFlowProviderUrl = `${getStudyUrl()}${
        STUDY_PATHS.loadflowDefaultProvider
    }`;
    console.debug(getDefaultLoadFlowProviderUrl);
    return backendFetchText(getDefaultLoadFlowProviderUrl);
}
