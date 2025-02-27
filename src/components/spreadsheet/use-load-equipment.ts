/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo } from 'react';
import { SpreadsheetEquipmentsByNodes, SpreadsheetEquipmentType } from './config/spreadsheet.type';
import { UUID } from 'crypto';
import { formatFetchedEquipments } from './utils/equipment-table-utils';
import { useDispatch, useSelector } from 'react-redux';
import { NodeType } from '../graph/tree-node.type';
import { isStatusBuilt } from '../graph/util/model-functions';
import { AppState } from '../../redux/reducer';
import { loadEquipments } from '../../redux/actions';
import { getFetcher } from './config/common-config';

export const useLoadEquipment = (
    type: SpreadsheetEquipmentType,
    studyUuid: UUID | null,
    currentRootNetworkUuid: UUID | null,
    currentNodeUuid: UUID | undefined,
    equipments: SpreadsheetEquipmentsByNodes | undefined
) => {
    const dispatch = useDispatch();
    const nodesAliases = useSelector((state: AppState) => state.customColumnsNodesAliases);
    const treeModel = useSelector((state: AppState) => state.networkModificationTreeModel);

    const formatEquipments = useCallback(
        (fetchedEquipments: any) => {
            //Format the equipments data to set calculated fields, so that the edition validation is consistent with the displayed data
            return formatFetchedEquipments(type, fetchedEquipments);
        },
        [type]
    );

    const aliasedNodesIds = useMemo(() => {
        return nodesAliases.map((alias) => {
            return alias.id;
        });
    }, [nodesAliases]);

    const builtAliasedNodesIds = useMemo(() => {
        let set = new Set<string>();
        if (aliasedNodesIds.length > 0) {
            treeModel?.treeNodes.forEach((treeNode) => {
                if (
                    aliasedNodesIds.includes(treeNode.id) &&
                    (treeNode.type === NodeType.ROOT || isStatusBuilt(treeNode.data.globalBuildStatus))
                ) {
                    set.add(treeNode.id);
                }
            });
        }
        return set;
    }, [aliasedNodesIds, treeModel?.treeNodes]);

    const nodesIdToFetch = useMemo(() => {
        let nodeIds = new Set<string>();
        if (!equipments) {
            return nodeIds;
        }
        // We check if we have the data for the currentNode and if we don't we save the fact that we need to fetch it
        const currentNodeId = currentNodeUuid as string;
        if (currentNodeId && equipments.nodesId.find((nodeId) => nodeId === currentNodeId) === undefined) {
            nodeIds.add(currentNodeId);
        }
        // Then we do the same for the other built nodes we need the data of (the ones defined in aliases)
        builtAliasedNodesIds.forEach((nodeAliasId) => {
            if (equipments.nodesId.find((nodeId) => nodeId === nodeAliasId) === undefined) {
                nodeIds.add(nodeAliasId);
            }
        });
        return nodeIds;
    }, [equipments, currentNodeUuid, builtAliasedNodesIds]);

    const loadEquipmentData = useCallback(
        (nodeIds: Set<string>) => {
            let fetcherPromises: Promise<unknown>[] = [];
            if (studyUuid && currentRootNetworkUuid) {
                let spreadsheetEquipmentsByNodes: SpreadsheetEquipmentsByNodes = {
                    nodesId: [],
                    equipmentsByNodeId: {},
                };
                console.log('DBG DBR LOAD');
                nodeIds.forEach((nodeId) => {
                    if (currentNodeUuid === nodeId || builtAliasedNodesIds.has(nodeId)) {
                        const promise = getFetcher(type)(studyUuid, nodeId as UUID, currentRootNetworkUuid, []);
                        fetcherPromises.push(promise);
                        promise.then((results) => {
                            console.log('DBG DBR Load done', nodeId);
                            let fetchedEquipments = results.flat();
                            spreadsheetEquipmentsByNodes.nodesId.push(nodeId);
                            fetchedEquipments = formatEquipments(fetchedEquipments);
                            spreadsheetEquipmentsByNodes.equipmentsByNodeId[nodeId] = fetchedEquipments;
                        });
                    }
                });

                console.log('DBG DBR before all');
                Promise.all(fetcherPromises).then(() => {
                    console.log('DBG DBR all DONE');
                    dispatch(loadEquipments(type, spreadsheetEquipmentsByNodes));
                });
            }

            return fetcherPromises;
        },
        [builtAliasedNodesIds, currentNodeUuid, currentRootNetworkUuid, dispatch, formatEquipments, studyUuid, type]
    );

    return { loadEquipmentData, nodesIdToFetch };
};
