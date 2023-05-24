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
    getRequestParamFromList,
    getUrlWithToken,
    toModificationOperation,
} from '../utils/rest-api';
import {
    EQUIPMENT_INFOS_TYPES,
    EQUIPMENT_TYPES,
} from '../components/utils/equipment-types';
import { MODIFICATION_TYPES } from '../components/utils/modification-type';
import {
    BRANCH_SIDE,
    BRANCH_STATUS_ACTION,
} from '../components/network/constants';

export const PREFIX_STUDY_QUERIES = `${process.env.REACT_APP_API_GATEWAY}/study`;
const API_VERSION = 'v1';
export const STUDY_PATHS = {
    build: '/build',
    case: '/case',
    contingencyCount: '/contingency-count',
    dynamicSimulation: '/dynamic-simulation',
    dynamicSimulationDefaultProvider: '/dynamic-simulation-default-provider',
    exportNetwork: '/export-network',
    exportNetworkFormats: '/export-network-formats',
    geoData: '/geo-data',
    loadflow: '/loadflow',
    loadflowDefaultProvider: 'loadflow-default-provider',
    networkAreaDiagram: '/network-area-diagram',
    networkElements: '/network/elements',
    networkMap: '/network-map',
    networkModification: '/network-modification/',
    networkModifications: '/network-modifications/',
    nodes: '/nodes',
    networkVoltageLevels: '/network/voltage-levels',
    networkSubstations: '/network/substations',
    overloadedLines: '/overloaded-lines',
    report: '/report',
    securityAnalysis: '/security-analysis',
    securityAnalysisDefaultProvider: '/security-analysis-default-provider',
    sensitivityAnalysis: '/sensitivity-analysis',
    sensitivityAnalysisDefaultProvider:
        '/sensitivity-analysis-default-provider',
    shortCircuitAnalysis: '/short-circuit-analysis',
    shortcircuit: '/shortcircuit',
    subtree: '/subtree',
    svgComponentLibraries: '/svg-component-libraries',
    tree: '/tree',
};

function getStudyUrl(studyUuid) {
    if (studyUuid) {
        const studyUuidEncodedURIComponent = encodeURIComponent(studyUuid);
        return `${PREFIX_STUDY_QUERIES}/${API_VERSION}/studies/${studyUuidEncodedURIComponent}`;
    }

    return `${PREFIX_STUDY_QUERIES}/${API_VERSION}`;
}

function getStudyUrlWithNodeUuid(studyUuid, nodeUuid) {
    return `${PREFIX_STUDY_QUERIES}/${API_VERSION}/studies/${encodeURIComponent(
        studyUuid
    )}/nodes/${encodeURIComponent(nodeUuid)}`;
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

export function buildNode(studyUuid, currentNodeUuid) {
    console.info(`Build node ${currentNodeUuid} of study ${studyUuid} ...`);

    const studyUrlWithUuid = getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    );

    const url = `${studyUrlWithUuid}${STUDY_PATHS.build}`;

    console.debug(url);
    return backendFetchText(url, { method: 'post' });
}

export function fetchCaseName(studyUuid) {
    console.info('Fetching case name');
    const studyUrl = getStudyUrl(studyUuid);
    const url = `${studyUrl}${STUDY_PATHS.case}/name`;
    console.debug(url);

    return backendFetchText(url);
}

export function fetchContingencyCount(
    studyUuid,
    currentNodeUuid,
    contingencyListNames
) {
    console.info(
        `Fetching contingency count for ${contingencyListNames} on '${studyUuid}' and node '${currentNodeUuid}'...`
    );

    // Add params to Url
    const contingencyListsQueryParams = getRequestParamFromList(
        contingencyListNames,
        'contingencyListName'
    );
    const urlSearchParams = new URLSearchParams(contingencyListsQueryParams);

    const studyUrlWithUuid = getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    );

    const url = `${studyUrlWithUuid}${STUDY_PATHS.contingencyCount}?${urlSearchParams}`;

    console.debug(url);
    return backendFetchJson(url);
}

function getDynamicSimulationPath(studyUuid, currentNodeUuid) {
    return `${
        currentNodeUuid
            ? getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)
            : getStudyUrl(studyUuid)
    }${STUDY_PATHS.dynamicSimulation}`;
}

export function fetchDynamicSimulationProvider(studyUuid) {
    console.info('fetch dynamic simulation provider');
    const url = `${getDynamicSimulationPath(studyUuid)}/provider`;
    console.debug(url);
    return backendFetchText(url);
}

export function fetchDefaultDynamicSimulationProvider() {
    console.info('fetch default dynamic simulation provider');
    const url = `${getStudyUrl()}${
        STUDY_PATHS.dynamicSimulationDefaultProvider
    }`;
    console.debug(url);
    return backendFetchText(url);
}

