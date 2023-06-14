/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { store } from '../redux/store';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { APP_NAME, getAppName } from './config-params';
import {
    BRANCH_STATUS_ACTION,
    BRANCH_SIDE,
} from '../components/network/constants';
import { MODIFICATION_TYPES } from '../components/utils/modification-type';
import {
    EQUIPMENT_INFOS_TYPES,
    EQUIPMENT_TYPES,
} from '../components/utils/equipment-types';
import { toModificationOperation } from '../components/utils/utils';

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
const PREFIX_LOADFLOW_SERVER_QUERIES =
    process.env.REACT_APP_API_GATEWAY + '/loadflow';
const PREFIX_SECURITY_ANALYSIS_SERVER_QUERIES =
    process.env.REACT_APP_API_GATEWAY + '/security-analysis';
const PREFIX_DYNAMIC_SIMULATION_SERVER_QUERIES =
    process.env.REACT_APP_API_GATEWAY + '/dynamic-simulation';

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

export function fetchValidateUser(user) {
    const sub = user?.profile?.sub;
    if (!sub) {
        return Promise.reject(
            new Error(
                'Error : Fetching access for missing user.profile.sub : ' + user
            )
        );
    }

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
            if (error.status === 403) {
                return false;
            } else {
                throw error;
            }
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
    componentLibrary,
    sldDisplayMode,
    language
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
            sldDisplayMode: sldDisplayMode,
            language: language,
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
    componentLibrary,
    language
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
            language: language,
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
    return backendFetch(svgUrl).then((response) =>
        response.status === 204 ? null : response.json()
    );
}

export function fetchSubstations(studyUuid, currentNodeUuid, substationsIds) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.SUBSTATION.type,
        EQUIPMENT_INFOS_TYPES.TAB.type,
        true
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

export function fetchLines(studyUuid, currentNodeUuid, substationsIds) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.LINE.type,
        EQUIPMENT_INFOS_TYPES.TAB.type,
        true
    );
}

export function fetchVoltageLevels(studyUuid, currentNodeUuid, substationsIds) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.VOLTAGE_LEVEL.type,
        EQUIPMENT_INFOS_TYPES.TAB.type,
        true
    );
}

export function fetchVoltageLevelsListInfos(
    studyUuid,
    currentNodeUuid,
    substationsIds
) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.VOLTAGE_LEVEL.type,
        EQUIPMENT_INFOS_TYPES.LIST.type,
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
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.LOAD.type,
        EQUIPMENT_INFOS_TYPES.TAB.type,
        true
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
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.HVDC_LINE.type,
        EQUIPMENT_INFOS_TYPES.TAB.type,
        true
    );
}

export function fetchHvdcLinesWithShuntCompensators(
    studyUuid,
    currentNodeUuid
) {
    console.info(
        `Fetching HVDC Lines with Shunt Compensators of study '${studyUuid}' and node '${currentNodeUuid}'...`
    );

    const fetchEquipmentsUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-map' +
        '/hvdc-lines';
    console.debug(fetchEquipmentsUrl);
    return backendFetchJson(fetchEquipmentsUrl);
}

export function fetchHvdcLineWithShuntCompensators(
    studyUuid,
    currentNodeUuid,
    hvdcLineId
) {
    console.info(
        `Fetching HVDC Line '${hvdcLineId}' with Shunt Compensators of study '${studyUuid}' and node '${currentNodeUuid}'...`
    );
    const fetchEquipmentsUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-map' +
        '/hvdc-lines/' +
        hvdcLineId +
        '/shunt-compensators';
    console.debug(fetchEquipmentsUrl);
    return backendFetchJson(fetchEquipmentsUrl);
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
        getQueryParamsList(substationsIds, 'substationId') +
        urlSearchParams.toString();
    console.debug(fetchEquipmentsUrl);
    return backendFetchJson(fetchEquipmentsUrl);
}

export function fetchNetworkElementsInfos(
    studyUuid,
    currentNodeUuid,
    substationsIds,
    elementType,
    infoType,
    inUpstreamBuiltParentNode
) {
    console.info(
        `Fetching network '${elementType}' elements '${infoType}' infos of study '${studyUuid}' and node '${currentNodeUuid}' with substations ids '${substationsIds}'...`
    );

    let urlSearchParams = new URLSearchParams();
    if (inUpstreamBuiltParentNode !== undefined) {
        urlSearchParams.append(
            'inUpstreamBuiltParentNode',
            inUpstreamBuiltParentNode
        );
    }
    if (substationsIds !== undefined && substationsIds.length > 0) {
        substationsIds.forEach((id) =>
            urlSearchParams.append('substationsIds', id)
        );
    }
    urlSearchParams.append('elementType', elementType);
    urlSearchParams.append('infoType', infoType);

    const fetchElementsUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network/elements' +
        '?' +
        urlSearchParams.toString();
    console.debug(fetchElementsUrl);

    return backendFetchJson(fetchElementsUrl);
}

