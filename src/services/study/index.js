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
} from '@gridsuite/commons-ui';

export const PREFIX_STUDY_QUERIES = import.meta.env.VITE_API_GATEWAY + '/study';

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

export function fetchParentNodesReport(
    studyUuid,
    nodeUuid,
    nodeOnlyReport,
    severityFilterList,
    reportType
) {
    console.info(
        'get node report with its parent for : ' +
            nodeUuid +
            ' with nodeOnlyReport = ' +
            nodeOnlyReport +
            ' in study ' +
            studyUuid +
            ' for ' +
            reportType
    );

    let url =
        getStudyUrlWithNodeUuid(studyUuid, nodeUuid) +
        '/parent-nodes-report?nodeOnlyReport=' +
        (nodeOnlyReport ? 'true' : 'false') +
        '&reportType=' +
        reportType.toString();
    if (severityFilterList?.length) {
        url +=
            '&' + getRequestParamFromList(severityFilterList, 'severityLevels');
    }

    return backendFetchJson(url);
}

export function fetchNodeReport(
    studyUuid,
    nodeUuid,
    reportId,
    severityFilterList,
    reportType
) {
    console.info(
        'get report for node : ' +
            nodeUuid +
            ' in study ' +
            studyUuid +
            ' for ' +
            reportType
    );

    let url =
        getStudyUrlWithNodeUuid(studyUuid, nodeUuid) +
        '/report?reportId=' +
        reportId +
        '&reportType=' +
        reportType.toString();
    if (severityFilterList?.length) {
        url +=
            '&' + getRequestParamFromList(severityFilterList, 'severityLevels');
    }

    return backendFetchJson(url);
}

export function fetchSubReport(
    studyUuid,
    nodeUuid,
    reportId,
    severityFilterList
) {
    console.info(
        'get subReport with Id : ' +
            reportId +
            ' with severities ' +
            severityFilterList
    );

    let url =
        getStudyUrlWithNodeUuid(studyUuid, nodeUuid) +
        '/subreport?reportId=' +
        reportId;
    if (severityFilterList?.length) {
        url +=
            '&' + getRequestParamFromList(severityFilterList, 'severityLevels');
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

export function unbuildNode(studyUuid, currentNodeUuid) {
    console.info(
        'Unbuild node ' + currentNodeUuid + ' of study ' + studyUuid + ' ...'
    );
    const url =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) + '/unbuild';
    console.debug(url);
    return backendFetchText(url, { method: 'post' });
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

export function getServersInfos() {
    console.info('get backend servers informations');
    return backendFetchJson(
        PREFIX_STUDY_QUERIES + '/v1/servers/about?view=study'
    ).catch((reason) => {
        console.error('Error while fetching the servers infos : ' + reason);
        return reason;
    });
}

export function fetchAvailableFilterEnumValues(
    studyUuid,
    nodeUuid,
    computingType,
    filterEnum
) {
    console.info('fetch available filter values');
    const url = `${getStudyUrlWithNodeUuid(
        studyUuid,
        nodeUuid
    )}/computation/result/enum-values?computingType=${encodeURIComponent(
        computingType
    )}&enumName=${encodeURIComponent(filterEnum)}`;
    console.debug(url);
    return backendFetchJson(url);
}
