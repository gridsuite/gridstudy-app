/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { store } from '../redux/store';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { APP_NAME, getAppName } from './config-params';

const PREFIX_STUDY_QUERIES = process.env.REACT_APP_API_GATEWAY + '/study';
const PREFIX_NOTIFICATION_WS =
    process.env.REACT_APP_WS_GATEWAY + '/notification';
const PREFIX_CONFIG_NOTIFICATION_WS =
    process.env.REACT_APP_WS_GATEWAY + '/config-notification';
const PREFIX_CONFIG_QUERIES = process.env.REACT_APP_API_GATEWAY + '/config';
const PREFIX_DIRECTORY_SERVER_QUERIES =
    process.env.REACT_APP_API_GATEWAY + '/directory';
const PREFIX_NETWORK_MODIFICATION_QUERIES =
    process.env.REACT_APP_API_GATEWAY + '/network-modification';

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

export function fetchConfigParameters(appName) {
    console.info('Fetching UI configuration params for app : ' + appName);
    const fetchParams =
        PREFIX_CONFIG_QUERIES + `/v1/applications/${appName}/parameters`;
    return backendFetch(fetchParams).then((response) =>
        response.ok
            ? response.json()
            : response.text().then((text) => Promise.reject(text))
    );
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
    return backendFetch(fetchParams).then((response) =>
        response.ok
            ? response.json()
            : response.text().then((text) => Promise.reject(text))
    );
}

export function fetchRootFolders() {
    console.info('Fetching Root Directories');
    const fetchRootFoldersUrl =
        PREFIX_DIRECTORY_SERVER_QUERIES + `/v1/root-directories`;
    return backendFetch(fetchRootFoldersUrl).then((response) =>
        response.ok
            ? response.json()
            : response.text().then((text) => Promise.reject(text))
    );
}

export function fetchDirectoryContent(directoryUuid) {
    console.info("Fetching Folder content '%s'", directoryUuid);
    const fetchDirectoryContentUrl =
        PREFIX_DIRECTORY_SERVER_QUERIES +
        `/v1/directories/${directoryUuid}/elements`;
    return backendFetch(fetchDirectoryContentUrl).then((response) =>
        response.ok
            ? response.json()
            : response.text().then((text) => Promise.reject(text))
    );
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
    return backendFetch(updateParams, { method: 'put' }).then((response) =>
        response.ok
            ? response
            : response.text().then((text) => Promise.reject(text))
    );
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
    return backendFetch(fetchStudiesUrl).then((response) => response.json());
}

export function fetchStudyExists(studyUuid) {
    console.info(`Fetching study '${studyUuid}' existence ...`);
    const fetchStudiesUrl = getStudyUrl(studyUuid);
    console.debug(fetchStudiesUrl);
    return backendFetch(fetchStudiesUrl, { method: 'head' });
}

function getPathUrl(studyUuid) {
    return (
        PREFIX_DIRECTORY_SERVER_QUERIES +
        '/v1/elements/' +
        encodeURIComponent(studyUuid) +
        '/path'
    );
}

export function fetchPath(studyUuid) {
    console.info(`Fetching element '${studyUuid}' and its parents info ...`);
    const fetchPathUrl = getPathUrl(studyUuid);
    console.debug(fetchPathUrl);
    return backendFetch(fetchPathUrl).then((response) =>
        response.ok
            ? response.json()
            : response.text().then((text) => Promise.reject(text))
    );
}

export function getVoltageLevelSingleLineDiagram(
    studyUuid,
    selectedNodeUuid,
    voltageLevelId,
    useName,
    centerLabel,
    diagonalLabel,
    componentLibrary
) {
    console.info(
        `Getting url of voltage level diagram '${voltageLevelId}' of study '${studyUuid}' and node '${selectedNodeUuid}'...`
    );
    return (
        getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
        '/network/voltage-levels/' +
        encodeURIComponent(voltageLevelId) +
        '/svg-and-metadata?' +
        new URLSearchParams({
            useName: useName,
            centerLabel: centerLabel,
            diagonalLabel: diagonalLabel,
            topologicalColoring: true,
            ...(componentLibrary !== null && {
                componentLibrary: componentLibrary,
            }),
        }).toString()
    );
}

export function getSubstationSingleLineDiagram(
    studyUuid,
    selectedNodeUuid,
    substationId,
    useName,
    centerLabel,
    diagonalLabel,
    substationLayout,
    componentLibrary
) {
    console.info(
        `Getting url of substation diagram '${substationId}' of study '${studyUuid}' and node '${selectedNodeUuid}'...`
    );
    return (
        getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
        '/network/substations/' +
        encodeURIComponent(substationId) +
        '/svg-and-metadata?' +
        new URLSearchParams({
            useName: useName,
            centerLabel: centerLabel,
            diagonalLabel: diagonalLabel,
            topologicalColoring: true,
            substationLayout: substationLayout,
            ...(componentLibrary !== null && {
                componentLibrary: componentLibrary,
            }),
        }).toString()
    );
}

