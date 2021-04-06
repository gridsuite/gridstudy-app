/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { store } from '../redux/store';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { APP_NAME, getAppName } from './config-params';

const PREFIX_CASE_QUERIES = process.env.REACT_APP_API_GATEWAY + '/case';
const PREFIX_STUDY_QUERIES = process.env.REACT_APP_API_GATEWAY + '/study';
const PREFIX_ACTIONS_QUERIES = process.env.REACT_APP_API_GATEWAY + '/actions';
const PREFIX_NOTIFICATION_WS =
    process.env.REACT_APP_WS_GATEWAY + '/notification';
const PREFIX_CONFIG_NOTIFICATION_WS =
    process.env.REACT_APP_WS_GATEWAY + '/config-notification';
const PREFIX_CONFIG_QUERIES = process.env.REACT_APP_API_GATEWAY + '/config';

function getToken() {
    const state = store.getState();
    return state.user.id_token;
}

function backendFetch(url, init) {
    if (!(typeof init == 'undefined' || typeof init == 'object')) {
        throw new TypeError(
            'Argument 2 of backendFetch is not an object' + typeof init
        );
    }
    const initCopy = Object.assign({}, init);
    initCopy.headers = new Headers(initCopy.headers || {});
    initCopy.headers.append('Authorization', 'Bearer ' + getToken());

    return fetch(url, initCopy);
}

export function fetchConfigParameters(appName) {
    console.info('Fetching UI configuration params for app : ' + appName);
    const fetchParams =
        PREFIX_CONFIG_QUERIES + `/v1/applications/${appName}/parameters`;
    return backendFetch(fetchParams).then((res) => {
        return res.json();
    });
}

export function fetchConfigParameter(name) {
    const appName = getAppName(name);
    console.info(
        "Fetching UI config parameter '%s' for app '%s' ",
        name,
        appName
    );
    const fetchParams =
        PREFIX_CONFIG_QUERIES +
        `/v1/applications/${appName}/parameters/${name}`;
    return backendFetch(fetchParams).then((res) => {
        return res.json();
    });
}

export function updateConfigParameter(name, value) {
    const appName = getAppName(name);
    console.info(
        "Updating config parameter '%s=%s' for app '%s' ",
        name,
        value,
        appName
    );
    const updateParams =
        PREFIX_CONFIG_QUERIES +
        `/v1/applications/${appName}/parameters/${name}?value=` +
        encodeURIComponent(value);
    backendFetch(updateParams, { method: 'put' }).then();
}

export function fetchStudies() {
    console.info('Fetching studies...');
    const fetchStudiesUrl = PREFIX_STUDY_QUERIES + '/v1/studies';
    return backendFetch(fetchStudiesUrl).then(function (response) {
        if (response.ok) {
            return response.json();
        } else {
            console.error(response);
            return Promise.resolve([]);
        }
    });
}

export function fetchStudyCreationRequests() {
    console.info('Fetching study creation requests...');
    const creationRequestsUrl =
        PREFIX_STUDY_QUERIES + '/v1/study_creation_requests';
    return backendFetch(creationRequestsUrl).then(function (response) {
        if (response.ok) {
            return response.json();
        } else {
            console.error(response);
            return Promise.resolve([]);
        }
    });
}

function getStudyUrl(studyName, userId) {
    return (
        PREFIX_STUDY_QUERIES +
        '/v1/' +
        encodeURIComponent(userId) +
        '/studies/' +
        encodeURIComponent(studyName)
    );
}

export function fetchStudy(studyName, userId) {
    console.info(`Fetching study '${studyName}' for user id '${userId}' ...`);
    const fetchStudiesUrl = getStudyUrl(studyName, userId);
    console.debug(fetchStudiesUrl);
    return backendFetch(fetchStudiesUrl).then((response) => response.json());
}

export function fetchCases() {
    console.info('Fetching cases...');
    const fetchCasesUrl = PREFIX_CASE_QUERIES + '/v1/cases';
    console.debug(fetchCasesUrl);
    return backendFetch(fetchCasesUrl).then((response) => response.json());
}

