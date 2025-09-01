/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { NotificationsUrlKeys, useNotificationsListener } from '@gridsuite/commons-ui';
import type { UUID } from 'crypto';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    deleteEquipments,
    type EquipmentToDelete,
    removeNodeData,
    resetEquipments,
    resetEquipmentsByTypes,
    updateEquipments,
    type UpdateEquipmentsAction,
} from 'redux/actions';
import { type AppState } from 'redux/reducer';
import { isSpreadsheetEquipmentType, SpreadsheetEquipmentType } from '../../../types/spreadsheet.type';
import { fetchAllEquipments } from 'services/study/network-map';
import type { NodeAlias } from '../../../types/node-alias.type';
import { isStatusBuilt } from '../../../../graph/util/model-functions';
import { useFetchEquipment } from '../../../hooks/use-fetch-equipment';
import { type DeletedEquipment, isStudyNotification, type NetworkImpactsInfos } from 'types/notification-types';
import { NodeType } from '../../../../graph/tree-node.type';
import { validAlias } from '../../../hooks/use-node-aliases';
import { fetchNetworkElementInfos } from 'services/study/network';
import { EQUIPMENT_INFOS_TYPES } from '../../../../utils/equipment-types';

export const useSpreadsheetEquipments = (
    type: SpreadsheetEquipmentType,
    equipmentToUpdateId: string | null,
    highlightUpdatedEquipment: () => void,
    nodeAliases: NodeAlias[] | undefined,
    active: boolean = false
) => {
    const dispatch = useDispatch();
    const allEquipments = useSelector((state: AppState) => state.spreadsheetNetwork);
    const equipments = useSelector((state: AppState) => state.spreadsheetNetwork[type]);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const isNetworkModificationTreeModelUpToDate = useSelector(
        (state: AppState) => state.isNetworkModificationTreeModelUpToDate
    );
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const treeNodes = useSelector((state: AppState) => state.networkModificationTreeModel?.treeNodes);
    const [builtAliasedNodesIds, setBuiltAliasedNodesIds] = useState<UUID[]>([]);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const { fetchNodesEquipmentData } = useFetchEquipment(type);

    // effect to keep builtAliasedNodesIds up-to-date (when we add/remove an alias or build/unbuild an aliased node)
    useEffect(() => {
        if (!nodeAliases) {
            return;
        }
        let computedIds: UUID[] = [];
        const aliasedNodesIds = nodeAliases
            .filter((nodeAlias) => validAlias(nodeAlias))
            .map((nodeAlias) => nodeAlias.id);
        if (aliasedNodesIds.length > 0) {
            computedIds =
                treeNodes
                    ?.filter(
                        (treeNode) =>
                            aliasedNodesIds.includes(treeNode.id) &&
                            (treeNode.type === NodeType.ROOT || isStatusBuilt(treeNode.data.globalBuildStatus))
                    )
                    .map((treeNode) => treeNode.id) ?? [];
        }
        computedIds.sort((a, b) => a.localeCompare(b));
        // Because of treeNodes: update the state only on real values changes (to avoid multiple effects for the watchers)
        setBuiltAliasedNodesIds((prevState) =>
            JSON.stringify(prevState) !== JSON.stringify(computedIds) ? computedIds : prevState
        );
    }, [nodeAliases, treeNodes]);

    const nodesIdToFetch = useMemo(() => {
        const nodesIdToFetch = new Set<UUID>();
        if (!equipments.nodesId || !builtAliasedNodesIds || !currentNode?.id) {
            return nodesIdToFetch;
        }
        // We check if we have the data for the currentNode and if we don't, we save the fact that we need to fetch it
        if (equipments.nodesId.find((nodeId) => nodeId === currentNode.id) === undefined) {
            nodesIdToFetch.add(currentNode.id);
        }
        // Then we do the same for the other nodes we need the data of (the ones defined in aliases)
        for (const builtAliasNodeId of builtAliasedNodesIds) {
            if (equipments.nodesId.find((nodeId) => nodeId === builtAliasNodeId) === undefined) {
                nodesIdToFetch.add(builtAliasNodeId);
            }
        }
        return nodesIdToFetch;
    }, [currentNode?.id, equipments.nodesId, builtAliasedNodesIds]);

    // effect to unload equipment data when we remove an alias or unbuild an aliased node
    useEffect(() => {
        if (!equipments || !builtAliasedNodesIds.length || !currentNode?.id) {
            return;
        }
        const currentNodeId = currentNode.id;
        const unwantedFetchedNodes = new Set(equipments.nodesId);
        const usedNodesId = new Set(builtAliasedNodesIds);
        usedNodesId.add(currentNodeId);
        usedNodesId.forEach((nodeId) => unwantedFetchedNodes.delete(nodeId));
        if (unwantedFetchedNodes.size !== 0) {
            dispatch(removeNodeData(Array.from(unwantedFetchedNodes)));
        }
    }, [builtAliasedNodesIds, currentNode?.id, dispatch, equipments]);

    const deleteEquipmentsLocal = useCallback(
        (impactedSubstationsIds: UUID[], deletedEquipments: DeletedEquipment[], impactedElementTypes: string[]) => {
            if (!type) {
                return;
            }
            // updating data related to impacted elements
            const nodeId = currentNode?.id as UUID; //TODO maybe do nothing if no current node?

            // Handle updates and resets based on impacted element types
            if (impactedElementTypes.length > 0) {
                if (impactedElementTypes.includes(SpreadsheetEquipmentType.SUBSTATION)) {
                    dispatch(resetEquipments());
                    return;
                }
                const impactedSpreadsheetEquipmentsTypes = impactedElementTypes.filter((type) =>
                    Object.keys(allEquipments).includes(type)
                );
                if (impactedSpreadsheetEquipmentsTypes.length > 0) {
                    dispatch(
                        resetEquipmentsByTypes(impactedSpreadsheetEquipmentsTypes.filter(isSpreadsheetEquipmentType))
                    );
                }
            }

            if (impactedSubstationsIds.length > 0 && studyUuid && currentRootNetworkUuid && currentNode?.id) {
                // The formatting of the fetched equipments is done in the reducer
                if (
                    type === SpreadsheetEquipmentType.SUBSTATION ||
                    type === SpreadsheetEquipmentType.VOLTAGE_LEVEL ||
                    !equipmentToUpdateId
                ) {
                    // we must fetch data for all equipments, as substation data (country) and voltage level data(nominalV)
                    // can be displayed for all equipment types
                    fetchAllEquipments(studyUuid, nodeId, currentRootNetworkUuid, impactedSubstationsIds).then(
                        (values) => {
                            highlightUpdatedEquipment();
                            dispatch(updateEquipments(values, nodeId));
                        }
                    );
                } else {
                    // here, we can fetch only the data for the modified equipment
                    const promises = [
                        fetchNetworkElementInfos(
                            studyUuid,
                            nodeId,
                            currentRootNetworkUuid,
                            type,
                            EQUIPMENT_INFOS_TYPES.TAB.type,
                            equipmentToUpdateId,
                            false
                        ),
                    ];
                    if (
                        type === SpreadsheetEquipmentType.LINE ||
                        type === SpreadsheetEquipmentType.TWO_WINDINGS_TRANSFORMER
                    ) {
                        promises.push(
                            fetchNetworkElementInfos(
                                studyUuid,
                                nodeId,
                                currentRootNetworkUuid,
                                SpreadsheetEquipmentType.BRANCH,
                                EQUIPMENT_INFOS_TYPES.TAB.type,
                                equipmentToUpdateId,
                                false
                            )
                        );
                    }
                    Promise.allSettled(promises).then((results) => {
                        const updates: UpdateEquipmentsAction['equipments'] = {};
                        if (results[0].status === 'rejected') {
                            //TODO show snackbar error?
                        } else {
                            updates[type] = results[0].value;
                        }
                        if (results.length > 1) {
                            if (results[1].status === 'rejected') {
                                //TODO show snackbar error?
                            } else {
                                updates[SpreadsheetEquipmentType.BRANCH] = results[1].value;
                            }
                        }
                        if (Object.keys(updates).length > 1) {
                            highlightUpdatedEquipment();
                            dispatch(updateEquipments(updates, nodeId));
                        }
                    });
                }
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
                    const equipmentsToDeleteArray = equipmentsToDelete
                        .filter((e) => isSpreadsheetEquipmentType(e.equipmentType))
                        .map<EquipmentToDelete>((equipment) => ({
                            equipmentType: equipment.equipmentType as unknown as SpreadsheetEquipmentType,
                            equipmentId: equipment.equipmentId,
                        }));
                    dispatch(deleteEquipments(equipmentsToDeleteArray, nodeId));
                }
            }
        },
        [
            type,
            currentNode?.id,
            studyUuid,
            currentRootNetworkUuid,
            dispatch,
            allEquipments,
            equipmentToUpdateId,
            highlightUpdatedEquipment,
        ]
    );

    const listenerUpdateEquipmentsLocal = useCallback(
        (event: MessageEvent) => {
            const eventData = JSON.parse(event.data);
            if (isStudyNotification(eventData)) {
                const eventStudyUuid = eventData.headers.studyUuid;
                const eventNodeUuid = eventData.headers.node;
                const eventRootNetworkUuid = eventData.headers.rootNetworkUuid;
                if (
                    studyUuid === eventStudyUuid &&
                    currentNode?.id === eventNodeUuid &&
                    currentRootNetworkUuid === eventRootNetworkUuid
                ) {
                    const payload = JSON.parse(eventData.payload) as NetworkImpactsInfos;
                    const impactedSubstationsIds = payload.impactedSubstationsIds;
                    const deletedEquipments = payload.deletedEquipments;
                    const impactedElementTypes = payload.impactedElementTypes ?? [];
                    deleteEquipmentsLocal(impactedSubstationsIds, deletedEquipments, impactedElementTypes);
                }
            }
        },
        [currentNode?.id, currentRootNetworkUuid, studyUuid, deleteEquipmentsLocal]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, { listenerCallbackMessage: listenerUpdateEquipmentsLocal });

    // Note: take care about the dependencies because any execution here implies equipment loading (large fetches).
    // For example, we have 3 currentNode properties in deps rather than currentNode object itself.
    useEffect(() => {
        if (
            active &&
            currentNode?.id &&
            currentRootNetworkUuid &&
            nodesIdToFetch.size > 0 &&
            isNetworkModificationTreeModelUpToDate &&
            (currentNode?.type === NodeType.ROOT || isStatusBuilt(currentNode?.data.globalBuildStatus))
        ) {
            setIsFetching(true);
            fetchNodesEquipmentData(nodesIdToFetch, currentNode.id, currentRootNetworkUuid, () => setIsFetching(false));
        }
    }, [
        active,
        isNetworkModificationTreeModelUpToDate,
        currentNode?.id,
        currentNode?.type,
        currentNode?.data.globalBuildStatus,
        currentRootNetworkUuid,
        fetchNodesEquipmentData,
        nodesIdToFetch,
    ]);

    return { equipments, isFetching };
};