export function fetchReport(studyUuid) {
    console.info('get report for study : ' + studyUuid);
    return backendFetch(getStudyUrl(studyUuid) + '/report').then((response) =>
        response.ok
            ? response.json()
            : response.text().then((text) => Promise.reject(text))
    );
}

export function fetchSvg(svgUrl) {
    console.debug(svgUrl);
    return backendFetch(svgUrl).then((response) =>
        response.ok
            ? response.json()
            : response.json().then((json) => {
                  return Promise.reject(
                      json ? json.message : response.statusText
                  );
              })
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

export function fetchSubstations(studyUuid, selectedNodeUuid, substationsIds) {
    return fetchEquipments(
        studyUuid,
        selectedNodeUuid,
        substationsIds,
        'Substations',
        'substations'
    );
}

export function fetchSubstationPositions(studyUuid) {
    console.info(`Fetching substation positions of study '${studyUuid}'...`);
    const fetchSubstationPositionsUrl =
        getStudyUrl(studyUuid) + '/geo-data/substations';
    console.debug(fetchSubstationPositionsUrl);
    return backendFetch(fetchSubstationPositionsUrl).then((response) =>
        response.json()
    );
}

export function fetchLines(studyUuid, selectedNodeUuid, substationsIds) {
    return fetchEquipments(
        studyUuid,
        selectedNodeUuid,
        substationsIds,
        'Lines',
        'lines'
    );
}

export function fetchTwoWindingsTransformers(
    studyUuid,
    selectedNodeUuid,
    substationsIds
) {
    return fetchEquipments(
        studyUuid,
        selectedNodeUuid,
        substationsIds,
        'Two windings transformers',
        '2-windings-transformers'
    );
}

export function fetchThreeWindingsTransformers(
    studyUuid,
    selectedNodeUuid,
    substationsIds
) {
    return fetchEquipments(
        studyUuid,
        selectedNodeUuid,
        substationsIds,
        'Three windings transformers',
        '3-windings-transformers'
    );
}

export function fetchGenerators(studyUuid, selectedNodeUuid, substationsIds) {
    return fetchEquipments(
        studyUuid,
        selectedNodeUuid,
        substationsIds,
        'Generators',
        'generators'
    );
}

export function fetchLoads(studyUuid, selectedNodeUuid, substationsIds) {
    return fetchEquipments(
        studyUuid,
        selectedNodeUuid,
        substationsIds,
        'Loads',
        'loads'
    );
}

export function fetchDanglingLines(
    studyUuid,
    selectedNodeUuid,
    substationsIds
) {
    return fetchEquipments(
        studyUuid,
        selectedNodeUuid,
        substationsIds,
        'Dangling lines',
        'dangling-lines'
    );
}

export function fetchBatteries(studyUuid, selectedNodeUuid, substationsIds) {
    return fetchEquipments(
        studyUuid,
        selectedNodeUuid,
        substationsIds,
        'Batteries',
        'batteries'
    );
}

export function fetchHvdcLines(studyUuid, selectedNodeUuid, substationsIds) {
    return fetchEquipments(
        studyUuid,
        selectedNodeUuid,
        substationsIds,
        'Hvdc lines',
        'hvdc-lines'
    );
}

export function fetchLccConverterStations(
    studyUuid,
    selectedNodeUuid,
    substationsIds
) {
    return fetchEquipments(
        studyUuid,
        selectedNodeUuid,
        substationsIds,
        'LCC converter stations',
        'lcc-converter-stations'
    );
}

export function fetchVscConverterStations(
    studyUuid,
    selectedNodeUuid,
    substationsIds
) {
    return fetchEquipments(
        studyUuid,
        selectedNodeUuid,
        substationsIds,
        'VSC converter stations',
        'vsc-converter-stations'
    );
}

export function fetchShuntCompensators(
    studyUuid,
    selectedNodeUuid,
    substationsIds
) {
    return fetchEquipments(
        studyUuid,
        selectedNodeUuid,
        substationsIds,
        'Shunt compensators',
        'shunt-compensators'
    );
}

export function fetchStaticVarCompensators(
    studyUuid,
    selectedNodeUuid,
    substationsIds
) {
    return fetchEquipments(
        studyUuid,
        selectedNodeUuid,
        substationsIds,
        'Static var compensators',
        'static-var-compensators'
    );
}

export function fetchEquipmentsInfos(
    studyUuid,
    nodeUuid,
    searchTerm,
    usesName,
    inUpstreamBuiltParentNode,
    equipmentType
) {
    console.info(
        "Fetching equipments infos matching with '%s' term ... ",
        searchTerm
    );
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('userInput', searchTerm);
    urlSearchParams.append('fieldSelector', usesName ? 'name' : 'id');
    if (inUpstreamBuiltParentNode !== undefined) {
        urlSearchParams.append(
            'inUpstreamBuiltParentNode',
            inUpstreamBuiltParentNode
        );
    }
    if (equipmentType !== undefined) {
        urlSearchParams.append('equipmentType', equipmentType);
    }
    return backendFetch(
        getStudyUrl(studyUuid) +
            '/nodes/' +
            encodeURIComponent(nodeUuid) +
            '/search?' +
            urlSearchParams.toString()
    ).then((response) =>
        response.ok
            ? response.json()
            : response.text().then((text) => Promise.reject(text))
    );
}

export function fetchAllEquipments(
    studyUuid,
    selectedNodeUuid,
    substationsIds
) {
    return fetchEquipments(
        studyUuid,
        selectedNodeUuid,
        substationsIds,
        'All',
        'all'
    );
}

export function fetchEquipments(
    studyUuid,
    selectedNodeUuid,
    substationsIds,
    equipmentType,
    equipmentPath,
    inUpstreamBuiltParentNode
) {
    console.info(
        `Fetching equipments '${equipmentType}' of study '${studyUuid}' and node '${selectedNodeUuid}' with substations ids '${substationsIds}'...`
    );
    let urlSearchParams = new URLSearchParams();
    if (inUpstreamBuiltParentNode !== undefined) {
        urlSearchParams.append(
            'inUpstreamBuiltParentNode',
            inUpstreamBuiltParentNode
        );
    }

    const fetchEquipmentsUrl =
        getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
        '/network-map/' +
        equipmentPath +
        getSubstationsIdsListsQueryParams(substationsIds);
    console.debug(fetchEquipmentsUrl);
    return backendFetch(fetchEquipmentsUrl).then((response) => response.json());
}

export function fetchEquipmentInfos(
    studyUuid,
    selectedNodeUuid,
    equipmentPath,
    equipmentId,
    inUpstreamBuiltParentNode
) {
    console.info(
        `Fetching specific equipments '${equipmentId}' of type '${equipmentPath}' of study '${studyUuid}' and node '${selectedNodeUuid}' ...`
    );

    let urlSearchParams = new URLSearchParams();
    if (inUpstreamBuiltParentNode !== undefined) {
        urlSearchParams.append(
            'inUpstreamBuiltParentNode',
            inUpstreamBuiltParentNode
        );
    }

    const fetchEquipmentInfosUrl =
        getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
        '/network-map/' +
        equipmentPath +
        '/' +
        encodeURIComponent(equipmentId) +
        '?' +
        urlSearchParams.toString();
    console.debug(fetchEquipmentInfosUrl);
    return backendFetch(fetchEquipmentInfosUrl);
}

export function fetchBusesForVoltageLevel(
    studyUuid,
    selectedNodeUuid,
    voltageLevelId
) {
    console.info(
        `Fetching buses of study '${studyUuid}' and node '${selectedNodeUuid}' + ' for voltage level '${voltageLevelId}'...`
    );
    const fetchBusesUrl =
        getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
        '/network/voltage-levels/' +
        voltageLevelId +
        '/buses';
    console.debug(fetchBusesUrl);
    return backendFetch(fetchBusesUrl).then((response) => response.json());
}

export function fetchBusbarSectionsForVoltageLevel(
    studyUuid,
    selectedNodeUuid,
    voltageLevelId
) {
    console.info(
        `Fetching busbar sections of study '${studyUuid}' and node '${selectedNodeUuid}' + ' for voltage level '${voltageLevelId}'...`
    );
    const fetchBusbarSectionsUrl =
        getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
        '/network/voltage-levels/' +
        voltageLevelId +
        '/busbar-sections';
    console.debug(fetchBusbarSectionsUrl);
    return backendFetch(fetchBusbarSectionsUrl).then((response) =>
        response.json()
    );
}

export function fetchLinePositions(studyUuid) {
    console.info(`Fetching line positions of study '${studyUuid}'...`);
    const fetchLinePositionsUrl = getStudyUrl(studyUuid) + '/geo-data/lines';
    console.debug(fetchLinePositionsUrl);
    return backendFetch(fetchLinePositionsUrl).then((response) =>
        response.json()
    );
}

export function updateSwitchState(studyUuid, selectedNodeUuid, switchId, open) {
    console.info('updating switch ' + switchId + ' ...');
    const updateSwitchUrl =
        getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
        '/network-modification/switches/' +
        encodeURIComponent(switchId) +
        '?' +
        new URLSearchParams({ open: open }).toString();
    console.debug(updateSwitchUrl);
    return backendFetch(updateSwitchUrl, { method: 'put' });
}

export function startLoadFlow(studyUuid, selectedNodeUuid) {
    console.info(
        'Running loadflow on ' +
            studyUuid +
            ' and node ' +
            selectedNodeUuid +
            '...'
    );
    const startLoadFlowUrl =
        getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) + '/loadflow/run';
    console.debug(startLoadFlowUrl);
    return backendFetch(startLoadFlowUrl, { method: 'put' });
}

export function stopSecurityAnalysis(studyUuid, selectedNodeUuid) {
    console.info(
        'Stopping security analysis on ' +
            studyUuid +
            ' and node ' +
            selectedNodeUuid +
            ' ...'
    );
    const stopSecurityAnalysisUrl =
        getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
        '/security-analysis/stop';
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

export function startSecurityAnalysis(
    studyUuid,
    selectedNodeUuid,
    contingencyListNames
) {
    console.info(
        'Running security analysis on ' +
            studyUuid +
            ' and node ' +
            selectedNodeUuid +
            ' ...'
    );
    const url =
        getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
        '/security-analysis/run' +
        getContingencyListsQueryParams(contingencyListNames);
    console.debug(url);
    return backendFetch(url, { method: 'post' });
}

export function fetchSecurityAnalysisResult(studyUuid, selectedNodeUuid) {
    console.info(
        'Fetching security analysis on ' +
            studyUuid +
            ' and node ' +
            selectedNodeUuid +
            ' ...'
    );
    const url =
        getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
        '/security-analysis/result';
    console.debug(url);
    return backendFetch(url, { method: 'get' }).then((response) => {
        if (response.ok) return response.json();
        throw new Error(response.status + ' ' + response.statusText);
    });
}

export function fetchSecurityAnalysisStatus(studyUuid, selectedNodeUuid) {
    console.info(
        'Fetching security analysis status on ' +
            studyUuid +
            ' and node ' +
            selectedNodeUuid +
            ' ...'
    );
    const url =
        getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
        '/security-analysis/status';
    console.debug(url);
    return backendFetch(url, { method: 'get' }).then(function (response) {
        if (response.ok) {
            return response.text();
        } else {
            return Promise.resolve(0);
        }
    });
}

export function fetchContingencyLists(listIds) {
    console.info('Fetching contingency lists');
    const url =
        PREFIX_DIRECTORY_SERVER_QUERIES +
        '/v1/elements?strictMode=false&ids=' +
        listIds
            .filter((e) => e != null && e !== '') // filter empty element
            .join('&ids=');
    console.debug(url);
    return backendFetch(url, { method: 'get' }).then((response) =>
        response.json()
    );
}

export function fetchContingencyCount(
    studyUuid,
    selectedNodeUuid,
    contingencyListNames
) {
    console.info(
        `Fetching contingency count for ${contingencyListNames} on '${studyUuid}' and node '${selectedNodeUuid}'...`
    );
    const url =
        getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
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

export function fetchNetworkModificationTree(studyUuid) {
    console.info('Fetching network modification tree');
    const url = getStudyUrl(studyUuid) + '/tree';
    console.debug(url);
    return backendFetch(url, { method: 'get' }).then((response) =>
        response.ok
            ? response.json()
            : response.text().then((text) => Promise.reject(text))
    );
}

export function fetchNetworkModificationTreeNode(studyUuid, nodeUuid) {
    console.info('Fetching network modification tree node : ', nodeUuid);
    const url =
        getStudyUrl(studyUuid) + '/tree/nodes/' + encodeURIComponent(nodeUuid);
    console.debug(url);
    return backendFetch(url, { method: 'get' }).then((response) =>
        response.json()
    );
}

export function createTreeNode(studyUuid, parentId, insertMode, node) {
    const nodeCreationUrl =
        getStudyUrl(studyUuid) +
        '/tree/nodes/' +
        encodeURIComponent(parentId) +
        '?mode=' +
        insertMode;
    console.debug('%s with body: %s', nodeCreationUrl, node);
    return backendFetch(nodeCreationUrl, {
        method: 'post',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(node),
    }).then((response) =>
        response.ok
            ? response
            : response.text().then((text) => Promise.reject(text))
    );
}

export function deleteTreeNode(studyUuid, nodeId) {
    console.info('Fetching network modification tree');
    const url =
        getStudyUrl(studyUuid) + '/tree/nodes/' + encodeURIComponent(nodeId);
    console.debug(url);
    return backendFetch(url, {
        method: 'delete',
    }).then((response) =>
        response.ok
            ? response
            : response.text().then((text) => Promise.reject(text))
    );
}

export function updateTreeNode(studyUuid, node) {
    const nodeUpdateUrl = getStudyUrl(studyUuid) + '/tree/nodes/';
    console.debug(nodeUpdateUrl);
    return backendFetch(nodeUpdateUrl, {
        method: 'put',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(node),
    }).then((response) =>
        response.ok
            ? response
            : response.text().then((text) => Promise.reject(text))
    );
}

export function deleteModifications(studyUuid, node, modificationUuid) {
    const modificationDeleteUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/studies/' +
        encodeURIComponent(studyUuid) +
        '/nodes/' +
        encodeURIComponent(node.id) +
        '/network-modification?' +
        new URLSearchParams({ modificationsUuids: modificationUuid });

    console.debug(modificationDeleteUrl);
    return backendFetch(modificationDeleteUrl, {
        method: 'delete',
    }).then((response) =>
        response.ok
            ? response
            : response.text().then((text) => Promise.reject(text))
    );
}

export function connectNotificationsWebsocket(studyUuid) {
    // The websocket API doesn't allow relative urls
    const wsbase = document.baseURI
        .replace(/^http:\/\//, 'ws://')
        .replace(/^https:\/\//, 'wss://');
    const wsadress =
        wsbase +
        PREFIX_NOTIFICATION_WS +
        '/notify?studyUuid=' +
        encodeURIComponent(studyUuid);
    let wsaddressWithToken;
    wsaddressWithToken = wsadress + '&access_token=' + getToken();

    const rws = new ReconnectingWebSocket(wsaddressWithToken);
    // don't log the token, it's private
    rws.onopen = function (event) {
        console.info('Connected Websocket ' + wsadress + ' ...');
    };
    return rws;
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

export function requestNetworkChange(
    studyUuid,
    selectedNodeUuid,
    groovyScript
) {
    console.info('request network change');
    const changeUrl =
        getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
        '/network-modification/groovy';
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
    }).then((response) =>
        response.ok
            ? response
            : response.text().then((text) => Promise.reject(text))
    );
}

export function getLoadFlowParameters(studyUuid) {
    console.info('get load flow parameters');
    const getLfParams = getStudyUrl(studyUuid) + '/loadflow/parameters';
    console.debug(getLfParams);
    return backendFetch(getLfParams, {
        method: 'get',
    }).then((response) =>
        response.ok
            ? response.json()
            : response.text().then((text) => Promise.reject(text))
    );
}

function changeLineStatus(studyUuid, selectedNodeUuid, lineId, status) {
    const changeLineStatusUrl =
        getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
        '/network-modification/lines/' +
        encodeURIComponent(lineId) +
        '/status';
    console.debug('%s with body: %s', changeLineStatusUrl, status);
    return backendFetch(changeLineStatusUrl, { method: 'put', body: status });
}

export function lockoutLine(studyUuid, selectedNodeUuid, lineId) {
    console.info('locking out line ' + lineId + ' ...');
    return changeLineStatus(studyUuid, selectedNodeUuid, lineId, 'lockout');
}

export function tripLine(studyUuid, selectedNodeUuid, lineId) {
    console.info('tripping line ' + lineId + ' ...');
    return changeLineStatus(studyUuid, selectedNodeUuid, lineId, 'trip');
}

export function energiseLineEnd(studyUuid, selectedNodeUuid, lineId, lineEnd) {
    console.info('energise line ' + lineId + ' end ' + lineEnd + ' ...');
    return changeLineStatus(
        studyUuid,
        selectedNodeUuid,
        lineId,
        lineEnd === 'ONE'
            ? 'energise_end_one'
            : lineEnd === 'TWO'
            ? 'energise_end_two'
            : null
    );
}

export function switchOnLine(studyUuid, selectedNodeUuid, lineId) {
    console.info('switching on line ' + lineId + ' ...');
    return changeLineStatus(studyUuid, selectedNodeUuid, lineId, 'switch_on');
}

export function createLoad(
    studyUuid,
    selectedNodeUuid,
    id,
    name,
    loadType,
    activePower,
    reactivePower,
    voltageLevelId,
    busOrBusbarSectionId,
    isUpdate = false,
    modificationUuid
) {
    let createLoadUrl;
    if (isUpdate) {
        console.info('Updating load creation');
        createLoadUrl =
            getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
            '/network-modification/modifications/' +
            encodeURIComponent(modificationUuid) +
            '/loads-creation';
    } else {
        console.info('Creating load ');
        createLoadUrl =
            getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
            '/network-modification/loads';
    }

    return backendFetch(createLoadUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            equipmentId: id,
            equipmentName: name,
            loadType: loadType,
            activePower: activePower,
            reactivePower: reactivePower,
            voltageLevelId: voltageLevelId,
            busOrBusbarSectionId: busOrBusbarSectionId,
        }),
    }).then((response) =>
        response.ok
            ? response.text()
            : response.text().then((text) => Promise.reject(text))
    );
}

export function modifyLoad(
    studyUuid,
    selectedNodeUuid,
    id,
    name,
    loadType,
    activePower,
    reactivePower,
    voltageLevelId,
    busOrBusbarSectionId
) {
    console.info('Modifying load ');
    let modifyLoadUrl =
        getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
        '/network-modification/loads';

    return backendFetch(modifyLoadUrl, {
        method: 'PUT',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            equipmentId: id,
            equipmentName: name ? { value: name, op: 'SET' } : null,
            loadType: loadType ? { value: loadType, op: 'SET' } : null,
            activePower:
                activePower === 0 || activePower
                    ? { value: activePower, op: 'SET' }
                    : null,
            reactivePower:
                reactivePower === 0 || reactivePower
                    ? { value: reactivePower, op: 'SET' }
                    : null,
            voltageLevelId: voltageLevelId
                ? { value: voltageLevelId, op: 'SET' }
                : null,
            busOrBusbarSectionId: busOrBusbarSectionId
                ? { value: busOrBusbarSectionId, op: 'SET' }
                : null,
        }),
    }).then((response) => {
        response.ok
            ? response.text()
            : response.text().then((text) => Promise.reject(text));
    });
}

