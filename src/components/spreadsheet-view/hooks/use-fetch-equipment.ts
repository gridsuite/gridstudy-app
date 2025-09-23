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
import { loadEquipments } from '../../../redux/actions';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { fetchNetworkElementsInfos } from '../../../services/study/network';
import { mapSpreadsheetEquipments } from '../../../utils/spreadsheet-equipments-mapper';
import { EQUIPMENT_INFOS_TYPES } from '../../utils/equipment-types';

export function useFetchEquipment(type: SpreadsheetEquipmentType) {
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
                    const promise = fetchNetworkElementsInfos(
                        studyUuid,
                        nodeId,
                        currentRootNetworkUuid,
                        [],
                        type,
                        EQUIPMENT_INFOS_TYPES.TAB.type
                    );
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
        [dispatch, snackError, studyUuid, type]
    );

    return { fetchNodesEquipmentData };
}
