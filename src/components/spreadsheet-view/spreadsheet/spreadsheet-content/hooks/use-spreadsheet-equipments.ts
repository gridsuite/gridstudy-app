/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Identifiable, useNotificationsListener } from '@gridsuite/commons-ui';
import { UUID } from 'crypto';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteEquipments, EquipmentToDelete, removeNodeData, updateEquipments } from 'redux/actions';
import { AppState, EquipmentUpdateType, NotificationType } from 'redux/reducer';
import { SpreadsheetEquipmentType } from '../../../types/spreadsheet.type';
import { fetchAllEquipments } from 'services/study/network-map';
import { NOTIFICATIONS_URL_KEYS } from '../../../../utils/notificationsProvider-utils';
import { NodeAlias } from '../../../types/node-alias.type';
import { isStatusBuilt } from '../../../../graph/util/model-functions';
import { useFetchEquipment } from '../../../hooks/use-fetch-equipment';
import { NodeType } from '../../../../graph/tree-node.type';
import { validAlias } from '../../../hooks/use-node-aliases';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { fetchNetworkElementInfos } from 'services/study/network';
import { getEquipmentUpdateTypeFromType } from 'components/spreadsheet-view/utils/convert-type-utils';

export const useSpreadsheetEquipments = (
    type: SpreadsheetEquipmentType,
    equipmentToUpdateId: string | null,
    highlightUpdatedEquipment: () => void,
    nodeAliases: NodeAlias[] | undefined,
    active: boolean = false
) => {
    const dispatch = useDispatch();
    const equipments = useSelector((state: AppState) => state.spreadsheetNetwork[type]);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const isNetworkModificationTreeModelUpToDate = useSelector(
        (state: AppState) => state.isNetworkModificationTreeModelUpToDate
    );
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const treeNodes = useSelector((state: AppState) => state.networkModificationTreeModel?.treeNodes);
    const [builtAliasedNodesIds, setBuiltAliasedNodesIds] = useState<UUID[]>();

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
            treeNodes?.forEach((treeNode) => {
                if (
                    aliasedNodesIds.includes(treeNode.id) &&
                    (treeNode.type === NodeType.ROOT || isStatusBuilt(treeNode.data.globalBuildStatus))
                ) {
                    computedIds.push(treeNode.id);
                }
            });
        }
        // Because of treeNodes: update the state only on real values changes (to avoid multiple effects for the watchers)
        setBuiltAliasedNodesIds((prevState) => {
            const currentIds = prevState;
            currentIds?.sort((a, b) => a.localeCompare(b));
            computedIds.sort((a, b) => a.localeCompare(b));
            if (JSON.stringify(currentIds) !== JSON.stringify(computedIds)) {
                return computedIds;
            }
            return prevState;
        });
    }, [nodeAliases, treeNodes]);

    const nodesIdToFetch = useMemo(() => {
        let nodesIdToFetch = new Set<string>();
        if (!equipments || !builtAliasedNodesIds) {
            return nodesIdToFetch;
        }
        // We check if we have the data for the currentNode and if we don't we save the fact that we need to fetch it
        if (equipments.nodesId.find((nodeId) => nodeId === currentNode?.id) === undefined) {
            nodesIdToFetch.add(currentNode?.id as string);
        }
        // Then we do the same for the other nodes we need the data of (the ones defined in aliases)
        builtAliasedNodesIds.forEach((builtAliasNodeId) => {
            if (equipments.nodesId.find((nodeId) => nodeId === builtAliasNodeId) === undefined) {
                nodesIdToFetch.add(builtAliasNodeId);
            }
        });
        return nodesIdToFetch;
    }, [currentNode?.id, equipments, builtAliasedNodesIds]);

    // effect to unload equipment data when we remove an alias or unbuild an aliased node
    useEffect(() => {
        if (!equipments || !builtAliasedNodesIds) {
            return;
        }
        const currentNodeId = currentNode?.id as UUID;
        let unwantedFetchedNodes = new Set<string>();
        unwantedFetchedNodes = new Set([...unwantedFetchedNodes, ...equipments.nodesId]);
        const usedNodesId = new Set(builtAliasedNodesIds);
        usedNodesId.add(currentNodeId);
        usedNodesId.forEach((nodeId) => unwantedFetchedNodes.delete(nodeId));
        if (unwantedFetchedNodes.size !== 0) {
            dispatch(removeNodeData(Array.from(unwantedFetchedNodes)));
        }
    }, [builtAliasedNodesIds, currentNode, dispatch, equipments]);

    const updateEquipmentsLocal = useCallback(
        (impactedSubstationsIds: string[], deletedEquipments: { equipmentType: string; equipmentId: string }[]) => {
            if (!type) {
                return;
            }
            // updating data related to impacted elements
            const nodeId = currentNode?.id as UUID;

            if (impactedSubstationsIds.length > 0 && studyUuid && currentRootNetworkUuid && currentNode?.id) {
                // The formatting of the fetched equipments is done in the reducer
                if (
                    type === EQUIPMENT_TYPES.SUBSTATION ||
                    type === EQUIPMENT_TYPES.VOLTAGE_LEVEL ||
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
                    fetchNetworkElementInfos(
                        studyUuid,
                        nodeId,
                        currentRootNetworkUuid,
                        type,
                        'TAB',
                        equipmentToUpdateId,
                        false
                    ).then((value: Identifiable) => {
                        highlightUpdatedEquipment();
                        const updateType = getEquipmentUpdateTypeFromType(type);
                        if (updateType) {
                            const equipmentsToUpdate: Partial<Record<EquipmentUpdateType, Identifiable[]>> = {
                                [updateType]: [value],
                            };
                            dispatch(updateEquipments(equipmentsToUpdate, nodeId));
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
                    const equipmentsToDeleteArray: EquipmentToDelete[] = equipmentsToDelete.map((equipment) => ({
                        equipmentType: equipment.equipmentType as SpreadsheetEquipmentType,
                        equipmentId: equipment.equipmentId,
                        nodeId: nodeId,
                    }));
                    dispatch(deleteEquipments(equipmentsToDeleteArray, nodeId));
                }
            }
        },
        [
            studyUuid,
            currentRootNetworkUuid,
            currentNode?.id,
            dispatch,
            type,
            highlightUpdatedEquipment,
            equipmentToUpdateId,
        ]
    );

    const listenerUpdateEquipmentsLocal = useCallback(
        (event: MessageEvent) => {
            const eventData = JSON.parse(event.data);
            const updateTypeHeader = eventData.headers.updateType;
            if (updateTypeHeader === NotificationType.STUDY) {
                const eventStudyUuid = eventData.headers.studyUuid;
                const eventNodeUuid = eventData.headers.node;
                const eventRootNetworkUuid = eventData.headers.rootNetworkUuid;
                if (
                    studyUuid === eventStudyUuid &&
                    currentNode?.id === eventNodeUuid &&
                    currentRootNetworkUuid === eventRootNetworkUuid
                ) {
                    const payload = JSON.parse(eventData.payload);
                    const impactedSubstationsIds = payload.impactedSubstationsIds;
                    const deletedEquipments = payload.deletedEquipments;
                    updateEquipmentsLocal(impactedSubstationsIds, deletedEquipments);
                }
            }
        },
        [currentNode?.id, currentRootNetworkUuid, studyUuid, updateEquipmentsLocal]
    );

    useNotificationsListener(NOTIFICATIONS_URL_KEYS.STUDY, {
        listenerCallbackMessage: listenerUpdateEquipmentsLocal,
    });

    const onFetchingDone = () => {
        setIsFetching(false);
    };

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
            fetchNodesEquipmentData(nodesIdToFetch, currentNode.id, currentRootNetworkUuid, onFetchingDone);
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