export function createGenerator(
    studyUuid,
    selectedNodeUuid,
    id,
    name,
    energySource,
    minActivePower,
    maxActivePower,
    ratedNominalPower,
    activePowerSetpoint,
    reactivePowerSetpoint,
    voltageRegulationOn,
    voltageSetpoint,
    voltageLevelId,
    busOrBusbarSectionId,
    isUpdate = false,
    modificationUuid
) {
    let createGeneratorUrl;
    if (isUpdate) {
        console.info('Updating generator creation');
        createGeneratorUrl =
            getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
            '/network-modification/modifications/' +
            encodeURIComponent(modificationUuid) +
            '/generators-creation';
    } else {
        console.info('Creating generator ');
        createGeneratorUrl =
            getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
            '/network-modification/generators';
    }
    return backendFetch(createGeneratorUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            equipmentId: id,
            equipmentName: name,
            energySource: energySource,
            minActivePower: minActivePower,
            maxActivePower: maxActivePower,
            ratedNominalPower: ratedNominalPower,
            activePowerSetpoint: activePowerSetpoint,
            reactivePowerSetpoint: reactivePowerSetpoint,
            voltageRegulationOn: voltageRegulationOn,
            voltageSetpoint: voltageSetpoint,
            voltageLevelId: voltageLevelId,
            busOrBusbarSectionId: busOrBusbarSectionId,
        }),
    }).then((response) =>
        response.ok
            ? response.text()
            : response.text().then((text) => Promise.reject(text))
    );
}