export function updateDynamicSimulationProvider(studyUuid, newProvider) {
    console.info('update dynamic simulation provider');
    const url = `${getDynamicSimulationPath(studyUuid)}/provider`;
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

export function getDynamicMappings(studyUuid) {
    console.info(`Fetching dynamic mappings on '${studyUuid}' ...`);
    const url = `${getDynamicSimulationPath(studyUuid)}/mappings`;
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchDynamicSimulationParameters(studyUuid) {
    console.info(
        `Fetching dynamic simulation parameters on '${studyUuid}' ...`
    );

    const url = `${getDynamicSimulationPath(studyUuid)}/parameters`;

    console.debug(url);

    const parametersPromise = backendFetchJson(url);

    const mappingsPromise = getDynamicMappings(studyUuid);

    return Promise.all([parametersPromise, mappingsPromise]).then(
        ([parameters, mappings]) => ({ ...parameters, mappings })
    );
}

export function updateDynamicSimulationParameters(studyUuid, newParams) {
    console.info('set dynamic simulation parameters');
    const url = `${getDynamicSimulationPath(studyUuid)}/parameters`;
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

export function startDynamicSimulation(
    studyUuid,
    currentNodeUuid,
    dynamicSimulationConfiguration
) {
    console.info(
        `Running dynamic simulation on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );

    const startDynamicSimulationUrl = `${getDynamicSimulationPath(
        studyUuid,
        currentNodeUuid
    )}/run`;

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
    const stopDynamicSimulationUrl = `${getDynamicSimulationPath(
        studyUuid,
        currentNodeUuid
    )}/stop`;
    console.debug(stopDynamicSimulationUrl);
    return backendFetch(stopDynamicSimulationUrl, { method: 'put' });
}

export function fetchDynamicSimulationResultTimeSeries(
    studyUuid,
    currentNodeUuid,
    timeSeriesNames
) {
    console.info(
        `Fetching dynamic simulation time series result on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );

    // Add params to Url
    const timeSeriesParams = getRequestParamFromList(
        timeSeriesNames,
        'timeSeriesNames'
    );
    const urlSearchParams = new URLSearchParams(timeSeriesParams);

    const url = `${getDynamicMappings(
        studyUuid,
        currentNodeUuid
    )}/result/timeseries?${urlSearchParams}`;

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
    const url = `${getDynamicSimulationPath(
        studyUuid,
        currentNodeUuid
    )}/result/timeline`;
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchDynamicSimulationStatus(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching dynamic simulation status on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const url = `${getDynamicSimulationPath(
        studyUuid,
        currentNodeUuid
    )}/status`;
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

    const url = `${getDynamicSimulationPath(
        studyUuid,
        currentNodeUuid
    )}/result/timeseries/metadata`;
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

export function getExportUrl(studyUuid, nodeUuid, exportFormat) {
    const url = `${getStudyUrlWithNodeUuid(studyUuid, nodeUuid)}${
        STUDY_PATHS.exportNetwork
    }/${exportFormat}`;
    return getUrlWithToken(url);
}

function getGeoDataPath(studyUuid, currentNodeUuid) {
    return `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
        STUDY_PATHS.geoData
    }`;
}

export function fetchSubstationPositions(
    studyUuid,
    currentNodeUuid,
    substationsIds
) {
    console.info(
        `Fetching substation positions of study '${studyUuid}' and node '${currentNodeUuid}' with ids '${substationsIds}'...`
    );

    // Add params to Url
    const substationParams = getRequestParamFromList(
        substationsIds,
        'substationId'
    );
    const urlSearchParams = new URLSearchParams(substationParams);

    const fetchSubstationPositionsUrl = `${getGeoDataPath(
        studyUuid,
        currentNodeUuid
    )}/substations?${urlSearchParams}`;

    console.debug(fetchSubstationPositionsUrl);
    return backendFetchJson(fetchSubstationPositionsUrl);
}

export function fetchLinePositions(studyUuid, currentNodeUuid, linesIds) {
    console.info(
        `Fetching line positions of study '${studyUuid}' and node '${currentNodeUuid}' with ids '${linesIds}'...`
    );

    // Add params to Url
    const linesIdsParams = getRequestParamFromList(linesIds, 'lineId');
    const urlSearchParams = new URLSearchParams(linesIdsParams);

    const fetchLinePositionsUrl = `${getGeoDataPath(
        studyUuid,
        currentNodeUuid
    )}/lines?${urlSearchParams}`;

    console.debug(fetchLinePositionsUrl);
    return backendFetchJson(fetchLinePositionsUrl);
}

export function getAvailableExportFormats() {
    console.info('get export formats');
    const getExportFormatsUrl = `${getStudyUrl()}${
        STUDY_PATHS.exportNetworkFormats
    }`;
    console.debug(getExportFormatsUrl);
    return backendFetchJson(getExportFormatsUrl);
}

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

export function getNetworkAreaDiagramUrl(
    studyUuid,
    currentNodeUuid,
    voltageLevelsIds,
    depth
) {
    console.info(
        `Getting url of network area diagram of study '${studyUuid}' and node '${currentNodeUuid}'...`
    );

    // Add params to Url
    const voltageLevelsIdsParams = getRequestParamFromList(
        voltageLevelsIds,
        'voltageLevelsIds'
    );
    const urlSearchParams = new URLSearchParams(voltageLevelsIdsParams);

    urlSearchParams.append('depth', depth);

    return `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
        STUDY_PATHS.networkAreaDiagram
    }?${urlSearchParams}`;
}

function fetchNetworkElementsInfos(
    studyUuid,
    currentNodeUuid,
    substationsIds,
    elementType,
    infoType,
    inUpstreamBuiltParentNode = true
) {
    console.info(
        `Fetching network '${elementType}' elements '${infoType}' infos of study '${studyUuid}' and node '${currentNodeUuid}' with substations ids '${substationsIds}'...`
    );

    // Add params to Url
    const substationParams = getRequestParamFromList(
        substationsIds,
        'substationId'
    );
    const urlSearchParams = new URLSearchParams(substationParams);

    if (!inUpstreamBuiltParentNode) {
        urlSearchParams.append('inUpstreamBuiltParentNode', 'false');
    }

    urlSearchParams.append('elementType', elementType);
    urlSearchParams.append('infoType', infoType);

    const fetchElementsUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.networkElements}?${urlSearchParams}`;

    console.debug(fetchElementsUrl);

    return backendFetchJson(fetchElementsUrl);
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
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER.type,
        EQUIPMENT_INFOS_TYPES.TAB.type,
        true
    );
}

export function fetchThreeWindingsTransformers(
    studyUuid,
    currentNodeUuid,
    substationsIds
) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER.type,
        EQUIPMENT_INFOS_TYPES.TAB.type,
        true
    );
}

export function fetchGenerators(studyUuid, currentNodeUuid, substationsIds) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.GENERATOR.type,
        EQUIPMENT_INFOS_TYPES.TAB.type,
        true
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
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.DANGLING_LINE.type,
        EQUIPMENT_INFOS_TYPES.TAB.type,
        true
    );
}

export function fetchBatteries(studyUuid, currentNodeUuid, substationsIds) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.BATTERY.type,
        EQUIPMENT_INFOS_TYPES.TAB.type,
        true
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

export function fetchLccConverterStations(
    studyUuid,
    currentNodeUuid,
    substationsIds
) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.LCC_CONVERTER_STATION.type,
        EQUIPMENT_INFOS_TYPES.TAB.type,
        true
    );
}

export function fetchVscConverterStations(
    studyUuid,
    currentNodeUuid,
    substationsIds
) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.VSC_CONVERTER_STATION.type,
        EQUIPMENT_INFOS_TYPES.TAB.type,
        true
    );
}

export function fetchShuntCompensators(
    studyUuid,
    currentNodeUuid,
    substationsIds
) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.SHUNT_COMPENSATOR.type,
        EQUIPMENT_INFOS_TYPES.TAB.type,
        true
    );
}

export function fetchStaticVarCompensators(
    studyUuid,
    currentNodeUuid,
    substationsIds
) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR.type,
        EQUIPMENT_INFOS_TYPES.TAB.type,
        true
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

export function fetchNetworkElementInfos(
    studyUuid,
    currentNodeUuid,
    elementType,
    infoType,
    elementId,
    inUpstreamBuiltParentNode = true
) {
    console.info(
        `Fetching specific network element '${elementId}' of type '${elementType}' of study '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    // Add params to Url
    const urlSearchParams = new URLSearchParams();

    if (!inUpstreamBuiltParentNode) {
        urlSearchParams.append('inUpstreamBuiltParentNode', 'false');
    }

    urlSearchParams.append('elementType', elementType);
    urlSearchParams.append('infoType', infoType);

    const studyUrlWithNodeUuid = getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    );

    const elementIdEncodedURIComponent = encodeURIComponent(elementId);

    const fetchElementsUrl = `${studyUrlWithNodeUuid}${STUDY_PATHS.networkElements}/${elementIdEncodedURIComponent}?${urlSearchParams}`;

    console.debug(fetchElementsUrl);

    return backendFetchJson(fetchElementsUrl);
}

export function fetchEquipmentsIds(
    studyUuid,
    currentNodeUuid,
    substationsIds,
    equipmentType,
    inUpstreamBuiltParentNode = true
) {
    console.info(
        `Fetching equipments ids '${equipmentType}' of study '${studyUuid}' and node '${currentNodeUuid}' with substations ids '${substationsIds}'...`
    );

    // Add params to Url
    const substationParams = getRequestParamFromList(
        substationsIds,
        'substationId'
    );
    const urlSearchParams = new URLSearchParams(substationParams);

    urlSearchParams.append('equipmentType', equipmentType);

    if (!inUpstreamBuiltParentNode) {
        urlSearchParams.append('inUpstreamBuiltParentNode', 'false');
    }

    const fetchEquipmentsUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.networkMap}/equipments-ids?${urlSearchParams}`;

    console.debug(fetchEquipmentsUrl);
    return backendFetchJson(fetchEquipmentsUrl);
}

export function fetchEquipments(
    studyUuid,
    currentNodeUuid,
    substationsIds,
    equipmentType,
    equipmentPath,
    inUpstreamBuiltParentNode = true
) {
    console.info(
        `Fetching equipments '${equipmentType}' of study '${studyUuid}' and node '${currentNodeUuid}' with substations ids '${substationsIds}'...`
    );

    // Add params to Url
    const substationParams = getRequestParamFromList(
        substationsIds,
        'substationId'
    );

    const urlSearchParams = new URLSearchParams(substationParams);

    if (!inUpstreamBuiltParentNode) {
        urlSearchParams.append('inUpstreamBuiltParentNode', 'false');
    }

    const fetchEquipmentsUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.networkMap}/${equipmentPath}?${urlSearchParams}`;

    console.debug(fetchEquipmentsUrl);
    return backendFetchJson(fetchEquipmentsUrl);
}

export function fetchVoltageLevelEquipments(
    studyUuid,
    currentNodeUuid,
    substationsIds,
    voltageLevelId,
    inUpstreamBuiltParentNode = true
) {
    console.info(
        `Fetching equipments of study '${studyUuid}' and node '${currentNodeUuid}' and voltage level '${voltageLevelId}' with substations ids '${substationsIds}'...`
    );

    // Add params to Url
    const substationParams = getRequestParamFromList(
        substationsIds,
        'substationId'
    );
    const urlSearchParams = new URLSearchParams(substationParams);

    if (!inUpstreamBuiltParentNode) {
        urlSearchParams.append('inUpstreamBuiltParentNode', 'false');
    }

    const fetchEquipmentsBaseUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.networkMap}`;

    const fetchEquipmentsUrl = `${fetchEquipmentsBaseUrl}/voltage-level-equipments/${encodeURIComponent(
        voltageLevelId
    )}?${urlSearchParams}`;

    console.debug(fetchEquipmentsUrl);
    return backendFetchJson(fetchEquipmentsUrl);
}

export function fetchEquipmentInfos(
    studyUuid,
    currentNodeUuid,
    equipmentPath,
    equipmentId,
    inUpstreamBuiltParentNode = true
) {
    console.info(
        `Fetching specific equipment '${equipmentId}' of type '${equipmentPath}' of study '${studyUuid}' and node '${currentNodeUuid}' ...`
    );

    // Add params to Url
    const urlSearchParams = new URLSearchParams();

    if (!inUpstreamBuiltParentNode) {
        urlSearchParams.append('inUpstreamBuiltParentNode', 'false');
    }

    const fetchEquipmentInfosUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.networkMap}/${equipmentPath}/${encodeURIComponent(
        equipmentId
    )}?${urlSearchParams}`;

    console.debug(fetchEquipmentInfosUrl);
    return backendFetchJson(fetchEquipmentInfosUrl);
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

export function fetchAllEquipments(studyUuid, currentNodeUuid, substationsIds) {
    return fetchEquipments(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        'All',
        'all'
    );
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

export function changeNetworkModificationOrder(
    studyUuid,
    currentNodeUuid,
    itemUuid,
    beforeUuid
) {
    console.info(`reorder node ${currentNodeUuid} of study ${studyUuid} ...`);

    const urlSearchParams = new URLSearchParams({
        beforeUuid: beforeUuid || '',
    });

    const url = `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
        STUDY_PATHS.networkModification
    }/${itemUuid}?${urlSearchParams.toString()}`;

    console.debug(url);
    return backendFetch(url, { method: 'put' });
}

export function updateSwitchState(studyUuid, currentNodeUuid, switchId, open) {
    console.info(`updating switch ${switchId} ...`);

    const updateSwitchUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.networkModifications}`;

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

export function requestNetworkChange(studyUuid, currentNodeUuid, groovyScript) {
    console.info('Creating groovy script (request network change)');

    const changeUrl = `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
        STUDY_PATHS.networkModifications
    }`;

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

function changeBranchStatus(studyUuid, currentNodeUuid, branchId, action) {
    const changeBranchStatusUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.networkModifications}`;

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
    console.info(`locking out branch ${branchId} ...`);
    return changeBranchStatus(
        studyUuid,
        currentNodeUuid,
        branchId,
        BRANCH_STATUS_ACTION.LOCKOUT
    );
}

export function tripBranch(studyUuid, currentNodeUuid, branchId) {
    console.info(`tripping branch ${branchId} ...`);
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
    console.info(`energise branch ${branchId} on side ${branchSide} ...`);
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
    console.info(`switching on branch ${branchId} ...`);
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

    let generatorScalingUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.networkModifications}`;

    if (modificationUuid) {
        console.info('generator scaling update', body);
        generatorScalingUrl = `${generatorScalingUrl}/${encodeURIComponent(
            modificationUuid
        )}`;
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
    let createLoadUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.networkModifications}`;

    if (isUpdate) {
        createLoadUrl += `/${encodeURIComponent(modificationUuid)}`;
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
    let modificationUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.networkModifications}`;

    if (modificationId) {
        modificationUrl += `/${encodeURIComponent(modificationId)}`;
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
    let createGeneratorUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.networkModifications}`;

    if (isUpdate) {
        createGeneratorUrl += `/${encodeURIComponent(modificationUuid)}`;
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
    let createShuntUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.networkModifications}`;

    if (isUpdate) {
        createShuntUrl += `/${encodeURIComponent(modificationUuid)}`;
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
    let createLineUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.networkModifications}`;

    if (isUpdate) {
        createLineUrl += `/${encodeURIComponent(modificationUuid)}`;
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
    let modifyLineUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.networkModifications}`;

    if (isUpdate) {
        modifyLineUrl += `/${encodeURIComponent(modificationUuid)}`;
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
    let url = `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
        STUDY_PATHS.networkModifications
    }`;

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
        url += `/${encodeURIComponent(modificationUuid)}`;
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
    let modifyUrl = `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
        STUDY_PATHS.networkModifications
    }`;

    if (isUpdate) {
        modifyUrl += `/${encodeURIComponent(modificationUuid)}`;
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
    let createVoltageLevelUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.networkModifications}`;

    if (isUpdate) {
        createVoltageLevelUrl += `/${encodeURIComponent(modificationUuid)}`;
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
    let modificationUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.networkModifications}`;

    if (isUpdate) {
        modificationUrl += `/${encodeURIComponent(modificationUuid)}`;
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

    let lineSplitUrl = `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
        STUDY_PATHS.networkModifications
    }`;

    if (modificationUuid) {
        lineSplitUrl += `/${encodeURIComponent(modificationUuid)}`;
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

    let lineAttachUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.networkModifications}`;

    if (modificationUuid) {
        lineAttachUrl += `/${encodeURIComponent(modificationUuid)}`;
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

    let loadScalingUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.networkModifications}`;
    if (modificationUuid) {
        console.info('load scaling update', body);
        loadScalingUrl = `${loadScalingUrl}/${encodeURIComponent(
            modificationUuid
        )}`;
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

    let lineAttachUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.networkModifications}`;

    if (modificationUuid) {
        lineAttachUrl += `/${encodeURIComponent(modificationUuid)}`;
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

    let deleteVoltageLevelOnLineUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.networkModifications}`;
    if (modificationUuid) {
        console.info('Updating delete voltage level on line', body);
        deleteVoltageLevelOnLineUrl += `/${encodeURIComponent(
            modificationUuid
        )}`;
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

    let deleteVoltageLevelOnLineUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.networkModifications}`;
    if (modificationUuid) {
        console.info('Updating delete attaching line', body);
        deleteVoltageLevelOnLineUrl += `/${encodeURIComponent(
            modificationUuid
        )}`;
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

export function deleteEquipment(
    studyUuid,
    currentNodeUuid,
    equipmentType,
    equipmentId,
    modificationUuid
) {
    let deleteEquipmentUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.networkModifications}`;

    if (modificationUuid) {
        deleteEquipmentUrl += `/${encodeURIComponent(modificationUuid)}`;
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
        }),
    });
}

export function generationDispatch(
    studyUuid,
    currentNodeUuid,
    modificationUuid,
    lossCoefficient
) {
    const body = JSON.stringify({
        type: MODIFICATION_TYPES.GENERATION_DISPATCH.type,
        lossCoefficient,
    });

    let generationDispatchUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.networkModifications}`;
    if (modificationUuid) {
        console.info('Updating generation dispatch ', body);
        generationDispatchUrl = `${generationDispatchUrl}/${encodeURIComponent(
            modificationUuid
        )}`;
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
    let modifyLoadUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.networkModifications}`;

    if (isUpdate) {
        modifyLoadUrl += `/${encodeURIComponent(modificationUuid)}`;
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
    let createTwoWindingsTransformerUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.networkModifications}`;

    if (isUpdate) {
        createTwoWindingsTransformerUrl += `/${encodeURIComponent(
            modificationUuid
        )}`;
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

    // Add params to Url
    const urlSearchParams = new URLSearchParams({
        useName: useName,
        centerLabel: centerLabel,
        diagonalLabel: diagonalLabel,
        topologicalColoring: true,
        substationLayout: substationLayout,
        ...(componentLibrary !== null && {
            componentLibrary: componentLibrary,
        }),
        language: language,
    });

    return `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
        STUDY_PATHS.networkSubstations
    }/${encodeURIComponent(substationId)}/svg-and-metadata?${urlSearchParams}`;
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

    // Add params to Url
    const urlSearchParams = new URLSearchParams({
        useName: useName,
        centerLabel: centerLabel,
        diagonalLabel: diagonalLabel,
        topologicalColoring: true,
        ...(componentLibrary !== null && {
            componentLibrary: componentLibrary,
        }),
        sldDisplayMode: sldDisplayMode,
        language: language,
    });

    return `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
        STUDY_PATHS.networkVoltageLevels
    }/${encodeURIComponent(
        voltageLevelId
    )}/svg-and-metadata?${urlSearchParams}`;
}

export function fetchBusesForVoltageLevel(
    studyUuid,
    currentNodeUuid,
    voltageLevelId
) {
    console.info(
        `Fetching buses of study '${studyUuid}' and node '${currentNodeUuid}' + ' for voltage level '${voltageLevelId}'...`
    );

    const fetchBusesUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.networkVoltageLevels}/${encodeURIComponent(
        voltageLevelId
    )}/buses`;

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

    const fetchBusbarSectionsUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.networkVoltageLevels}/${encodeURIComponent(
        voltageLevelId
    )}/busbar-sections`;

    console.debug(fetchBusbarSectionsUrl);
    return backendFetchJson(fetchBusbarSectionsUrl);
}