export function fetchNetworkElementInfos(
    studyUuid,
    currentNodeUuid,
    elementType,
    infoType,
    elementId,
    inUpstreamBuiltParentNode
) {
    console.info(
        `Fetching specific network element '${elementId}' of type '${elementType}' of study '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    let urlSearchParams = new URLSearchParams();
    if (inUpstreamBuiltParentNode !== undefined) {
        urlSearchParams.append(
            'inUpstreamBuiltParentNode',
            inUpstreamBuiltParentNode
        );
    }
    urlSearchParams.append('elementType', elementType);
    urlSearchParams.append('infoType', infoType);

    const fetchElementsUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network/elements/' +
        encodeURIComponent(elementId) +
        '?' +
        urlSearchParams.toString();
    console.debug(fetchElementsUrl);

    return backendFetchJson(fetchElementsUrl);
}

export function fetchVoltageLevelEquipments(
    studyUuid,
    currentNodeUuid,
    substationsIds,
    voltageLevelId,
    inUpstreamBuiltParentNode
) {
    console.info(
        `Fetching equipments of study '${studyUuid}' and node '${currentNodeUuid}' and voltage level '${voltageLevelId}' with substations ids '${substationsIds}'...`
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
        '/network-map' +
        '/voltage-level-equipments/' +
        encodeURIComponent(voltageLevelId) +
        '?' +
        getQueryParamsList(substationsIds, 'substationId') +
        urlSearchParams.toString();
    console.debug(fetchEquipmentsUrl);
    return backendFetchJson(fetchEquipmentsUrl);
}

export function fetchEquipmentsIds(
    studyUuid,
    currentNodeUuid,
    substationsIds,
    equipmentType,
    inUpstreamBuiltParentNode
) {
    console.info(
        `Fetching equipments ids '${equipmentType}' of study '${studyUuid}' and node '${currentNodeUuid}' with substations ids '${substationsIds}'...`
    );
    let urlSearchParams = new URLSearchParams();

    let fetchEquipmentsUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-map/' +
        'equipments-ids' +
        '?' +
        'equipmentType=' +
        equipmentType +
        getQueryParamsList(substationsIds, 'substationId');

    if (inUpstreamBuiltParentNode !== undefined) {
        urlSearchParams.append(
            'inUpstreamBuiltParentNode',
            inUpstreamBuiltParentNode
        );
        fetchEquipmentsUrl =
            fetchEquipmentsUrl + '&' + urlSearchParams.toString();
    }
    console.debug(fetchEquipmentsUrl);
    return backendFetchJson(fetchEquipmentsUrl);
}

export function fetchLineOrTransformer(
    studyUuid,
    currentNodeUuid,
    equipmentId
) {
    return fetchEquipmentInfos(
        studyUuid,
        currentNodeUuid,
        'branch-or-3wt',
        equipmentId,
        true
    );
}

export function fetchEquipmentInfos(
    studyUuid,
    currentNodeUuid,
    equipmentPath,
    equipmentId,
    inUpstreamBuiltParentNode
) {
    console.info(
        `Fetching specific equipment '${equipmentId}' of type '${equipmentPath}' of study '${studyUuid}' and node '${currentNodeUuid}' ...`
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

export function fetchCurrentLimitViolations(
    studyUuid,
    currentNodeUuid,
    limitReduction
) {
    console.info(
        `Fetching current limit violations (with limit reduction ${limitReduction}) ...`
    );
    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/current-limit-violations?limitReduction=' +
        limitReduction.toString();
    return backendFetchJson(url);
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
            type: MODIFICATION_TYPES.EQUIPMENT_ATTRIBUTE_MODIFICATION.type,
            equipmentType: EQUIPMENT_TYPES.SWITCH.type,
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

function getSecurityAnalysisUrl() {
    return PREFIX_SECURITY_ANALYSIS_SERVER_QUERIES + '/v1/';
}

export function fetchSecurityAnalysisProviders() {
    console.info('fetch security analysis providers');
    const url = getSecurityAnalysisUrl() + 'providers';
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchSecurityAnalysisProvider(studyUuid) {
    console.info('fetch security analysis provider');
    const url = getStudyUrl(studyUuid) + '/security-analysis/provider';
    console.debug(url);
    return backendFetchText(url);
}

export function updateSecurityAnalysisProvider(studyUuid, newProvider) {
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

export function fetchSensitivityAnalysisResult(
    studyUuid,
    currentNodeUuid,
    selector
) {
    console.info(
        `Fetching sensitivity analysis on ${studyUuid} and node ${currentNodeUuid}  ...`
    );

    const urlSearchParams = new URLSearchParams();
    const jsoned = JSON.stringify(selector);
    urlSearchParams.append('selector', jsoned);

    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/sensitivity-analysis/result?' +
        urlSearchParams.toString();
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchSensitivityAnalysisProviders() {
    console.info('fetch sensitivity analysis providers');
    const url = getSensiUrl() + 'providers';
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchSensitivityAnalysisProvider(studyUuid) {
    console.info('fetch sensitivity analysis provider');
    const url = getStudyUrl(studyUuid) + '/sensitivity-analysis/provider';
    console.debug(url);
    return backendFetchText(url);
}

export function updateSensitivityAnalysisProvider(studyUuid, newProvider) {
    console.info('update sensitivity analysis provider');
    const url = getStudyUrl(studyUuid) + '/sensitivity-analysis/provider';
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

export function fetchDefaultSensitivityAnalysisProvider() {
    console.info('fetch default sensitivity analysis provider');
    const url =
        PREFIX_STUDY_QUERIES + '/v1/sensitivity-analysis-default-provider';
    console.debug(url);
    return backendFetchText(url);
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

// --- Voltage init API - BEGIN
export function startVoltageInit(studyUuid, currentNodeUuid) {
    console.info(
        `Running voltage init on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );

    const startVoltageInitUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/voltage-init/run';
    console.debug(startVoltageInitUrl);
    return backendFetch(startVoltageInitUrl, { method: 'put' });
}

