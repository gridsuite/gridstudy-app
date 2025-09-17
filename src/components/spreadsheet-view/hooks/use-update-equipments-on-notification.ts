/*
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import type { UUID } from 'crypto';
import { DeletedEquipment, isStudyNotification, type NetworkImpactsInfos } from '../../../types/notification-types';
import { isSpreadsheetEquipmentType, SpreadsheetEquipmentType } from '../types/spreadsheet.type';
import {
    deleteEquipments,
    type EquipmentToDelete,
    resetEquipments,
    resetEquipmentsByTypes,
    updateEquipments,
} from '../../../redux/actions';
import { fetchAllEquipments } from '../../../services/study/network-map';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { NotificationsUrlKeys, useNotificationsListener } from '@gridsuite/commons-ui';
import { NodeAlias } from '../types/node-alias.type';
import { useSpreadsheetNodes } from './use-spreadsheet-nodes';

const SPREADSHEET_EQUIPMENTS_LISTENER_ID = 'spreadsheet-equipments-listener';

export function useUpdateEquipmentsOnNotification(nodeAliases: NodeAlias[] | undefined) {
    const dispatch = useDispatch();
    const allEquipments = useSelector((state: AppState) => state.spreadsheetNetwork);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);

    const { builtNodesIds } = useSpreadsheetNodes(nodeAliases);

    const updateEquipmentsLocal = useCallback(
        (
            nodeUuid: UUID,
            impactedSubstationsIds: UUID[],
            deletedEquipments: DeletedEquipment[],
            impactedElementTypes: string[]
        ) => {
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

            if (impactedSubstationsIds.length > 0 && studyUuid && currentRootNetworkUuid) {
                fetchAllEquipments(studyUuid, nodeUuid, currentRootNetworkUuid, impactedSubstationsIds).then(
                    (values) => {
                        dispatch(updateEquipments(values, nodeUuid));
                    }
                );
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
                    dispatch(deleteEquipments(equipmentsToDeleteArray, nodeUuid));
                }
            }
        },
        [studyUuid, currentRootNetworkUuid, dispatch, allEquipments]
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
                    currentRootNetworkUuid === eventRootNetworkUuid &&
                    builtNodesIds.has(eventNodeUuid)
                ) {
                    const payload = JSON.parse(eventData.payload) as NetworkImpactsInfos;
                    const impactedSubstationsIds = payload.impactedSubstationsIds;
                    const deletedEquipments = payload.deletedEquipments;
                    const impactedElementTypes = payload.impactedElementTypes ?? [];
                    updateEquipmentsLocal(
                        eventNodeUuid,
                        impactedSubstationsIds,
                        deletedEquipments,
                        impactedElementTypes
                    );
                }
            }
        },
        [builtNodesIds, currentRootNetworkUuid, studyUuid, updateEquipmentsLocal]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: listenerUpdateEquipmentsLocal,
        propsId: SPREADSHEET_EQUIPMENTS_LISTENER_ID,
    });
}
