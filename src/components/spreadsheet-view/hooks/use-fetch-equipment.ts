/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useRef } from 'react';
import { type SpreadsheetEquipmentsByNodes, type SpreadsheetEquipmentType } from '../types/spreadsheet.type';
import type { UUID } from 'node:crypto';
import { useDispatch, useSelector } from 'react-redux';
import { type AppState } from '../../../redux/reducer.type';
import { loadEquipments, setSpreadsheetFetching } from '../../../redux/actions';
import { EquipmentType, snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
import { fetchNetworkElementsInfos } from '../../../services/study/network';
import { mapSpreadsheetEquipments } from '../../../utils/spreadsheet-equipments-mapper';
import { EQUIPMENT_INFOS_TYPES } from '../../utils/equipment-types';

export function useFetchEquipment() {
    const dispatch = useDispatch();
    const { snackError } = useSnackMessage();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);

    // Track the latest fetch version per equipment type to ignore stale responses
    const fetchVersionRef = useRef<Map<SpreadsheetEquipmentType, number>>(new Map());

    const fetchNodesEquipmentData = useCallback(
        (type: SpreadsheetEquipmentType, nodesIds: Set<UUID>) => {
            if (studyUuid && currentRootNetworkUuid) {
                // Increment version for this type — only the latest version will dispatch results
                const currentVersion = (fetchVersionRef.current.get(type) ?? 0) + 1;
                fetchVersionRef.current.set(type, currentVersion);

                dispatch(setSpreadsheetFetching(type, true));
                const fetcherPromises: ReturnType<typeof fetchNetworkElementsInfos>[] = [];
                const spreadsheetEquipmentsByNodes: SpreadsheetEquipmentsByNodes['equipmentsByNodeId'] = {};

                nodesIds.forEach((nodeId) => {
                    const promise = fetchNetworkElementsInfos(
                        studyUuid,
                        nodeId,
                        currentRootNetworkUuid,
                        [],
                        type as unknown as EquipmentType,
                        EQUIPMENT_INFOS_TYPES.TAB.type
                    );
                    fetcherPromises.push(promise);
                    promise
                        .then((results) => {
                            // Format the equipments data to set calculated fields so that the edition validation is consistent with the displayed data
                            spreadsheetEquipmentsByNodes[nodeId] = mapSpreadsheetEquipments(type, results);
                        })
                        .catch((err) => {
                            console.error(
                                `Fetching error for type ${type.toString()} on node ${nodeId} (${err.message})`
                            );
                        });
                });

                Promise.all(fetcherPromises)
                    .then(() => {
                        // Only dispatch if this is still the latest fetch for this type
                        if (fetchVersionRef.current.get(type) === currentVersion) {
                            dispatch(loadEquipments(type, spreadsheetEquipmentsByNodes));
                            console.debug(
                                `Equipment data fetching and dispatch done for ${fetcherPromises.length} built nodes among ${nodesIds.size}`
                            );
                        } else {
                            console.debug(
                                `Ignoring stale fetch response for equipment type ${type} (version ${currentVersion}, current ${fetchVersionRef.current.get(type)})`
                            );
                        }
                    })
                    .catch((error) => {
                        if (fetchVersionRef.current.get(type) === currentVersion) {
                            snackWithFallback(snackError, error, { headerId: 'SpreadsheetFetchError' });
                        }
                    })
                    .finally(() => {
                        if (fetchVersionRef.current.get(type) === currentVersion) {
                            dispatch(setSpreadsheetFetching(type, false));
                        }
                    });
            }
        },
        [currentRootNetworkUuid, dispatch, snackError, studyUuid]
    );

    return { fetchNodesEquipmentData };
}