export function createShuntCompensator(
    studyUuid,
    selectedNodeUuid,
    shuntCompensatorId,
    shuntCompensatorName,
    maximumNumberOfSections,
    currentNumberOfSections,
    identicalSections,
    susceptancePerSection,
    connectivity,
    isUpdate,
    modificationUuid
) {
    let createShuntUrl;
    if (isUpdate) {
        console.info('Updating shunt compensator creation');
        createShuntUrl =
            getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
            '/network-modification/modifications/' +
            encodeURIComponent(modificationUuid) +
            '/shunt-compensators-creation';
    } else {
        console.info('Creating shunt compensator ');
        createShuntUrl =
            getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
            '/network-modification/shunt-compensators';
    }

    return backendFetch(createShuntUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            equipmentId: shuntCompensatorId,
            equipmentName: shuntCompensatorName,
            maximumNumberOfSections: maximumNumberOfSections,
            currentNumberOfSections: currentNumberOfSections,
            isIdenticalSection: identicalSections,
            susceptancePerSection: susceptancePerSection,
            voltageLevelId: connectivity.voltageLevel.id,
            busOrBusbarSectionId: connectivity.busOrBusbarSection.id,
        }),
    }).then((response) =>
        response.ok
            ? response.text()
            : response.text().then((text) => Promise.reject(text))
    );
}

