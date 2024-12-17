/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UUID } from 'crypto';
import {
    backendFetch,
    backendFetchJson,
    backendFetchText,
    getQueryParamsList,
    getRequestParamFromList,
} from '../utils';
import ComputingType from 'components/computing-status/computing-type';
import { NetworkModificationCopyInfo } from 'components/graph/menus/network-modification-menu.type';
import { COMPUTING_AND_NETWORK_MODIFICATION_TYPE } from 'utils/report/report.constant';
import { EquipmentType } from '@gridsuite/commons-ui';

export const PREFIX_STUDY_QUERIES = import.meta.env.VITE_API_GATEWAY + '/study';

export const getStudyUrl = (studyUuid: UUID) => `${PREFIX_STUDY_QUERIES}/v1/studies/${encodeURIComponent(studyUuid)}`;

export const getStudyUrlWithNodeUuidAndRootNetworkUuid = (studyUuid: UUID, nodeUuid: UUID, rootNetworkUuid: UUID) =>
    `${PREFIX_STUDY_QUERIES}/v1/studies/${encodeURIComponent(studyUuid)}/root-networks/${encodeURIComponent(
        rootNetworkUuid
    )}/nodes/${encodeURIComponent(nodeUuid)}`;

export const getStudyUrlWithNodeUuid = (studyUuid: UUID, nodeUuid: UUID) =>
    `${PREFIX_STUDY_QUERIES}/v1/studies/${encodeURIComponent(studyUuid)}/nodes/${encodeURIComponent(nodeUuid)}`;

export const fetchStudy = (studyUuid: UUID) => {
    console.info(`Fetching study '${studyUuid}' ...`);
    const fetchStudiesUrl = getStudyUrl(studyUuid);
    console.debug(fetchStudiesUrl);
    return backendFetchJson(fetchStudiesUrl);
};

export const fetchStudyExists = (studyUuid: UUID) => {
    console.info(`Fetching study '${studyUuid}' existence ...`);
    const fetchStudiesUrl = getStudyUrl(studyUuid);
    console.debug(fetchStudiesUrl);
    return backendFetch(fetchStudiesUrl, { method: 'head' });
};

export function getNetworkAreaDiagramUrl(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    voltageLevelsIds: UUID[],
    depth: number,
    withGeoData: boolean
) {
    console.info(`Getting url of network area diagram of study '${studyUuid}' and node '${currentNodeUuid}'...`);
    return (
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid) +
        '/network-area-diagram?' +
        new URLSearchParams({
            depth: depth.toString(),
            withGeoData: withGeoData.toString(),
        }) +
        '&' +
        getQueryParamsList(voltageLevelsIds, 'voltageLevelsIds').toString()
    );
}

export function fetchParentNodesReport(
    studyUuid: UUID,
    nodeUuid: UUID,
    nodeOnlyReport: boolean,
    severityFilterList: string[],
    reportType: keyof typeof COMPUTING_AND_NETWORK_MODIFICATION_TYPE
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
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, nodeUuid) +
        '/parent-nodes-report?nodeOnlyReport=' +
        (nodeOnlyReport ? 'true' : 'false') +
        '&reportType=' +
        reportType.toString();
    if (severityFilterList?.length) {
        url += '&' + getRequestParamFromList(severityFilterList, 'severityLevels');
    }

    return backendFetchJson(url);
}

export function fetchNodeReportLogs(
    studyUuid: UUID,
    nodeUuid: UUID,
    reportId: string | null,
    severityFilterList: string[],
    messageFilter: string,
    isGlobalLogs: boolean
) {
    let url;
    if (isGlobalLogs) {
        url = getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, nodeUuid) + '/report/logs?';
    } else {
        url = getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, nodeUuid) + '/report/' + reportId + '/logs?';
    }
    if (severityFilterList?.length) {
        url += '&' + getRequestParamFromList(severityFilterList, 'severityLevels');
    }
    if (messageFilter && messageFilter !== '') {
        url += '&message=' + messageFilter;
    }

    return backendFetchJson(url);
}

export function fetchSvg(svgUrl: string) {
    console.debug(svgUrl);
    return backendFetch(svgUrl).then((response) => (response.status === 204 ? null : response.json()));
}