export function searchEquipmentsInfos(
    studyUuid,
    nodeUuid,
    searchTerm,
    getUseNameParameterKey,
    inUpstreamBuiltParentNode = true,
    equipmentType
) {
    console.info(
        "Fetching equipments infos matching with '%s' term ... ",
        searchTerm
    );

    // Add params to Url
    const urlSearchParams = new URLSearchParams();

    urlSearchParams.append('userInput', searchTerm);
    urlSearchParams.append('fieldSelector', getUseNameParameterKey());

    if (!inUpstreamBuiltParentNode) {
        urlSearchParams.append('inUpstreamBuiltParentNode', 'false');
    }

    if (equipmentType !== undefined) {
        urlSearchParams.append('equipmentType', equipmentType);
    }

    const searchEquipmentsInfoUrl = `${getStudyUrl(studyUuid)}${
        STUDY_PATHS.nodes
    }/${encodeURIComponent(nodeUuid)}/search?${urlSearchParams}`;

    return backendFetchJson(searchEquipmentsInfoUrl);
}

export function deleteModifications(studyUuid, nodeUuid, modificationUuids) {
    const modificationDeleteUrl = `${getStudyUrl()}/studies/${encodeURIComponent(
        studyUuid
    )}${STUDY_PATHS.nodes}/${encodeURIComponent(
        nodeUuid
    )}/network-modifications?uuids=${encodeURIComponent(modificationUuids)}`;

    console.debug(modificationDeleteUrl);
    return backendFetch(modificationDeleteUrl, {
        method: 'delete',
    });
}

