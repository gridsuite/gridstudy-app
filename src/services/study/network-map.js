/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrlWithNodeUuid } from './index';
import {
    backendFetchJson,
    getQueryParamsList,
    getRequestParamFromList,
} from '../utils';
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
    const substationsIdsParams = getRequestParamFromList(
        substationsIds,
        'substationsIds'
    );

    const urlSearchParams = new URLSearchParams(substationsIdsParams);
    if (inUpstreamBuiltParentNode !== undefined) {
        urlSearchParams.append(
            'inUpstreamBuiltParentNode',
            inUpstreamBuiltParentNode
        );
    }

    urlSearchParams.append('equipmentType', equipmentType);

    const fetchElementsUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-map/equipments-ids' +
        '?' +
        urlSearchParams;

    console.debug(fetchElementsUrl);
    return backendFetchJson(fetchElementsUrl);
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
    selectedEquipements
) {
    let equipementList = [];
    switch (filter.equipmentType) {
        case EQUIPMENT_TYPES.SUBSTATION:
        case EQUIPMENT_TYPES.LINE:
            equipementList = createEquipmentIdentifierList(
                filter.equipmentType,
                selectedEquipements
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
            const substationsIds = selectedEquipements.map(
                (substation) => substation.id
            );
            if (substationsIds.length === 0) {
                throw new Error('No substations selected');
            }
            try {
                const elements = await fetchEquipmentsIds(
                    studyUuid,
                    currentNodeUuid,
                    substationsIds,
                    filter.equipmentType,
                    false
                );

                if (elements.length > 0) {
                    equipementList = createEquipmentIdentifierList(
                        filter.equipmentType,
                        elements
                    );
                }
            } catch (error) {
                throw error;
            }

            break;

        default:
            break;
    }

    if (equipementList.filterEquipmentsAttributes?.length === 0) {
        throw new Error('No equipment selected');
    }

    if (equipementList.filterEquipmentsAttributes.length > 0) {
        await createFilter(
            equipementList,
            filter[NAME],
            '',
            distDir.id?.toString() ?? ''
        );
    }
}