export function createLine(
    studyUuid,
    selectedNodeUuid,
    lineId,
    lineName,
    seriesResistance,
    seriesReactance,
    shuntConductance1,
    shuntSusceptance1,
    shuntConductance2,
    shuntSusceptance2,
    voltageLevelId1,
    busOrBusbarSectionId1,
    voltageLevelId2,
    busOrBusbarSectionId2,
    permanentCurrentLimit1,
    permanentCurrentLimit2,
    isUpdate,
    modificationUuid
) {
    let createLineUrl;
    if (isUpdate) {
        console.info('Updating line creation');
        createLineUrl =
            getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
            '/network-modification/modifications/' +
            encodeURIComponent(modificationUuid) +
            '/lines-creation';
    } else {
        console.info('Creating line ');
        createLineUrl =
            getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
            '/network-modification/lines';
    }
    return backendFetch(createLineUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            equipmentId: lineId,
            equipmentName: lineName,
            seriesResistance: seriesResistance,
            seriesReactance: seriesReactance,
            shuntConductance1: shuntConductance1,
            shuntSusceptance1: shuntSusceptance1,
            shuntConductance2: shuntConductance2,
            shuntSusceptance2: shuntSusceptance2,
            voltageLevelId1: voltageLevelId1,
            busOrBusbarSectionId1: busOrBusbarSectionId1,
            voltageLevelId2: voltageLevelId2,
            busOrBusbarSectionId2: busOrBusbarSectionId2,
            currentLimits1: {
                permanentLimit: permanentCurrentLimit1,
            },
            currentLimits2: {
                permanentLimit: permanentCurrentLimit2,
            },
        }),
    }).then((response) =>
        response.ok
            ? response.text()
            : response.text().then((text) => Promise.reject(text))
    );
}