export function isNodeExists(studyUuid, nodeName) {
    const urlSearchParams = new URLSearchParams({ nodeName: nodeName });

    const existsNodeUrl = `${getStudyUrl(studyUuid)}${
        STUDY_PATHS.nodes
    }?${urlSearchParams}`;

    console.debug(existsNodeUrl);
    return backendFetch(existsNodeUrl, { method: 'head' });
}

export function getUniqueNodeName(studyUuid) {
    const uniqueNodeNameUrl = `${getStudyUrl(studyUuid)}${
        STUDY_PATHS.nodes
    }/nextUniqueName`;
    console.debug(uniqueNodeNameUrl);
    return backendFetchText(uniqueNodeNameUrl);
}

export function copyOrMoveModifications(
    studyUuid,
    targetNodeId,
    modificationToCutUuidList,
    copyInfos
) {
    console.info(`${copyInfos.copyType} modifications`);

    const urlSearchParams = new URLSearchParams({
        action: copyInfos.copyType,
        originNodeUuid: copyInfos.originNodeUuid ?? '',
    });

    const copyOrMoveModificationUrl = `${getStudyUrl()}/studies/${encodeURIComponent(
        studyUuid
    )}${STUDY_PATHS.nodes}/${encodeURIComponent(
        targetNodeId
    )}?${urlSearchParams}`;

    return backendFetch(copyOrMoveModificationUrl, {
        method: 'PUT',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(modificationToCutUuidList),
    });
}

