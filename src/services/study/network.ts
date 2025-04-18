/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'crypto';
import { EquipmentType, ExtendedEquipmentType, type GsLang, type Identifiable } from '@gridsuite/commons-ui';
import type { MapHvdcLine, MapLine, MapSubstation, MapTieLine } from '@powsybl/network-viewer';
import { getStudyUrlWithNodeUuidAndRootNetworkUuid, PREFIX_STUDY_QUERIES, safeEncodeURIComponent } from './index';
import { EQUIPMENT_INFOS_TYPES, EQUIPMENT_TYPES, type VoltageLevel } from '../../components/utils/equipment-types';
import { backendFetch, backendFetchJson, backendFetchText, getQueryParamsList, getUrlWithToken } from '../utils';

interface VoltageLevelSingleLineDiagram {
    studyUuid: UUID;
    currentNodeUuid: UUID;
    currentRootNetworkUuid: UUID;
    voltageLevelId?: UUID;
    useName: boolean;
    centerLabel: boolean;
    diagonalLabel: boolean;
    componentLibrary: string;
    sldDisplayMode: string;
    language: GsLang;
}

interface SubstationSingleLineDiagram {
    studyUuid: UUID;
    currentNodeUuid: UUID;
    currentRootNetworkUuid: UUID;
    substationId: UUID;
    useName: boolean;
    centerLabel: boolean;
    diagonalLabel: boolean;
    substationLayout: string;
    componentLibrary: string;
    language: GsLang;
}

/* voltage-levels */
export function getVoltageLevelSingleLineDiagram({
    studyUuid,
    currentNodeUuid,
    currentRootNetworkUuid,
    voltageLevelId,
    useName,
    centerLabel,
    diagonalLabel,
    componentLibrary,
    sldDisplayMode,
    language,
}: VoltageLevelSingleLineDiagram) {
    console.info(
        `Getting url of voltage level diagram '${voltageLevelId}' of study '${studyUuid}' and node '${currentNodeUuid}'...`
    );
    const queryParams = new URLSearchParams({
        useName: String(useName),
        centerLabel: String(centerLabel),
        diagonalLabel: String(diagonalLabel),
        topologicalColoring: 'true',
        sldDisplayMode: sldDisplayMode,
        language: language,
        inUpstreamBuiltParentNode: 'true',
    });
    if (componentLibrary !== null) {
        queryParams.append('componentLibrary', String(componentLibrary));
    }
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
    voltageLevelId: UUID
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

/* substations */
export function getSubstationSingleLineDiagram({
    studyUuid,
    currentNodeUuid,
    currentRootNetworkUuid,
    substationId,
    useName,
    centerLabel,
    diagonalLabel,
    substationLayout,
    componentLibrary,
    language,
}: SubstationSingleLineDiagram) {
    console.info(
        `Getting url of substation diagram '${substationId}' of study '${studyUuid}' , node '${currentNodeUuid}' and root network '${currentRootNetworkUuid}'...`
    );
    const queryParams = new URLSearchParams({
        useName: String(useName),
        centerLabel: String(centerLabel),
        diagonalLabel: String(diagonalLabel),
        topologicalColoring: 'true',
        substationLayout: substationLayout,
        language: language,
    });
    if (componentLibrary !== null) {
        queryParams.append('componentLibrary', String(componentLibrary));
    }
    return (
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/network/substations/' +
        encodeURIComponent(substationId) +
        '/svg-and-metadata?' +
        queryParams.toString()
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
    elementType: EquipmentType | ExtendedEquipmentType | EQUIPMENT_TYPES,
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

export function fetchSubstations(
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
        EQUIPMENT_TYPES.SUBSTATION,
        EQUIPMENT_INFOS_TYPES.TAB.type
    );
}

export function fetchLines(
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
        EQUIPMENT_TYPES.LINE,
        EQUIPMENT_INFOS_TYPES.TAB.type
    );
}

export function fetchVoltageLevels(
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
        EQUIPMENT_INFOS_TYPES.TAB.type
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

export function fetchTwoWindingsTransformers(
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
        EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER,
        EQUIPMENT_INFOS_TYPES.TAB.type
    );
}

export function fetchThreeWindingsTransformers(
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
        EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER,
        EQUIPMENT_INFOS_TYPES.TAB.type
    );
}

export function fetchGenerators(
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
        EQUIPMENT_TYPES.GENERATOR,
        EQUIPMENT_INFOS_TYPES.TAB.type
    );
}

export function fetchLoads(
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
        EQUIPMENT_TYPES.LOAD,
        EQUIPMENT_INFOS_TYPES.TAB.type
    );
}

export function fetchDanglingLines(
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
        EQUIPMENT_TYPES.DANGLING_LINE,
        EQUIPMENT_INFOS_TYPES.TAB.type
    );
}

export function fetchBatteries(
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
        EQUIPMENT_TYPES.BATTERY,
        EQUIPMENT_INFOS_TYPES.TAB.type
    );
}

export function fetchHvdcLines(
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
        EQUIPMENT_TYPES.HVDC_LINE,
        EQUIPMENT_INFOS_TYPES.TAB.type
    );
}

export function fetchLccConverterStations(
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
        EQUIPMENT_TYPES.LCC_CONVERTER_STATION,
        EQUIPMENT_INFOS_TYPES.TAB.type
    );
}

export function fetchVscConverterStations(
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
        EQUIPMENT_TYPES.VSC_CONVERTER_STATION,
        EQUIPMENT_INFOS_TYPES.TAB.type
    );
}

export function fetchShuntCompensators(
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
        EQUIPMENT_TYPES.SHUNT_COMPENSATOR,
        EQUIPMENT_INFOS_TYPES.TAB.type
    );
}

export function fetchStaticVarCompensators(
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
        EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR,
        EQUIPMENT_INFOS_TYPES.TAB.type
    );
}

export function fetchBuses(
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
        EQUIPMENT_TYPES.BUS,
        EQUIPMENT_INFOS_TYPES.TAB.type
    );
}

export function fetchBusbarSections(
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
        EQUIPMENT_TYPES.BUSBAR_SECTION,
        EQUIPMENT_INFOS_TYPES.TAB.type
    );
}

export function fetchTieLines(
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
        EQUIPMENT_TYPES.TIE_LINE,
        EQUIPMENT_INFOS_TYPES.TAB.type
    );
}

export const fetchNetworkExistence = (studyUuid: UUID, rootNetworkUuid: UUID) => {
    const fetchNetworkExistenceUrl = `${PREFIX_STUDY_QUERIES}/v1/studies/${studyUuid}/root-networks/${rootNetworkUuid}/network`;

    return backendFetch(fetchNetworkExistenceUrl, { method: 'HEAD' });
};

export const fetchStudyIndexationStatus = (studyUuid: UUID, rootNetworkUuid: UUID) => {
    console.info(`Fetching study indexation status of study '${studyUuid}' ...`);
    const fetchStudyIndexationUrl = `${PREFIX_STUDY_QUERIES}/v1/studies/${studyUuid}/root-networks/${rootNetworkUuid}/indexation/status`;

    console.debug(fetchStudyIndexationUrl);

    return backendFetchText(fetchStudyIndexationUrl);
};

/* export-network */

export function getExportUrl(studyUuid: UUID, nodeUuid: UUID, rootNetworkUuid: UUID, exportFormat: string) {
    const url =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, nodeUuid, rootNetworkUuid) +
        '/export-network/' +
        exportFormat;
    return getUrlWithToken(url);
}
