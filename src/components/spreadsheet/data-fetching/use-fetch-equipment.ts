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
import { useDispatch, useSelector } from 'react-redux';
import { NodeType } from '../../graph/tree-node.type';
import { isStatusBuilt } from '../../graph/util/model-functions';
import { AppState } from '../../../redux/reducer';
import { loadEquipments } from '../../../redux/actions';
import { getFetcher } from './fetchers';
import { useSnackMessage } from '@gridsuite/commons-ui';

export const useFetchEquipment = (type: SpreadsheetEquipmentType) => {
    const dispatch = useDispatch();
    const { snackError } = useSnackMessage();
    const treeNodes = useSelector((state: AppState) => state.networkModificationTreeModel?.treeNodes);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNodeUuid = useSelector((state: AppState) => state.currentTreeNode?.id);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);

    const formatEquipments = useCallback(
        (fetchedEquipments: any) => {
            //Format the equipments data to set calculated fields, so that the edition validation is consistent with the displayed data
            return formatFetchedEquipments(type, fetchedEquipments);
        },
        [type]
    );

    const isBuilt = useCallback(
        (nodeId: string) =>
            treeNodes?.find(
                (node) =>
                    node.id === nodeId && (node.type === NodeType.ROOT || isStatusBuilt(node.data?.globalBuildStatus))
            ) !== undefined,
        [treeNodes]
    );

    const fetchNodesEquipmentData = useCallback(
        (nodeIds: Set<string>, onFetchingDone?: () => void) => {
            if (studyUuid && currentRootNetworkUuid && currentNodeUuid) {
                let fetcherPromises: Promise<unknown>[] = [];
                let spreadsheetEquipmentsByNodes: SpreadsheetEquipmentsByNodes = {
                    nodesId: [],
                    equipmentsByNodeId: {},
                };

                nodeIds.forEach((nodeId) => {
                    if (currentNodeUuid === nodeId || isBuilt(nodeId)) {
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
                    } else {
                        // mark un-built node as processed with empty entry/result
                        spreadsheetEquipmentsByNodes.nodesId.push(nodeId);
                        spreadsheetEquipmentsByNodes.equipmentsByNodeId[nodeId] = [];
                    }
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
                        onFetchingDone && onFetchingDone();
                    });
            }
        },
        [currentNodeUuid, currentRootNetworkUuid, dispatch, formatEquipments, isBuilt, snackError, studyUuid, type]
    );

    return { fetchNodesEquipmentData };
};
