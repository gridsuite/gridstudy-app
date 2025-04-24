/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { EquipmentFetcher, SpreadsheetEquipmentsByNodes, SpreadsheetEquipmentType } from '../types/spreadsheet.type';
import { UUID } from 'crypto';
import { formatFetchedEquipments } from '../utils/equipment-table-utils';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer';
import { loadEquipments } from '../../../redux/actions';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { EQUIPMENT_TYPES } from '../../utils/equipment-types';
import {
    fetchBatteries,
    fetchBusbarSections,
    fetchBuses,
    fetchDanglingLines,
    fetchGenerators,
    fetchHvdcLines,
    fetchLccConverterStations,
    fetchLines,
    fetchLoads,
    fetchShuntCompensators,
    fetchStaticVarCompensators,
    fetchSubstations,
    fetchThreeWindingsTransformers,
    fetchTieLines,
    fetchTwoWindingsTransformers,
    fetchVoltageLevels,
    fetchVscConverterStations,
} from '../../../services/study/network';

const getFetcher = (equipmentType: SpreadsheetEquipmentType): EquipmentFetcher => {
    switch (equipmentType) {
        case EQUIPMENT_TYPES.SUBSTATION:
            return fetchSubstations;
        case EQUIPMENT_TYPES.VOLTAGE_LEVEL:
            return fetchVoltageLevels;
        case EQUIPMENT_TYPES.LINE:
            return fetchLines;
        case EQUIPMENT_TYPES.TIE_LINE:
            return fetchTieLines;
        case EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER:
            return fetchTwoWindingsTransformers;
        case EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER:
            return fetchThreeWindingsTransformers;
        case EQUIPMENT_TYPES.HVDC_LINE:
            return fetchHvdcLines;
        case EQUIPMENT_TYPES.GENERATOR:
            return fetchGenerators;
        case EQUIPMENT_TYPES.BATTERY:
            return fetchBatteries;
        case EQUIPMENT_TYPES.LOAD:
            return fetchLoads;
        case EQUIPMENT_TYPES.SHUNT_COMPENSATOR:
            return fetchShuntCompensators;
        case EQUIPMENT_TYPES.DANGLING_LINE:
            return fetchDanglingLines;
        case EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR:
            return fetchStaticVarCompensators;
        case EQUIPMENT_TYPES.VSC_CONVERTER_STATION:
            return fetchVscConverterStations;
        case EQUIPMENT_TYPES.LCC_CONVERTER_STATION:
            return fetchLccConverterStations;
        case EQUIPMENT_TYPES.BUS:
            return fetchBuses;
        case EQUIPMENT_TYPES.BUSBAR_SECTION:
            return fetchBusbarSections;
    }
};

export const useFetchEquipment = (type: SpreadsheetEquipmentType) => {
    const dispatch = useDispatch();
    const { snackError } = useSnackMessage();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    const formatEquipments = useCallback(
        (fetchedEquipments: any) => {
            //Format the equipments data to set calculated fields, so that the edition validation is consistent with the displayed data
            return formatFetchedEquipments(type, fetchedEquipments);
        },
        [type]
    );

    const fetchNodesEquipmentData = useCallback(
        (nodeIds: Set<string>, currentNodeUuid: UUID, currentRootNetworkUuid: UUID, onFetchingDone?: () => void) => {
            if (studyUuid && currentNodeUuid && currentRootNetworkUuid) {
                let fetcherPromises: Promise<unknown>[] = [];
                let spreadsheetEquipmentsByNodes: SpreadsheetEquipmentsByNodes = {
                    nodesId: [],
                    equipmentsByNodeId: {},
                };

                nodeIds.forEach((nodeId) => {
                    const promise = getFetcher(type)(studyUuid, nodeId as UUID, currentRootNetworkUuid, []);
                    fetcherPromises.push(promise);
                    promise
                        .then((results) => {
                            let fetchedEquipments = results.flat();
                            spreadsheetEquipmentsByNodes.nodesId.push(nodeId);
                            fetchedEquipments = formatEquipments(fetchedEquipments);
                            spreadsheetEquipmentsByNodes.equipmentsByNodeId[nodeId] = fetchedEquipments;
                        })
                        .catch((err) => {
                            console.error(
                                `Fetching error for type ${type.toString()} on node ${nodeId} (${err.message})`
                            );
                        });
                });

                Promise.all(fetcherPromises)
                    .then(() => {
                        dispatch(loadEquipments(type, spreadsheetEquipmentsByNodes));
                        console.debug(
                            `Equipment data fetching and dispatch done for ${fetcherPromises.length} built nodes among ${nodeIds.size}`
                        );
                    })
                    .catch((err) => {
                        console.debug('Equipment data fetching and dispatch NOT done');
                        snackError({
                            messageTxt: err.message,
                            headerId: 'SpreadsheetFetchError',
                        });
                    })
                    .finally(() => {
                        onFetchingDone?.();
                    });
            }
        },
        [dispatch, formatEquipments, snackError, studyUuid, type]
    );

    return { fetchNodesEquipmentData };
};
