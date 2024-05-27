/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrlWithNodeUuid } from './index';
import { backendFetchJson, getRequestParamFromList } from '@gridsuite/commons-ui';
import { createFilter } from '../explore';
import { NAME } from '../../components/utils/field-constants.js';
import { EQUIPMENT_TYPES } from '../../components/utils/equipment-types.js';

export function fetchHvdcLineWithShuntCompensators(
    studyUuid,
    currentNodeUuid,
    hvdcLineId
) {
    console.info(
        `Fetching HVDC Line '${hvdcLineId}' with Shunt Compensators of study '${studyUuid}' and node '${currentNodeUuid}'...`
    );
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('inUpstreamBuiltParentNode', 'true');
    const fetchEquipmentsUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-map' +
        '/hvdc-lines/' +
        hvdcLineId +
        '/shunt-compensators?' +
        urlSearchParams.toString();
    console.debug(fetchEquipmentsUrl);
    return backendFetchJson(fetchEquipmentsUrl);
}

export function fetchAllEquipments(studyUuid, currentNodeUuid, substationsIds) {
    console.info(
        `Fetching all equipments of study '${studyUuid}' and node '${currentNodeUuid}' with substations ids '${substationsIds}'...`
    );

    const fetchEquipmentsUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-map/all' +
        '?' +
        getRequestParamFromList(substationsIds, 'substationId');
    console.debug(fetchEquipmentsUrl);
    return backendFetchJson(fetchEquipmentsUrl);
}

export function fetchVoltageLevelEquipments(
    studyUuid,
    currentNodeUuid,
    substationsIds,
    voltageLevelId,
    inUpstreamBuiltParentNode
) {
    console.info(
        `Fetching equipments of study '${studyUuid}' and node '${currentNodeUuid}' and voltage level '${voltageLevelId}' with substations ids '${substationsIds}'...`
    );
    const urlSearchParams = new URLSearchParams();
    if (inUpstreamBuiltParentNode !== undefined) {
        urlSearchParams.append(
            'inUpstreamBuiltParentNode',
            inUpstreamBuiltParentNode
        );
    }

    const fetchEquipmentsUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-map' +
        '/voltage-levels/' +
        encodeURIComponent(voltageLevelId) +
        '/equipments' +
        '?' +
        getRequestParamFromList(substationsIds, 'substationId') +
        urlSearchParams.toString();
    console.debug(fetchEquipmentsUrl);
    return backendFetchJson(fetchEquipmentsUrl);
}

export function fetchEquipmentsIds(
    studyUuid,
    currentNodeUuid,
    substationsIds,
    equipmentType,
    inUpstreamBuiltParentNode
) {
    console.info(
        `Fetching equipments ids '${equipmentType}' of study '${studyUuid}' and node '${currentNodeUuid}' with substations ids '${substationsIds}'...`
    );
    let urlSearchParams = new URLSearchParams();

    let fetchEquipmentsUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-map/' +
        'equipments-ids';
    const elementInfos = {
        elementType: equipmentType,
        substationsIds: substationsIds !== undefined && substationsIds,
    };
    if (inUpstreamBuiltParentNode !== undefined) {
        urlSearchParams.append(
            'inUpstreamBuiltParentNode',
            inUpstreamBuiltParentNode
        );
        fetchEquipmentsUrl =
            fetchEquipmentsUrl + '?' + urlSearchParams.toString();
    }
    console.debug(fetchEquipmentsUrl);
    return backendFetchJson(fetchEquipmentsUrl, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(elementInfos),
    });
}

export function fetchLineOrTransformer(
    studyUuid,
    currentNodeUuid,
    equipmentId
) {
    console.info(
        `Fetching specific equipment '${equipmentId}' of type branch-or-3wt of study '${studyUuid}' and node '${currentNodeUuid}' ...`
    );
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('inUpstreamBuiltParentNode', true);
    const fetchEquipmentInfosUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-map/branch-or-3wt/' +
        encodeURIComponent(equipmentId) +
        '?' +
        urlSearchParams.toString();
    console.debug(fetchEquipmentInfosUrl);
    return backendFetchJson(fetchEquipmentInfosUrl);
}

export function fetchAllCountries(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching all countries of study '${studyUuid}' and node '${currentNodeUuid}' ...`
    );

    const fetchCountriesUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
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
function createEquipmentIdentifierList(equipmentType, equipmentList) {
    return {
        type: 'IDENTIFIER_LIST',
        equipmentType: equipmentType,
        filterEquipmentsAttributes: equipmentList.map((eqId) => {
            return { equipmentID: eqId };
        }),
    };
}

export async function createMapFilter(
    filter,
    distDir,
    studyUuid,
    currentNodeUuid,
    selectedEquipmentsIds
) {
    let equipmentFilters = [];
    switch (filter.equipmentType) {
        case EQUIPMENT_TYPES.SUBSTATION:
        case EQUIPMENT_TYPES.LINE:
            equipmentFilters = createEquipmentIdentifierList(
                filter.equipmentType,
                selectedEquipmentsIds
            );
            break;

        default:
            if (selectedEquipmentsIds.length === 0) {
                throw new Error('EmptySelection');
            }

            const elementsIds = await fetchEquipmentsIds(
                studyUuid,
                currentNodeUuid,
                selectedEquipmentsIds,
                filter.equipmentType,
                false
            );

            equipmentFilters = createEquipmentIdentifierList(
                filter.equipmentType,
                elementsIds
            );
            break;
    }
    if (
        equipmentFilters.filterEquipmentsAttributes === undefined ||
        equipmentFilters.filterEquipmentsAttributes?.length === 0
    ) {
        throw new Error('EmptySelection');
    }

    await createFilter(
        equipmentFilters,
        filter[NAME],
        '',
        distDir.id?.toString() ?? ''
    );
}

export function fetchAllNominalVoltages(studyUuid, currentNodeUuid) {
    console.info(
        `Fetching all nominal voltages of study '${studyUuid}' and node '${currentNodeUuid}' ...`
    );

    const fetchNominalVoltagesUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-map/nominal-voltages?inUpstreamBuiltParentNode=true';
    console.debug(fetchNominalVoltagesUrl);
    return backendFetchJson(fetchNominalVoltagesUrl);
}
