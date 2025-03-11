/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetch, backendFetchJson, backendFetchText, getRequestParamFromList } from '../utils';
import { UUID } from 'crypto';
import { COMPUTING_AND_NETWORK_MODIFICATION_TYPE } from '../../utils/report/report.constant';
import { EquipmentType, ExtendedEquipmentType } from '@gridsuite/commons-ui';
import { NetworkModificationCopyInfo } from '../../components/graph/menus/network-modification-menu.type';
import { ComputingType } from '../../components/computing-status/computing-type';
import type { Svg } from 'components/diagrams/diagram-common';

export function safeEncodeURIComponent(value: string | null | undefined): string {
    return value != null ? encodeURIComponent(value) : '';
}

export const PREFIX_STUDY_QUERIES = import.meta.env.VITE_API_GATEWAY + '/study';

export const getStudyUrl = (studyUuid: UUID | null) =>
    `${PREFIX_STUDY_QUERIES}/v1/studies/${safeEncodeURIComponent(studyUuid)}`;

export const getStudyUrlWithNodeUuidAndRootNetworkUuid = (
    studyUuid: string | null | undefined,
    nodeUuid: string | undefined,
    rootNetworkUuid: string | undefined | null
) =>
    `${PREFIX_STUDY_QUERIES}/v1/studies/${safeEncodeURIComponent(studyUuid)}/root-networks/${safeEncodeURIComponent(
        rootNetworkUuid
    )}/nodes/${safeEncodeURIComponent(nodeUuid)}`;

export const getStudyUrlWithRootNetworkUuid = (
    studyUuid: string | null | undefined,
    rootNetworkUuid: string | undefined | null
) =>
    `${PREFIX_STUDY_QUERIES}/v1/studies/${safeEncodeURIComponent(studyUuid)}/root-networks/${safeEncodeURIComponent(
        rootNetworkUuid
    )}`;

export const getStudyUrlWithNodeUuid = (studyUuid: string | null | undefined, nodeUuid: string | undefined) =>
    `${PREFIX_STUDY_QUERIES}/v1/studies/${safeEncodeURIComponent(studyUuid)}/nodes/${safeEncodeURIComponent(nodeUuid)}`;

export const fetchStudyExists = (studyUuid: UUID) => {
    console.info(`Fetching study '${studyUuid}' existence ...`);
    const fetchStudiesUrl = getStudyUrl(studyUuid);
    console.debug(fetchStudiesUrl);
    return backendFetch(fetchStudiesUrl, { method: 'head' });
};

export function getNetworkAreaDiagramUrl(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    depth: number,
    withGeoData: boolean
) {
    console.info(
        `Getting url of network area diagram of study '${studyUuid}' on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}'...`
    );
    return (
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/network-area-diagram?' +
        new URLSearchParams({
            depth: depth.toString(),
            withGeoData: withGeoData.toString(),
        })
    );
}

export function fetchParentNodesReport(
    studyUuid: UUID | null,
    nodeUuid: UUID,
    currentRootNetworkUuid: UUID,
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
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, nodeUuid, currentRootNetworkUuid) +
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
    studyUuid: UUID | null,
    nodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    reportId: string | null,
    severityFilterList: string[],
    messageFilter: string,
    isGlobalLogs: boolean
) {
    let url;
    if (isGlobalLogs) {
        url = getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, nodeUuid, currentRootNetworkUuid) + '/report/logs?';
    } else {
        url =
            getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, nodeUuid, currentRootNetworkUuid) +
            '/report/' +
            reportId +
            '/logs?';
    }
    if (severityFilterList?.length) {
        url += '&' + getRequestParamFromList(severityFilterList, 'severityLevels');
    }
    if (messageFilter && messageFilter !== '') {
        url += '&message=' + encodeURIComponent(messageFilter);
    }

    return backendFetchJson(url);
}

export function fetchNodeSeverities(
    studyUuid: UUID,
    nodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    reportId: string | null,
    isGlobalLogs: boolean
) {
    let url;
    if (isGlobalLogs) {
        url =
            getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, nodeUuid, currentRootNetworkUuid) +
            '/report/aggregated-severities';
    } else {
        url =
            getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, nodeUuid, currentRootNetworkUuid) +
            '/report/' +
            reportId +
            '/aggregated-severities';
    }
    return backendFetchJson(url);
}

export function fetchSvg(svgUrl: string, fetchOptions?: RequestInit): Promise<Svg> {
    console.debug(svgUrl);
    return backendFetch(svgUrl, fetchOptions).then((response) => (response.status === 204 ? null : response.json()));
}

export function searchEquipmentsInfos(
    studyUuid: UUID,
    nodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    searchTerm: string,
    getUseNameParameterKey: () => 'name' | 'id',
    inUpstreamBuiltParentNode?: boolean,
    equipmentType?: EquipmentType | ExtendedEquipmentType
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
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, nodeUuid, currentRootNetworkUuid) +
            '/search?' +
            urlSearchParams.toString()
    );
}

export function fetchContingencyCount(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    contingencyListNames: string[]
) {
    console.info(
        `Fetching contingency count for ${contingencyListNames} on '${studyUuid}' for root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}'...`
    );

    const contingencyListNamesParams = getRequestParamFromList(contingencyListNames, 'contingencyListName');
    const urlSearchParams = new URLSearchParams(contingencyListNamesParams);

    const url =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/contingency-count?' +
        urlSearchParams;

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
        safeEncodeURIComponent(studyUuid) +
        '/nodes/' +
        safeEncodeURIComponent(targetNodeId) +
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

export function unbuildNode(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID) {
    console.info(
        'Unbuild node ' +
            currentNodeUuid +
            ' of study ' +
            studyUuid +
            ' and current root network ' +
            currentRootNetworkUuid +
            ' ...'
    );
    const url =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) + '/unbuild';
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
            ' and current root network ' +
            currentRootNetworkUuid +
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
    currentRootNetworkUuid: UUID,
    computingType: ComputingType,
    filterEnum: string
) {
    console.info('fetch available filter values');
    const url = `${getStudyUrlWithNodeUuidAndRootNetworkUuid(
        studyUuid,
        nodeUuid,
        currentRootNetworkUuid
    )}/computation/result/enum-values?computingType=${encodeURIComponent(computingType)}&enumName=${encodeURIComponent(
        filterEnum
    )}`;
    console.debug(url);
    return backendFetchJson(url);
}