export function stopVoltageInit(studyUuid, currentNodeUuid) {
    console.info(
        `Stopping voltage init on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const stopVoltageInitUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/voltage-init/stop';
    console.debug(stopVoltageInitUrl);
    return backendFetch(stopVoltageInitUrl, { method: 'put' });
}

export function fetchVoltageInitStatus(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching voltage init status on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/voltage-init/status';
    console.debug(url);
    return backendFetchText(url);
}

export function fetchVoltageInitResult(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching voltage init result on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/voltage-init/result';
    console.debug(url);
    return backendFetchJson(url);
}

export function updateVoltageInitParameters(studyUuid, newParams) {
    console.info('set voltage init parameters');
    const url = getStudyUrl(studyUuid) + '/voltage-init/parameters';
    console.debug(url);

    return backendFetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newParams),
    });
}

export function getVoltageInitParameters(studyUuid) {
    console.info('get voltage init parameters');
    const getVoltageInitParams =
        getStudyUrl(studyUuid) + '/voltage-init/parameters';
    console.debug(getVoltageInitParams);
    return backendFetchJson(getVoltageInitParams);
}
// --- Voltage init API - END

// --- Dynamic simulation API - BEGIN
export function getDynamicMappings(studyUuid) {
    console.info(`Fetching dynamic mappings on '${studyUuid}' ...`);
    const url = getStudyUrl(studyUuid) + '/dynamic-simulation/mappings';
    console.debug(url);
    return backendFetchJson(url);
}

export function startDynamicSimulation(
    studyUuid,
    currentNodeUuid,
    dynamicSimulationConfiguration
) {
    console.info(
        `Running dynamic simulation on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );

    let startDynamicSimulationUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/dynamic-simulation/run?';

    // add body
    const body = JSON.stringify(dynamicSimulationConfiguration ?? {});

    console.debug({ startDynamicSimulationUrl, body });
    return backendFetchJson(startDynamicSimulationUrl, {
        method: 'post',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body,
    });
}

