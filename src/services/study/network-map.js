/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrlWithNodeUuid } from './index';
import { backendFetchJson, getQueryParamsList } from '../utils';
import { NAME } from '../../components/utils/field-constants.js';
import {
    EQUIPMENT_INFOS_TYPES,
    EQUIPMENT_TYPES,
} from '../../components/utils/equipment-types';
import { createFilter, useSnackMessage } from '@gridsuite/commons-ui';
import { fetchNetworkElementsInfos } from './network';
import { createContingencyList } from 'services/explore';
import { createIdentifierContingencyList } from './contingency-list';
import { useIntl } from 'react-intl';

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
    studyUuid,
    currentNodeUuid,
    substationsIds,
    equipmentType,
    inUpstreamBuiltParentNode,
    nominalVoltages = undefined
) {
    const substationsCount = substationsIds ? substationsIds.length : 0;
    const nominalVoltagesStr = nominalVoltages ? `[${nominalVoltages}]` : '[]';

    console.info(
        `Fetching equipments ids '${equipmentType}' of study '${studyUuid}' and node '${currentNodeUuid}' for ${substationsCount} substations ids and ${nominalVoltagesStr} nominal voltages.`
    );
    let urlSearchParams = new URLSearchParams();

    const nominalVoltagesParams = getQueryParamsList(
        nominalVoltages,
        'nominalVoltages'
    );
    const nominalVoltagesParamsList =
        nominalVoltages && nominalVoltages.length > 0
            ? '&' + nominalVoltagesParams
            : '';

    let fetchEquipmentsUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/network-map/' +
        'equipments-ids' +
        '?' +
        'equipmentType=' +
        equipmentType +
        nominalVoltagesParamsList;
    if (inUpstreamBuiltParentNode !== undefined) {
        urlSearchParams.append(
            'inUpstreamBuiltParentNode',
            inUpstreamBuiltParentNode
        );
        fetchEquipmentsUrl =
            fetchEquipmentsUrl + '&' + urlSearchParams.toString();
    }
    console.debug(fetchEquipmentsUrl);
    return backendFetchJson(fetchEquipmentsUrl, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(substationsIds ?? null),
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
export const useCreateMapFilter = () => {
    const intl = useIntl();
    const { snackWarning } = useSnackMessage();

    const createMapFilter = async (
        filter,
        distDir,
        studyUuid,
        currentNodeUuid,
        selectedEquipmentsIds,
        nominalVoltages
    ) => {
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
                    snackWarning({
                        messageTxt: intl.formatMessage({
                            id: 'EmptySelection',
                        }),
                        headerId: 'FilterCreationIgnored',
                    });
                    return false;
                }

                const elementsIds = await fetchEquipmentsIds(
                    studyUuid,
                    currentNodeUuid,
                    selectedEquipmentsIds,
                    filter.equipmentType,
                    false,
                    nominalVoltages
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
            snackWarning({
                messageTxt: intl.formatMessage({
                    id: 'EmptySelection',
                }),
                headerId: 'FilterCreationIgnored',
            });
            return false;
        }

        await createFilter(
            equipmentFilters,
            filter[NAME],
            '',
            distDir.id?.toString() ?? ''
        );

        return true;
    };

    return createMapFilter;
};

export const useCreateMapContingencyList = () => {
    const intl = useIntl();
    const { snackWarning } = useSnackMessage();

    const createMapContingencyList = async (
        contingencyList,
        distDir,
        studyUuid,
        currentNodeUuid,
        selectedEquipments
    ) => {
        let equipmentContingencyList = [];
        switch (contingencyList.equipmentType) {
            case EQUIPMENT_TYPES.SUBSTATION:
            case EQUIPMENT_TYPES.LINE:
                equipmentContingencyList = createIdentifierContingencyList(
                    contingencyList.name,
                    selectedEquipments
                );
                break;

            default:
                if (selectedEquipments.length === 0) {
                    snackWarning({
                        messageTxt: intl.formatMessage({
                            id: 'EmptySelection',
                        }),
                        headerId: 'ContingencyListCreationIgnored',
                    });
                    return false;
                }

                const selectedEquipmentsIds = selectedEquipments.map(
                    (element) => element.id
                );
                const elementsIds = await fetchNetworkElementsInfos(
                    studyUuid,
                    currentNodeUuid,
                    selectedEquipmentsIds,
                    contingencyList.equipmentType,
                    EQUIPMENT_INFOS_TYPES.LIST.type,
                    false
                );

                if (elementsIds?.length === 0) {
                    snackWarning({
                        messageTxt: intl.formatMessage({
                            id: 'EmptySelection',
                        }),
                        headerId: 'ContingencyListCreationIgnored',
                    });
                    return false;
                }
                equipmentContingencyList = createIdentifierContingencyList(
                    contingencyList.name,
                    elementsIds
                );
                break;
        }
        if (
            equipmentContingencyList === undefined ||
            equipmentContingencyList?.length === 0
        ) {
            snackWarning({
                messageTxt: intl.formatMessage({
                    id: 'EmptySelection',
                }),
                headerId: 'ContingencyListCreationIgnored',
            });
            return false;
        }

        await createContingencyList(
            equipmentContingencyList,
            contingencyList[NAME],
            '',
            distDir.id?.toString() ?? ''
        );
        return true;
    };

    return createMapContingencyList;
};

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
