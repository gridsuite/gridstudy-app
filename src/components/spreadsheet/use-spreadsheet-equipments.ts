/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { UUID } from 'crypto';
import { useGetStudyImpacts } from 'hooks/use-get-study-impacts';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    deleteEquipments,
    EquipmentToDelete,
    loadEquipments,
    removeNodeData,
    resetEquipments,
    resetEquipmentsByTypes,
    updateEquipments,
    reloadNodesAliases,
} from 'redux/actions';
import { AppState, initialReloadNodesAliases } from 'redux/reducer';
import type { SpreadsheetEquipmentType } from './config/spreadsheet.type';
import { fetchAllEquipments } from 'services/study/network-map';
import { getFetcher } from './config/common-config';
import { isNodeBuilt } from 'components/graph/util/model-functions';
import { isStatusBuilt } from '../graph/util/model-functions';
import { formatFetchedEquipments } from './utils/equipment-table-utils';
import { SpreadsheetEquipmentsByNodes } from './config/spreadsheet.type';
import { NodeAlias } from './custom-columns/node-alias.type';
import { NodeType } from '../graph/tree-node.type';

export const useSpreadsheetEquipments = (
    type: SpreadsheetEquipmentType,
    highlightUpdatedEquipment: () => void,
    nodeAliases: NodeAlias[] | undefined
) => {
    const dispatch = useDispatch();
    const allEquipments = useSelector((state: AppState) => state.spreadsheetNetwork);
    const equipments = useMemo(() => allEquipments[type], [allEquipments, type]);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const isNetworkModificationTreeModelUpToDate = useSelector(
        (state: AppState) => state.isNetworkModificationTreeModelUpToDate
    );
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const nodesAliasesToReload = useSelector((state: AppState) => state.reloadNodesAliases);
    const treeNodes = useSelector((state: AppState) => state.networkModificationTreeModel?.treeNodes);

    const [errorMessage, setErrorMessage] = useState<string | null>();
    const [isFetching, setIsFetching] = useState(false);

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

    const nodesIdToFetch = useMemo(() => {
        let nodesIdToFetch = new Set<string>();
        if (!equipments || !nodeAliases) {
            return nodesIdToFetch;
        }
        // We check if we have the data for the currentNode and if we don't we save the fact that we need to fetch it
        if (equipments.nodesId.find((nodeId) => nodeId === currentNode?.id) === undefined) {
            nodesIdToFetch.add(currentNode?.id as string);
        }
        //Then we do the same for the other nodes we need the data of (the ones defined in aliases)
        nodeAliases.forEach((nodeAlias) => {
            if (equipments.nodesId.find((nodeId) => nodeId === nodeAlias.id) === undefined) {
                nodesIdToFetch.add(nodeAlias.id);
            }
        });
        return nodesIdToFetch;
    }, [currentNode?.id, equipments, nodeAliases]);

    const shouldFetchEquipments = useMemo(() => nodesIdToFetch.size > 0, [nodesIdToFetch]);

    const {
        impactedSubstationsIds,
        deletedEquipments,
        impactedElementTypes,
        resetImpactedSubstationsIds,
        resetDeletedEquipments,
        resetImpactedElementTypes,
    } = useGetStudyImpacts();

    useEffect(() => {
        if (!nodeAliases) {
            return;
        }
        const currentNodeId = currentNode?.id as UUID;

        let unwantedFetchedNodes = new Set<string>();
        Object.values(allEquipments).forEach((value) => {
            unwantedFetchedNodes = new Set([...unwantedFetchedNodes, ...value.nodesId]);
        });
        const usedNodesId = new Set(nodeAliases.map((nodeAlias) => nodeAlias.id));
        usedNodesId.add(currentNodeId);
        usedNodesId.forEach((nodeId) => unwantedFetchedNodes.delete(nodeId));
        if (unwantedFetchedNodes.size !== 0) {
            dispatch(removeNodeData(Array.from(unwantedFetchedNodes)));
        }
    }, [dispatch, nodeAliases, currentNode, allEquipments]);

    useEffect(() => {
        if (!type) {
            return;
        }
        // updating data related to impacted elements
        const nodeId = currentNode?.id as UUID;

        // If we dont have any data in the spreadsheet, we don't need to update the equipments
        const hasSpreadsheetData = () => {
            return Object.values(allEquipments)
                .map((value) => value.equipmentsByNodeId[nodeId])
                .filter((value) => value !== undefined)
                .some((value) => value.length > 0);
        };
        if (!hasSpreadsheetData()) {
            resetImpactedSubstationsIds();
            resetDeletedEquipments();
            resetImpactedElementTypes();
            return;
        }
        // Handle updates and resets based on impacted element types
        if (impactedElementTypes.length > 0) {
            if (impactedElementTypes.includes(EQUIPMENT_TYPES.SUBSTATION)) {
                dispatch(resetEquipments());
                resetImpactedElementTypes();
                return;
            }
            const impactedSpreadsheetEquipmentsTypes = impactedElementTypes.filter((type) =>
                Object.keys(allEquipments).includes(type)
            );
            if (impactedSpreadsheetEquipmentsTypes.length > 0) {
                dispatch(resetEquipmentsByTypes(impactedSpreadsheetEquipmentsTypes as SpreadsheetEquipmentType[]));
            }
            resetImpactedElementTypes();
        }
        if (impactedSubstationsIds.length > 0 && studyUuid && currentRootNetworkUuid && currentNode?.id) {
            // The formatting of the fetched equipments is done in the reducer
            fetchAllEquipments(studyUuid, nodeId, currentRootNetworkUuid, impactedSubstationsIds).then((values) => {
                highlightUpdatedEquipment();
                dispatch(updateEquipments(values, nodeId));
            });
            resetImpactedSubstationsIds();
        }
        if (deletedEquipments.length > 0) {
            const equipmentsToDelete = deletedEquipments
                .filter(({ equipmentType, equipmentId }) => equipmentType && equipmentId)
                .map(({ equipmentType, equipmentId }) => {
                    console.info(
                        'removing equipment with id=',
                        equipmentId,
                        ' and type=',
                        equipmentType,
                        ' from the network'
                    );
                    return { equipmentType, equipmentId };
                });

            if (equipmentsToDelete.length > 0) {
                const equipmentsToDeleteArray: EquipmentToDelete[] = equipmentsToDelete.map((equipment) => ({
                    equipmentType: equipment.equipmentType as SpreadsheetEquipmentType,
                    equipmentId: equipment.equipmentId,
                    nodeId: nodeId,
                }));
                dispatch(deleteEquipments(equipmentsToDeleteArray, nodeId));
            }

            resetDeletedEquipments();
        }
    }, [
        impactedSubstationsIds,
        deletedEquipments,
        impactedElementTypes,
        studyUuid,
        currentRootNetworkUuid,
        currentNode?.id,
        dispatch,
        allEquipments,
        resetImpactedSubstationsIds,
        resetDeletedEquipments,
        resetImpactedElementTypes,
        type,
        highlightUpdatedEquipment,
    ]);

    const loadEquipmentData = useCallback(
        (nodeIds: Set<string>) => {
            if (studyUuid && currentRootNetworkUuid && currentNode?.id) {
                setErrorMessage(null);
                setIsFetching(true);
                let fetcherPromises: Promise<unknown>[] = [];
                let spreadsheetEquipmentsByNodes: SpreadsheetEquipmentsByNodes = {
                    nodesId: [],
                    equipmentsByNodeId: {},
                };

                nodeIds.forEach((nodeId) => {
                    if (currentNode?.id === nodeId || isBuilt(nodeId)) {
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
                        // mark unbuilt node as processed with empty entry/result
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
                        setErrorMessage(err.message);
                    })
                    .finally(() => {
                        setIsFetching(false);
                    });
            }
        },
        [currentNode?.id, currentRootNetworkUuid, dispatch, formatEquipments, isBuilt, studyUuid, type]
    );

    useEffect(() => {
        if (shouldFetchEquipments && isNetworkModificationTreeModelUpToDate && isNodeBuilt(currentNode)) {
            loadEquipmentData(nodesIdToFetch);
        }
    }, [shouldFetchEquipments, isNetworkModificationTreeModelUpToDate, nodesIdToFetch, loadEquipmentData, currentNode]);

    useEffect(() => {
        if (nodesAliasesToReload.sheetType === type && nodesAliasesToReload?.nodesId.length) {
            loadEquipmentData(new Set<string>(nodesAliasesToReload.nodesId));
            // reset reload action
            dispatch(reloadNodesAliases(initialReloadNodesAliases));
        }
    }, [dispatch, loadEquipmentData, nodesAliasesToReload, type]);

    return { equipments, errorMessage, isFetching };
};