export function stopDynamicSimulation(studyUuid, currentNodeUuid) {
    console.info(
        `Stopping dynamic simulation on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const stopDynamicSimulationUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/dynamic-simulation/stop';
    console.debug(stopDynamicSimulationUrl);
    return backendFetch(stopDynamicSimulationUrl, { method: 'put' });
}

export function fetchDynamicSimulationStatus(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching dynamic simulation status on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/dynamic-simulation/status';
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchDynamicSimulationTimeSeriesMetadata(
    studyUuid,
    currentNodeUuid
) {
    console.info(
        `Fetching dynamic simulation time series's metadata on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );

    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/dynamic-simulation/result/timeseries/metadata';
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchDynamicSimulationResultTimeSeries(
    studyUuid,
    currentNodeUuid,
    timeSeriesNames
) {
    console.info(
        `Fetching dynamic simulation time series result on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    let url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/dynamic-simulation/result/timeseries';

    const paramsList =
        timeSeriesNames &&
        timeSeriesNames.length > 0 &&
        '?' + getQueryParamsList(timeSeriesNames, 'timeSeriesNames');

    url += paramsList || '';

    console.debug(url);
    return backendFetchJson(url);
}

export function fetchDynamicSimulationResultTimeLine(
    studyUuid,
    currentNodeUuid
) {
    console.info(
        `Fetching dynamic simulation timeline result on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/dynamic-simulation/result/timeline';
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchDynamicSimulationResult(studyUuid, currentNodeUuid) {
    // fetch parallel different results
    const timeseriesMetadataPromise = fetchDynamicSimulationTimeSeriesMetadata(
        studyUuid,
        currentNodeUuid
    );
    const statusPromise = fetchDynamicSimulationStatus(
        studyUuid,
        currentNodeUuid
    );
    return Promise.all([timeseriesMetadataPromise, statusPromise]).then(
        ([timeseriesMetadatas, status]) => ({
            timeseriesMetadatas,
            status,
        })
    );
}

// -- Parameters API - BEGIN
function getDynamicSimulationUrl() {
    return PREFIX_DYNAMIC_SIMULATION_SERVER_QUERIES + '/v1/';
}

export function fetchDynamicSimulationModels(studyUuid, nodeUuid) {
    console.info(
        `Fetching dynamic simulation models on '${studyUuid}' and node '${nodeUuid}' ...`
    );

    const url =
        getStudyUrlWithNodeUuid(studyUuid, nodeUuid) +
        '/dynamic-simulation/models';
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchDynamicSimulationProviders() {
    console.info('fetch dynamic simulation providers');
    const url = getDynamicSimulationUrl() + 'providers';
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchDynamicSimulationProvider(studyUuid) {
    console.info('fetch dynamic simulation provider');
    const url = getStudyUrl(studyUuid) + '/dynamic-simulation/provider';
    console.debug(url);
    return backendFetchText(url);
}

export function fetchDefaultDynamicSimulationProvider() {
    console.info('fetch default dynamic simulation provider');
    const url =
        PREFIX_STUDY_QUERIES + '/v1/dynamic-simulation-default-provider';
    console.debug(url);
    return backendFetchText(url);
}

export function updateDynamicSimulationProvider(studyUuid, newProvider) {
    console.info('update dynamic simulation provider');
    const url = getStudyUrl(studyUuid) + '/dynamic-simulation/provider';
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

export function fetchDynamicSimulationParameters(studyUuid) {
    console.info(
        `Fetching dynamic simulation parameters on '${studyUuid}' ...`
    );
    let url = getStudyUrl(studyUuid) + '/dynamic-simulation/parameters';

    console.debug(url);
    const parametersPromise = backendFetchJson(url);

    const mappingsPromise = getDynamicMappings(studyUuid);

    return Promise.all([parametersPromise, mappingsPromise]).then(
        ([parameters, mappings]) => ({
            ...parameters,
            mappings,
        })
    );
}

export function updateDynamicSimulationParameters(studyUuid, newParams) {
    console.info('set dynamic simulation parameters');
    const url = getStudyUrl(studyUuid) + '/dynamic-simulation/parameters';
    console.debug(url);

    return backendFetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newParams),
    });
}

// -- Parameters API - END
// --- Dynamic simulation API - END

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

export function fetchNetworkModificationSubtree(studyUuid, parentNodeUuid) {
    console.info('Fetching network modification tree node : ', parentNodeUuid);
    const url =
        getStudyUrl(studyUuid) +
        '/subtree?parentNodeUuid=' +
        encodeURIComponent(parentNodeUuid);
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

export function deleteSubtree(studyUuid, parentNodeId) {
    console.info('Deleting node subtree : ', parentNodeId);
    const url =
        getStudyUrl(studyUuid) +
        '/tree/nodes/' +
        encodeURIComponent(parentNodeId) +
        '?deleteChildren=true';
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
    sourceStudyId,
    targetStudyId,
    nodeToCopyUuid,
    referenceNodeUuid,
    insertMode
) {
    const nodeCopyUrl =
        getStudyUrl(targetStudyId) +
        '/tree/nodes?insertMode=' +
        insertMode +
        '&nodeToCopyUuid=' +
        nodeToCopyUuid +
        '&referenceNodeUuid=' +
        referenceNodeUuid +
        '&sourceStudyUuid=' +
        sourceStudyId;
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

export function cutSubtree(targetStudyId, nodeToCopyUuid, referenceNodeUuid) {
    const nodeCopyUrl =
        getStudyUrl(targetStudyId) +
        '/tree/subtrees?subtreeToCutParentNodeUuid=' +
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

export function copySubtree(targetStudyId, nodeToCopyUuid, referenceNodeUuid) {
    const nodeCopyUrl =
        getStudyUrl(targetStudyId) +
        '/tree/subtrees?subtreeToCopyParentNodeUuid=' +
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

    return backendFetch(copyOrMoveModificationUrl, {
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

export function fetchMapBoxToken() {
    console.info(`Fetching MapBoxToken...`);
    return fetch('env.json')
        .then((res) => res.json())
        .then((res) => {
            return res.mapBoxToken;
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
            type: MODIFICATION_TYPES.GROOVY_SCRIPT.type,
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

export function getLoadFlowSpecificParametersDescription() {
    console.info('get load flow specific parameters description');
    const getLoadFlowSpecificParameterssUrl =
        getLoadFlowUrl() + 'specific-parameters';
    console.debug(getLoadFlowSpecificParameterssUrl);
    return backendFetchJson(getLoadFlowSpecificParameterssUrl);
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

function changeBranchStatus(studyUuid, currentNodeUuid, branchId, action) {
    const changeBranchStatusUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-modifications';
    console.debug('%s with action: %s', changeBranchStatusUrl, action);
    return backendFetch(changeBranchStatusUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/text',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPES.BRANCH_STATUS_MODIFICATION.type,
            equipmentId: branchId,
            action: action,
        }),
    });
}

export function lockoutBranch(studyUuid, currentNodeUuid, branchId) {
    console.info('locking out branch ' + branchId + ' ...');
    return changeBranchStatus(
        studyUuid,
        currentNodeUuid,
        branchId,
        BRANCH_STATUS_ACTION.LOCKOUT
    );
}

export function tripBranch(studyUuid, currentNodeUuid, branchId) {
    console.info('tripping branch ' + branchId + ' ...');
    return changeBranchStatus(
        studyUuid,
        currentNodeUuid,
        branchId,
        BRANCH_STATUS_ACTION.TRIP
    );
}

export function energiseBranchEnd(
    studyUuid,
    currentNodeUuid,
    branchId,
    branchSide
) {
    console.info(
        'energise branch ' + branchId + ' on side ' + branchSide + ' ...'
    );
    return changeBranchStatus(
        studyUuid,
        currentNodeUuid,
        branchId,
        branchSide === BRANCH_SIDE.ONE
            ? BRANCH_STATUS_ACTION.ENERGISE_END_ONE
            : BRANCH_STATUS_ACTION.ENERGISE_END_TWO
    );
}

export function switchOnBranch(studyUuid, currentNodeUuid, branchId) {
    console.info('switching on branch ' + branchId + ' ...');
    return changeBranchStatus(
        studyUuid,
        currentNodeUuid,
        branchId,
        BRANCH_STATUS_ACTION.SWITCH_ON
    );
}

export function generatorScaling(
    studyUuid,
    currentNodeUuid,
    modificationUuid,
    variationType,
    variations
) {
    const body = JSON.stringify({
        type: MODIFICATION_TYPES.GENERATOR_SCALING.type,
        variationType,
        variations,
    });

    let generatorScalingUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-modifications';
    if (modificationUuid) {
        console.info('generator scaling update', body);
        generatorScalingUrl =
            generatorScalingUrl + '/' + encodeURIComponent(modificationUuid);
    }

    return backendFetch(generatorScalingUrl, {
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
    connectionName,
    connectionPosition
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
            type: MODIFICATION_TYPES.LOAD_CREATION.type,
            equipmentId: id,
            equipmentName: name,
            loadType: loadType,
            activePower: activePower,
            reactivePower: reactivePower,
            voltageLevelId: voltageLevelId,
            busOrBusbarSectionId: busOrBusbarSectionId,
            connectionDirection: connectionDirection,
            connectionName: connectionName,
            connectionPosition: connectionPosition,
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
            type: MODIFICATION_TYPES.LOAD_MODIFICATION.type,
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
    modificationId,
    qPercent,
    plannedActivePowerSetPoint,
    startupCost,
    marginalCost,
    plannedOutageRate,
    forcedOutageRate,
    transientReactance,
    transformerReactance,
    voltageRegulationType,
    regulatingTerminalId,
    regulatingTerminalType,
    regulatingTerminalVlId,
    isReactiveCapabilityCurveOn,
    frequencyRegulation,
    droop,
    maximumReactivePower,
    minimumReactivePower,
    reactiveCapabilityCurve
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
        type: MODIFICATION_TYPES.GENERATOR_MODIFICATION.type,
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
        qPercent: toModificationOperation(qPercent),
        plannedActivePowerSetPoint: toModificationOperation(
            plannedActivePowerSetPoint
        ),
        startupCost: toModificationOperation(startupCost),
        marginalCost: toModificationOperation(marginalCost),
        plannedOutageRate: toModificationOperation(plannedOutageRate),
        forcedOutageRate: toModificationOperation(forcedOutageRate),
        transientReactance: toModificationOperation(transientReactance),
        stepUpTransformerReactance:
            toModificationOperation(transformerReactance),
        voltageRegulationType: toModificationOperation(voltageRegulationType),
        regulatingTerminalId: toModificationOperation(regulatingTerminalId),
        regulatingTerminalType: toModificationOperation(regulatingTerminalType),
        regulatingTerminalVlId: toModificationOperation(regulatingTerminalVlId),
        reactiveCapabilityCurve: toModificationOperation(
            isReactiveCapabilityCurveOn
        ),
        participate: toModificationOperation(frequencyRegulation),
        droop: toModificationOperation(droop),
        maximumReactivePower: toModificationOperation(maximumReactivePower),
        minimumReactivePower: toModificationOperation(minimumReactivePower),
        reactiveCapabilityCurvePoints: reactiveCapabilityCurve,
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
    plannedActivePowerSetPoint,
    startupCost,
    marginalCost,
    plannedOutageRate,
    forcedOutageRate,
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
    connectionName,
    connectionPosition
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
            type: MODIFICATION_TYPES.GENERATOR_CREATION.type,
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
            plannedActivePowerSetPoint: plannedActivePowerSetPoint,
            startupCost: startupCost,
            marginalCost: marginalCost,
            plannedOutageRate: plannedOutageRate,
            forcedOutageRate: forcedOutageRate,
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
            connectionPosition: connectionPosition,
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
    qAtNominalV,
    shuntCompensatorType,
    connectivity,
    isUpdate,
    modificationUuid,
    connectionDirection,
    connectionName,
    connectionPosition
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
            type: MODIFICATION_TYPES.SHUNT_COMPENSATOR_CREATION.type,
            equipmentId: shuntCompensatorId,
            equipmentName: shuntCompensatorName,
            maximumNumberOfSections: maximumNumberOfSections,
            currentNumberOfSections: currentNumberOfSections,
            isIdenticalSection: identicalSections,
            susceptancePerSection: susceptancePerSection,
            qAtNominalV: qAtNominalV,
            shuntCompensatorType: shuntCompensatorType,
            voltageLevelId: connectivity.voltageLevel.id,
            busOrBusbarSectionId: connectivity.busOrBusbarSection.id,
            connectionDirection: connectionDirection,
            connectionName: connectionName,
            connectionPosition: connectionPosition,
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
    temporaryCurrentLimits1,
    temporaryCurrentLimits2,
    isUpdate,
    modificationUuid,
    connectionName1,
    connectionDirection1,
    connectionName2,
    connectionDirection2,
    connectionPosition1,
    connectionPosition2
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
            type: MODIFICATION_TYPES.LINE_CREATION.type,
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
                temporaryLimits: temporaryCurrentLimits1,
            },
            currentLimits2: {
                permanentLimit: permanentCurrentLimit2,
                temporaryLimits: temporaryCurrentLimits2,
            },
            connectionName1: connectionName1,
            connectionDirection1: connectionDirection1,
            connectionName2: connectionName2,
            connectionDirection2: connectionDirection2,
            connectionPosition1: connectionPosition1,
            connectionPosition2: connectionPosition2,
        }),
    });
}

export function modifyLine(
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
    permanentCurrentLimit1,
    permanentCurrentLimit2,
    temporaryCurrentLimits1,
    temporaryCurrentLimits2,
    isUpdate,
    modificationUuid
) {
    let modifyLineUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-modifications';

    if (isUpdate) {
        modifyLineUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating line modification');
    } else {
        console.info('Creating line modification');
    }

    return backendFetchText(modifyLineUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPES.LINE_MODIFICATION.type,
            equipmentId: lineId,
            equipmentName: toModificationOperation(lineName),
            seriesResistance: toModificationOperation(seriesResistance),
            seriesReactance: toModificationOperation(seriesReactance),
            shuntConductance1: toModificationOperation(shuntConductance1),
            shuntSusceptance1: toModificationOperation(shuntSusceptance1),
            shuntConductance2: toModificationOperation(shuntConductance2),
            shuntSusceptance2: toModificationOperation(shuntSusceptance2),
            currentLimits1: {
                permanentLimit: permanentCurrentLimit1,
                temporaryLimits: temporaryCurrentLimits1,
            },
            currentLimits2: {
                permanentLimit: permanentCurrentLimit2,
                temporaryLimits: temporaryCurrentLimits2,
            },
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
    currentLimit1,
    currentLimit2,
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
    connectionDirection2,
    connectionPosition1,
    connectionPosition2
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
            type: MODIFICATION_TYPES.TWO_WINDINGS_TRANSFORMER_CREATION.type,
            equipmentId: twoWindingsTransformerId,
            equipmentName: twoWindingsTransformerName,
            seriesResistance: seriesResistance,
            seriesReactance: seriesReactance,
            magnetizingConductance: magnetizingConductance,
            magnetizingSusceptance: magnetizingSusceptance,
            ratedS: ratedS,
            ratedVoltage1: ratedVoltage1,
            ratedVoltage2: ratedVoltage2,
            currentLimits1: currentLimit1,
            currentLimits2: currentLimit2,
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
            connectionPosition1: connectionPosition1,
            connectionPosition2: connectionPosition2,
        }),
    });
}

export function modifyTwoWindingsTransformer(
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
    currentLimit1,
    currentLimit2,
    isUpdate,
    modificationUuid
) {
    let modifyTwoWindingsTransformerUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-modifications';

    if (isUpdate) {
        modifyTwoWindingsTransformerUrl +=
            '/' + encodeURIComponent(modificationUuid);
        console.info('Updating two windings transformer modification');
    } else {
        console.info('Creating two windings transformer modification');
    }

    return backendFetchText(modifyTwoWindingsTransformerUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPES.TWO_WINDINGS_TRANSFORMER_MODIFICATION.type,
            equipmentId: twoWindingsTransformerId,
            equipmentName: twoWindingsTransformerName,
            seriesResistance: seriesResistance,
            seriesReactance: seriesReactance,
            magnetizingConductance: magnetizingConductance,
            magnetizingSusceptance: magnetizingSusceptance,
            ratedS: ratedS,
            ratedVoltage1: ratedVoltage1,
            ratedVoltage2: ratedVoltage2,
            currentLimits1: currentLimit1,
            currentLimits2: currentLimit2,
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
    let url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-modifications';

    const asObj = !properties?.length
        ? undefined
        : Object.fromEntries(properties.map((p) => [p.name, p.value]));

    const body = JSON.stringify({
        type: MODIFICATION_TYPES.SUBSTATION_CREATION.type,
        equipmentId: substationId,
        equipmentName: substationName,
        substationCountry: substationCountry === '' ? null : substationCountry,
        properties: asObj,
    });

    if (isUpdate) {
        url += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating substation creation', { url, body });
    } else {
        console.info('Creating substation creation', { url, body });
    }

    return backendFetchText(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: body,
    });
}

export function modifySubstation(
    studyUuid,
    currentNodeUuid,
    id,
    name,
    substationCountry,
    isUpdate = false,
    modificationUuid,
    properties
) {
    let modifyUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-modifications';

    if (isUpdate) {
        modifyUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating substation modification');
    } else {
        console.info('Creating substation modification');
    }

    return backendFetchText(modifyUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPES.SUBSTATION_MODIFICATION.type,
            equipmentId: id,
            equipmentName: toModificationOperation(name),
            substationCountry: toModificationOperation(substationCountry),
            properties: properties,
        }),
    });
}

export function createVoltageLevel({
    studyUuid,
    currentNodeUuid,
    voltageLevelId,
    voltageLevelName,
    substationId,
    nominalVoltage,
    lowVoltageLimit,
    highVoltageLimit,
    ipMin,
    ipMax,
    busbarCount,
    sectionCount,
    switchKinds,
    couplingDevices,
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
        type: MODIFICATION_TYPES.VOLTAGE_LEVEL_CREATION.type,
        equipmentId: voltageLevelId,
        equipmentName: voltageLevelName,
        substationId: substationId,
        nominalVoltage: nominalVoltage,
        lowVoltageLimit: lowVoltageLimit,
        highVoltageLimit: highVoltageLimit,
        ipMin: ipMin,
        ipMax: ipMax,
        busbarCount: busbarCount,
        sectionCount: sectionCount,
        switchKinds: switchKinds,
        couplingDevices: couplingDevices,
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

export function modifyVoltageLevel(
    studyUuid,
    currentNodeUuid,
    voltageLevelId,
    voltageLevelName,
    nominalVoltage,
    lowVoltageLimit,
    highVoltageLimit,
    lowShortCircuitCurrentLimit,
    highShortCircuitCurrentLimit,
    isUpdate,
    modificationUuid
) {
    let modificationUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-modifications';

    if (isUpdate) {
        modificationUrl += '/' + encodeURIComponent(modificationUuid);
        console.info('Updating voltage level modification');
    } else {
        console.info('Creating voltage level modification');
    }

    return backendFetchText(modificationUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: MODIFICATION_TYPES.VOLTAGE_LEVEL_MODIFICATION.type,
            equipmentId: voltageLevelId,
            equipmentName: toModificationOperation(voltageLevelName),
            nominalVoltage: toModificationOperation(nominalVoltage),
            lowVoltageLimit: toModificationOperation(lowVoltageLimit),
            highVoltageLimit: toModificationOperation(highVoltageLimit),
            ipMin: toModificationOperation(lowShortCircuitCurrentLimit),
            ipMax: toModificationOperation(highShortCircuitCurrentLimit),
        }),
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
        type: MODIFICATION_TYPES.LINE_SPLIT_WITH_VOLTAGE_LEVEL.type,
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
        type: MODIFICATION_TYPES.LINE_ATTACH_TO_VOLTAGE_LEVEL.type,
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

export function loadScaling(
    studyUuid,
    currentNodeUuid,
    modificationUuid,
    variationType,
    variations
) {
    const body = JSON.stringify({
        type: MODIFICATION_TYPES.LOAD_SCALING.type,
        variationType,
        variations,
    });

    let loadScalingUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-modifications';
    if (modificationUuid) {
        console.info('load scaling update', body);
        loadScalingUrl =
            loadScalingUrl + '/' + encodeURIComponent(modificationUuid);
    }

    return backendFetch(loadScalingUrl, {
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
        type: MODIFICATION_TYPES.LINES_ATTACH_TO_SPLIT_LINES.type,
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

export function deleteVoltageLevelOnLine(
    studyUuid,
    currentNodeUuid,
    modificationUuid,
    lineToAttachTo1Id,
    lineToAttachTo2Id,
    replacingLine1Id,
    replacingLine1Name
) {
    const body = JSON.stringify({
        type: MODIFICATION_TYPES.DELETE_VOLTAGE_LEVEL_ON_LINE.type,
        lineToAttachTo1Id,
        lineToAttachTo2Id,
        replacingLine1Id,
        replacingLine1Name,
    });

    let deleteVoltageLevelOnLineUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-modifications';
    if (modificationUuid) {
        console.info('Updating delete voltage level on line', body);
        deleteVoltageLevelOnLineUrl +=
            '/' + encodeURIComponent(modificationUuid);
    } else {
        console.info('Creating delete voltage level on line', body);
    }

    return backendFetchText(deleteVoltageLevelOnLineUrl, {
        method: modificationUuid ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body,
    });
}

export function deleteAttachingLine(
    studyUuid,
    currentNodeUuid,
    modificationUuid,
    lineToAttachTo1Id,
    lineToAttachTo2Id,
    attachedLineId,
    replacingLine1Id,
    replacingLine1Name
) {
    const body = JSON.stringify({
        type: MODIFICATION_TYPES.DELETE_ATTACHING_LINE.type,
        lineToAttachTo1Id,
        lineToAttachTo2Id,
        attachedLineId,
        replacingLine1Id,
        replacingLine1Name,
    });

    let deleteVoltageLevelOnLineUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-modifications';
    if (modificationUuid) {
        console.info('Updating delete attaching line', body);
        deleteVoltageLevelOnLineUrl +=
            '/' + encodeURIComponent(modificationUuid);
    } else {
        console.info('Creating delete attaching line', body);
    }

    return backendFetchText(deleteVoltageLevelOnLineUrl, {
        method: modificationUuid ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body,
    });
}

function getLoadFlowUrl() {
    return PREFIX_LOADFLOW_SERVER_QUERIES + '/v1/';
}

export function getLoadFlowProviders() {
    console.info('get load flow providers');
    const getLoadFlowProvidersUrl = getLoadFlowUrl() + 'providers';
    console.debug(getLoadFlowProvidersUrl);
    return backendFetchJson(getLoadFlowProvidersUrl);
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
    hvdcWithLCC,
    mcsOnSide1,
    mcsOnSide2,
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
            type: MODIFICATION_TYPES.EQUIPMENT_DELETION.type,
            equipmentId: equipmentId,
            equipmentType: equipmentType,
            hvdcWithLCC: hvdcWithLCC,
            mcsOnSide1: mcsOnSide1,
            mcsOnSide2: mcsOnSide2,
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

export function fetchSubstationsMapInfos(
    studyUuid,
    currentNodeUuid,
    substationsIds,
    inUpstreamBuiltParentNode
) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.SUBSTATION.type,
        EQUIPMENT_INFOS_TYPES.MAP.type,
        inUpstreamBuiltParentNode
    );
}

export function fetchLinesMapInfos(
    studyUuid,
    currentNodeUuid,
    substationsIds,
    inUpstreamBuiltParentNode
) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.LINE.type,
        EQUIPMENT_INFOS_TYPES.MAP.type,
        inUpstreamBuiltParentNode
    );
}

export function fetchHvdcLinesMapInfos(
    studyUuid,
    currentNodeUuid,
    substationsIds,
    inUpstreamBuiltParentNode
) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.HVDC_LINE.type,
        EQUIPMENT_INFOS_TYPES.MAP.type,
        inUpstreamBuiltParentNode
    );
}

export function generationDispatch(
    studyUuid,
    currentNodeUuid,
    modificationUuid,
    lossCoefficient,
    defaultOutageRate,
    generatorsWithoutOutage,
    generatorsWithFixedActivePower,
    generatorsFrequencyReserve
) {
    const body = JSON.stringify({
        type: MODIFICATION_TYPES.GENERATION_DISPATCH.type,
        lossCoefficient: lossCoefficient,
        defaultOutageRate: defaultOutageRate,
        generatorsWithoutOutage: generatorsWithoutOutage,
        generatorsWithFixedSupply: generatorsWithFixedActivePower,
        generatorsFrequencyReserve: generatorsFrequencyReserve,
    });

    let generationDispatchUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-modifications';
    if (modificationUuid) {
        console.info('Updating generation dispatch ', body);
        generationDispatchUrl =
            generationDispatchUrl + '/' + encodeURIComponent(modificationUuid);
    } else {
        console.info('Creating generation dispatch ', body);
    }

    return backendFetchText(generationDispatchUrl, {
        method: modificationUuid ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body,
    });
}

export function getLineTypesCatalog() {
    console.info(`get line types catalog`);
    const url =
        PREFIX_NETWORK_MODIFICATION_QUERIES +
        '/v1/network-modifications/catalog/line_types';
    return backendFetchJson(url);
}