export function getVoltageLevelSingleLineDiagram(
    studyName,
    userId,
    voltageLevelId,
    useName,
    centerLabel,
    diagonalLabel
) {
    console.info(
        `Getting url of voltage level diagram '${voltageLevelId}' of study '${studyName}' of user '${userId}'...`
    );
    return (
        getStudyUrl(studyName, userId) +
        '/network/voltage-levels/' +
        encodeURIComponent(voltageLevelId) +
        '/svg-and-metadata?' +
        new URLSearchParams({
            useName: useName,
            centerLabel: centerLabel,
            diagonalLabel: diagonalLabel,
            topologicalColoring: true,
        }).toString()
    );
}

export function getSubstationSingleLineDiagram(
    studyName,
    userId,
    substationId,
    useName,
    centerLabel,
    diagonalLabel,
    substationLayout
) {
    console.info(
        `Getting url of substation diagram '${substationId}' of study '${studyName}' of user '${userId}'...`
    );
    return (
        getStudyUrl(studyName, userId) +
        '/network/substations/' +
        encodeURIComponent(substationId) +
        '/svg-and-metadata?' +
        new URLSearchParams({
            useName: useName,
            centerLabel: centerLabel,
            diagonalLabel: diagonalLabel,
            topologicalColoring: true,
            substationLayout: substationLayout,
        }).toString()
    );
}

export function fetchSvg(svgUrl) {
    console.debug(svgUrl);
    return backendFetch(svgUrl).then((response) =>
        response.ok
            ? response.json()
            : response
                  .json()
                  .then((error) => Promise.reject(new Error(error.error)))
    );
}

function getSubstationsIdsListsQueryParams(substationsIds) {
    if (substationsIds !== undefined && substationsIds.length > 0) {
        const urlSearchParams = new URLSearchParams();
        substationsIds.forEach((substationId) =>
            urlSearchParams.append('substationId', substationId)
        );
        return '?' + urlSearchParams.toString();
    }
    return '';
}

export function fetchSubstations(studyName, userId, substationsIds) {
    return fetchEquipments(
        studyName,
        userId,
        substationsIds,
        'Substations',
        'substations'
    );
}

export function fetchSubstationPositions(studyName, userId) {
    console.info(`Fetching substation positions of study '${studyName}'...`);
    const fetchSubstationPositionsUrl =
        getStudyUrl(studyName, userId) + '/geo-data/substations';
    console.debug(fetchSubstationPositionsUrl);
    return backendFetch(fetchSubstationPositionsUrl).then((response) =>
        response.json()
    );
}

export function fetchLines(studyName, userId, substationsIds) {
    return fetchEquipments(studyName, userId, substationsIds, 'Lines', 'lines');
}

export function fetchTwoWindingsTransformers(
    studyName,
    userId,
    substationsIds
) {
    return fetchEquipments(
        studyName,
        userId,
        substationsIds,
        'Two windings transformers',
        '2-windings-transformers'
    );
}

export function fetchThreeWindingsTransformers(
    studyName,
    userId,
    substationsIds
) {
    return fetchEquipments(
        studyName,
        userId,
        substationsIds,
        'Three windings transformers',
        '3-windings-transformers'
    );
}

export function fetchGenerators(studyName, userId, substationsIds) {
    return fetchEquipments(
        studyName,
        userId,
        substationsIds,
        'Generators',
        'generators'
    );
}

export function fetchLoads(studyName, userId, substationsIds) {
    return fetchEquipments(studyName, userId, substationsIds, 'Loads', 'loads');
}

export function fetchDanglingLines(studyName, userId, substationsIds) {
    return fetchEquipments(
        studyName,
        userId,
        substationsIds,
        'Dangling lines',
        'dangling-lines'
    );
}

export function fetchBatteries(studyName, userId, substationsIds) {
    return fetchEquipments(
        studyName,
        userId,
        substationsIds,
        'Batteries',
        'batteries'
    );
}

export function fetchHvdcLines(studyName, userId, substationsIds) {
    return fetchEquipments(
        studyName,
        userId,
        substationsIds,
        'Hvdc lines',
        'hvdc-lines'
    );
}