export function searchEquipmentsInfos(
    studyUuid: UUID,
    nodeUuid: UUID,
    searchTerm: string,
    getUseNameParameterKey: () => 'name' | 'id',
    inUpstreamBuiltParentNode?: boolean,
    equipmentType?: EquipmentType
) {
    console.info("Fetching equipments infos matching with '%s' term ... ", searchTerm);
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('userInput', searchTerm);
    urlSearchParams.append('fieldSelector', getUseNameParameterKey());
    if (inUpstreamBuiltParentNode !== undefined) {
        urlSearchParams.append('inUpstreamBuiltParentNode', inUpstreamBuiltParentNode.toString());
    }
    if (equipmentType !== undefined) {
        urlSearchParams.append('equipmentType', equipmentType);
    }
    return backendFetchJson(
        getStudyUrl(studyUuid) + '/nodes/' + encodeURIComponent(nodeUuid) + '/search?' + urlSearchParams.toString()
    );
}

export function fetchContingencyCount(studyUuid: UUID, currentNodeUuid: UUID, contingencyListNames: string[]) {
    console.info(
        `Fetching contingency count for ${contingencyListNames} on '${studyUuid}' and node '${currentNodeUuid}'...`
    );

    const contingencyListNamesParams = getRequestParamFromList(contingencyListNames, 'contingencyListName');
    const urlSearchParams = new URLSearchParams(contingencyListNamesParams);

    const url =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid) + '/contingency-count?' + urlSearchParams;

    console.debug(url);
    return backendFetchJson(url);
}

export function copyOrMoveModifications(
    studyUuid: UUID,
    targetNodeId: UUID,
    modificationToCutUuidList: string[],
    copyInfos: NetworkModificationCopyInfo
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
    const getExportFormatsUrl = PREFIX_STUDY_QUERIES + '/v1/export-network-formats';
    console.debug(getExportFormatsUrl);
    return backendFetchJson(getExportFormatsUrl);
}

export function getAvailableComponentLibraries(): Promise<string[]> {
    console.info('get available component libraries for diagrams');
    const getAvailableComponentLibrariesUrl = PREFIX_STUDY_QUERIES + '/v1/svg-component-libraries';
    console.debug(getAvailableComponentLibrariesUrl);
    return backendFetchJson(getAvailableComponentLibrariesUrl);
}

export function unbuildNode(studyUuid: UUID, currentNodeUuid: UUID) {
    console.info('Unbuild node ' + currentNodeUuid + ' of study ' + studyUuid + ' ...');
    const url = getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid) + '/unbuild';
    console.debug(url);
    return backendFetchText(url, { method: 'post' });
}

export function buildNode(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID) {
    console.info(
        'Build node ' +
            currentNodeUuid +
            ' on root network ' +
            currentRootNetworkUuid +
            ' of study ' +
            studyUuid +
            ' ...'
    );
    const url =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) + '/build';
    console.debug(url);
    return backendFetchText(url, { method: 'post' });
}

export function fetchCaseName(studyUuid: UUID, rootNetworkUuid: UUID) {
    console.info('Fetching case name');
    const url = getStudyUrl(studyUuid) + '/root-networks/' + encodeURIComponent(rootNetworkUuid) + '/case/name';
    console.debug(url);

    return backendFetchText(url);
}

export function isNodeExists(studyUuid: UUID, nodeName: string) {
    const existsNodeUrl =
        getStudyUrl(studyUuid) +
        '/nodes?' +
        new URLSearchParams({
            nodeName: nodeName,
        });
    console.debug(existsNodeUrl);
    return backendFetch(existsNodeUrl, { method: 'head' });
}

export function getUniqueNodeName(studyUuid: UUID) {
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
    return backendFetchJson(PREFIX_STUDY_QUERIES + '/v1/servers/about?view=study').catch((reason) => {
        console.error('Error while fetching the servers infos : ' + reason);
        return reason;
    });
}

export function fetchAvailableFilterEnumValues(
    studyUuid: UUID,
    nodeUuid: UUID,
    computingType: ComputingType,
    filterEnum: string
) {
    console.info('fetch available filter values');
    const url = `${getStudyUrlWithNodeUuidAndRootNetworkUuid(
        studyUuid,
        nodeUuid
    )}/computation/result/enum-values?computingType=${encodeURIComponent(computingType)}&enumName=${encodeURIComponent(
        filterEnum
    )}`;
    console.debug(url);
    return backendFetchJson(url);
}