export function createTwoWindingsTransformer(
    studyUuid,
    selectedNodeUuid,
    twoWindingsTransformerId,
    twoWindingsTransformerName,
    seriesResistance,
    seriesReactance,
    magnetizingConductance,
    magnetizingSusceptance,
    ratedVoltage1,
    ratedVoltage2,
    voltageLevelId1,
    busOrBusbarSectionId1,
    voltageLevelId2,
    busOrBusbarSectionId2,
    isUpdate,
    modificationUuid
) {
    let createTwoWindingsTransformerUrl;
    if (isUpdate) {
        console.info('Updating two windings transformer creation');
        createTwoWindingsTransformerUrl =
            getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
            '/network-modification/modifications/' +
            encodeURIComponent(modificationUuid) +
            '/two-windings-transformers-creation';
    } else {
        console.info('Creating two windings transformer ');
        createTwoWindingsTransformerUrl =
            getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
            '/network-modification/two-windings-transformers';
    }
    return backendFetch(createTwoWindingsTransformerUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            equipmentId: twoWindingsTransformerId,
            equipmentName: twoWindingsTransformerName,
            seriesResistance: seriesResistance,
            seriesReactance: seriesReactance,
            magnetizingConductance: magnetizingConductance,
            magnetizingSusceptance: magnetizingSusceptance,
            ratedVoltage1: ratedVoltage1,
            ratedVoltage2: ratedVoltage2,
            voltageLevelId1: voltageLevelId1,
            busOrBusbarSectionId1: busOrBusbarSectionId1,
            voltageLevelId2: voltageLevelId2,
            busOrBusbarSectionId2: busOrBusbarSectionId2,
        }),
    }).then((response) =>
        response.ok
            ? response.text()
            : response.text().then((text) => Promise.reject(text))
    );
}

