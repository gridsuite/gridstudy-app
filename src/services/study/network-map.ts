/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrlWithNodeUuidAndRootNetworkUuid } from './index';
import { backendFetchJson, backendFetchText, getQueryParamsList } from '../utils';
import { EQUIPMENT_INFOS_TYPES } from '../../components/utils/equipment-types';
import {
    createFilter,
    EquipmentInfos,
    EquipmentType,
    ExtendedEquipmentType,
    Identifiable,
    NewFilterType,
} from '@gridsuite/commons-ui';
import { fetchNetworkElementsInfos } from './network';
import { createContingencyList } from 'services/explore';
import { ContingencyList, createIdentifierContingencyList } from './contingency-list';
import { UUID } from 'crypto';

export function fetchHvdcLineWithShuntCompensators(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    hvdcLineId: string
) {
    console.info(
        `Fetching HVDC Line '${hvdcLineId}' with Shunt Compensators of study '${studyUuid}' on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}'...`
    );
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('inUpstreamBuiltParentNode', 'true');
    const fetchEquipmentsUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/network-map' +
        '/hvdc-lines/' +
        hvdcLineId +
        '/shunt-compensators?' +
        urlSearchParams.toString();
    console.debug(fetchEquipmentsUrl);
    return backendFetchJson(fetchEquipmentsUrl);
}

export function fetchAllEquipments(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    substationsIds: string[]
) {
    console.info(
        `Fetching all equipments of study '${studyUuid}' on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' with substations ids '${substationsIds}'...`
    );

    const fetchEquipmentsUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/network-map/all' +
        '?' +
        getQueryParamsList(substationsIds, 'substationId');
    console.debug(fetchEquipmentsUrl);
    return backendFetchJson(fetchEquipmentsUrl);
}

export function fetchVoltageLevelEquipments(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    voltageLevelId: string,
    substationsIds?: string[],
    inUpstreamBuiltParentNode?: boolean
): Promise<(Identifiable & { type: EquipmentType })[]> {
    console.info(
        `Fetching equipments of study '${studyUuid}' on root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' and voltage level '${voltageLevelId}' with substations ids '${substationsIds}'...`
    );
    const urlSearchParams = new URLSearchParams();
    if (inUpstreamBuiltParentNode !== undefined) {
        urlSearchParams.append('inUpstreamBuiltParentNode', inUpstreamBuiltParentNode.toString());
    }

    const fetchEquipmentsUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/network-map' +
        '/voltage-levels/' +
        encodeURIComponent(voltageLevelId) +
        '/equipments' +
        '?' +
        getQueryParamsList(substationsIds, 'substationId') +
        urlSearchParams.toString();
    console.debug(fetchEquipmentsUrl);
    return backendFetchJson(fetchEquipmentsUrl);
}

export function fetchEquipmentsIds(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    substationsIds: string[],
    equipmentType: EquipmentType | ExtendedEquipmentType,
    inUpstreamBuiltParentNode: boolean,
    nominalVoltages?: number[]
) {
    const substationsCount = substationsIds ? substationsIds.length : 0;
    const nominalVoltagesStr = nominalVoltages ? `[${nominalVoltages}]` : '[]';

    console.info(
        `Fetching equipments ids '${equipmentType}' of study '${studyUuid}', node '${currentNodeUuid}' and root network '${currentRootNetworkUuid}' for ${substationsCount} substations ids and ${nominalVoltagesStr} nominal voltages.`
    );
    let urlSearchParams = new URLSearchParams();

    const nominalVoltagesParams = getQueryParamsList(nominalVoltages, 'nominalVoltages');
    const nominalVoltagesParamsList = nominalVoltages && nominalVoltages.length > 0 ? '&' + nominalVoltagesParams : '';

    let fetchEquipmentsUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/network-map/' +
        'equipments-ids' +
        '?' +
        'equipmentType=' +
        equipmentType +
        nominalVoltagesParamsList;
    if (inUpstreamBuiltParentNode !== undefined) {
        urlSearchParams.append('inUpstreamBuiltParentNode', inUpstreamBuiltParentNode.toString());
        fetchEquipmentsUrl = fetchEquipmentsUrl + '&' + urlSearchParams.toString();
    }
    console.debug(fetchEquipmentsUrl);
    return backendFetchJson(fetchEquipmentsUrl, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(substationsIds ?? null),
    });
}

export function fetchVoltageLevelIdForLineOrTransformerBySide(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    equipmentId: string,
    side: string
) {
    console.info(
        `Fetching voltage level ID for equipment '${equipmentId}' in study '${studyUuid}', node '${currentNodeUuid}' and root network '${currentRootNetworkUuid}' ...`
    );

    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('inUpstreamBuiltParentNode', 'true');
    urlSearchParams.append('side', side);

    const fetchEquipmentInfosUrl = `${getStudyUrlWithNodeUuidAndRootNetworkUuid(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid
    )}/network-map/branch-or-3wt/${encodeURIComponent(equipmentId)}/voltage-level-id?${urlSearchParams.toString()}`;

    console.debug(fetchEquipmentInfosUrl);
    return backendFetchText(fetchEquipmentInfosUrl);
}

