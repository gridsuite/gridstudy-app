/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { store } from '../redux/store';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { APP_NAME, getAppName } from './config-params';

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
const PREFIX_EXPLORE_SERVER_QUERIES =
    process.env.REACT_APP_API_GATEWAY + '/explore';

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

    return fetch(CheckAccessUrl, {
        method: 'head',
        headers: {
            Authorization: 'Bearer ' + user?.id_token,
        },
    }).then((response) => {
        if (response.status === 200) return true;
        else if (response.status === 204 || response.status === 403)
            return false;
        else throw new Error(response.status + ' ' + response.statusText);
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
    return backendFetch(svgUrl).then((response) => {
        return response.ok
            ? response.text()
            : response.text().then((text) => Promise.reject(text));
    });
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
    return backendFetch(
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
            '/report?nodeOnlyReport=' +
            (nodeOnlyReport ? 'true' : 'false')
    ).then((response) => {
        return response.ok
            ? response.json()
            : response.text().then((text) => Promise.reject(text));
    });
}

export function fetchSvg(svgUrl) {
    console.debug(svgUrl);
    return backendFetch(svgUrl).then((response) => {
        return response.ok
            ? response.json()
            : response.text().then((text) => Promise.reject(text));
    });
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
    return backendFetch(fetchSubstationPositionsUrl).then((response) =>
        response.json()
    );
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
    return backendFetch(fetchEquipmentsUrl).then((response) => response.json());
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
    return backendFetch(fetchEquipmentInfosUrl);
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
    return backendFetch(fetchBusesUrl).then((response) => response.json());
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
    return backendFetch(fetchBusbarSectionsUrl).then((response) =>
        response.json()
    );
}

export function fetchLinePositions(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching line positions of study '${studyUuid}' and node '${currentNodeUuid}'...`
    );
    const fetchLinePositionsUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) + '/geo-data/lines';
    console.debug(fetchLinePositionsUrl);
    return backendFetch(fetchLinePositionsUrl).then((response) =>
        response.json()
    );
}

export function updateSwitchState(studyUuid, currentNodeUuid, switchId, open) {
    console.info('updating switch ' + switchId + ' ...');
    const updateSwitchUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-modification/switches/' +
        encodeURIComponent(switchId) +
        '?' +
        new URLSearchParams({ open: open }).toString();
    console.debug(updateSwitchUrl);
    return backendFetch(updateSwitchUrl, { method: 'put' });
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
    return backendFetch(startLoadFlowUrl, { method: 'put' }).then((response) =>
        response.ok
            ? response
            : response.text().then((text) => Promise.reject(text))
    );
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
    return backendFetch(url, { method: 'get' }).then((response) => {
        if (response.ok) return response.json();
        throw new Error(response.status + ' ' + response.statusText);
    });
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
    return backendFetch(url, { method: 'get' }).then(function (response) {
        if (response.ok) {
            return response.text();
        } else {
            return Promise.resolve(0);
        }
    });
}

function getSensitivityAnalysisQueryParams(
    variablesFiltersUuids,
    contingencyListUuids,
    branchFiltersUuids
) {
    if (
        variablesFiltersUuids.length > 0 ||
        contingencyListUuids.length > 0 ||
        branchFiltersUuids.length > 0
    ) {
        const urlSearchParams = new URLSearchParams();
        variablesFiltersUuids.forEach((variablesFiltersUuid) =>
            urlSearchParams.append(
                'variablesFiltersListUuid',
                variablesFiltersUuid
            )
        );
        contingencyListUuids.forEach((contingencyListUuid) =>
            urlSearchParams.append('contingencyListUuid', contingencyListUuid)
        );
        branchFiltersUuids.forEach((branchFiltersUuid) =>
            urlSearchParams.append('branchFiltersListUuid', branchFiltersUuid)
        );
        return '?' + urlSearchParams.toString();
    }
    return '';
}

export function startSensitivityAnalysis(
    studyUuid,
    currentNodeUuid,
    variablesFiltersUuids,
    contingencyListUuids,
    branchFiltersUuids
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
        '/sensitivity-analysis/run' +
        getSensitivityAnalysisQueryParams(
            variablesFiltersUuids,
            contingencyListUuids,
            branchFiltersUuids
        );
    console.debug(url);
    return backendFetch(url, { method: 'post' });
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
    return backendFetch(url, { method: 'get' }).then(function (response) {
        if (response.ok) {
            return response.text();
        } else {
            return Promise.resolve(0);
        }
    });
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
    return backendFetch(url, { method: 'get' }).then((response) => {
        if (response.ok) return response.json();
        throw new Error(response.status + ' ' + response.statusText);
    });
}

export function startShortCircuitAnalysis(studyUuid, currentNodeUuid) {
    console.info(
        `Running short circuit analysis on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );

    const startShortCircuitAnanysisUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/shortcircuit/run';
    console.debug(startShortCircuitAnanysisUrl);
    return backendFetch(startShortCircuitAnanysisUrl, { method: 'put' }).then(
        (response) =>
            response.ok
                ? response
                : response.text().then((text) => Promise.reject(text))
    );
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
    return backendFetch(url, { method: 'get' }).then(function (response) {
        if (response.ok) {
            return response.text();
        } else {
            return Promise.resolve(0);
        }
    });
}