export function createSubstation(
    studyUuid,
    selectedNodeUuid,
    substationId,
    substationName,
    substationCountry,
    isUpdate = false,
    modificationUuid
) {
    let createSubstationUrl;
    if (isUpdate) {
        console.info('Updating substation creation');
        createSubstationUrl =
            getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
            '/network-modification/modifications/' +
            encodeURIComponent(modificationUuid) +
            '/substations-creation';
    } else {
        console.info('Creating substation ');
        createSubstationUrl =
            getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
            '/network-modification/substations';
    }

    return backendFetch(createSubstationUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            equipmentId: substationId,
            equipmentName: substationName,
            substationCountry:
                substationCountry === '' ? null : substationCountry,
        }),
    }).then((response) =>
        response.ok
            ? response.text()
            : response.text().then((text) => Promise.reject(text))
    );
}

export function createVoltageLevel({
    studyUuid,
    selectedNodeUuid,
    voltageLevelId,
    name,
    nominalVoltage,
    substationId,
    busbarSections,
    busbarConnections,
    isUpdate,
    modificationUuid,
}) {
    let createVoltageLevelUrl;
    if (isUpdate) {
        console.info('Updating voltage level creation');
        createVoltageLevelUrl =
            getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
            '/network-modification/modifications/' +
            encodeURIComponent(modificationUuid) +
            '/voltage-levels-creation';
    } else {
        console.info('Creating voltage level (stub)');
        createVoltageLevelUrl =
            getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
            '/network-modification/voltage-levels';
    }

    const body = JSON.stringify({
        equipmentId: voltageLevelId,
        equipmentName: name,
        nominalVoltage: nominalVoltage,
        substationId: substationId,
        busbarSections: busbarSections,
        busbarConnections: busbarConnections,
    });
    console.log('body', body);

    return backendFetch(createVoltageLevelUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: body,
    }).then((response) =>
        response.ok
            ? response.text()
            : response.text().then((text) => Promise.reject(text))
    );
}

export function divideLine(
    studyUuid,
    selectedNodeUuid,
    modificationUuid,
    lineToSplitId,
    percent,
    mayNewVoltageLevelInfos,
    existingVoltageLevelId,
    bbsOrBusId,
    newLine1Id,
    newLine1Name,
    newLine2Id,
    newLine2Name
) {
    const body = JSON.stringify({
        lineToSplitId,
        percent,
        mayNewVoltageLevelInfos,
        existingVoltageLevelId,
        bbsOrBusId,
        newLine1Id,
        newLine1Name,
        newLine2Id,
        newLine2Name,
    });
    console.log('divide body', body);
    let lineSplitUrl;
    if (modificationUuid) {
        console.info('Line split with voltage level update', body);
        lineSplitUrl =
            getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
            '/network-modification/modifications/' +
            encodeURIComponent(modificationUuid) +
            '/line-splits';
    } else {
        console.info('Line split with voltage level', body);
        lineSplitUrl =
            getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
            '/network-modification/line-splits';
    }

    return backendFetch(lineSplitUrl, {
        method: modificationUuid ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body,
    }).then((response) =>
        response.ok
            ? response.text()
            : response.text().then((text) => Promise.reject(text))
    );
}

