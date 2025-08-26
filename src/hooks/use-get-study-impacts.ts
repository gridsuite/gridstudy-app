/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from '../redux/reducer';
import { UUID } from 'crypto';
import { DeletedEquipment, isStudyNotification, NetworkImpactsInfos } from 'types/notification-types';
import { setReloadMapNeeded } from 'redux/actions';
import { NotificationsUrlKeys, useNotificationsListener } from '@gridsuite/commons-ui';

interface StudyImpactsWithReset extends NetworkImpactsInfos {
    resetImpactedSubstationsIds: () => void;
    resetDeletedEquipments: () => void;
    resetImpactedElementTypes: () => void;
}

/**
 * Custom hook that consume the update notification 'study' and return the impacts of the study
 */
export const useGetStudyImpacts = (): StudyImpactsWithReset => {
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const mapManualRefresh = useSelector(
        (state: AppState) => state.networkVisualizationsParameters.mapParameters.mapManualRefresh
    );
    const dispatch = useDispatch();

    const [impactedSubstationsIds, setImpactedSubstationsIds] = useState<UUID[]>([]);
    const [deletedEquipments, setDeletedEquipments] = useState<DeletedEquipment[]>([]);
    const [impactedElementTypes, setImpactedElementTypes] = useState<string[]>([]);

    const resetImpactedSubstationsIds = useCallback(() => {
        setImpactedSubstationsIds([]);
    }, []);

    const resetDeletedEquipments = useCallback(() => {
        setDeletedEquipments([]);
    }, []);

    const resetImpactedElementTypes = useCallback(() => {
        setImpactedElementTypes([]);
    }, []);

    const handleStudyNotification = useCallback(
        (event: MessageEvent) => {
            const eventData = JSON.parse(event.data);

            if (isStudyNotification(eventData)) {
                const nodeUuidFromNotif = eventData.headers.node;
                const rootNetworkUuidFromNotif = eventData.headers.rootNetworkUuid;
                if (rootNetworkUuidFromNotif !== currentRootNetworkUuid || nodeUuidFromNotif !== currentNode?.id) {
                    return;
                }
                const {
                    impactedSubstationsIds: substationsIds,
                    deletedEquipments,
                    impactedElementTypes,
                } = JSON.parse(eventData.payload) as NetworkImpactsInfos;

                if (impactedElementTypes?.length > 0) {
                    setImpactedElementTypes(impactedElementTypes);
                }
                if (deletedEquipments?.length > 0) {
                    setDeletedEquipments(deletedEquipments);
                }
                if (substationsIds?.length > 0) {
                    setImpactedSubstationsIds(substationsIds);
                }
                if (impactedElementTypes?.length > 0 || substationsIds?.length > 0) {
                    // The following line will proc a map update in auto mode
                    // or show the button to refresh the map in manual mode
                    dispatch(setReloadMapNeeded(true));
                } else if (deletedEquipments?.length > 0) {
                    // for deletedEquipments do nothing in auto mode, it will be simply removed from the map without
                    // consequent update
                    // but in manual mode, we need to show the button to refresh the map at demand
                    if (mapManualRefresh) {
                        dispatch(setReloadMapNeeded(true));
                    }
                }
            }
        },
        [currentRootNetworkUuid, currentNode?.id, dispatch, mapManualRefresh]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, { listenerCallbackMessage: handleStudyNotification });

    return {
        impactedSubstationsIds,
        deletedEquipments,
        impactedElementTypes,
        resetImpactedSubstationsIds,
        resetDeletedEquipments,
        resetImpactedElementTypes,
    };
};
