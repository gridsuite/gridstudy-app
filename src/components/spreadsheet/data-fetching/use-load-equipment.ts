/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { SpreadsheetEquipmentsByNodes, SpreadsheetEquipmentType } from '../config/spreadsheet.type';
import { UUID } from 'crypto';
import { formatFetchedEquipments } from '../utils/equipment-table-utils';
import { useDispatch, useSelector } from 'react-redux';
import { NodeType } from '../../graph/tree-node.type';
import { isStatusBuilt } from '../../graph/util/model-functions';
import { AppState } from '../../../redux/reducer';
import { loadEquipments } from '../../../redux/actions';
import { getFetcher } from './fetchers';

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

    const [nodeIdsToFetch, setNodeIdsToFetch] = useState<string[]>([]);

    const formatEquipments = useCallback(
        (fetchedEquipments: any) => {
            //Format the equipments data to set calculated fields, so that the edition validation is consistent with the displayed data
            return formatFetchedEquipments(type, fetchedEquipments);
        },
        [type]
    );

    const builtAliasedNodesIds = useMemo(() => {
        let set = new Set<string>();
        const aliasedNodesIds = nodesAliases.map((alias) => alias.id);
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
    }, [nodesAliases, treeModel?.treeNodes]);

    useEffect(() => {
        if (!equipments) {
            return;
        }
        // We want to build a set with unique node uuids to be loaded
        let nodeIds = new Set<string>();

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
        // Update the state only on values changes (to avoid multiple effects for the users of this hook)
        setNodeIdsToFetch((prevState) => {
            const currentNodeIds = prevState;
            currentNodeIds.sort((a, b) => a.localeCompare(b));
            const computedNodeIds = Array.from(nodeIds);
            computedNodeIds.sort((a, b) => a.localeCompare(b));
            if (JSON.stringify(currentNodeIds) !== JSON.stringify(computedNodeIds)) {
                return computedNodeIds;
            }
            return prevState;
        });
    }, [builtAliasedNodesIds, currentNodeUuid, equipments]);

    const loadEquipmentData = useCallback(
        (nodeIds: string[]) => {
            let fetcherPromises: Promise<unknown>[] = [];
            if (studyUuid && currentRootNetworkUuid) {
                let spreadsheetEquipmentsByNodes: SpreadsheetEquipmentsByNodes = {
                    nodesId: [],
                    equipmentsByNodeId: {},
                };
                nodeIds.forEach((nodeId) => {
                    if (currentNodeUuid === nodeId || builtAliasedNodesIds.has(nodeId)) {
                        const promise = getFetcher(type)(studyUuid, nodeId as UUID, currentRootNetworkUuid, []);
                        fetcherPromises.push(promise);
                        promise.then((results) => {
                            let fetchedEquipments = results.flat();
                            spreadsheetEquipmentsByNodes.nodesId.push(nodeId);
                            fetchedEquipments = formatEquipments(fetchedEquipments);
                            spreadsheetEquipmentsByNodes.equipmentsByNodeId[nodeId] = fetchedEquipments;
                        });
                    }
                });
                Promise.all(fetcherPromises).then(() => {
                    dispatch(loadEquipments(type, spreadsheetEquipmentsByNodes));
                });
            }

            return fetcherPromises;
        },
        [builtAliasedNodesIds, currentNodeUuid, currentRootNetworkUuid, dispatch, formatEquipments, studyUuid, type]
    );

    return { loadEquipmentData, nodeIdsToFetch };
};
