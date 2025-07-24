/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import {
    type EquipmentFetcher,
    type SpreadsheetEquipmentsByNodes,
    SpreadsheetEquipmentType,
} from '../types/spreadsheet.type';
import type { UUID } from 'crypto';
import { useDispatch, useSelector } from 'react-redux';
import { type AppState } from '../../../redux/reducer';
import { loadEquipments } from '../../../redux/actions';
import { useSnackMessage } from '@gridsuite/commons-ui';
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
import { mapSpreadsheetEquipments } from '../../../utils/spreadsheet-equipments-mapper';

const getFetcher = (equipmentType: SpreadsheetEquipmentType): EquipmentFetcher => {
    switch (equipmentType) {
        case SpreadsheetEquipmentType.SUBSTATION:
            return fetchSubstations;
        case SpreadsheetEquipmentType.VOLTAGE_LEVEL:
            return fetchVoltageLevels;
        case SpreadsheetEquipmentType.LINE:
            return fetchLines;
        case SpreadsheetEquipmentType.TIE_LINE:
            return fetchTieLines;
        case SpreadsheetEquipmentType.TWO_WINDINGS_TRANSFORMER:
            return fetchTwoWindingsTransformers;
        case SpreadsheetEquipmentType.THREE_WINDINGS_TRANSFORMER:
            return fetchThreeWindingsTransformers;
        case SpreadsheetEquipmentType.HVDC_LINE:
            return fetchHvdcLines;
        case SpreadsheetEquipmentType.GENERATOR:
            return fetchGenerators;
        case SpreadsheetEquipmentType.BATTERY:
            return fetchBatteries;
        case SpreadsheetEquipmentType.LOAD:
            return fetchLoads;
        case SpreadsheetEquipmentType.SHUNT_COMPENSATOR:
            return fetchShuntCompensators;
        case SpreadsheetEquipmentType.DANGLING_LINE:
            return fetchDanglingLines;
        case SpreadsheetEquipmentType.STATIC_VAR_COMPENSATOR:
            return fetchStaticVarCompensators;
        case SpreadsheetEquipmentType.VSC_CONVERTER_STATION:
            return fetchVscConverterStations;
        case SpreadsheetEquipmentType.LCC_CONVERTER_STATION:
            return fetchLccConverterStations;
        case SpreadsheetEquipmentType.BUS:
            return fetchBuses;
        case SpreadsheetEquipmentType.BUSBAR_SECTION:
            return fetchBusbarSections;
    }
};

export const useFetchEquipment = (type: SpreadsheetEquipmentType) => {
    const dispatch = useDispatch();
    const { snackError } = useSnackMessage();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    const fetchNodesEquipmentData = useCallback(
        (nodeIds: Set<UUID>, currentNodeUuid: UUID, currentRootNetworkUuid: UUID, onFetchingDone?: () => void) => {
            if (studyUuid && currentNodeUuid && currentRootNetworkUuid) {
                const fetcherPromises: ReturnType<typeof fetchNetworkElementsInfos>[] = [];
                const spreadsheetEquipmentsByNodes: SpreadsheetEquipmentsByNodes = {
                    nodesId: [],
                    equipmentsByNodeId: {},
                };

                nodeIds.forEach((nodeId) => {
                    const promise = getFetcher(type)(studyUuid, nodeId as UUID, currentRootNetworkUuid, []);
                    fetcherPromises.push(promise);
                    promise
                        .then((results) => {
                            spreadsheetEquipmentsByNodes.nodesId.push(nodeId);
                            // Format the equipments data to set calculated fields so that the edition validation is consistent with the displayed data
                            spreadsheetEquipmentsByNodes.equipmentsByNodeId[nodeId] = mapSpreadsheetEquipments(
                                type,
                                results
                            );
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
        [dispatch, mapEquipments, snackError, studyUuid, type]
    );

    return { fetchNodesEquipmentData };
};
