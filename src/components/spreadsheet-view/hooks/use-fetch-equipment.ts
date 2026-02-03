/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { type SpreadsheetEquipmentsByNodes, type SpreadsheetEquipmentType } from '../types/spreadsheet.type';
import type { UUID } from 'node:crypto';
import { useDispatch, useSelector } from 'react-redux';
import { type AppState } from '../../../redux/reducer';
import { loadEquipments, setSpreadsheetFetching } from '../../../redux/actions';
import { EquipmentInfosTypes, snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
import { fetchNetworkElementsInfos } from '../../../services/study/network';
import { mapSpreadsheetEquipments } from '../../../utils/spreadsheet-equipments-mapper';

export function useFetchEquipment() {
    const dispatch = useDispatch();
    const { snackError } = useSnackMessage();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);

    const fetchNodesEquipmentData = useCallback(
        (type: SpreadsheetEquipmentType, nodesIds: Set<UUID>) => {
            if (studyUuid && currentRootNetworkUuid) {
                dispatch(setSpreadsheetFetching(type, true));
                const fetcherPromises: ReturnType<typeof fetchNetworkElementsInfos>[] = [];
                const spreadsheetEquipmentsByNodes: SpreadsheetEquipmentsByNodes['equipmentsByNodeId'] = {};

                nodesIds.forEach((nodeId) => {
                    const promise = fetchNetworkElementsInfos(
                        studyUuid,
                        nodeId,
                        currentRootNetworkUuid,
                        [],
                        type,
                        EquipmentInfosTypes.TAB
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
                        dispatch(loadEquipments(type, spreadsheetEquipmentsByNodes));
                        console.debug(
                            `Equipment data fetching and dispatch done for ${fetcherPromises.length} built nodes among ${nodesIds.size}`
                        );
                    })
                    .catch((error) => {
                        snackWithFallback(snackError, error, { headerId: 'SpreadsheetFetchError' });
                    })
                    .finally(() => {
                        dispatch(setSpreadsheetFetching(type, false));
                    });
            }
        },
        [currentRootNetworkUuid, dispatch, snackError, studyUuid]
    );

    return { fetchNodesEquipmentData };
}