export function getLoadFlowProvider(studyUuid) {
    console.info('get load flow provider');
    const getLoadFlowProviderUrl =
        getStudyUrl(studyUuid) + '/loadflow/provider';
    console.debug(getLoadFlowProviderUrl);
    return backendFetch(getLoadFlowProviderUrl, {
        method: 'get',
    }).then((response) =>
        response.ok
            ? response.text()
            : response.text().then((text) => Promise.reject(text))
    );
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
    }).then((response) =>
        response.ok
            ? response
            : response.text().then((text) => Promise.reject(text))
    );
}

export function getDefaultLoadFlowProvider() {
    console.info('get default load flow provier');
    const getDefaultLoadFlowProviderUrl =
        PREFIX_STUDY_QUERIES + '/v1/loadflow-default-provider';
    console.debug(getDefaultLoadFlowProviderUrl);
    return backendFetch(getDefaultLoadFlowProviderUrl, {
        method: 'GET',
    }).then((response) => {
        if (response.ok) return response.text();
        throw new Error(response.status + ' ' + response.statusText);
    });
}

export function getAvailableComponentLibraries() {
    console.info('get available component libraries for diagrams');
    const getAvailableComponentLibrariesUrl =
        PREFIX_STUDY_QUERIES + '/v1/svg-component-libraries';
    console.debug(getAvailableComponentLibrariesUrl);
    return backendFetch(getAvailableComponentLibrariesUrl, {
        method: 'get',
    }).then((response) => response.json());
}

export function deleteEquipment(
    studyUuid,
    selectedNodeUuid,
    equipmentType,
    equipmentId
) {
    console.info(
        'deleting equipment ' +
            equipmentId +
            ' with type ' +
            equipmentType +
            ' ...'
    );
    const deleteEquipmentUrl =
        getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
        '/network-modification/equipments/type/' +
        encodeURIComponent(equipmentType) +
        '/id/' +
        encodeURIComponent(equipmentId);
    return backendFetch(deleteEquipmentUrl, { method: 'delete' });
}

export function fetchLoadFlowInfos(studyUuid, selectedNodeUuid) {
    console.info(
        `Fetching loadflow infos (status and result) for '${studyUuid}' and node '${selectedNodeUuid}' ...`
    );
    const fetchLoadFlowInfosUrl =
        getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
        '/loadflow/infos';
    return backendFetch(fetchLoadFlowInfosUrl).then((response) =>
        response.json()
    );
}

export function fetchNetworkModifications(groupUuid) {
    console.info('Fetching network modification tree node');
    const url =
        PREFIX_NETWORK_MODIFICATION_QUERIES +
        '/v1/groups/' +
        encodeURIComponent(groupUuid) +
        '/modifications';
    console.debug(url);
    return backendFetch(url, { method: 'get' }).then((response) =>
        response.json()
    );
}

export function fetchNetworkModification(modificationUuid) {
    const modificationFetchUrl =
        PREFIX_NETWORK_MODIFICATION_QUERIES +
        '/v1/modifications/' +
        encodeURIComponent(modificationUuid);
    console.debug(modificationFetchUrl);
    return backendFetch(modificationFetchUrl, {
        method: 'get',
    }).then((response) =>
        response.ok
            ? response
            : response.text().then((text) => Promise.reject(text))
    );
}

export function buildNode(studyUuid, selectedNodeUuid) {
    console.info(
        'Build node ' + selectedNodeUuid + ' of study ' + studyUuid + ' ...'
    );
    const url = getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) + '/build';
    console.debug(url);
    return backendFetch(url, { method: 'post' }).then((response) =>
        response.ok
            ? response.text()
            : response.text().then((text) => Promise.reject(text))
    );
}

export function changeNetworkModificationOrder(
    studyUuid,
    selectedNodeUuid,
    itemUuid,
    beforeUuid
) {
    console.info(
        'reorder node ' + selectedNodeUuid + ' of study ' + studyUuid + ' ...'
    );
    const url =
        getStudyUrlWithNodeUuid(studyUuid, selectedNodeUuid) +
        '/network-modification/' +
        itemUuid +
        '?' +
        new URLSearchParams({ beforeUuid: beforeUuid || '' }).toString();
    console.debug(url);
    return backendFetch(url, { method: 'put' }).then((response) => {
        if (!response.ok)
            throw new Error(response.status + ' ' + response.statusText);
    });
}
