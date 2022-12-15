/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { store } from '../redux/store';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { APP_NAME, getAppName } from './config-params';
import { MODIFICATION_TYPE } from '../components/network/constants';

const PREFIX_USER_ADMIN_SERVER_QUERIES =
    process.env.REACT_APP_API_GATEWAY + '/user-admin';
const PREFIX_STUDY_QUERIES = process.env.REACT_APP_API_GATEWAY + '/study';
const PREFIX_STUDY_NOTIFICATION_WS =
    process.env.REACT_APP_WS_GATEWAY + '/study-notification';
const PREFIX_CONFIG_NOTIFICATION_WS =
    process.env.REACT_APP_WS_GATEWAY + '/config-notification';
const PREFIX_DIRECTORY_NOTIFICATION_WS =
    process.env.REACT_APP_WS_GATEWAY + '/directory-notification';
const PREFIX_CONFIG_QUERIES = process.env.REACT_APP_API_GATEWAY + '/config';
const PREFIX_DIRECTORY_SERVER_QUERIES =
    process.env.REACT_APP_API_GATEWAY + '/directory';
const PREFIX_NETWORK_MODIFICATION_QUERIES =
    process.env.REACT_APP_API_GATEWAY + '/network-modification';
const PREFIX_SENSITIVITY_ANALYSIS_SERVER_QUERIES =
    process.env.REACT_APP_API_GATEWAY + '/sensitivity-analysis';
const PREFIX_EXPLORE_SERVER_QUERIES =
    process.env.REACT_APP_API_GATEWAY + '/explore';

function getToken() {
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
                errorName + response.status + ' ' + response.statusText
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
    return safeFetch(url, initCopy).then((safeResponse) => safeResponse.json());
}

export function fetchValidateUser(user) {
    const sub = user?.profile?.sub;
    if (!sub)
        return Promise.reject(
            new Error(
                'Error : Fetching access for missing user.profile.sub : ' + user
            )
        );

    console.info(`Fetching access for user...`);
    const CheckAccessUrl =
        PREFIX_USER_ADMIN_SERVER_QUERIES + `/v1/users/${sub}`;
    console.debug(CheckAccessUrl);

    return backendFetch(
        CheckAccessUrl,
        {
            method: 'head',
        },
        user?.id_token
    )
        .then((response) => {
            //if the response is ok, the responseCode will be either 200 or 204 otherwise it's a Http error and it will be caught
            return response.status === 200;
        })
        .catch((error) => {
            if (error.status === 403) return false;
            else throw error;
        });
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
    return backendFetchJson(fetchParams);
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
        response.status === 204 ? null : response.json()
    );
}

export function fetchRootFolders(types) {
    console.info('Fetching Root Directories');
    const urlSearchParams = types
        ? '?elementTypes=' + types.join('&elementTypes=')
        : '';
    const fetchRootFoldersUrl =
        PREFIX_DIRECTORY_SERVER_QUERIES +
        `/v1/root-directories` +
        urlSearchParams;
    return backendFetchJson(fetchRootFoldersUrl);
}

export function fetchDirectoryContent(directoryUuid, types) {
    console.info("Fetching Folder content '%s'", directoryUuid);
    const urlSearchParams = types
        ? '?elementTypes=' + types.join('&elementTypes=')
        : '';
    const fetchDirectoryContentUrl =
        PREFIX_DIRECTORY_SERVER_QUERIES +
        `/v1/directories/${directoryUuid}/elements` +
        urlSearchParams;
    return backendFetchJson(fetchDirectoryContentUrl);
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
    return backendFetch(updateParams, { method: 'put' });
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
    return backendFetchJson(fetchPathUrl);
}

