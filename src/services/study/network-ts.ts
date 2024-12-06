/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UnknownArray } from 'type-fest';
import type { UUID } from 'crypto';
import type { MapHvdcLine, MapLine, MapSubstation, MapTieLine } from '@powsybl/network-viewer';
import { EQUIPMENT_INFOS_TYPES, EQUIPMENT_TYPES } from '../../components/utils/equipment-types';
import { backendFetchJson, getQueryParamsList } from '../utils';
import { getStudyUrlWithNodeUuid } from './index';

/*
 * NOTE: this file is temporary until network.js is fully migrated to TS
 */

/* elements */
export async function fetchNetworkElementsInfos<T = unknown>(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    substationsIds: string[] | undefined,
    elementType: string, //TODO found which EQUIPMENT_TYPES enum to use
    infoType: string, // TODO migrate to EquipmentInfosTypes
    inUpstreamBuiltParentNode?: boolean,
    nominalVoltages?: UnknownArray
): Promise<T> {
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

    return await backendFetchJson(fetchElementsUrl, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(substationsIds ?? null),
    });
}

export function fetchSubstationsMapInfos(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    substationsIds: string[] | undefined,
    inUpstreamBuiltParentNode: boolean
) {
    return fetchNetworkElementsInfos<MapSubstation[]>(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.SUBSTATION,
        EQUIPMENT_INFOS_TYPES.MAP.type,
        inUpstreamBuiltParentNode
    );
}

export function fetchLinesMapInfos(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    substationsIds: string[] | undefined,
    inUpstreamBuiltParentNode: boolean
) {
    return fetchNetworkElementsInfos<MapLine[]>(
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
    return fetchNetworkElementsInfos<MapTieLine[]>(
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
    return fetchNetworkElementsInfos<MapHvdcLine[]>(
        studyUuid,
        currentNodeUuid,
        substationsIds,
        EQUIPMENT_TYPES.HVDC_LINE,
        EQUIPMENT_INFOS_TYPES.MAP.type,
        inUpstreamBuiltParentNode
    );
}
