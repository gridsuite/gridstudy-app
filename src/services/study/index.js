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
    getQueryParamsList,
    getRequestParamFromList,
} from '../utils';

export const PREFIX_STUDY_QUERIES =
    process.env.REACT_APP_API_GATEWAY + '/study';

export const getStudyUrl = (studyUuid) =>
    `${PREFIX_STUDY_QUERIES}/v1/studies/${encodeURIComponent(studyUuid)}`;

export const getStudyUrlWithNodeUuid = (studyUuid, nodeUuid) =>
    `${PREFIX_STUDY_QUERIES}/v1/studies/${encodeURIComponent(
        studyUuid
    )}/nodes/${encodeURIComponent(nodeUuid)}`;

export const fetchStudy = (studyUuid) => {
    console.info(`Fetching study '${studyUuid}' ...`);
    const fetchStudiesUrl = getStudyUrl(studyUuid);
    console.debug(fetchStudiesUrl);
    return backendFetchJson(fetchStudiesUrl);
};

export const fetchStudyExists = (studyUuid) => {
    console.info(`Fetching study '${studyUuid}' existence ...`);
    const fetchStudiesUrl = getStudyUrl(studyUuid);
    console.debug(fetchStudiesUrl);
    return backendFetch(fetchStudiesUrl, { method: 'head' });
};

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

export function fetchNodeReportTree(studyUuid, nodeUuid, nodeOnlyReport) {
    console.info(
        'get report tree for node : ' +
            nodeUuid +
            ' with nodeOnlyReport = ' +
            nodeOnlyReport +
            ' in study ' +
            studyUuid
    );

    let url =
        getStudyUrlWithNodeUuid(studyUuid, nodeUuid) +
        '/report?nodeOnlyReport=' +
        (nodeOnlyReport ? 'true' : 'false');
    return backendFetchJson(url);
}

export function fetchAllNodesReportElements(
    studyUuid,
    nodeUuid,
    severityFilterList
) {
    console.info(
        'get report elements for node and all its parents : ' +
            nodeUuid +
            ' in study ' +
            studyUuid
    );

    let url =
        getStudyUrlWithNodeUuid(studyUuid, nodeUuid) + '/reports/elements';
    if (severityFilterList?.length) {
        url +=
            '?' + getRequestParamFromList(severityFilterList, 'severityLevels');
    }
    return backendFetchJson(url);
}

export function fetchSingleNodeReportElements(
    studyUuid,
    nodeUuid,
    reportUuid,
    severityFilterList,
    nodeFilter
) {
    console.info(
        'get report elements for single node : ' +
            nodeUuid +
            ' in study ' +
            studyUuid +
            ' with filter ' +
            nodeFilter
    );

    let url =
        getStudyUrlWithNodeUuid(studyUuid, nodeUuid) +
        '/reports/' +
        reportUuid +
        '/elements';

    // Add 2 optional params
    let urlParams = '';
    if (severityFilterList?.length) {
        urlParams = getRequestParamFromList(
            severityFilterList,
            'severityLevels'
        );
    }
    if (nodeFilter) {
        if (urlParams !== '') {
            urlParams += '&';
        }
        urlParams += 'filter=' + nodeFilter;
    }
    if (urlParams !== '') {
        url += '?' + urlParams;
    }

    return backendFetchJson(url);
}

export function fetchReporterElements(
    studyUuid,
    nodeUuid,
    reporterUuid,
    severityFilterList
) {
    console.info(
        'get report elements for reporter : ' +
            reporterUuid +
            ' with severities ' +
            severityFilterList
    );

    let url =
        getStudyUrlWithNodeUuid(studyUuid, nodeUuid) +
        '/reporters/' +
        reporterUuid +
        '/elements';
    if (severityFilterList?.length) {
        url +=
            '?' + getRequestParamFromList(severityFilterList, 'severityLevels');
    }
    return backendFetchJson(url);
}

export function fetchSvg(svgUrl) {
    console.debug(svgUrl);
    return backendFetch(svgUrl).then((response) =>
        response.status === 204 ? null : response.json()
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

export function fetchContingencyCount(
    studyUuid,
    currentNodeUuid,
    contingencyListNames
) {
    console.info(
        `Fetching contingency count for ${contingencyListNames} on '${studyUuid}' and node '${currentNodeUuid}'...`
    );

    const contingencyListNamesParams = getRequestParamFromList(
        contingencyListNames,
        'contingencyListName'
    );
    const urlSearchParams = new URLSearchParams(contingencyListNamesParams);

    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/contingency-count' +
        '?' +
        urlSearchParams;

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

export function getAvailableExportFormats() {
    console.info('get export formats');
    const getExportFormatsUrl =
        PREFIX_STUDY_QUERIES + '/v1/export-network-formats';
    console.debug(getExportFormatsUrl);
    return backendFetchJson(getExportFormatsUrl);
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

export function getOptionalServices() {
    console.info('get available optional services');
    const url = PREFIX_STUDY_QUERIES + '/v1/optional-services';
    console.debug(url);
    return backendFetchJson(url);
}
