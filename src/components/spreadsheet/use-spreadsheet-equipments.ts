/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Identifiable } from '@gridsuite/commons-ui';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { UUID } from 'crypto';
import { useGetStudyImpacts } from 'hooks/use-get-study-impacts';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    deleteEquipments,
    EquipmentToDelete,
    loadEquipments,
    reloadNodesAliases,
    removeNodeData,
    resetEquipments,
    resetEquipmentsByTypes,
    updateEquipments,
} from 'redux/actions';
import { AppState, initialReloadNodesAliases } from 'redux/reducer';
import { SpreadsheetEquipmentType } from './config/spreadsheet.type';
import { fetchAllEquipments } from 'services/study/network-map';
import { getFetcher } from './config/equipment/common-config';
import { isNodeBuilt, isStatusBuilt } from 'components/graph/util/model-functions';
import { SpreadsheetEquipmentsByNodes } from './config/spreadsheet.type';

type FormatFetchedEquipments = (equipments: Identifiable[]) => Identifiable[];

export const useSpreadsheetEquipments = (
    type: SpreadsheetEquipmentType,
    formatFetchedEquipments: FormatFetchedEquipments
) => {
    const dispatch = useDispatch();
    const allEquipments = useSelector((state: AppState) => state.spreadsheetNetwork);
    const equipments = useMemo(() => allEquipments[type], [allEquipments, type]);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const isNetworkModificationTreeModelUpToDate = useSelector(
        (state: AppState) => state.isNetworkModificationTreeModelUpToDate
    );
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetwork);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const [errorMessage, setErrorMessage] = useState<string | null>();
    const [isFetching, setIsFetching] = useState(false);
    const nodesAliases = useSelector((state: AppState) => state.customColumnsNodesAliases);
    const nodesAliasesToReload = useSelector((state: AppState) => state.reloadNodesAliases);
    const treeModel = useSelector((state: AppState) => state.networkModificationTreeModel);

    const idsToBuildStatus = useMemo(() => {
        let map = new Map();
        treeModel?.treeNodes.forEach((treeNode) => {
            map.set(treeNode.id, treeNode.data.globalBuildStatus);
        });
        return map;
    }, [treeModel]);

    const nodesIdToFetch = useMemo(() => {
        let nodeIds = new Set<string>();
        // We check if we have the data for the currentNode and if we don't we save the fact that we need to fetch it
        const currentNodeId = currentNode?.id as string;
        if (
            currentNodeId &&
            isStatusBuilt(idsToBuildStatus.get(currentNodeId)) &&
            equipments.nodesId.find((nodeId) => nodeId === currentNode?.id) === undefined
        ) {
            nodeIds.add(currentNodeId);
        }
        //Then we do the same for the other nodes we need the data of (the ones defined in aliases)
        nodesAliases.forEach((nodeAlias) => {
            if (
                isStatusBuilt(idsToBuildStatus.get(nodeAlias.id)) &&
                equipments.nodesId.find((nodeId) => nodeId === nodeAlias.id) === undefined
            ) {
                nodeIds.add(nodeAlias.id);
            }
        });
        return nodeIds;
    }, [currentNode?.id, equipments.nodesId, idsToBuildStatus, nodesAliases]);

    const loadEquipmentData = useCallback(
        (nodeIds: Set<string>) => {
            if (studyUuid && currentRootNetworkUuid) {
                setErrorMessage(null);
                setIsFetching(true);
                let fetcherPromises: Promise<unknown>[] = [];
                let spreadsheetEquipmentsByNodes: SpreadsheetEquipmentsByNodes = {
                    nodesId: [],
                    equipmentsByNodeId: {},
                };
                nodeIds.forEach((nodeId) => {
                    const promise = getFetcher(type)(studyUuid, nodeId as UUID, currentRootNetworkUuid, []);
                    fetcherPromises.push(promise);
                    promise.then((results) => {
                        let fetchedEquipments = results.flat();
                        spreadsheetEquipmentsByNodes.nodesId.push(nodeId);
                        if (formatFetchedEquipments) {
                            fetchedEquipments = formatFetchedEquipments(fetchedEquipments);
                            spreadsheetEquipmentsByNodes.equipmentsByNodeId[nodeId] = fetchedEquipments;
                        }
                    });
                });

                Promise.all(fetcherPromises).then(() => {
                    dispatch(loadEquipments(type, spreadsheetEquipmentsByNodes));
                    setIsFetching(false);
                });
            }
        },
        [currentRootNetworkUuid, dispatch, formatFetchedEquipments, studyUuid, type]
    );

    const {
        impactedSubstationsIds,
        deletedEquipments,
        impactedElementTypes,
        resetImpactedSubstationsIds,
        resetDeletedEquipments,
        resetImpactedElementTypes,
    } = useGetStudyImpacts();

    useEffect(() => {
        const currentNodeId = currentNode?.id as UUID;

        let unwantedFetchedNodes = new Set<string>();
        Object.values(allEquipments).forEach((value) => {
            unwantedFetchedNodes = new Set([...unwantedFetchedNodes, ...value.nodesId]);
        });
        const usedNodesId = new Set(nodesAliases.map((nodeAlias) => nodeAlias.id));
        usedNodesId.add(currentNodeId);
        usedNodesId.forEach((nodeId) => unwantedFetchedNodes.delete(nodeId));
        if (unwantedFetchedNodes.size !== 0) {
            dispatch(removeNodeData(Array.from(unwantedFetchedNodes)));
        }
    }, [dispatch, nodesAliases, currentNode, allEquipments]);

    useEffect(() => {
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
    ]);

    useEffect(() => {
        if (
            nodesIdToFetch.size > 0 &&
            currentNode?.id &&
            isNetworkModificationTreeModelUpToDate &&
            isNodeBuilt(currentNode)
        ) {
            loadEquipmentData(nodesIdToFetch);
        }
    }, [currentNode, isNetworkModificationTreeModelUpToDate, loadEquipmentData, nodesIdToFetch]);

    useEffect(() => {
        if (nodesAliasesToReload.sheetType === type && nodesAliasesToReload.nodesId.length) {
            let idsToRelaod = new Set<string>();
            nodesAliasesToReload.nodesId.forEach((nodeId) => {
                if (isStatusBuilt(idsToBuildStatus.get(nodeId))) {
                    idsToRelaod.add(nodeId);
                }
            });
            loadEquipmentData(idsToRelaod);
            // reset reload action
            dispatch(reloadNodesAliases(initialReloadNodesAliases));
        }
    }, [dispatch, idsToBuildStatus, loadEquipmentData, nodesAliasesToReload, type]);

    return { equipments, errorMessage, isFetching };
};