export function fetchLccConverterStations(studyName, userId, substationsIds) {
    return fetchEquipments(
        studyName,
        userId,
        substationsIds,
        'LCC converter stations',
        'lcc-converter-stations'
    );
}

export function fetchVscConverterStations(studyName, userId, substationsIds) {
    return fetchEquipments(
        studyName,
        userId,
        substationsIds,
        'VSC converter stations',
        'vsc-converter-stations'
    );
}

export function fetchShuntCompensators(studyName, userId, substationsIds) {
    return fetchEquipments(
        studyName,
        userId,
        substationsIds,
        'Shunt compensators',
        'shunt-compensators'
    );
}

export function fetchStaticVarCompensators(studyName, userId, substationsIds) {
    return fetchEquipments(
        studyName,
        userId,
        substationsIds,
        'Static var compensators',
        'static-var-compensators'
    );
}

export function fetchAllEquipments(studyName, userId, substationsIds) {
    return fetchEquipments(studyName, userId, substationsIds, 'All', 'all');
}

function fetchEquipments(
    studyName,
    userId,
    substationsIds,
    equipmentType,
    equipmentPath
) {
    console.info(
        `Fetching equipments '${equipmentType}' of study '${studyName}' of user '${userId}' with substations ids '${substationsIds}'...`
    );
    const fetchEquipmentsUrl =
        getStudyUrl(studyName, userId) +
        '/network-map/' +
        equipmentPath +
        getSubstationsIdsListsQueryParams(substationsIds);
    console.debug(fetchEquipmentsUrl);
    return backendFetch(fetchEquipmentsUrl).then((response) => response.json());
}

export function fetchLinePositions(studyName, userId) {
    console.info(`Fetching line positions of study '${studyName}'...`);
    const fetchLinePositionsUrl =
        getStudyUrl(studyName, userId) + '/geo-data/lines';
    console.debug(fetchLinePositionsUrl);
    return backendFetch(fetchLinePositionsUrl).then((response) =>
        response.json()
    );
}

export function studyExists(studyName, userId) {
    const studyExistsUrl = getStudyUrl(studyName, userId) + '/exists';
    console.debug(studyExistsUrl);
    return backendFetch(studyExistsUrl, { method: 'get' }).then((response) => {
        return response.json();
    });
}

export function createStudy(
    caseExist,
    studyName,
    studyDescription,
    caseName,
    selectedFile,
    isPrivateStudy
) {
    console.info('Creating a new study...');
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('description', studyDescription);
    urlSearchParams.append('isPrivate', isPrivateStudy);

    if (caseExist) {
        const createStudyWithExistingCaseUrl =
            PREFIX_STUDY_QUERIES +
            '/v1/studies/' +
            encodeURIComponent(studyName) +
            '/cases/' +
            encodeURIComponent(caseName) +
            '?' +
            urlSearchParams.toString();
        console.debug(createStudyWithExistingCaseUrl);
        return backendFetch(createStudyWithExistingCaseUrl, {
            method: 'post',
        });
    } else {
        const createStudyWithNewCaseUrl =
            PREFIX_STUDY_QUERIES +
            '/v1/studies/' +
            encodeURIComponent(studyName) +
            '?' +
            urlSearchParams.toString();
        const formData = new FormData();
        formData.append('caseFile', selectedFile);
        console.debug(createStudyWithNewCaseUrl);

        return backendFetch(createStudyWithNewCaseUrl, {
            method: 'post',
            body: formData,
        });
    }
}

export function deleteStudy(studyName, userId) {
    console.info(
        'Deleting study ' + studyName + 'from user ' + userId + ' ...'
    );
    const deleteStudyUrl = getStudyUrl(studyName, userId);
    console.debug(deleteStudyUrl);
    return backendFetch(deleteStudyUrl, {
        method: 'delete',
    });
}

export function updateSwitchState(studyName, userId, switchId, open) {
    console.info('updating switch ' + switchId + ' ...');
    const updateSwitchUrl =
        getStudyUrl(studyName, userId) +
        '/network-modification/switches/' +
        encodeURIComponent(switchId) +
        '?' +
        new URLSearchParams({ open: open }).toString();
    console.debug(updateSwitchUrl);
    return backendFetch(updateSwitchUrl, { method: 'put' });
}

