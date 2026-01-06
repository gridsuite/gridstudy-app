/**
 * Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 */

import type { UUID } from 'node:crypto';
import {
    backendFetch,
    backendFetchJson,
    backendFetchText,
    EquipmentType,
    ExtendedEquipmentType,
    type Identifiable,
} from '@gridsuite/commons-ui';
import type { MapHvdcLine, MapLine, MapSubstation, MapTieLine } from '@powsybl/network-viewer';
import { getStudyUrlWithNodeUuidAndRootNetworkUuid, PREFIX_STUDY_QUERIES, safeEncodeURIComponent } from './index';
import { EQUIPMENT_INFOS_TYPES, EQUIPMENT_TYPES, type VoltageLevel } from '../../components/utils/equipment-types';
import { getQueryParamsList } from '../utils';
import { BusBarSectionsInfos, FeederBaysInfos, SwitchInfos } from './network-map.type';
import type { SpreadsheetEquipmentType } from '../../components/spreadsheet-view/types/spreadsheet.type';
import { JSONSchema4 } from 'json-schema';
import { isBlankOrEmpty } from '../../components/utils/validation-functions';

interface VoltageLevelSingleLineDiagram {
    studyUuid: UUID;
    currentNodeUuid: UUID;
    currentRootNetworkUuid: UUID;
    voltageLevelId: string;
}

interface SubstationSingleLineDiagram {
    studyUuid: UUID;
    currentNodeUuid: UUID;
    currentRootNetworkUuid: UUID;
    substationId: string;
}

export const PREFIX_SCHEMAS_QUERIES = import.meta.env.VITE_API_GATEWAY + '/network-map';

/* voltage-levels */
export function getVoltageLevelSingleLineDiagramUrl({
    studyUuid,
    currentNodeUuid,
    currentRootNetworkUuid,
    voltageLevelId,
}: VoltageLevelSingleLineDiagram) {
    console.info(
        `Getting url of voltage level diagram '${voltageLevelId}' of study '${studyUuid}' and node '${currentNodeUuid}'...`
    );
    const queryParams = new URLSearchParams({
        inUpstreamBuiltParentNode: 'true',
    });
    return (
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/network/voltage-levels/' +
        safeEncodeURIComponent(voltageLevelId) +
        '/svg-and-metadata?' +
        queryParams.toString()
    );
}

export function fetchSubstationIdForVoltageLevel(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    voltageLevelId: string
) {
    console.info(
        `Fetching substation ID for the voltage level '${voltageLevelId}' of study '${studyUuid}' on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' + ' for voltage level '${voltageLevelId}'...`
    );
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('inUpstreamBuiltParentNode', 'true');

    const fetchSubstationIdUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/network/voltage-levels/' +
        encodeURIComponent(voltageLevelId) +
        '/substation-id' +
        '?' +
        urlSearchParams.toString();

    console.debug(fetchSubstationIdUrl);

    return backendFetchText(fetchSubstationIdUrl);
}

export function fetchBusesOrBusbarSectionsForVoltageLevel(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    voltageLevelId: string
): Promise<Identifiable[]> {
    console.info(
        `Fetching buses or busbar sections of study '${studyUuid}' on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' + ' for voltage level '${voltageLevelId}'...`
    );
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('inUpstreamBuiltParentNode', 'true');

    const fetchBusbarSectionsUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/network/voltage-levels/' +
        encodeURIComponent(voltageLevelId) +
        '/buses-or-busbar-sections' +
        '?' +
        urlSearchParams.toString();

    console.debug(fetchBusbarSectionsUrl);
    return backendFetchJson(fetchBusbarSectionsUrl);
}

export function fetchSwitchesOfVoltageLevel(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    voltageLevelId: string
): Promise<SwitchInfos[]> {
    console.info(
        `Fetching switches of study '${studyUuid}' on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' + ' for voltage level '${voltageLevelId}'...`
    );
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('inUpstreamBuiltParentNode', 'true');

    const fetchSwitchesUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/network/voltage-levels/' +
        encodeURIComponent(voltageLevelId) +
        '/switches' +
        '?' +
        urlSearchParams.toString();

    console.debug(fetchSwitchesUrl);
    return backendFetchJson(fetchSwitchesUrl);
}