export function fetchAllCountries(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID) {
    console.info(
        `Fetching all countries of study '${studyUuid}', node '${currentNodeUuid}' and root network '${currentRootNetworkUuid}' ...`
    );

    const fetchCountriesUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/network-map/countries?inUpstreamBuiltParentNode=true';
    console.debug(fetchCountriesUrl);
    return backendFetchJson(fetchCountriesUrl);
}

/**
 * Creates an object that represents a list of equipment identifiers.
 *
 * @param {string} equipmentType - The type of the equipment.
 * @param {Array} equipmentList - The list of equipment. Each equipment is a string representing the equipment ID
 *
 * @returns {Object} An object with the following properties:
 * - type: A string that is always 'IDENTIFIER_LIST'.
 * - equipmentType: The type of the equipment, same as the input parameter.
 * - filterEquipmentsAttributes: An array of objects. Each object has a single property 'equipmentID' which is the ID of an equipment. The IDs are extracted from the input equipmentList.
 */
function createEquipmentIdentifierList(equipmentType: EquipmentType, equipmentList: string[]) {
    return {
        id: null,
        type: 'IDENTIFIER_LIST',
        equipmentType: equipmentType,
        filterEquipmentsAttributes: equipmentList.map((eqId) => {
            return { equipmentID: eqId };
        }),
    };
}

export async function createMapFilter(
    equipmentType: EquipmentType,
    elementName: string,
    destinationDirectoryId: UUID,
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    selectedEquipmentsIds: string[],
    nominalVoltages: number[]
) {
    let equipmentFilters: NewFilterType = {
        id: null,
        type: '',
        equipmentType: '',
    };

    switch (equipmentType) {
        case EquipmentType.SUBSTATION:
        case EquipmentType.LINE:
            equipmentFilters = createEquipmentIdentifierList(equipmentType, selectedEquipmentsIds);
            break;

        default:
            if (selectedEquipmentsIds.length === 0) {
                throw new Error('EmptySelection');
            }

            const elementsIds = await fetchEquipmentsIds(
                studyUuid,
                currentNodeUuid,
                currentRootNetworkUuid,
                selectedEquipmentsIds,
                equipmentType,
                false,
                nominalVoltages
            );

            equipmentFilters = createEquipmentIdentifierList(equipmentType, elementsIds);
            break;
    }
    if (
        equipmentFilters.filterEquipmentsAttributes === undefined ||
        equipmentFilters.filterEquipmentsAttributes?.length === 0
    ) {
        throw new Error('EmptySelection');
    }

    return createFilter(equipmentFilters, elementName, '', destinationDirectoryId);
}

export async function createMapContingencyList(
    equipmentType: EquipmentType,
    elementName: string,
    destinationDirectoryId: UUID,
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    selectedEquipments: EquipmentInfos[],
    nominalVoltages: number[]
) {
    let equipmentContingencyList: ContingencyList;
    switch (equipmentType) {
        case EquipmentType.SUBSTATION:
        case EquipmentType.LINE:
            equipmentContingencyList = createIdentifierContingencyList(elementName, selectedEquipments);

            break;

        default:
            if (selectedEquipments.length === 0) {
                throw new Error('EmptySelection');
            }

            const selectedEquipmentsIds = selectedEquipments.map((element) => element.id);
            const elementsIds = await fetchNetworkElementsInfos<EquipmentInfos[]>(
                studyUuid,
                currentNodeUuid,
                currentRootNetworkUuid,
                selectedEquipmentsIds,
                equipmentType,
                EQUIPMENT_INFOS_TYPES.LIST.type,
                false,
                nominalVoltages
            );

            if (elementsIds?.length === 0) {
                throw new Error('EmptySelection');
            }
            equipmentContingencyList = createIdentifierContingencyList(elementName, elementsIds);
            break;
    }
    if (
        equipmentContingencyList === undefined ||
        equipmentContingencyList.identifierContingencyList.identifiers.length === 0
    ) {
        throw new Error('EmptySelection');
    }

    return createContingencyList(equipmentContingencyList, elementName, '', destinationDirectoryId);
}

export function fetchAllNominalVoltages(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID) {
    console.info(
        `Fetching all nominal voltages of study '${studyUuid}', node '${currentNodeUuid}' and root network '${currentRootNetworkUuid}' ...`
    );

    const fetchNominalVoltagesUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/network-map/nominal-voltages?inUpstreamBuiltParentNode=true';
    console.debug(fetchNominalVoltagesUrl);
    return backendFetchJson(fetchNominalVoltagesUrl);
}