export function fetchShortCircuitAnalysisResult(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching short circuit analysis result on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/shortcircuit/result';
    console.debug(url);
    return backendFetch(url, { method: 'get' }).then((response) => {
        if (response.ok) return response.json();
        throw new Error(response.status + ' ' + response.statusText);
    });
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
    return backendFetch(url, { method: 'get' }).then((response) =>
        response.json()
    );
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
    return backendFetch(url, { method: 'get' }).then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            return Promise.reject(response);
        }
    });
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
    console.info('Deleting tree node : ', nodeId);
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
    }).then((response) =>
        response.ok
            ? response
            : response.text().then((text) => Promise.reject(text))
    );
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
    }).then((response) =>
        response.ok
            ? response
            : response.text().then((text) => Promise.reject(text))
    );
}

export function deleteModifications(studyUuid, nodeUuid, modificationUuid) {
    const modificationDeleteUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/studies/' +
        encodeURIComponent(studyUuid) +
        '/nodes/' +
        encodeURIComponent(nodeUuid) +
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
    }).then((response) =>
        response.ok
            ? response.text()
            : response.text().then((text) => Promise.reject(text))
    );
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
        '/notify?updateType=deleteStudy&studyUuid=' +
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

export function requestNetworkChange(studyUuid, currentNodeUuid, groovyScript) {
    console.info('request network change');
    const changeUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
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
        return response.ok
            ? response.text()
            : response.text().then((text) => Promise.reject(text));
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
    }).then((response) =>
        response.ok
            ? response
            : response.text().then((text) => Promise.reject(text))
    );
}

export function getShortCircuitParameters(studyUuid) {
    console.info('get short-circuit parameters');
    const getShortCircuitParams =
        getStudyUrl(studyUuid) + '/short-circuit-analysis/parameters';
    console.debug(getShortCircuitParams);
    return backendFetch(getShortCircuitParams, {
        method: 'get',
    }).then((response) =>
        response.ok
            ? response.json()
            : response.text().then((text) => Promise.reject(text))
    );
}

