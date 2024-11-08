/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrlWithNodeUuid, PREFIX_STUDY_QUERIES, safeEncodeURIComponent } from './index';
import { EQUIPMENT_INFOS_TYPES, EQUIPMENT_TYPES } from '../../components/utils/equipment-types';
import { backendFetch, backendFetchJson, backendFetchText, getQueryParamsList, getUrlWithToken } from '../utils';
import { UUID } from 'crypto';
import { GsLang } from '@gridsuite/commons-ui';
import { SubstationLayout } from '../../components/diagrams/diagram-common';

/* voltage-levels */
export function getVoltageLevelSingleLineDiagram(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    voltageLevelId: UUID | undefined,
    useName: boolean,
    centerLabel: boolean,
    diagonalLabel: boolean,
    componentLibrary: unknown | null,
    sldDisplayMode: string,
    language: GsLang
) {
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
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network/voltage-levels/' +
        safeEncodeURIComponent(voltageLevelId) +
        '/svg-and-metadata?' +
        queryParams.toString()
    );
}

export function fetchBusesForVoltageLevel(studyUuid: UUID, currentNodeUuid: UUID, voltageLevelId: UUID) {
    console.info(
        `Fetching buses of study '${studyUuid}' and node '${currentNodeUuid}' + ' for voltage level '${voltageLevelId}'...`
    );
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('inUpstreamBuiltParentNode', 'true');

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

export function fetchBusbarSectionsForVoltageLevel(studyUuid: UUID, currentNodeUuid: UUID, voltageLevelId: UUID) {
    console.info(
        `Fetching busbar sections of study '${studyUuid}' and node '${currentNodeUuid}' + ' for voltage level '${voltageLevelId}'...`
    );
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('inUpstreamBuiltParentNode', 'true');

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

/* substations */
export function getSubstationSingleLineDiagram(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    substationId: UUID,
    useName: boolean,
    centerLabel: boolean,
    diagonalLabel: boolean,
    substationLayout: SubstationLayout,
    componentLibrary: unknown | null,
    language: GsLang
) {
    console.info(
        `Getting url of substation diagram '${substationId}' of study '${studyUuid}' and node '${currentNodeUuid}'...`
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
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network/substations/' +
        encodeURIComponent(substationId) +
        '/svg-and-metadata?' +
        queryParams.toString()
    );
}

/* elements */
export function fetchNetworkElementsInfos(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    substationsIds: string[] | undefined,
    elementType: string,
    infoType: string,
    inUpstreamBuiltParentNode?: boolean,
    nominalVoltages?: number[]
) {
    const substationsCount = substationsIds ? substationsIds.length : 0;
    const nominalVoltagesStr = nominalVoltages ? `[${nominalVoltages}]` : '[]';

    console.info(
        `Fetching network '${elementType}' elements '${infoType}' infos of study '${studyUuid}' and node '${currentNodeUuid}' with ${substationsCount} substations ids and ${nominalVoltagesStr} nominal voltages.`
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
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network/elements' +
        '?' +
        urlSearchParams +
        nominalVoltagesParamsList;
    console.debug(fetchElementsUrl);

    return backendFetchJson(fetchElementsUrl, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(substationsIds ?? null),
    });
}

export function fetchNetworkElementInfos(
    studyUuid: string,
    currentNodeUuid: UUID | undefined,
    elementType: EQUIPMENT_TYPES,
    infoType: string,
    elementId: string,
    inUpstreamBuiltParentNode: boolean
) {
    console.info(
        `Fetching specific network element '${elementId}' of type '${elementType}' of study '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    const urlSearchParams = new URLSearchParams();
    if (inUpstreamBuiltParentNode !== undefined) {
        urlSearchParams.append('inUpstreamBuiltParentNode', String(inUpstreamBuiltParentNode));
    }
    urlSearchParams.append('elementType', elementType);
    urlSearchParams.append('infoType', infoType);
    const optionalParams = new Map();

    optionalParams.forEach((value, key) => urlSearchParams.append(`optionalParameters[${key}]`, value));
    const fetchElementsUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
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
    substationsIds: string[] | undefined,
    inUpstreamBuiltParentNode: boolean
) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.SUBSTATION,
        EQUIPMENT_INFOS_TYPES.MAP.type,
        inUpstreamBuiltParentNode,
    );
}

export function fetchLinesMapInfos(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    substationsIds: string[] | undefined,
    inUpstreamBuiltParentNode: boolean
) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.LINE,
        EQUIPMENT_INFOS_TYPES.MAP.type,
        inUpstreamBuiltParentNode
    );
}

export function fetchTieLinesMapInfos(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    substationsIds: string[] | undefined,
    inUpstreamBuiltParentNode: boolean
) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.TIE_LINE,
        EQUIPMENT_INFOS_TYPES.MAP.type,
        inUpstreamBuiltParentNode
    );
}

export function fetchHvdcLinesMapInfos(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    substationsIds: string[] | undefined,
    inUpstreamBuiltParentNode: boolean
) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.HVDC_LINE,
        EQUIPMENT_INFOS_TYPES.MAP.type,
        inUpstreamBuiltParentNode
    );
}

export function fetchSubstations(studyUuid: UUID, currentNodeUuid: UUID, substationsIds: string[] | undefined) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.SUBSTATION,
        EQUIPMENT_INFOS_TYPES.TAB.type,
        true
    );
}

export function fetchLines(studyUuid: UUID, currentNodeUuid: UUID, substationsIds: string[] | undefined) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.LINE,
        EQUIPMENT_INFOS_TYPES.TAB.type,
        true
    );
}

export function fetchVoltageLevels(studyUuid: UUID, currentNodeUuid: UUID, substationsIds: string[] | undefined) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.VOLTAGE_LEVEL,
        EQUIPMENT_INFOS_TYPES.TAB.type,
        true
    );
}

export function fetchVoltageLevelsListInfos(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    substationsIds: string[] | undefined
) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.VOLTAGE_LEVEL,
        EQUIPMENT_INFOS_TYPES.LIST.type,
        true
    );
}

export function fetchVoltageLevelsMapInfos(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    substationsIds: string[] | undefined
) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.VOLTAGE_LEVEL,
        EQUIPMENT_INFOS_TYPES.MAP.type,
        true
    );
}

export function fetchTwoWindingsTransformers(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    substationsIds: string[] | undefined
) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER,
        EQUIPMENT_INFOS_TYPES.TAB.type,
        false
    );
}

export function fetchThreeWindingsTransformers(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    substationsIds: string[] | undefined
) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER,
        EQUIPMENT_INFOS_TYPES.TAB.type,
        false
    );
}

export function fetchGenerators(studyUuid: UUID, currentNodeUuid: UUID, substationsIds: string[] | undefined) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.GENERATOR,
        EQUIPMENT_INFOS_TYPES.TAB.type
    );
}

export function fetchLoads(studyUuid: UUID, currentNodeUuid: UUID, substationsIds: string[] | undefined) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.LOAD,
        EQUIPMENT_INFOS_TYPES.TAB.type,
        true
    );
}

export function fetchDanglingLines(studyUuid: UUID, currentNodeUuid: UUID, substationsIds: string[] | undefined) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.DANGLING_LINE,
        EQUIPMENT_INFOS_TYPES.TAB.type
    );
}

export function fetchBatteries(studyUuid: UUID, currentNodeUuid: UUID, substationsIds: string[] | undefined) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.BATTERY,
        EQUIPMENT_INFOS_TYPES.TAB.type
    );
}

export function fetchHvdcLines(studyUuid: UUID, currentNodeUuid: UUID, substationsIds: string[] | undefined) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.HVDC_LINE,
        EQUIPMENT_INFOS_TYPES.TAB.type,
        true
    );
}

export function fetchLccConverterStations(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    substationsIds: string[] | undefined
) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.LCC_CONVERTER_STATION,
        EQUIPMENT_INFOS_TYPES.TAB.type
    );
}

export function fetchVscConverterStations(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    substationsIds: string[] | undefined
) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.VSC_CONVERTER_STATION,
        EQUIPMENT_INFOS_TYPES.TAB.type
    );
}

export function fetchShuntCompensators(studyUuid: UUID, currentNodeUuid: UUID, substationsIds: string[] | undefined) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.SHUNT_COMPENSATOR,
        EQUIPMENT_INFOS_TYPES.TAB.type
    );
}

export function fetchStaticVarCompensators(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    substationsIds: string[] | undefined
) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR,
        EQUIPMENT_INFOS_TYPES.TAB.type
    );
}

export function fetchBuses(studyUuid: UUID, currentNodeUuid: UUID, substationsIds: string[] | undefined) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.BUS,
        EQUIPMENT_INFOS_TYPES.TAB.type
    );
}

export function fetchBusbarSections(studyUuid, currentNodeUuid, substationsIds) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.BUSBAR_SECTION,
        EQUIPMENT_INFOS_TYPES.TAB.type
    );
}

export const fetchNetworkExistence = (studyUuid:UUID) => {
    const fetchNetworkExistenceUrl = `${PREFIX_STUDY_QUERIES}/v1/studies/${studyUuid}/network`;

    return backendFetch(fetchNetworkExistenceUrl, { method: 'HEAD' });
};

export const fetchStudyIndexationStatus = (studyUuid: UUID) => {
    console.info(`Fetching study indexation status of study '${studyUuid}' ...`);
    const fetchStudyIndexationUrl = `${PREFIX_STUDY_QUERIES}/v1/studies/${studyUuid}/indexation/status`;

    console.debug(fetchStudyIndexationUrl);

    return backendFetchText(fetchStudyIndexationUrl);
};

/* export-network */
export function getExportUrl(studyUuid: UUID, nodeUuid: UUID, exportFormat: string) {
    const url = getStudyUrlWithNodeUuid(studyUuid, nodeUuid) + '/export-network/' + exportFormat;
    return getUrlWithToken(url);
}

export function fetchTieLines(studyUuid: UUID, currentNodeUuid: UUID, substationsIds: string[] | undefined) {
    return fetchNetworkElementsInfos(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.TIE_LINE,
        EQUIPMENT_INFOS_TYPES.TAB.type
    );
}
