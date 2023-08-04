/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { store } from '../redux/store';

const PREFIX_STUDY_QUERIES = process.env.REACT_APP_API_GATEWAY + '/study';
export const getWsBase = () =>
    document.baseURI
        .replace(/^http:\/\//, 'ws://')
        .replace(/^https:\/\//, 'wss://');

export function getRequestParamFromList(params, paramName) {
    return new URLSearchParams(
        params?.length ? params.map((param) => [paramName, param]) : []
    );
}

export function getToken() {
    const state = store.getState();
    return state.user.id_token;
}

function parseError(text) {
    try {
        return JSON.parse(text);
    } catch (err) {
        return null;
    }
}

export const FetchStatus = {
    SUCCEED: 'SUCCEED',
    FAILED: 'FAILED',
    IDLE: 'IDLE',
    RUNNING: 'RUNNING',
};

function handleError(response) {
    return response.text().then((text) => {
        const errorName = 'HttpResponseError : ';
        let error;
        const errorJson = parseError(text);
        if (
            errorJson &&
            errorJson.status &&
            errorJson.error &&
            errorJson.message
        ) {
            error = new Error(
                errorName +
                    errorJson.status +
                    ' ' +
                    errorJson.error +
                    ', message : ' +
                    errorJson.message
            );
            error.status = errorJson.status;
        } else {
            error = new Error(
                errorName +
                    response.status +
                    ' ' +
                    response.statusText +
                    ', message : ' +
                    text
            );
            error.status = response.status;
        }
        throw error;
    });
}

function prepareRequest(init, token) {
    if (!(typeof init == 'undefined' || typeof init == 'object')) {
        throw new TypeError(
            'Argument 2 of backendFetch is not an object' + typeof init
        );
    }
    const initCopy = Object.assign({}, init);
    initCopy.headers = new Headers(initCopy.headers || {});
    const tokenCopy = token ? token : getToken();
    initCopy.headers.append('Authorization', 'Bearer ' + tokenCopy);
    return initCopy;
}

function safeFetch(url, initCopy) {
    return fetch(url, initCopy).then((response) =>
        response.ok ? response : handleError(response)
    );
}

export function backendFetch(url, init, token) {
    const initCopy = prepareRequest(init, token);
    return safeFetch(url, initCopy);
}

export function backendFetchText(url, init, token) {
    const initCopy = prepareRequest(init, token);
    return safeFetch(url, initCopy).then((safeResponse) => safeResponse.text());
}

export function backendFetchJson(url, init, token) {
    const initCopy = prepareRequest(init, token);
    return safeFetch(url, initCopy).then((safeResponse) =>
        safeResponse.status === 204 ? null : safeResponse.json()
    );
}

export function fetchDefaultParametersValues() {
    return fetchAppsAndUrls().then((res) => {
        console.info(
            'fecthing default parameters values from apps-metadata file'
        );
        const studyMetadata = res.find((metadata) => metadata.name === 'Study');
        if (!studyMetadata) {
            return Promise.reject(
                'Study entry could not be found in metadatas'
            );
        }

        return studyMetadata.defaultParametersValues;
    });
}

function getStudyUrl(studyUuid) {
    return (
        PREFIX_STUDY_QUERIES + '/v1/studies/' + encodeURIComponent(studyUuid)
    );
}

function getStudyUrlWithNodeUuid(studyUuid, nodeUuid) {
    return (
        PREFIX_STUDY_QUERIES +
        '/v1/studies/' +
        encodeURIComponent(studyUuid) +
        '/nodes/' +
        encodeURIComponent(nodeUuid)
    );
}

export function fetchStudy(studyUuid) {
    console.info(`Fetching study '${studyUuid}' ...`);
    const fetchStudiesUrl = getStudyUrl(studyUuid);
    console.debug(fetchStudiesUrl);
    return backendFetchJson(fetchStudiesUrl);
}

export function fetchStudyExists(studyUuid) {
    console.info(`Fetching study '${studyUuid}' existence ...`);
    const fetchStudiesUrl = getStudyUrl(studyUuid);
    console.debug(fetchStudiesUrl);
    return backendFetch(fetchStudiesUrl, { method: 'head' });
}

export function getNetworkAreaDiagramUrl(
    studyUuid,
    currentNodeUuid,
    voltageLevelsIds,
    depth
) {
    console.info(
        `Getting url of network area diagram of study '${studyUuid}' and node '${currentNodeUuid}'...`
    );
    return (
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-area-diagram?' +
        new URLSearchParams({
            depth: depth,
        }) +
        '&' +
        getQueryParamsList(voltageLevelsIds, 'voltageLevelsIds').toString()
    );
}

export function getQueryParamsList(params, paramName) {
    if (params !== undefined && params.length > 0) {
        const urlSearchParams = new URLSearchParams();
        params.forEach((id) => urlSearchParams.append(paramName, id));
        return urlSearchParams.toString();
    }
    return '';
}

export function fetchReport(studyUuid, currentNodeUuid, nodeOnlyReport) {
    console.info(
        'get report for node : ' +
            currentNodeUuid +
            ' with nodeOnlyReport = ' +
            nodeOnlyReport +
            ' in study ' +
            studyUuid
    );
    return backendFetchJson(
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
            '/report?nodeOnlyReport=' +
            (nodeOnlyReport ? 'true' : 'false')
    );
}

export function fetchSvg(svgUrl) {
    console.debug(svgUrl);
    return backendFetch(svgUrl).then((response) =>
        response.status === 204 ? null : response.json()
    );
}

export function fetchSubstationPositions(
    studyUuid,
    currentNodeUuid,
    substationsIds
) {
    console.info(
        `Fetching substation positions of study '${studyUuid}' and node '${currentNodeUuid}' with ids '${substationsIds}'...`
    );

    const paramsList =
        substationsIds && substationsIds.length > 0
            ? '?' + getQueryParamsList(substationsIds, 'substationId')
            : '';

    const fetchSubstationPositionsUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/geo-data/substations' +
        paramsList;
    console.debug(fetchSubstationPositionsUrl);
    return backendFetchJson(fetchSubstationPositionsUrl);
}

export function searchEquipmentsInfos(
    studyUuid,
    nodeUuid,
    searchTerm,
    getUseNameParameterKey,
    inUpstreamBuiltParentNode,
    equipmentType
) {
    console.info(
        "Fetching equipments infos matching with '%s' term ... ",
        searchTerm
    );
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('userInput', searchTerm);
    urlSearchParams.append('fieldSelector', getUseNameParameterKey());
    if (inUpstreamBuiltParentNode !== undefined) {
        urlSearchParams.append(
            'inUpstreamBuiltParentNode',
            inUpstreamBuiltParentNode
        );
    }
    if (equipmentType !== undefined) {
        urlSearchParams.append('equipmentType', equipmentType);
    }
    return backendFetchJson(
        getStudyUrl(studyUuid) +
            '/nodes/' +
            encodeURIComponent(nodeUuid) +
            '/search?' +
            urlSearchParams.toString()
    );
}

export function fetchLimitViolations(
    studyUuid,
    currentNodeUuid,
    limitReduction
) {
    console.info(
        `Fetching limit violations with (limit reduction ${limitReduction}) ...`
    );
    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/limit-violations?limitReduction=' +
        limitReduction.toString();
    return backendFetchJson(url);
}

export function fetchLinePositions(studyUuid, currentNodeUuid, linesIds) {
    console.info(
        `Fetching line positions of study '${studyUuid}' and node '${currentNodeUuid}' with ids '${linesIds}'...`
    );

    const paramsList =
        linesIds && linesIds.length > 0
            ? '?' + getQueryParamsList(linesIds, 'lineId')
            : '';

    const fetchLinePositionsUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/geo-data/lines' +
        paramsList;

    console.debug(fetchLinePositionsUrl);
    return backendFetchJson(fetchLinePositionsUrl);
}

function getContingencyListsQueryParams(contingencyListNames) {
    if (contingencyListNames.length > 0) {
        const urlSearchParams = new URLSearchParams();
        contingencyListNames.forEach((contingencyListName) =>
            urlSearchParams.append('contingencyListName', contingencyListName)
        );
        return '?' + urlSearchParams.toString();
    }
    return '';
}

export function fetchContingencyCount(
    studyUuid,
    currentNodeUuid,
    contingencyListNames
) {
    console.info(
        `Fetching contingency count for ${contingencyListNames} on '${studyUuid}' and node '${currentNodeUuid}'...`
    );
    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/contingency-count' +
        getContingencyListsQueryParams(contingencyListNames);
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchNetworkModificationTree(studyUuid) {
    console.info('Fetching network modification tree');
    const url = getStudyUrl(studyUuid) + '/tree';
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchNetworkModificationSubtree(studyUuid, parentNodeUuid) {
    console.info('Fetching network modification tree node : ', parentNodeUuid);
    const url =
        getStudyUrl(studyUuid) +
        '/subtree?parentNodeUuid=' +
        encodeURIComponent(parentNodeUuid);
    console.debug(url);
    return backendFetchJson(url);
}

export function copyOrMoveModifications(
    studyUuid,
    targetNodeId,
    modificationToCutUuidList,
    copyInfos
) {
    console.info(copyInfos.copyType + ' modifications');
    const copyOrMoveModificationUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/studies/' +
        encodeURIComponent(studyUuid) +
        '/nodes/' +
        encodeURIComponent(targetNodeId) +
        '?' +
        new URLSearchParams({
            action: copyInfos.copyType,
            originNodeUuid: copyInfos.originNodeUuid ?? '',
        });

    return backendFetch(copyOrMoveModificationUrl, {
        method: 'PUT',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(modificationToCutUuidList),
    });
}

export function getUrlWithToken(baseUrl) {
    if (baseUrl.includes('?')) {
        return baseUrl + '&access_token=' + getToken();
    } else {
        return baseUrl + '?access_token=' + getToken();
    }
}

export function getAvailableExportFormats() {
    console.info('get export formats');
    const getExportFormatsUrl =
        PREFIX_STUDY_QUERIES + '/v1/export-network-formats';
    console.debug(getExportFormatsUrl);
    return backendFetchJson(getExportFormatsUrl);
}

export function fetchAppsAndUrls() {
    console.info(`Fetching apps and urls...`);
    return fetch('env.json')
        .then((res) => res.json())
        .then((res) => {
            return fetch(
                res.appsMetadataServerUrl + '/apps-metadata.json'
            ).then((response) => {
                return response.json();
            });
        });
}

export function fetchMapBoxToken() {
    console.info(`Fetching MapBoxToken...`);
    return fetch('env.json')
        .then((res) => res.json())
        .then((res) => {
            return res.mapBoxToken;
        });
}

export function getAvailableComponentLibraries() {
    console.info('get available component libraries for diagrams');
    const getAvailableComponentLibrariesUrl =
        PREFIX_STUDY_QUERIES + '/v1/svg-component-libraries';
    console.debug(getAvailableComponentLibrariesUrl);
    return backendFetchJson(getAvailableComponentLibrariesUrl);
}

export function buildNode(studyUuid, currentNodeUuid) {
    console.info(
        'Build node ' + currentNodeUuid + ' of study ' + studyUuid + ' ...'
    );
    const url = getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) + '/build';
    console.debug(url);
    return backendFetchText(url, { method: 'post' });
}

export function getExportUrl(studyUuid, nodeUuid, exportFormat) {
    const url =
        getStudyUrlWithNodeUuid(studyUuid, nodeUuid) +
        '/export-network/' +
        exportFormat;
    return getUrlWithToken(url);
}

export function fetchCaseName(studyUuid) {
    console.info('Fetching case name');
    const url = getStudyUrl(studyUuid) + '/case/name';
    console.debug(url);

    return backendFetchText(url);
}

export function isNodeExists(studyUuid, nodeName) {
    const existsNodeUrl =
        getStudyUrl(studyUuid) +
        '/nodes?' +
        new URLSearchParams({
            nodeName: nodeName,
        });
    console.debug(existsNodeUrl);
    return backendFetch(existsNodeUrl, { method: 'head' });
}

export function getUniqueNodeName(studyUuid) {
    const uniqueNodeNameUrl = getStudyUrl(studyUuid) + '/nodes/nextUniqueName';
    console.debug(uniqueNodeNameUrl);
    return backendFetchText(uniqueNodeNameUrl);
}