export function renameStudy(studyName, userId, newStudyName) {
    console.info('Renaming study ' + studyName);
    const renameStudiesUrl = getStudyUrl(studyName, userId) + '/rename';

    console.debug(renameStudiesUrl);
    return backendFetch(renameStudiesUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newStudyName: newStudyName }),
    }).then((response) => {
        if (response.status === 200 || response.status === 403) {
            return response.json();
        } else {
            return response.text().then((text) => {
                let json;
                try {
                    json = JSON.parse(text);
                } catch {
                    throw new Error(
                        response.status +
                            ' ' +
                            response.statusText +
                            ' : ' +
                            text
                    );
                }
                throw new Error(
                    json.status + ' ' + json.error + ' : ' + json.message
                );
            });
        }
    });
}

export function changeStudyAccessRights(studyName, userId, toPrivate) {
    console.info('Change access rights of study ' + studyName);
    let changeStudyAccessRightsUrl;
    if (toPrivate === 'true') {
        changeStudyAccessRightsUrl =
            getStudyUrl(studyName, userId) + '/private';
    } else {
        changeStudyAccessRightsUrl = getStudyUrl(studyName, userId) + '/public';
    }

    console.debug(changeStudyAccessRightsUrl);
    return backendFetch(changeStudyAccessRightsUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });
}

export function startLoadFlow(studyName, userId) {
    console.info('Running loadflow on ' + studyName + '...');
    const startLoadFlowUrl = getStudyUrl(studyName, userId) + '/loadflow/run';
    console.debug(startLoadFlowUrl);
    return backendFetch(startLoadFlowUrl, { method: 'put' });
}

