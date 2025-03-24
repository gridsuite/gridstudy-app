/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { SpreadsheetEquipmentsByNodes, SpreadsheetEquipmentType } from '../config/spreadsheet.type';
import { UUID } from 'crypto';
import { formatFetchedEquipments } from '../utils/equipment-table-utils';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer';
import { getFetcher } from './fetchers';
import { useSnackMessage } from '@gridsuite/commons-ui';

export const useFetchEquipment = (type: SpreadsheetEquipmentType | undefined) => {
    const { snackError } = useSnackMessage();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNodeUuid = useSelector((state: AppState) => state.currentTreeNode?.id);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);

    console.log(`study uuid ${studyUuid} ${currentNodeUuid} ${currentRootNetworkUuid}`);

    const fetchNodesEquipmentData = useCallback(
        (nodeIds: Set<string>, onFetchingDone?: () => void) => {
            if (studyUuid && currentRootNetworkUuid && currentNodeUuid && type) {
                let fetcherPromises: Promise<unknown>[] = [];
                let spreadsheetEquipmentsByNodes: SpreadsheetEquipmentsByNodes = {
                    nodesId: [],
                    equipmentsByNodeId: {},
                };

                nodeIds.forEach((nodeId) => {
                    if (currentNodeUuid === nodeId) {
                        const promise = getFetcher(type)(studyUuid, nodeId as UUID, currentRootNetworkUuid, []);
                        fetcherPromises.push(promise);
                        promise
                            .then((results) => {
                                let fetchedEquipments = results.flat();
                                spreadsheetEquipmentsByNodes.nodesId.push(nodeId);
                                fetchedEquipments = formatFetchedEquipments(type, fetchedEquipments);
                                spreadsheetEquipmentsByNodes.equipmentsByNodeId[nodeId] = fetchedEquipments;
                            })
                            .catch((err) => {
                                console.error(
                                    `Fetching error for type ${type.toString()} on node ${nodeId} (${err.message})`
                                );
                            });
                    } else {
                        // mark un-built node as processed with empty entry/result
                        spreadsheetEquipmentsByNodes.nodesId.push(nodeId);
                        spreadsheetEquipmentsByNodes.equipmentsByNodeId[nodeId] = [];
                    }
                });

                return Promise.all(fetcherPromises)
                    .then(() => {
                        console.debug(
                            `Equipment data fetching and dispatch done for ${fetcherPromises.length} built nodes among ${nodeIds.size}`
                        );
                        return spreadsheetEquipmentsByNodes;
                    })
                    .catch((err) => {
                        console.debug('Equipment data fetching and dispatch NOT done');
                        snackError({
                            messageTxt: err.message,
                            headerId: 'SpreadsheetFetchError',
                        });
                    })
                    .finally(() => {
                        onFetchingDone && onFetchingDone();
                    });
            }
        },
        [currentNodeUuid, currentRootNetworkUuid, snackError, studyUuid, type]
    );

    return { fetchNodesEquipmentData };
};