export function fetchNetworkModifications(studyUuid, nodeUuid) {
    console.info('Fetching network modifications for nodeUuid : ', nodeUuid);
    const modificationsGetUrl = `${getStudyUrl()}/studies/${encodeURIComponent(
        studyUuid
    )}${STUDY_PATHS.nodes}/${encodeURIComponent(
        nodeUuid
    )}/network-modifications`;

    console.debug(modificationsGetUrl);
    return backendFetchJson(modificationsGetUrl);
}

export function fetchOverloadedLines(
    studyUuid,
    currentNodeUuid,
    limitReduction
) {
    console.info(
        `Fetching overloaded lines (with limit reduction ${limitReduction}) ...`
    );
    const url = `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
        STUDY_PATHS.overloadedLines
    }?limitReduction=${limitReduction.toString()}`;
    return backendFetchJson(url);
}

export function fetchReport(studyUuid, currentNodeUuid, nodeOnlyReport) {
    console.info(
        `get report for node : ${currentNodeUuid} with nodeOnlyReport = ${nodeOnlyReport} in study ${studyUuid}`
    );

    // Add params to Url
    const urlSearchParams = new URLSearchParams();

    urlSearchParams.append('nodeOnlyReport', nodeOnlyReport ? 'true' : 'false');

    return backendFetchJson(
        `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
            STUDY_PATHS.report
        }?${urlSearchParams}`
    );
}