export function getVoltageLevelSingleLineDiagram(
    studyUuid,
    currentNodeUuid,
    voltageLevelId,
    useName,
    centerLabel,
    diagonalLabel,
    componentLibrary
) {
    console.info(
        `Getting url of voltage level diagram '${voltageLevelId}' of study '${studyUuid}' and node '${currentNodeUuid}'...`
    );
    return (
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
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
    currentNodeUuid,
    substationId,
    useName,
    centerLabel,
    diagonalLabel,
    substationLayout,
    componentLibrary
) {
    console.info(
        `Getting url of substation diagram '${substationId}' of study '${studyUuid}' and node '${currentNodeUuid}'...`
    );
    return (
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
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

export function fetchNADSvg(svgUrl) {
    console.debug(svgUrl);
    return backendFetchText(svgUrl);
}

function getQueryParamsList(params, paramName) {
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
    return backendFetchJson(svgUrl);
}

export function fetchSubstations(studyUuid, currentNodeUuid, substationsIds) {
    return fetchEquipments(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        'Substations',
        'substations',
        true
    );
}

export function fetchSubstationPositions(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching substation positions of study '${studyUuid}' and node '${currentNodeUuid}'...`
    );
    const fetchSubstationPositionsUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/geo-data/substations';
    console.debug(fetchSubstationPositionsUrl);
    return backendFetchJson(fetchSubstationPositionsUrl);
}

export function fetchLines(studyUuid, currentNodeUuid, substationsIds) {
    return fetchEquipments(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        'Lines',
        'lines',
        true
    );
}

export function fetchVoltageLevels(studyUuid, currentNodeUuid, substationsIds) {
    return fetchEquipments(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        'Voltage-levels',
        'voltage-levels',
        true
    );
}

export function fetchVoltageLevelsEquipments(
    studyUuid,
    currentNodeUuid,
    substationsIds
) {
    return fetchEquipments(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        'Voltage-levels-equipments',
        'voltage-levels-equipments',
        true
    );
}

export function fetchTwoWindingsTransformers(
    studyUuid,
    currentNodeUuid,
    substationsIds
) {
    return fetchEquipments(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        'Two windings transformers',
        '2-windings-transformers'
    );
}

export function fetchThreeWindingsTransformers(
    studyUuid,
    currentNodeUuid,
    substationsIds
) {
    return fetchEquipments(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        'Three windings transformers',
        '3-windings-transformers'
    );
}

export function fetchGenerators(studyUuid, currentNodeUuid, substationsIds) {
    return fetchEquipments(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        'Generators',
        'generators'
    );
}

export function fetchLoads(studyUuid, currentNodeUuid, substationsIds) {
    return fetchEquipments(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        'Loads',
        'loads'
    );
}

export function fetchDanglingLines(studyUuid, currentNodeUuid, substationsIds) {
    return fetchEquipments(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        'Dangling lines',
        'dangling-lines'
    );
}

export function fetchBatteries(studyUuid, currentNodeUuid, substationsIds) {
    return fetchEquipments(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        'Batteries',
        'batteries'
    );
}

export function fetchHvdcLines(studyUuid, currentNodeUuid, substationsIds) {
    return fetchEquipments(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        'Hvdc lines',
        'hvdc-lines'
    );
}

export function fetchLccConverterStations(
    studyUuid,
    currentNodeUuid,
    substationsIds
) {
    return fetchEquipments(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        'LCC converter stations',
        'lcc-converter-stations'
    );
}

export function fetchVscConverterStations(
    studyUuid,
    currentNodeUuid,
    substationsIds
) {
    return fetchEquipments(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        'VSC converter stations',
        'vsc-converter-stations'
    );
}

export function fetchShuntCompensators(
    studyUuid,
    currentNodeUuid,
    substationsIds
) {
    return fetchEquipments(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        'Shunt compensators',
        'shunt-compensators'
    );
}

export function fetchStaticVarCompensators(
    studyUuid,
    currentNodeUuid,
    substationsIds
) {
    return fetchEquipments(
        studyUuid,
        currentNodeUuid,
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
    return backendFetchJson(
        getStudyUrl(studyUuid) +
            '/nodes/' +
            encodeURIComponent(nodeUuid) +
            '/search?' +
            urlSearchParams.toString()
    );
}

export function fetchAllEquipments(studyUuid, currentNodeUuid, substationsIds) {
    return fetchEquipments(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        'All',
        'all'
    );
}

export function fetchEquipments(
    studyUuid,
    currentNodeUuid,
    substationsIds,
    equipmentType,
    equipmentPath,
    inUpstreamBuiltParentNode
) {
    console.info(
        `Fetching equipments '${equipmentType}' of study '${studyUuid}' and node '${currentNodeUuid}' with substations ids '${substationsIds}'...`
    );
    let urlSearchParams = new URLSearchParams();
    if (inUpstreamBuiltParentNode !== undefined) {
        urlSearchParams.append(
            'inUpstreamBuiltParentNode',
            inUpstreamBuiltParentNode
        );
    }

    const fetchEquipmentsUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-map/' +
        equipmentPath +
        '?' +
        getQueryParamsList(substationsIds, 'substationId');
    console.debug(fetchEquipmentsUrl);
    return backendFetchJson(fetchEquipmentsUrl);
}

export function fetchEquipmentInfos(
    studyUuid,
    currentNodeUuid,
    equipmentPath,
    equipmentId,
    inUpstreamBuiltParentNode
) {
    console.info(
        `Fetching specific equipments '${equipmentId}' of type '${equipmentPath}' of study '${studyUuid}' and node '${currentNodeUuid}' ...`
    );

    let urlSearchParams = new URLSearchParams();
    if (inUpstreamBuiltParentNode !== undefined) {
        urlSearchParams.append(
            'inUpstreamBuiltParentNode',
            inUpstreamBuiltParentNode
        );
    }

    const fetchEquipmentInfosUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-map/' +
        equipmentPath +
        '/' +
        encodeURIComponent(equipmentId) +
        '?' +
        urlSearchParams.toString();
    console.debug(fetchEquipmentInfosUrl);
    return backendFetchJson(fetchEquipmentInfosUrl);
}

export function fetchBusesForVoltageLevel(
    studyUuid,
    currentNodeUuid,
    voltageLevelId
) {
    console.info(
        `Fetching buses of study '${studyUuid}' and node '${currentNodeUuid}' + ' for voltage level '${voltageLevelId}'...`
    );
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('inUpstreamBuiltParentNode', true);

    const fetchBusesUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network/voltage-levels/' +
        encodeURIComponent(voltageLevelId) +
        '/buses' +
        '?' +
        urlSearchParams.toString();
    console.debug(fetchBusesUrl);
    return backendFetchJson(fetchBusesUrl);
}

export function fetchBusbarSectionsForVoltageLevel(
    studyUuid,
    currentNodeUuid,
    voltageLevelId
) {
    console.info(
        `Fetching busbar sections of study '${studyUuid}' and node '${currentNodeUuid}' + ' for voltage level '${voltageLevelId}'...`
    );
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('inUpstreamBuiltParentNode', true);

    const fetchBusbarSectionsUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network/voltage-levels/' +
        encodeURIComponent(voltageLevelId) +
        '/busbar-sections' +
        '?' +
        urlSearchParams.toString();

    console.debug(fetchBusbarSectionsUrl);
    return backendFetchJson(fetchBusbarSectionsUrl);
}

export function fetchLinePositions(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching line positions of study '${studyUuid}' and node '${currentNodeUuid}'...`
    );
    const fetchLinePositionsUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) + '/geo-data/lines';
    console.debug(fetchLinePositionsUrl);
    return backendFetchJson(fetchLinePositionsUrl);
}

export function updateSwitchState(studyUuid, currentNodeUuid, switchId, open) {
    console.info('updating switch ' + switchId + ' ...');
    const updateSwitchUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-modifications';
    console.debug(updateSwitchUrl);
    return backendFetch(updateSwitchUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/text',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPE.EQUIPMENT_ATTRIBUTE_MODIFICATION,
            equipmentType: 'SWITCH',
            equipmentId: switchId,
            equipmentAttributeName: 'open',
            equipmentAttributeValue: open,
        }),
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

export function stopSecurityAnalysis(studyUuid, currentNodeUuid) {
    console.info(
        'Stopping security analysis on ' +
            studyUuid +
            ' and node ' +
            currentNodeUuid +
            ' ...'
    );
    const stopSecurityAnalysisUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
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
    currentNodeUuid,
    contingencyListNames
) {
    console.info(
        'Running security analysis on ' +
            studyUuid +
            ' and node ' +
            currentNodeUuid +
            ' ...'
    );
    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/security-analysis/run' +
        getContingencyListsQueryParams(contingencyListNames);
    console.debug(url);
    return backendFetch(url, { method: 'post' });
}

export function fetchSecurityAnalysisResult(studyUuid, currentNodeUuid) {
    console.info(
        'Fetching security analysis on ' +
            studyUuid +
            ' and node ' +
            currentNodeUuid +
            ' ...'
    );
    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/security-analysis/result';
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchSecurityAnalysisStatus(studyUuid, currentNodeUuid) {
    console.info(
        'Fetching security analysis status on ' +
            studyUuid +
            ' and node ' +
            currentNodeUuid +
            ' ...'
    );
    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/security-analysis/status';
    console.debug(url);
    return backendFetchText(url);
}

export function startSensitivityAnalysis(
    studyUuid,
    currentNodeUuid,
    sensiConfiguration
) {
    console.info(
        'Running sensi on ' +
            studyUuid +
            ' and node ' +
            currentNodeUuid +
            ' ...'
    );
    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/sensitivity-analysis/run';
    console.debug(url);

    const body = JSON.stringify(sensiConfiguration);

    return backendFetch(url, {
        method: 'post',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: body,
    });
}

export function stopSensitivityAnalysis(studyUuid, currentNodeUuid) {
    console.info(
        'Stopping sensitivity analysis on ' +
            studyUuid +
            ' and node ' +
            currentNodeUuid +
            ' ...'
    );
    const stopSensitivityAnalysisUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/sensitivity-analysis/stop';
    console.debug(stopSensitivityAnalysisUrl);
    return backendFetch(stopSensitivityAnalysisUrl, { method: 'put' });
}

export function fetchSensitivityAnalysisStatus(studyUuid, currentNodeUuid) {
    console.info(
        'Fetching sensitivity analysis status on ' +
            studyUuid +
            ' and node ' +
            currentNodeUuid +
            ' ...'
    );
    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/sensitivity-analysis/status';
    console.debug(url);
    return backendFetchText(url);
}

export function fetchSensitivityAnalysisResult(studyUuid, currentNodeUuid) {
    console.info(
        'Fetching sensitivity analysis on ' +
            studyUuid +
            ' and node ' +
            currentNodeUuid +
            ' ...'
    );
    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/sensitivity-analysis/result';
    console.debug(url);
    return backendFetchJson(url);
}

export function startShortCircuitAnalysis(studyUuid, currentNodeUuid) {
    console.info(
        `Running short circuit analysis on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );

    const startShortCircuitAnanysisUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/shortcircuit/run';
    console.debug(startShortCircuitAnanysisUrl);
    return backendFetch(startShortCircuitAnanysisUrl, { method: 'put' });
}

export function stopShortCircuitAnalysis(studyUuid, currentNodeUuid) {
    console.info(
        `Stopping short circuit analysis on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const stopShortCircuitAnalysisUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/shortcircuit/stop';
    console.debug(stopShortCircuitAnalysisUrl);
    return backendFetch(stopShortCircuitAnalysisUrl, { method: 'put' });
}

export function fetchShortCircuitAnalysisStatus(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching short circuit analysis status on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/shortcircuit/status';
    console.debug(url);
    return backendFetchText(url);
}

export function fetchShortCircuitAnalysisResult(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching short circuit analysis result on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/shortcircuit/result';
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchContingencyAndFiltersLists(listIds) {
    console.info('Fetching contingency and filters lists');
    const url =
        PREFIX_DIRECTORY_SERVER_QUERIES +
        '/v1/elements?strictMode=false&ids=' +
        listIds
            .filter((e) => e != null && e !== '') // filter empty element
            .join('&ids=');
    console.debug(url);
    return backendFetchJson(url);
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

export function fetchNetworkModificationTreeNode(studyUuid, nodeUuid) {
    console.info('Fetching network modification tree node : ', nodeUuid);
    const url =
        getStudyUrl(studyUuid) + '/tree/nodes/' + encodeURIComponent(nodeUuid);
    console.debug(url);
    return backendFetchJson(url);
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
    });
}

export function deleteTreeNode(studyUuid, nodeId) {
    console.info('Deleting tree node : ', nodeId);
    const url =
        getStudyUrl(studyUuid) + '/tree/nodes/' + encodeURIComponent(nodeId);
    console.debug(url);
    return backendFetch(url, {
        method: 'delete',
    });
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
    });
}

export function copyTreeNode(
    studyUuid,
    nodeToCopyUuid,
    referenceNodeUuid,
    insertMode
) {
    const nodeCopyUrl =
        getStudyUrl(studyUuid) +
        '/tree/nodes?insertMode=' +
        insertMode +
        '&nodeToCopyUuid=' +
        nodeToCopyUuid +
        '&referenceNodeUuid=' +
        referenceNodeUuid;
    console.debug(nodeCopyUrl);
    return backendFetch(nodeCopyUrl, {
        method: 'post',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });
}

export function cutTreeNode(
    studyUuid,
    nodeToCutUuid,
    referenceNodeUuid,
    insertMode
) {
    const nodeCutUrl =
        getStudyUrl(studyUuid) +
        '/tree/nodes?insertMode=' +
        insertMode +
        '&nodeToCutUuid=' +
        nodeToCutUuid +
        '&referenceNodeUuid=' +
        referenceNodeUuid;
    console.debug(nodeCutUrl);
    return backendFetch(nodeCutUrl, {
        method: 'post',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });
}

export function deleteModifications(studyUuid, nodeUuid, modificationUuids) {
    const modificationDeleteUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/studies/' +
        encodeURIComponent(studyUuid) +
        '/nodes/' +
        encodeURIComponent(nodeUuid) +
        '/network-modifications?uuids=' +
        encodeURIComponent(modificationUuids);

    console.debug(modificationDeleteUrl);
    return backendFetch(modificationDeleteUrl, {
        method: 'delete',
    });
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

    return backendFetchText(copyOrMoveModificationUrl, {
        method: 'PUT',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(modificationToCutUuidList),
    });
}

function getUrlWithToken(baseUrl) {
    if (baseUrl.includes('?')) {
        return baseUrl + '&access_token=' + getToken();
    } else {
        return baseUrl + '?access_token=' + getToken();
    }
}

export function connectNotificationsWebsocket(studyUuid, options) {
    // The websocket API doesn't allow relative urls
    const wsbase = document.baseURI
        .replace(/^http:\/\//, 'ws://')
        .replace(/^https:\/\//, 'wss://');
    const wsadress =
        wsbase +
        PREFIX_STUDY_NOTIFICATION_WS +
        '/notify?studyUuid=' +
        encodeURIComponent(studyUuid);

    const rws = new ReconnectingWebSocket(
        () => getUrlWithToken(wsadress),
        [],
        options
    );
    // don't log the token, it's private
    rws.onopen = function (event) {
        console.info('Connected Websocket ' + wsadress + ' ...');
    };
    return rws;
}

export function connectDeletedStudyNotificationsWebsocket(studyUuid) {
    // The websocket API doesn't allow relative urls
    const wsbase = document.baseURI
        .replace(/^http:\/\//, 'ws://')
        .replace(/^https:\/\//, 'wss://');
    const wsadress =
        wsbase +
        PREFIX_DIRECTORY_NOTIFICATION_WS +
        '/notify?updateType=deleteStudy&elementUuid=' +
        studyUuid;

    const rws = new ReconnectingWebSocket(() => getUrlWithToken(wsadress));
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
export function connectNotificationsWsUpdateDirectories() {
    const webSocketBaseUrl = document.baseURI
        .replace(/^http:\/\//, 'ws://')
        .replace(/^https:\/\//, 'wss://');
    const webSocketUrl =
        webSocketBaseUrl +
        PREFIX_DIRECTORY_NOTIFICATION_WS +
        '/notify?updateType=directories';

    const reconnectingWebSocket = new ReconnectingWebSocket(
        () => webSocketUrl + '&access_token=' + getToken()
    );
    reconnectingWebSocket.onopen = function (event) {
        console.info(
            'Connected Websocket update directories ' + webSocketUrl + ' ...'
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

    const reconnectingWebSocket = new ReconnectingWebSocket(() =>
        getUrlWithToken(webSocketUrl)
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

export function requestNetworkChange(studyUuid, currentNodeUuid, groovyScript) {
    console.info('Creating groovy script (request network change)');
    const changeUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-modifications';
    console.debug(changeUrl);
    return backendFetchText(changeUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/text',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPE.GROOVY_SCRIPT,
            script: groovyScript,
        }),
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
    });
}

export function getLoadFlowParameters(studyUuid) {
    console.info('get load flow parameters');
    const getLfParams = getStudyUrl(studyUuid) + '/loadflow/parameters';
    console.debug(getLfParams);
    return backendFetchJson(getLfParams);
}

export function setShortCircuitParameters(studyUuid, newParams) {
    console.info('set short-circuit parameters');
    const setShortCircuitParametersUrl =
        getStudyUrl(studyUuid) + '/short-circuit-analysis/parameters';
    console.debug(setShortCircuitParametersUrl);
    return backendFetch(setShortCircuitParametersUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newParams),
    });
}

export function getShortCircuitParameters(studyUuid) {
    console.info('get short-circuit parameters');
    const getShortCircuitParams =
        getStudyUrl(studyUuid) + '/short-circuit-analysis/parameters';
    console.debug(getShortCircuitParams);
    return backendFetchJson(getShortCircuitParams);
}

function changeLineStatus(studyUuid, currentNodeUuid, lineId, status) {
    const changeLineStatusUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-modifications';
    console.debug('%s with body: %s', changeLineStatusUrl, status);
    return backendFetch(changeLineStatusUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/text',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPE.BRANCH_STATUS,
            equipmentId: lineId,
            action: status.toUpperCase(),
        }),
    });
}

export function lockoutLine(studyUuid, currentNodeUuid, lineId) {
    console.info('locking out line ' + lineId + ' ...');
    return changeLineStatus(studyUuid, currentNodeUuid, lineId, 'lockout');
}

export function tripLine(studyUuid, currentNodeUuid, lineId) {
    console.info('tripping line ' + lineId + ' ...');
    return changeLineStatus(studyUuid, currentNodeUuid, lineId, 'trip');
}

export function energiseLineEnd(studyUuid, currentNodeUuid, lineId, lineEnd) {
    console.info('energise line ' + lineId + ' end ' + lineEnd + ' ...');
    return changeLineStatus(
        studyUuid,
        currentNodeUuid,
        lineId,
        lineEnd === 'ONE'
            ? 'energise_end_one'
            : lineEnd === 'TWO'
            ? 'energise_end_two'
            : null
    );
}

export function switchOnLine(studyUuid, currentNodeUuid, lineId) {
    console.info('switching on line ' + lineId + ' ...');
    return changeLineStatus(studyUuid, currentNodeUuid, lineId, 'switch_on');
}

export function createLoad(
    studyUuid,
    currentNodeUuid,
    id,
    name,
    loadType,
    activePower,
    reactivePower,
    voltageLevelId,
    busOrBusbarSectionId,
    isUpdate = false,
    modificationUuid,
    connectionDirection,
    connectionName
) {
    let createLoadUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-modifications';

    if (isUpdate) {
        createLoadUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating load creation');
    } else {
        console.info('Creating load creation');
    }

    return backendFetchText(createLoadUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPE.LOAD_CREATION,
            equipmentId: id,
            equipmentName: name,
            loadType: loadType,
            activePower: activePower,
            reactivePower: reactivePower,
            voltageLevelId: voltageLevelId,
            busOrBusbarSectionId: busOrBusbarSectionId,
            connectionDirection: connectionDirection,
            connectionName: connectionName,
        }),
    });
}

export function modifyLoad(
    studyUuid,
    currentNodeUuid,
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
    let modifyLoadUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-modifications';

    if (isUpdate) {
        modifyLoadUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating load modification');
    } else {
        console.info('Creating load modification');
    }

    return backendFetchText(modifyLoadUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPE.LOAD_MODIFICATION,
            equipmentId: id,
            equipmentName: toModificationOperation(name),
            loadType: toModificationOperation(loadType),
            activePower: toModificationOperation(activePower),
            reactivePower: toModificationOperation(reactivePower),
            voltageLevelId: toModificationOperation(voltageLevelId),
            busOrBusbarSectionId: toModificationOperation(busOrBusbarSectionId),
        }),
    });
}

function toModificationOperation(value) {
    return value === 0 || value === false || value
        ? { value: value, op: 'SET' }
        : null;
}

export function modifyGenerator(
    studyUuid,
    currentNodeUuid,
    generatorId,
    name,
    energySource,
    minimumActivePower,
    maximumActivePower,
    ratedNominalPower,
    activePowerSetpoint,
    reactivePowerSetpoint,
    voltageRegulation,
    voltageSetpoint,
    voltageLevelId,
    busOrBusbarSectionId,
    modificationId
) {
    let modificationUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-modifications';

    if (modificationId) {
        modificationUrl += '/' + encodeURIComponent(modificationId);
        console.info('Updating generator modification');
    } else {
        console.info('Creating generator modification');
    }

    const generatorModification = {
        type: MODIFICATION_TYPE.GENERATOR_MODIFICATION,
        equipmentId: generatorId,
        equipmentName: toModificationOperation(name),
        energySource: toModificationOperation(energySource),
        minActivePower: toModificationOperation(minimumActivePower),
        maxActivePower: toModificationOperation(maximumActivePower),
        ratedNominalPower: toModificationOperation(ratedNominalPower),
        activePowerSetpoint: toModificationOperation(activePowerSetpoint),
        reactivePowerSetpoint: toModificationOperation(reactivePowerSetpoint),
        voltageRegulationOn: toModificationOperation(voltageRegulation),
        voltageSetpoint: toModificationOperation(voltageSetpoint),
        voltageLevelId: toModificationOperation(voltageLevelId),
        busOrBusbarSectionId: toModificationOperation(busOrBusbarSectionId),
    };
    return backendFetchText(modificationUrl, {
        method: modificationId ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(generatorModification),
    });
}

export function createGenerator(
    studyUuid,
    currentNodeUuid,
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
    qPercent,
    voltageLevelId,
    busOrBusbarSectionId,
    isUpdate = false,
    modificationUuid,
    marginalCost,
    transientReactance,
    transformerReactance,
    regulatingTerminalId,
    regulatingTerminalType,
    regulatingTerminalVlId,
    isReactiveCapabilityCurveOn,
    frequencyRegulation,
    droop,
    maximumReactivePower,
    minimumReactivePower,
    reactiveCapabilityCurve,
    connectionDirection,
    connectionName
) {
    let createGeneratorUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-modifications';

    if (isUpdate) {
        createGeneratorUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating generator creation');
    } else {
        console.info('Creating generator creation');
    }

    return backendFetchText(createGeneratorUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPE.GENERATOR_CREATION,
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
            qPercent: qPercent,
            voltageLevelId: voltageLevelId,
            busOrBusbarSectionId: busOrBusbarSectionId,
            marginalCost: marginalCost,
            transientReactance: transientReactance,
            stepUpTransformerReactance: transformerReactance,
            regulatingTerminalId: regulatingTerminalId,
            regulatingTerminalType: regulatingTerminalType,
            regulatingTerminalVlId: regulatingTerminalVlId,
            reactiveCapabilityCurve: isReactiveCapabilityCurveOn,
            participate: frequencyRegulation,
            droop: droop,
            maximumReactivePower: maximumReactivePower,
            minimumReactivePower: minimumReactivePower,
            connectionDirection: connectionDirection,
            connectionName: connectionName,
            reactiveCapabilityCurvePoints: reactiveCapabilityCurve,
        }),
    });
}

export function createShuntCompensator(
    studyUuid,
    currentNodeUuid,
    shuntCompensatorId,
    shuntCompensatorName,
    maximumNumberOfSections,
    currentNumberOfSections,
    identicalSections,
    susceptancePerSection,
    connectivity,
    isUpdate,
    modificationUuid,
    connectionDirection,
    connectionName
) {
    let createShuntUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-modifications';

    if (isUpdate) {
        createShuntUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating shunt compensator creation');
    } else {
        console.info('Creating shunt compensator creation');
    }

    return backendFetchText(createShuntUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPE.SHUNT_COMPENSATOR_CREATION,
            equipmentId: shuntCompensatorId,
            equipmentName: shuntCompensatorName,
            maximumNumberOfSections: maximumNumberOfSections,
            currentNumberOfSections: currentNumberOfSections,
            isIdenticalSection: identicalSections,
            susceptancePerSection: susceptancePerSection,
            voltageLevelId: connectivity.voltageLevel.id,
            busOrBusbarSectionId: connectivity.busOrBusbarSection.id,
            connectionDirection: connectionDirection,
            connectionName: connectionName,
        }),
    });
}

export function createLine(
    studyUuid,
    currentNodeUuid,
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
    modificationUuid,
    connectionName1,
    connectionDirection1,
    connectionName2,
    connectionDirection2
) {
    let createLineUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-modifications';

    if (isUpdate) {
        createLineUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating line creation');
    } else {
        console.info('Creating line creation');
    }

    return backendFetchText(createLineUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPE.LINE_CREATION,
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
            connectionName1: connectionName1,
            connectionDirection1: connectionDirection1,
            connectionName2: connectionName2,
            connectionDirection2: connectionDirection2,
        }),
    });
}

export function createTwoWindingsTransformer(
    studyUuid,
    currentNodeUuid,
    twoWindingsTransformerId,
    twoWindingsTransformerName,
    seriesResistance,
    seriesReactance,
    magnetizingConductance,
    magnetizingSusceptance,
    ratedS,
    ratedVoltage1,
    ratedVoltage2,
    permanentCurrentLimit1,
    permanentCurrentLimit2,
    voltageLevelId1,
    busOrBusbarSectionId1,
    voltageLevelId2,
    busOrBusbarSectionId2,
    ratioTapChanger,
    phaseTapChanger,
    isUpdate,
    modificationUuid,
    connectionName1,
    connectionDirection1,
    connectionName2,
    connectionDirection2
) {
    let createTwoWindingsTransformerUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-modifications';

    if (isUpdate) {
        createTwoWindingsTransformerUrl +=
            '/' + encodeURIComponent(modificationUuid);
        console.info('Updating two windings transformer creation');
    } else {
        console.info('Creating two windings transformer creation');
    }

    return backendFetchText(createTwoWindingsTransformerUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPE.TWO_WINDINGS_TRANSFORMER_CREATION,
            equipmentId: twoWindingsTransformerId,
            equipmentName: twoWindingsTransformerName,
            seriesResistance: seriesResistance,
            seriesReactance: seriesReactance,
            magnetizingConductance: magnetizingConductance,
            magnetizingSusceptance: magnetizingSusceptance,
            ratedS: ratedS,
            ratedVoltage1: ratedVoltage1,
            ratedVoltage2: ratedVoltage2,
            currentLimits1: permanentCurrentLimit1,
            currentLimits2: permanentCurrentLimit2,
            voltageLevelId1: voltageLevelId1,
            busOrBusbarSectionId1: busOrBusbarSectionId1,
            voltageLevelId2: voltageLevelId2,
            busOrBusbarSectionId2: busOrBusbarSectionId2,
            ratioTapChanger: ratioTapChanger,
            phaseTapChanger: phaseTapChanger,
            connectionName1: connectionName1,
            connectionDirection1: connectionDirection1,
            connectionName2: connectionName2,
            connectionDirection2: connectionDirection2,
        }),
    });
}

export function createSubstation(
    studyUuid,
    currentNodeUuid,
    substationId,
    substationName,
    substationCountry,
    isUpdate = false,
    modificationUuid,
    properties
) {
    let createSubstationUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-modifications';

    if (isUpdate) {
        createSubstationUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating substation creation');
    } else {
        console.info('Creating substation creation');
    }

    const asObj = !properties
        ? undefined
        : Object.fromEntries(properties.map((p) => [p.name, p.value]));

    const body = JSON.stringify({
        type: MODIFICATION_TYPE.SUBSTATION_CREATION,
        equipmentId: substationId,
        equipmentName: substationName,
        substationCountry: substationCountry === '' ? null : substationCountry,
        properties: asObj,
    });
    console.debug('createSubstation body', properties, body);

    return backendFetchText(createSubstationUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: body,
    });
}

export function createVoltageLevel({
    studyUuid,
    currentNodeUuid,
    voltageLevelId,
    voltageLevelName,
    nominalVoltage,
    substationId,
    busbarSections,
    busbarConnections,
    isUpdate,
    modificationUuid,
}) {
    let createVoltageLevelUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-modifications';

    if (isUpdate) {
        createVoltageLevelUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating voltage level creation');
    } else {
        console.info('Creating voltage level creation');
    }

    const body = JSON.stringify({
        type: MODIFICATION_TYPE.VOLTAGE_LEVEL_CREATION,
        equipmentId: voltageLevelId,
        equipmentName: voltageLevelName,
        nominalVoltage: nominalVoltage,
        substationId: substationId,
        busbarSections: busbarSections,
        busbarConnections: busbarConnections,
    });

    return backendFetchText(createVoltageLevelUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: body,
    });
}

export function divideLine(
    studyUuid,
    currentNodeUuid,
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
        type: MODIFICATION_TYPE.LINE_SPLIT_WITH_VOLTAGE_LEVEL,
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

    let lineSplitUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-modifications';

    if (modificationUuid) {
        lineSplitUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating line split with voltage level');
    } else {
        console.info('Creating line split with voltage level');
    }

    return backendFetchText(lineSplitUrl, {
        method: modificationUuid ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body,
    });
}

export function attachLine(
    studyUuid,
    currentNodeUuid,
    modificationUuid,
    lineToAttachToId,
    percent,
    attachmentPointId,
    attachmentPointName,
    mayNewVoltageLevelInfos,
    existingVoltageLevelId,
    bbsOrBusId,
    attachmentLine,
    newLine1Id,
    newLine1Name,
    newLine2Id,
    newLine2Name
) {
    const body = JSON.stringify({
        type: MODIFICATION_TYPE.LINE_ATTACH_TO_VOLTAGE_LEVEL,
        lineToAttachToId,
        percent,
        attachmentPointId,
        attachmentPointName,
        mayNewVoltageLevelInfos,
        existingVoltageLevelId,
        bbsOrBusId,
        attachmentLine,
        newLine1Id,
        newLine1Name,
        newLine2Id,
        newLine2Name,
    });

    let lineAttachUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-modifications';

    if (modificationUuid) {
        lineAttachUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating line attach to voltage level');
    } else {
        console.info('Creating line attach to voltage level');
    }

    return backendFetchText(lineAttachUrl, {
        method: modificationUuid ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body,
    });
}

export function linesAttachToSplitLines(
    studyUuid,
    currentNodeUuid,
    modificationUuid,
    lineToAttachTo1Id,
    lineToAttachTo2Id,
    attachedLineId,
    voltageLevelId,
    bbsBusId,
    replacingLine1Id,
    replacingLine1Name,
    replacingLine2Id,
    replacingLine2Name
) {
    const body = JSON.stringify({
        type: MODIFICATION_TYPE.LINES_ATTACH_TO_SPLIT_LINES,
        lineToAttachTo1Id,
        lineToAttachTo2Id,
        attachedLineId,
        voltageLevelId,
        bbsBusId,
        replacingLine1Id,
        replacingLine1Name,
        replacingLine2Id,
        replacingLine2Name,
    });

    let lineAttachUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-modifications';

    if (modificationUuid) {
        lineAttachUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating attaching lines to splitting lines');
    } else {
        console.info('Creating attaching lines to splitting lines');
    }

    return backendFetchText(lineAttachUrl, {
        method: modificationUuid ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body,
    });
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

export function getDefaultLoadFlowProvider() {
    console.info('get default load flow provier');
    const getDefaultLoadFlowProviderUrl =
        PREFIX_STUDY_QUERIES + '/v1/loadflow-default-provider';
    console.debug(getDefaultLoadFlowProviderUrl);
    return backendFetchText(getDefaultLoadFlowProviderUrl);
}

export function getAvailableComponentLibraries() {
    console.info('get available component libraries for diagrams');
    const getAvailableComponentLibrariesUrl =
        PREFIX_STUDY_QUERIES + '/v1/svg-component-libraries';
    console.debug(getAvailableComponentLibrariesUrl);
    return backendFetchJson(getAvailableComponentLibrariesUrl);
}

export function deleteEquipment(
    studyUuid,
    currentNodeUuid,
    equipmentType,
    equipmentId,
    modificationUuid
) {
    let deleteEquipmentUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-modifications';

    if (modificationUuid) {
        deleteEquipmentUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating equipment deletion');
    } else {
        console.info('Creating equipment deletion');
    }

    return backendFetch(deleteEquipmentUrl, {
        method: modificationUuid ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPE.EQUIPMENT_DELETION,
            equipmentId: equipmentId,
            equipmentType: equipmentType,
        }),
    });
}

export function fetchLoadFlowInfos(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching loadflow infos (status and result) for '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const fetchLoadFlowInfosUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) + '/loadflow/infos';
    return backendFetchJson(fetchLoadFlowInfosUrl);
}

export function fetchNetworkModifications(studyUuid, nodeUuid) {
    console.info('Fetching network modifications for nodeUuid : ', nodeUuid);
    const modificationsGetUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/studies/' +
        encodeURIComponent(studyUuid) +
        '/nodes/' +
        encodeURIComponent(nodeUuid) +
        '/network-modifications';

    console.debug(modificationsGetUrl);
    return backendFetchJson(modificationsGetUrl);
}

export function fetchNetworkModification(modificationUuid) {
    const modificationFetchUrl =
        PREFIX_NETWORK_MODIFICATION_QUERIES +
        '/v1/network-modifications/' +
        encodeURIComponent(modificationUuid);
    console.debug(modificationFetchUrl);
    return backendFetch(modificationFetchUrl);
}

export function buildNode(studyUuid, currentNodeUuid) {
    console.info(
        'Build node ' + currentNodeUuid + ' of study ' + studyUuid + ' ...'
    );
    const url = getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) + '/build';
    console.debug(url);
    return backendFetchText(url, { method: 'post' });
}

export function changeNetworkModificationOrder(
    studyUuid,
    currentNodeUuid,
    itemUuid,
    beforeUuid
) {
    console.info(
        'reorder node ' + currentNodeUuid + ' of study ' + studyUuid + ' ...'
    );
    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-modification/' +
        itemUuid +
        '?' +
        new URLSearchParams({ beforeUuid: beforeUuid || '' }).toString();
    console.debug(url);
    return backendFetch(url, { method: 'put' });
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

function getSensiUrl() {
    return PREFIX_SENSITIVITY_ANALYSIS_SERVER_QUERIES + '/v1/';
}

export function getSensiDefaultResultsThreshold() {
    console.info('get sensi default results threshold');
    const getSensiDefaultResultsThresholdUrl =
        getSensiUrl() + 'results-threshold-default-value';
    console.debug(getSensiDefaultResultsThresholdUrl);
    return backendFetchText(getSensiDefaultResultsThresholdUrl, {
        method: 'get',
    });
}

export function fetchElementsMetadata(ids, elementTypes, equipmentTypes) {
    console.info('Fetching elements metadata');
    const url =
        PREFIX_EXPLORE_SERVER_QUERIES +
        '/v1/explore/elements/metadata?ids=' +
        ids
            .filter((e) => e != null && e !== '') // filter empty element
            .join('&ids=') +
        '&equipmentTypes=' +
        equipmentTypes.join('&equipmentTypes=') +
        '&elementTypes=' +
        elementTypes.join('&elementTypes=');
    console.debug(url);
    return backendFetchJson(url);
}
