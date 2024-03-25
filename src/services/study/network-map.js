/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrlWithNodeUuid } from './index';
import { backendFetchJson, getQueryParamsList } from '../utils';
import {
    EQUIPMENT_INFOS_TYPES,
    EQUIPMENT_TYPES,
} from '../../components/utils/equipment-types.js';
import { fetchNetworkElementsInfos } from './network.js';
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
        equipmentType +
        getQueryParamsList(substationsIds, 'substationId');

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

function createEquipmentIdentifierList(equipmentType, equipmentList) {
    if (equipmentType === EQUIPMENT_TYPES.SUBSTATION) {
        // TODO (jamal) refactor this to not have to create a special case for substations
        return {
            type: 'IDENTIFIER_LIST',
            equipmentType: equipmentType,
            filterEquipmentsAttributes: equipmentList.map((eq) => {
                return { equipmentID: eq.substation.id };
            }),
        };
    }
    return {
        type: 'IDENTIFIER_LIST',
        equipmentType: equipmentType,
        filterEquipmentsAttributes: equipmentList.map((eq) => {
            return { equipmentID: eq.id };
        }),
    };
}
export async function createMapFilter(
    filter,
    distDir,
    studyUuid,
    currentNodeUuid,
    networkMapref,
    filtredNominalVoltage
) {
    let equipementList = [];
    switch (filter.equipmentType) {
        case EQUIPMENT_TYPES.SUBSTATION:
            equipementList = createEquipmentIdentifierList(
                filter.equipmentType,
                networkMapref.current.getSelectedSubstation(
                    filtredNominalVoltage
                )
            );
            break;
        case EQUIPMENT_TYPES.VOLTAGE_LEVEL:
            equipementList = createEquipmentIdentifierList(
                filter.equipmentType,
                networkMapref.current.getSelectedVoltageLevel(
                    filtredNominalVoltage
                )
            );
            break;
        case EQUIPMENT_TYPES.LINE:
            equipementList = createEquipmentIdentifierList(
                filter.equipmentType,
                networkMapref.current.getSelectedLines(filtredNominalVoltage)
            );
            break;
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
            const substationsIds = networkMapref.current
                .getSelectedSubstation(filtredNominalVoltage)
                .map((substation) => substation.id);
            try {
                const elements = await fetchNetworkElementsInfos(
                    studyUuid,
                    currentNodeUuid,
                    substationsIds,
                    filter.equipmentType,
                    EQUIPMENT_INFOS_TYPES.TAB.type,
                    false
                );
                equipementList = createEquipmentIdentifierList(
                    filter.equipmentType,
                    elements
                );
            } catch (error) {
                throw error;
            }

            break;

        default:
            break;
    }

    if (equipementList.filterEquipmentsAttributes.length > 0) {
        createFilter(
            equipementList,
            filter[NAME],
            'description',
            distDir.id?.toString() ?? ''
        )
            .then((res) => {
                console.log('debug', 'createFilter', res);
            })
            .catch((err) => {
                console.error('debug', 'createFilter', err);
            });
    }
}