export function stopSecurityAnalysis(studyName, userId) {
    console.info('Stopping security analysis on ' + studyName + '...');
    const stopSecurityAnalysisUrl =
        getStudyUrl(studyName, userId) + '/security-analysis/stop';
    console.debug(stopSecurityAnalysisUrl);
    return backendFetch(stopSecurityAnalysisUrl, { method: 'put' });
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

export function startSecurityAnalysis(studyName, userId, contingencyListNames) {
    console.info('Running security analysis on ' + studyName + '...');
    const url =
        getStudyUrl(studyName, userId) +
        '/security-analysis/run' +
        getContingencyListsQueryParams(contingencyListNames);
    console.debug(url);
    return backendFetch(url, { method: 'post' });
}

export function fetchSecurityAnalysisResult(studyName, userId) {
    console.info('Fetching security analysis on ' + studyName + '...');
    const url = getStudyUrl(studyName, userId) + '/security-analysis/result';
    console.debug(url);
    return backendFetch(url, { method: 'get' }).then((response) =>
        response.json()
    );
}

export function fetchSecurityAnalysisStatus(studyName, userId) {
    console.info('Fetching security analysis status on ' + studyName + '...');
    const url = getStudyUrl(studyName, userId) + '/security-analysis/status';
    console.debug(url);
    return backendFetch(url, { method: 'get' }).then(function (response) {
        if (response.ok) {
            return response.text();
        } else {
            return Promise.resolve(0);
        }
    });
}

export function fetchContingencyLists() {
    console.info('Fetching contingency lists');
    const url = PREFIX_ACTIONS_QUERIES + '/v1/contingency-lists';
    console.debug(url);
    return backendFetch(url, { method: 'get' }).then((response) =>
        response.json()
    );
}

export function fetchContingencyCount(userId, studyName, contingencyListNames) {
    console.info(
        `Fetching contingency count for ${contingencyListNames} on ' + ${studyName} + '...'`
    );
    const url =
        getStudyUrl(studyName, userId) +
        '/contingency-count' +
        getContingencyListsQueryParams(contingencyListNames);
    console.debug(url);
    return backendFetch(url, { method: 'get' }).then(function (response) {
        if (response.ok) {
            return response.json();
        } else {
            console.error(response);
            return Promise.resolve(0);
        }
    });
}

export function connectNotificationsWebsocket(studyName) {
    // The websocket API doesn't allow relative urls
    const wsbase = document.baseURI
        .replace(/^http:\/\//, 'ws://')
        .replace(/^https:\/\//, 'wss://');
    const wsadress =
        wsbase +
        PREFIX_NOTIFICATION_WS +
        '/notify?studyName=' +
        encodeURIComponent(studyName);
    let wsaddressWithToken;
    wsaddressWithToken = wsadress + '&access_token=' + getToken();

    const rws = new ReconnectingWebSocket(wsaddressWithToken);
    // don't log the token, it's private
    rws.onopen = function (event) {
        console.info('Connected Websocket ' + wsadress + ' ...');
    };
    return rws;
}

/**
 * Function will be called to connect with notification websocket to update the studies list
 * @returns {ReconnectingWebSocket}
 */
export function connectNotificationsWsUpdateStudies() {
    const webSocketBaseUrl = document.baseURI
        .replace(/^http:\/\//, 'ws://')
        .replace(/^https:\/\//, 'wss://');
    const webSocketUrl =
        webSocketBaseUrl +
        PREFIX_NOTIFICATION_WS +
        '/notify?updateType=studies';

    let webSocketUrlWithToken;
    webSocketUrlWithToken = webSocketUrl + '&access_token=' + getToken();

    const reconnectingWebSocket = new ReconnectingWebSocket(
        webSocketUrlWithToken
    );
    reconnectingWebSocket.onopen = function (event) {
        console.info(
            'Connected Websocket update studies' + webSocketUrl + ' ...'
        );
    };
    return reconnectingWebSocket;
}

export function connectNotificationsWsUpdateConfig() {
    const webSocketBaseUrl = document.baseURI
        .replace(/^http:\/\//, 'ws://')
        .replace(/^https:\/\//, 'wss://');
    const webSocketUrl =
        webSocketBaseUrl +
        PREFIX_CONFIG_NOTIFICATION_WS +
        '/notify?appName=' +
        APP_NAME;

    let webSocketUrlWithToken;
    webSocketUrlWithToken = webSocketUrl + '&access_token=' + getToken();

    const reconnectingWebSocket = new ReconnectingWebSocket(
        webSocketUrlWithToken
    );
    reconnectingWebSocket.onopen = function (event) {
        console.info(
            'Connected Websocket update config ui ' + webSocketUrl + ' ...'
        );
    };
    return reconnectingWebSocket;
}

export function getAvailableExportFormats() {
    console.info('get export formats');
    const getExportFormatsUrl =
        PREFIX_STUDY_QUERIES + '/v1/export-network-formats';
    console.debug(getExportFormatsUrl);
    return backendFetch(getExportFormatsUrl, {
        method: 'get',
    }).then((response) => response.json());
}

function getUrlWithToken(baseUrl) {
    return baseUrl + '?access_token=' + getToken();
}

export function getExportUrl(userId, studyName, exportFormat) {
    const url =
        getStudyUrl(studyName, userId) + '/export-network/' + exportFormat;
    return getUrlWithToken(url);
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

export function requestNetworkChange(userId, studyName, groovyScript) {
    console.info('request network change');
    const changeUrl =
        getStudyUrl(studyName, userId) + '/network-modification/groovy';
    console.debug(changeUrl);
    return backendFetch(changeUrl, {
        method: 'PUT',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/text',
        },
        body: groovyScript,
    }).then((response) => {
        return response;
    });
}

export function setLoadFlowParameters(studyName, userId, newParams) {
    console.info('set load flow parameters');
    const setLoadFlowParametersUrl =
        getStudyUrl(studyName, userId) + '/loadflow/parameters';
    console.debug(setLoadFlowParametersUrl);
    return backendFetch(setLoadFlowParametersUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newParams),
    }).then();
}

export function getLoadFlowParameters(studyName, userId) {
    console.info('get load flow parameters');
    const getLfParams = getStudyUrl(studyName, userId) + '/loadflow/parameters';
    console.debug(getLfParams);
    return backendFetch(getLfParams, {
        method: 'get',
    }).then((response) => response.json());
}