export function stopSecurityAnalysis(studyUuid, currentNodeUuid) {
    console.info(
        `Stopping security analysis on ${studyUuid} and node ${currentNodeUuid} ...`
    );
    const stopSecurityAnalysisUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.securityAnalysis}/stop`;
    console.debug(stopSecurityAnalysisUrl);
    return backendFetch(stopSecurityAnalysisUrl, { method: 'put' });
}

export function startSecurityAnalysis(
    studyUuid,
    currentNodeUuid,
    contingencyListNames
) {
    console.info(
        `Running security analysis on ${studyUuid} and node ${currentNodeUuid} ...`
    );

    // Add params to Url
    const contingencyListsQueryParams = getRequestParamFromList(
        contingencyListNames,
        'contingencyListName'
    );
    const urlSearchParams = new URLSearchParams(contingencyListsQueryParams);

    const url = `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
        STUDY_PATHS.securityAnalysis
    }/run?${urlSearchParams}`;

    console.debug(url);
    return backendFetch(url, { method: 'post' });
}

export function fetchSecurityAnalysisResult(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching security analysis on ${studyUuid} and node ${currentNodeUuid} ...`
    );
    const url = `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
        STUDY_PATHS.securityAnalysis
    }/result`;
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchSecurityAnalysisStatus(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching security analysis status on ${studyUuid} and node ${currentNodeUuid} ...`
    );
    const url = `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
        STUDY_PATHS.securityAnalysis
    }/status`;
    console.debug(url);
    return backendFetchText(url);
}

export function fetchSecurityAnalysisProvider(studyUuid) {
    console.info('fetch security analysis provider');
    const url = `${getStudyUrl(studyUuid)}${
        STUDY_PATHS.securityAnalysis
    }/provider`;
    console.debug(url);
    return backendFetchText(url);
}

export function updateSecurityAnalysisProvider(studyUuid, newProvider) {
    console.info('update security analysis provider');
    const url = `${getStudyUrl(studyUuid)}${
        STUDY_PATHS.securityAnalysis
    }/provider`;
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
    const url = `${getStudyUrl()}${
        STUDY_PATHS.securityAnalysisDefaultProvider
    }`;
    console.debug(url);
    return backendFetchText(url);
}

export function startSensitivityAnalysis(
    studyUuid,
    currentNodeUuid,
    sensiConfiguration
) {
    console.info(
        `Running sensi on ${studyUuid} and node ${currentNodeUuid} ...`
    );
    const url = `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
        STUDY_PATHS.sensitivityAnalysis
    }/run`;

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
        `Stopping sensitivity analysis on ${studyUuid} and node ${currentNodeUuid} ...`
    );
    const stopSensitivityAnalysisUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.sensitivityAnalysis}/stop`;
    console.debug(stopSensitivityAnalysisUrl);
    return backendFetch(stopSensitivityAnalysisUrl, { method: 'put' });
}

