/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useNotificationsListener } from '@gridsuite/commons-ui';
import { UUID } from 'crypto';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteEquipments, EquipmentToDelete, removeNodeData, updateEquipments } from 'redux/actions';
import { AppState, NotificationType } from 'redux/reducer';
import type { SpreadsheetEquipmentType } from '../config/spreadsheet.type';
import { fetchAllEquipments } from 'services/study/network-map';
import { isNodeBuilt } from 'components/graph/util/model-functions';
import { NOTIFICATIONS_URL_KEYS } from '../../utils/notificationsProvider-utils';
import { UPDATE_TYPE_HEADER } from '../../use-node-data';
import { NodeAlias } from '../custom-columns/node-alias.type';
import { useFetchEquipment } from './use-fetch-equipment';

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

    const [isFetching, setIsFetching] = useState<boolean>();

    const { fetchNodesEquipmentData } = useFetchEquipment(type);

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

    const updateEquipmentsLocal = useCallback(
        (impactedSubstationsIds: string[], deletedEquipments: { equipmentType: string; equipmentId: string }[]) => {
            if (!type) {
                return;
            }
            // updating data related to impacted elements
            const nodeId = currentNode?.id as UUID;

            if (impactedSubstationsIds.length > 0 && studyUuid && currentRootNetworkUuid && currentNode?.id) {
                // The formatting of the fetched equipments is done in the reducer
                fetchAllEquipments(studyUuid, nodeId, currentRootNetworkUuid, impactedSubstationsIds).then((values) => {
                    highlightUpdatedEquipment();
                    dispatch(updateEquipments(values, nodeId));
                });
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
        [studyUuid, currentRootNetworkUuid, currentNode?.id, dispatch, type, highlightUpdatedEquipment]
    );

    useNotificationsListener(NOTIFICATIONS_URL_KEYS.STUDY, {
        listenerCallbackMessage: (event) => {
            const eventData = JSON.parse(event.data);
            const updateTypeHeader = eventData.headers[UPDATE_TYPE_HEADER];
            if (updateTypeHeader === NotificationType.STUDY) {
                const eventStudyUuid = eventData.headers.studyUuid;
                const eventNodeUuid = eventData.headers.node;
                const eventRootNetworkUuid = eventData.headers.rootNetwork;
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
    });

    const onFetchingDone = () => {
        setIsFetching(false);
    };

    useEffect(() => {
        if (shouldFetchEquipments && isNetworkModificationTreeModelUpToDate && isNodeBuilt(currentNode)) {
            setIsFetching(true);
            fetchNodesEquipmentData(nodesIdToFetch, onFetchingDone);
        }
    }, [
        shouldFetchEquipments,
        isNetworkModificationTreeModelUpToDate,
        nodesIdToFetch,
        fetchNodesEquipmentData,
        currentNode,
    ]);

    return { equipments, isFetching };
};
