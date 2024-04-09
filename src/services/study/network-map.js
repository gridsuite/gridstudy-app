/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrlWithNodeUuid } from './index';
import { backendFetchJson, getQueryParamsList } from '../utils';
import { EQUIPMENT_TYPES } from '../../components/utils/equipment-types.js';
import { createFilter } from '../explore';
import { NAME } from '../../components/utils/field-constants.js';

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
        getQueryParamsList(substationsIds, 'substationId');
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
        '/voltage-level-equipments/' +
        encodeURIComponent(voltageLevelId) +
        '?' +
        getQueryParamsList(substationsIds, 'substationId') +
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
        'equipments-ids' +
        '?' +
        'equipmentType=' +
        equipmentType;
    if (substationsIds !== undefined && substationsIds.length > 0) {
        fetchEquipmentsUrl +=
            '&' + getQueryParamsList(substationsIds, 'substationId');
    }

    if (inUpstreamBuiltParentNode !== undefined) {
        urlSearchParams.append(
            'inUpstreamBuiltParentNode',
            inUpstreamBuiltParentNode
        );
        fetchEquipmentsUrl =
            fetchEquipmentsUrl + '&' + urlSearchParams.toString();
    }
    console.debug(fetchEquipmentsUrl);
    return backendFetchJson(fetchEquipmentsUrl);
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
 * @param {Array} equipmentList - The list of equipment. Each equipment can be either a string representing the equipment ID or an object with an 'id' property.
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
            if (eqId?.id) {
                return { equipmentID: eqId.id };
            } else {
                return { equipmentID: eqId };
            }
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
    let equipementFilters = [];
    switch (filter.equipmentType) {
        case EQUIPMENT_TYPES.SUBSTATION:
        case EQUIPMENT_TYPES.LINE:
            equipementFilters = createEquipmentIdentifierList(
                filter.equipmentType,
                selectedEquipmentsIds
            );
            break;

        case EQUIPMENT_TYPES.VOLTAGE_LEVEL:
        case EQUIPMENT_TYPES.BUS:
        case EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER:
        case EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER:
        case EQUIPMENT_TYPES.BUSBAR_SECTION:
        case EQUIPMENT_TYPES.GENERATOR:
        case EQUIPMENT_TYPES.BATTERY:
        case EQUIPMENT_TYPES.LOAD:
        case EQUIPMENT_TYPES.SHUNT_COMPENSATOR:
        case EQUIPMENT_TYPES.DANGLING_LINE:
        case EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR:
        case EQUIPMENT_TYPES.HVDC_CONVERTER_STATION:
        case EQUIPMENT_TYPES.VSC_CONVERTER_STATION:
        case EQUIPMENT_TYPES.LCC_CONVERTER_STATION:
        case EQUIPMENT_TYPES.SWITCH:
            const substationsIds = selectedEquipmentsIds.map(
                (substation) => substation.id
            );
            if (substationsIds.length === 0) {
                throw new Error('No substations selected');
            }

            const elementsIds = await fetchEquipmentsIds(
                studyUuid,
                currentNodeUuid,
                substationsIds,
                filter.equipmentType,
                false
            );

            if (elementsIds.length > 0) {
                equipementFilters = createEquipmentIdentifierList(
                    filter.equipmentType,
                    elementsIds
                );
            }

            break;

        default:
            break;
    }

    if (equipementFilters.filterEquipmentsAttributes?.length === 0) {
        throw new Error('No equipment selected');
    }

    if (equipementFilters.filterEquipmentsAttributes.length > 0) {
        await createFilter(
            equipementFilters,
            filter[NAME],
            '',
            distDir.id?.toString() ?? ''
        );
    }
}