export function fetchSensitivityAnalysisStatus(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching sensitivity analysis status on ${studyUuid} and node ${currentNodeUuid} ...`
    );
    const url = `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
        STUDY_PATHS.sensitivityAnalysis
    }/status`;
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

    // Add params to Url
    const urlSearchParams = new URLSearchParams();
    const jsoned = JSON.stringify(selector);
    urlSearchParams.append('selector', jsoned);

    const url = `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
        STUDY_PATHS.sensitivityAnalysis
    }/result?${urlSearchParams}`;
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchSensitivityAnalysisProvider(studyUuid) {
    console.info('fetch sensitivity analysis provider');
    const url = `${getStudyUrl(studyUuid)}${
        STUDY_PATHS.sensitivityAnalysis
    }/provider`;
    console.debug(url);
    return backendFetchText(url);
}

export function updateSensitivityAnalysisProvider(studyUuid, newProvider) {
    console.info('update sensitivity analysis provider');
    const url = `${getStudyUrl(studyUuid)}${
        STUDY_PATHS.sensitivityAnalysis
    }/provider`;
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
    const url = `${getStudyUrl()}${
        STUDY_PATHS.sensitivityAnalysisDefaultProvider
    }`;
    console.debug(url);
    return backendFetchText(url);
}

export function setShortCircuitParameters(studyUuid, newParams) {
    console.info('set short-circuit parameters');
    const setShortCircuitParametersUrl = `${getStudyUrl(studyUuid)}${
        STUDY_PATHS.shortCircuitAnalysis
    }/parameters`;
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
    const getShortCircuitParams = `${getStudyUrl(studyUuid)}${
        STUDY_PATHS.shortCircuitAnalysis
    }/parameters`;
    console.debug(getShortCircuitParams);
    return backendFetchJson(getShortCircuitParams);
}

export function startShortCircuitAnalysis(studyUuid, currentNodeUuid) {
    console.info(
        `Running short circuit analysis on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );

    const startShortCircuitAnanysisUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.shortcircuit}/run`;

    console.debug(startShortCircuitAnanysisUrl);
    return backendFetch(startShortCircuitAnanysisUrl, { method: 'put' });
}

export function stopShortCircuitAnalysis(studyUuid, currentNodeUuid) {
    console.info(
        `Stopping short circuit analysis on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const stopShortCircuitAnalysisUrl = `${getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    )}${STUDY_PATHS.shortcircuit}/stop`;
    console.debug(stopShortCircuitAnalysisUrl);
    return backendFetch(stopShortCircuitAnalysisUrl, { method: 'put' });
}

export function fetchShortCircuitAnalysisStatus(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching short circuit analysis status on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const url = `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
        STUDY_PATHS.shortcircuit
    }/status`;
    console.debug(url);
    return backendFetchText(url);
}