function changeLineStatus(studyUuid, currentNodeUuid, lineId, status) {
    const changeLineStatusUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-modification/lines/' +
        encodeURIComponent(lineId) +
        '/status';
    console.debug('%s with body: %s', changeLineStatusUrl, status);
    return backendFetch(changeLineStatusUrl, { method: 'put', body: status });
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
    let createLoadUrl;
    if (isUpdate) {
        console.info('Updating load creation');
        createLoadUrl =
            getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
            '/network-modification/modifications/' +
            encodeURIComponent(modificationUuid) +
            '/loads-creation';
    } else {
        console.info('Creating load ');
        createLoadUrl =
            getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
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
            connectionDirection: connectionDirection,
            connectionName: connectionName,
        }),
    }).then((response) => {
        return response.ok
            ? response.text()
            : response.text().then((text) => Promise.reject(text));
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
    console.info('Modifying load ');
    let modifyLoadUrl;
    if (isUpdate) {
        console.info('Updating load creation');
        modifyLoadUrl =
            getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
            '/network-modification/modifications/' +
            encodeURIComponent(modificationUuid) +
            '/loads-modification';
    } else {
        console.info('Creating load ');
        modifyLoadUrl =
            getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
            '/network-modification/loads';
    }

    return backendFetch(modifyLoadUrl, {
        method: 'PUT',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            equipmentId: id,
            equipmentName: toModificationOperation(name),
            loadType: toModificationOperation(loadType),
            activePower: toModificationOperation(activePower),
            reactivePower: toModificationOperation(reactivePower),
            voltageLevelId: toModificationOperation(voltageLevelId),
            busOrBusbarSectionId: toModificationOperation(busOrBusbarSectionId),
        }),
    }).then((response) => {
        return response.ok
            ? response.text()
            : response.text().then((text) => Promise.reject(text));
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
    console.info('Modifying generator ');
    const idUrl =
        modificationId === undefined
            ? ''
            : '/' + encodeURIComponent(modificationId);

    const modificationUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-modification/modifications/generators-modification' +
        idUrl;

    const generatorModification = {
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
    return backendFetch(modificationUrl, {
        method: 'PUT',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(generatorModification),
    }).then((response) => {
        return response.ok
            ? response.text()
            : response.text().then((text) => Promise.reject(text));
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
    let createGeneratorUrl;
    if (isUpdate) {
        console.info('Updating generator creation');
        createGeneratorUrl =
            getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
            '/network-modification/modifications/' +
            encodeURIComponent(modificationUuid) +
            '/generators-creation';
    } else {
        console.info('Creating generator ');
        createGeneratorUrl =
            getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
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
    }).then((response) => {
        return response.ok
            ? response.text()
            : response.text().then((text) => Promise.reject(text));
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
    let createShuntUrl;
    if (isUpdate) {
        console.info('Updating shunt compensator creation');
        createShuntUrl =
            getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
            '/network-modification/modifications/' +
            encodeURIComponent(modificationUuid) +
            '/shunt-compensators-creation';
    } else {
        console.info('Creating shunt compensator ');
        createShuntUrl =
            getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
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
            connectionDirection: connectionDirection,
            connectionName: connectionName,
        }),
    }).then((response) => {
        return response.ok
            ? response.text()
            : response.text().then((text) => Promise.reject(text));
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
    let createLineUrl;
    if (isUpdate) {
        console.info('Updating line creation');
        createLineUrl =
            getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
            '/network-modification/modifications/' +
            encodeURIComponent(modificationUuid) +
            '/lines-creation';
    } else {
        console.info('Creating line ');
        createLineUrl =
            getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
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
            connectionName1: connectionName1,
            connectionDirection1: connectionDirection1,
            connectionName2: connectionName2,
            connectionDirection2: connectionDirection2,
        }),
    }).then((response) => {
        return response.ok
            ? response.text()
            : response.text().then((text) => Promise.reject(text));
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
    let createTwoWindingsTransformerUrl;
    if (isUpdate) {
        console.info('Updating two windings transformer creation');
        createTwoWindingsTransformerUrl =
            getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
            '/network-modification/modifications/' +
            encodeURIComponent(modificationUuid) +
            '/two-windings-transformers-creation';
    } else {
        console.info('Creating two windings transformer ');
        createTwoWindingsTransformerUrl =
            getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
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
    }).then((response) => {
        return response.ok
            ? response.text()
            : response.text().then((text) => Promise.reject(text));
    });
}

export function createSubstation(
    studyUuid,
    currentNodeUuid,
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
            getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
            '/network-modification/modifications/' +
            encodeURIComponent(modificationUuid) +
            '/substations-creation';
    } else {
        console.info('Creating substation ');
        createSubstationUrl =
            getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
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
    }).then((response) => {
        return response.ok
            ? response.text()
            : response.text().then((text) => Promise.reject(text));
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
    let createVoltageLevelUrl;
    if (isUpdate) {
        console.info('Updating voltage level creation');
        createVoltageLevelUrl =
            getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
            '/network-modification/modifications/' +
            encodeURIComponent(modificationUuid) +
            '/voltage-levels-creation';
    } else {
        console.info('Creating voltage level (stub)');
        createVoltageLevelUrl =
            getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
            '/network-modification/voltage-levels';
    }

    const body = JSON.stringify({
        equipmentId: voltageLevelId,
        equipmentName: voltageLevelName,
        nominalVoltage: nominalVoltage,
        substationId: substationId,
        busbarSections: busbarSections,
        busbarConnections: busbarConnections,
    });

    return backendFetch(createVoltageLevelUrl, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: body,
    }).then((response) => {
        return response.ok
            ? response.text()
            : response.text().then((text) => Promise.reject(text));
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

    let lineSplitUrl;
    if (modificationUuid) {
        console.info('Line split with voltage level update', body);
        lineSplitUrl =
            getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
            '/network-modification/modifications/' +
            encodeURIComponent(modificationUuid) +
            '/line-splits';
    } else {
        console.info('Line split with voltage level', body);
        lineSplitUrl =
            getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
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

    let lineAttachUrl;
    if (modificationUuid) {
        console.info('Line attach to voltage level update', body);
        lineAttachUrl =
            getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
            '/network-modification/modifications/' +
            encodeURIComponent(modificationUuid) +
            '/line-attach';
    } else {
        console.info('Line attach to voltage level', body);
        lineAttachUrl =
            getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
            '/network-modification/line-attach';
    }

    return backendFetch(lineAttachUrl, {
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

    let lineAttachUrl;
    if (modificationUuid) {
        console.info('Attaching lines to splitting lines update', body);
        lineAttachUrl =
            getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
            '/network-modification/modifications/' +
            encodeURIComponent(modificationUuid) +
            '/lines-attach-to-split-lines';
    } else {
        console.info('Attaching lines to splitting lines', body);
        lineAttachUrl =
            getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
            '/network-modification/lines-attach-to-split-lines';
    }

    return backendFetch(lineAttachUrl, {
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
    currentNodeUuid,
    equipmentType,
    equipmentId,
    modificationUuid
) {
    let deleteEquipmentUrl;
    if (modificationUuid) {
        console.info('Updating equipment deletion');
        deleteEquipmentUrl =
            getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
            '/network-modification/modifications/' +
            encodeURIComponent(modificationUuid) +
            '/equipments-deletion/type/' +
            encodeURIComponent(equipmentType) +
            '/id/' +
            encodeURIComponent(equipmentId);
    } else {
        console.info('Creating equipment deletion');
        deleteEquipmentUrl =
            getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
            '/network-modification/equipments/type/' +
            encodeURIComponent(equipmentType) +
            '/id/' +
            encodeURIComponent(equipmentId);
    }
    return backendFetch(deleteEquipmentUrl, {
        method: modificationUuid ? 'PUT' : 'DELETE',
    });
}

export function fetchLoadFlowInfos(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching loadflow infos (status and result) for '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const fetchLoadFlowInfosUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) + '/loadflow/infos';
    return backendFetch(fetchLoadFlowInfosUrl).then((response) =>
        response.json()
    );
}

export function fetchNetworkModifications(studyUuid, nodeUuid) {
    console.info('Fetching network modifications for nodeUuid : ', nodeUuid);
    const modificationsGetUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/studies/' +
        encodeURIComponent(studyUuid) +
        '/nodes/' +
        encodeURIComponent(nodeUuid) +
        '/network-modification/modifications';

    console.debug(modificationsGetUrl);
    return backendFetch(modificationsGetUrl, {
        method: 'get',
    }).then((response) =>
        response.ok
            ? response.json()
            : response.text().then((text) => Promise.reject(text))
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

export function buildNode(studyUuid, currentNodeUuid) {
    console.info(
        'Build node ' + currentNodeUuid + ' of study ' + studyUuid + ' ...'
    );
    const url = getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) + '/build';
    console.debug(url);
    return backendFetch(url, { method: 'post' }).then((response) =>
        response.ok
            ? response.text()
            : response.text().then((text) => Promise.reject(text))
    );
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
    return backendFetch(url, { method: 'put' }).then((response) => {
        if (!response.ok) {
            return response.text().then((text) => Promise.reject(text));
        }
    });
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

    return backendFetch(url, { method: 'get' }).then((response) => {
        return response.ok
            ? response.text()
            : response
                  .text()
                  .then((text) =>
                      Promise.reject(text ? text : response.statusText)
                  );
    });
}

export function isNodeExists(studyUuid, nodeName) {
    const existsNodeUrl =
        getStudyUrl(studyUuid) +
        '/nodes?' +
        new URLSearchParams({
            nodeName: nodeName,
        });
    console.debug(existsNodeUrl);
    return backendFetch(existsNodeUrl, { method: 'head' }).then((response) => {
        return response.ok
            ? response
            : response.text().then((text) => Promise.reject(text));
    });
}

export function getUniqueNodeName(studyUuid) {
    const uniqueNodeNameUrl = getStudyUrl(studyUuid) + '/nodes/nextUniqueName';
    console.debug(uniqueNodeNameUrl);
    return backendFetch(uniqueNodeNameUrl, {
        method: 'get',
    }).then((response) => {
        return response.ok
            ? response.text()
            : response.text().then((text) => Promise.reject(text));
    });
}

export function fetchMapEquipments(
    studyUuid,
    currentNodeUuid,
    substationsIds,
    inUpstreamBuiltParentNode
) {
    console.info(
        `Fetching map equipments data of study '${studyUuid}' and node '${currentNodeUuid}'...`
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
        '/network-map/map-equipments-data?' +
        getQueryParamsList(substationsIds, 'substationId');
    console.debug(fetchEquipmentsUrl);
    return backendFetch(fetchEquipmentsUrl).then((response) => response.json());
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
    return backendFetch(url, { method: 'get' }).then((response) => {
        return response.ok
            ? response.json()
            : response.text().then((text) => Promise.reject(text));
    });
}