export function fetchVoltageLevelBusBarSectionsInfos(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    voltageLevelId: string
): Promise<BusBarSectionsInfos> {
    console.info(
        `Fetching bus bar sections information of study '${studyUuid}' on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' + ' for voltage level '${voltageLevelId}'...`
    );
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('inUpstreamBuiltParentNode', 'true');

    const fetchTopologyUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/network/voltage-levels/' +
        encodeURIComponent(voltageLevelId) +
        '/bus-bar-sections' +
        '?' +
        urlSearchParams.toString();

    console.debug(fetchTopologyUrl);
    return backendFetchJson(fetchTopologyUrl);
}

export function fetchVoltageLevelFeederBaysInfos(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    voltageLevelId: string
): Promise<FeederBaysInfos> {
    console.info(
        `Fetching feeder bays infos of study '${studyUuid}' on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' + ' for voltage level '${voltageLevelId}'...`
    );
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('inUpstreamBuiltParentNode', 'true');

    const fetchTopologyUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/network/voltage-levels/' +
        encodeURIComponent(voltageLevelId) +
        '/feeder-bays' +
        '?' +
        urlSearchParams.toString();

    console.debug(fetchTopologyUrl);
    return backendFetchJson(fetchTopologyUrl);
}

/* substations */
export function getSubstationSingleLineDiagramUrl({
    studyUuid,
    currentNodeUuid,
    currentRootNetworkUuid,
    substationId,
}: SubstationSingleLineDiagram) {
    console.info(
        `Getting url of substation diagram '${substationId}' of study '${studyUuid}' , node '${currentNodeUuid}' and root network '${currentRootNetworkUuid}'...`
    );
    return (
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/network/substations/' +
        encodeURIComponent(substationId) +
        '/svg-and-metadata'
    );
}

/* elements */

// TODO: remove default generics once fetchers typed
export async function fetchNetworkElementsInfos<T extends Identifiable[] = Identifiable[]>(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    substationsIds: string[] | undefined,
    elementType: string, //TODO found which EQUIPMENT_TYPES enum to use
    infoType: string, // TODO migrate to EquipmentInfosTypes
    inUpstreamBuiltParentNode?: boolean,
    nominalVoltages?: number[]
): Promise<T> {
    console.info(
        `Fetching network '${elementType}' elements '${infoType}' infos of study '${studyUuid}' on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' with ${
            substationsIds?.length ?? 0
        } substations ids and [${nominalVoltages ?? ''}] nominal voltages.`
    );

    const nominalVoltagesParams = getQueryParamsList(nominalVoltages, 'nominalVoltages');

    const nominalVoltagesParamsList = nominalVoltages && nominalVoltages?.length > 0 ? '&' + nominalVoltagesParams : '';

    const urlSearchParams = new URLSearchParams();
    if (inUpstreamBuiltParentNode !== undefined) {
        urlSearchParams.append('inUpstreamBuiltParentNode', String(inUpstreamBuiltParentNode));
    }
    urlSearchParams.append('infoType', infoType);
    urlSearchParams.append('elementType', elementType);
    // the `partialObject` parameter will be injected by the study-server who hold this parameter in database

    const fetchElementsUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/network/elements' +
        '?' +
        urlSearchParams +
        nominalVoltagesParamsList;
    console.debug(fetchElementsUrl);

    return await backendFetchJson(fetchElementsUrl, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(substationsIds ?? null),
    });
}

export function fetchNetworkElementInfos(
    studyUuid: string | undefined | null,
    currentNodeUuid: UUID | undefined,
    currentRootNetworkUuid: string | undefined | null,
    elementType: EquipmentType | ExtendedEquipmentType | EQUIPMENT_TYPES | SpreadsheetEquipmentType,
    infoType: string,
    elementId: string,
    inUpstreamBuiltParentNode: boolean
) {
    console.info(
        `Fetching specific network element '${elementId}' of type '${elementType}' of study '${studyUuid}' on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' ...`
    );
    const urlSearchParams = new URLSearchParams();
    if (inUpstreamBuiltParentNode !== undefined) {
        urlSearchParams.append('inUpstreamBuiltParentNode', String(inUpstreamBuiltParentNode));
    }
    urlSearchParams.append('elementType', elementType);
    urlSearchParams.append('infoType', infoType);

    const fetchElementsUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/network/elements/' +
        encodeURIComponent(elementId) +
        '?' +
        urlSearchParams.toString();
    console.debug(fetchElementsUrl);

    return backendFetchJson(fetchElementsUrl);
}