export function fetchShortCircuitAnalysisResult(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching short circuit analysis result on '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const url = `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
        STUDY_PATHS.shortcircuit
    }/result`;
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchNetworkModificationSubtree(studyUuid, parentNodeUuid) {
    console.info('Fetching network modification tree node : ', parentNodeUuid);
    const url = `${getStudyUrl(studyUuid)}${
        STUDY_PATHS.subtree
    }?parentNodeUuid=${encodeURIComponent(parentNodeUuid)}`;
    console.debug(url);
    return backendFetchJson(url);
}

export function getAvailableComponentLibraries() {
    console.info('get available component libraries for diagrams');
    const getAvailableComponentLibrariesUrl = `${getStudyUrl()}${
        STUDY_PATHS.svgComponentLibraries
    }`;
    console.debug(getAvailableComponentLibrariesUrl);
    return backendFetchJson(getAvailableComponentLibrariesUrl);
}

export function deleteTreeNode(studyUuid, nodeId) {
    console.info('Deleting tree node : ', nodeId);
    const url = `${getStudyUrl(studyUuid)}/tree/nodes/${encodeURIComponent(
        nodeId
    )}`;
    console.debug(url);
    return backendFetch(url, {
        method: 'delete',
    });
}

export function deleteSubtree(studyUuid, parentNodeId) {
    console.info('Deleting node subtree : ', parentNodeId);

    const urlSearchParams = new URLSearchParams();

    urlSearchParams.append('deleteChildren', 'true');

    const url = `${getStudyUrl(studyUuid)}${
        STUDY_PATHS.tree
    }/nodes/${encodeURIComponent(parentNodeId)}?${urlSearchParams}`;
    console.debug(url);
    return backendFetch(url, {
        method: 'delete',
    });
}

export function updateTreeNode(studyUuid, node) {
    const nodeUpdateUrl = `${getStudyUrl(studyUuid)}${STUDY_PATHS.tree}/nodes/`;
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
    // Add params to Url
    const urlSearchParams = new URLSearchParams();

    urlSearchParams.append('insertMode', insertMode);
    urlSearchParams.append('nodeToCopyUuid', nodeToCopyUuid);
    urlSearchParams.append('referenceNodeUuid', referenceNodeUuid);
    urlSearchParams.append('sourceStudyUuid', sourceStudyId);

    const nodeCopyUrl = `${getStudyUrl(targetStudyId)}${
        STUDY_PATHS.tree
    }/nodes?${urlSearchParams}`;

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
    // Add params to Url
    const urlSearchParams = new URLSearchParams();

    urlSearchParams.append('insertMode', insertMode);
    urlSearchParams.append('nodeToCutUuid', nodeToCutUuid);
    urlSearchParams.append('referenceNodeUuid', referenceNodeUuid);

    const nodeCutUrl = `${getStudyUrl(studyUuid)}${
        STUDY_PATHS.tree
    }/nodes?${urlSearchParams}`;

    console.debug(nodeCutUrl);
    return backendFetch(nodeCutUrl, {
        method: 'post',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });
}

export function createTreeNode(studyUuid, parentId, insertMode, node) {
    // Add params to Url
    const urlSearchParams = new URLSearchParams();

    urlSearchParams.append('mode', insertMode);

    const nodeCreationUrl = `${getStudyUrl(studyUuid)}${
        STUDY_PATHS.tree
    }/nodes/${encodeURIComponent(parentId)}?${urlSearchParams}`;

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

export function cutSubtree(targetStudyId, nodeToCopyUuid, referenceNodeUuid) {
    // Add params to Url
    const urlSearchParams = new URLSearchParams();

    urlSearchParams.append('subtreeToCutParentNodeUuid', nodeToCopyUuid);
    urlSearchParams.append('referenceNodeUuid', referenceNodeUuid);

    const nodeCopyUrl = `${getStudyUrl(targetStudyId)}${
        STUDY_PATHS.tree
    }/subtrees?${urlSearchParams}`;

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
    // Add params to Url
    const urlSearchParams = new URLSearchParams();

    urlSearchParams.append('subtreeToCopyParentNodeUuid', nodeToCopyUuid);
    urlSearchParams.append('referenceNodeUuid', referenceNodeUuid);

    const nodeCopyUrl = `${getStudyUrl(targetStudyId)}${
        STUDY_PATHS.tree
    }/subtrees?${urlSearchParams}`;

    console.debug(nodeCopyUrl);
    return backendFetch(nodeCopyUrl, {
        method: 'post',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });
}

export function fetchNetworkModificationTree(studyUuid) {
    console.info('Fetching network modification tree');
    const url = `${getStudyUrl(studyUuid)}${STUDY_PATHS.tree}`;
    console.debug(url);
    return backendFetchJson(url);
}

export function fetchNetworkModificationTreeNode(studyUuid, nodeUuid) {
    console.info('Fetching network modification tree node : ', nodeUuid);
    const url = `${getStudyUrl(studyUuid)}${
        STUDY_PATHS.tree
    }/nodes/${encodeURIComponent(nodeUuid)}`;
    console.debug(url);
    return backendFetchJson(url);
}
