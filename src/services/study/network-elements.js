/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrlWithNodeUuid, STUDY_PATHS } from './index';
import {
    backendFetchJson,
    getRequestParamFromList,
} from '../../utils/rest-api';
import {
    EQUIPMENT_INFOS_TYPES,
    EQUIPMENT_TYPES,
} from '../../components/utils/equipment-types';

export function fetchNetworkElementsInfos(
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