export function fetchSubstationsMapInfos(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    substationsIds: string[] | undefined,
    inUpstreamBuiltParentNode: boolean
) {
    return fetchNetworkElementsInfos<MapSubstation[]>(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid,
        substationsIds,
        EQUIPMENT_TYPES.SUBSTATION,
        EQUIPMENT_INFOS_TYPES.MAP.type,
        inUpstreamBuiltParentNode
    );
}

export function fetchLinesMapInfos(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    substationsIds: string[] | undefined,
    inUpstreamBuiltParentNode: boolean
) {
    return fetchNetworkElementsInfos<MapLine[]>(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid,
        substationsIds,
        EQUIPMENT_TYPES.LINE,
        EQUIPMENT_INFOS_TYPES.MAP.type,
        inUpstreamBuiltParentNode
    );
}

export function fetchTieLinesMapInfos(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    substationsIds: string[] | undefined,
    inUpstreamBuiltParentNode: boolean
) {
    return fetchNetworkElementsInfos<MapTieLine[]>(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid,
        substationsIds,
        EQUIPMENT_TYPES.TIE_LINE,
        EQUIPMENT_INFOS_TYPES.MAP.type,
        inUpstreamBuiltParentNode
    );
}

export function fetchHvdcLinesMapInfos(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    substationsIds: string[] | undefined,
    inUpstreamBuiltParentNode: boolean
) {
    return fetchNetworkElementsInfos<MapHvdcLine[]>(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid,
        substationsIds,
        EQUIPMENT_TYPES.HVDC_LINE,
        EQUIPMENT_INFOS_TYPES.MAP.type,
        inUpstreamBuiltParentNode
    );
}

export function fetchVoltageLevelsListInfos(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    substationsIds?: string[]
) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid,
        substationsIds,
        EQUIPMENT_TYPES.VOLTAGE_LEVEL,
        EQUIPMENT_INFOS_TYPES.LIST.type,
        true
    );
}

export function fetchVoltageLevelsMapInfos(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    substationsIds?: string[]
) {
    return fetchNetworkElementsInfos<VoltageLevel[]>(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid,
        substationsIds,
        EQUIPMENT_TYPES.VOLTAGE_LEVEL,
        EQUIPMENT_INFOS_TYPES.MAP.type,
        true
    );
}

export const fetchNetworkExistence = (studyUuid: UUID, rootNetworkUuid: UUID) => {
    const fetchNetworkExistenceUrl = `${PREFIX_STUDY_QUERIES}/v1/studies/${studyUuid}/root-networks/${rootNetworkUuid}/network`;

    return backendFetch(fetchNetworkExistenceUrl, { method: 'HEAD' });
};

export const fetchRootNetworkIndexationStatus = (studyUuid: UUID, rootNetworkUuid: UUID) => {
    console.info(
        `Fetching root network indexation status of study '${studyUuid}' and root network '${rootNetworkUuid}' ...`
    );
    const fetchRootNetworkIndexationUrl = `${PREFIX_STUDY_QUERIES}/v1/studies/${studyUuid}/root-networks/${rootNetworkUuid}/indexation/status`;

    console.debug(fetchRootNetworkIndexationUrl);

    return backendFetchText(fetchRootNetworkIndexationUrl);
};

export function exportNetworkFile(
    studyUuid: UUID,
    nodeUuid: UUID,
    rootNetworkUuid: UUID,
    params: Record<string, any>,
    selectedFormat: string,
    fileName: string
): Promise<UUID> {
    const url =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, nodeUuid, rootNetworkUuid) +
        '/export-network/' +
        selectedFormat;

    const urlSearchParams = new URLSearchParams();
    if (Object.keys(params).length > 0) {
        const paramsJson = JSON.stringify(params);
        urlSearchParams.append('formatParameters', paramsJson);
    }
    if (!isBlankOrEmpty(fileName)) {
        urlSearchParams.append('fileName', fileName);
    }

    const suffix = urlSearchParams.toString() ? '?' + urlSearchParams.toString() : '';

    return backendFetchJson(url + suffix, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
    });
}

export function fetchSpreadsheetEquipmentTypeSchema(type: SpreadsheetEquipmentType): Promise<JSONSchema4> {
    const fetchEquipmentTypeSchemaUrl = `${PREFIX_SCHEMAS_QUERIES}/v1/schemas/${type}/${EQUIPMENT_INFOS_TYPES.TAB.type}`;
    return backendFetchJson(fetchEquipmentTypeSchemaUrl, {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
    });
}
