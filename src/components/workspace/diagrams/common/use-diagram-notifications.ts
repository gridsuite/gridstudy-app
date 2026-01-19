/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { NotificationsUrlKeys, useNotificationsListener } from '@gridsuite/commons-ui';
import {
    isLoadflowResultNotification,
    isShortCircuitResultNotification,
    isStudyNotification,
    isWorkspaceNadConfigUpdatedNotification,
} from '../../../../types/notification-types';
import { getClientId } from '../../../../hooks/use-client-id';
import { selectActiveWorkspaceId } from '../../../../redux/slices/workspace-selectors';

interface UseDiagramNotificationsProps {
    currentRootNetworkUuid: UUID;
    onNotification: (newConfigUuid?: UUID) => void;
    savedNadConfigUuid?: UUID;
    panelId?: UUID;
}

/**
 * Hook to listen for diagram-related notifications (loadflow results, study changes, NAD config updates)
 * and trigger a refetch callback.
 */
export const useDiagramNotifications = ({
    currentRootNetworkUuid,
    onNotification,
    panelId,
}: UseDiagramNotificationsProps) => {
    const workspaceId = useSelector(selectActiveWorkspaceId);

    const handleNotification = useCallback(
        (event: MessageEvent) => {
            const eventData = JSON.parse(event.data);

            const isRootNetworkNotification =
                (isLoadflowResultNotification(eventData) ||
                    isShortCircuitResultNotification(eventData) ||
                    isStudyNotification(eventData)) &&
                eventData.headers.rootNetworkUuid === currentRootNetworkUuid;

            // NAD config update: only trigger if notification is for this specific panel
            const isMatchingNadConfigNotification =
                workspaceId &&
                panelId &&
                isWorkspaceNadConfigUpdatedNotification(eventData) &&
                eventData.headers?.workspaceUuid === workspaceId.toString() &&
                eventData.headers?.panelId === panelId.toString() &&
                eventData.headers?.clientId !== getClientId();

            if (isRootNetworkNotification) {
                onNotification();
            } else if (isMatchingNadConfigNotification) {
                const newConfigUuid = eventData.payload as UUID;
                onNotification(newConfigUuid);
            }
        },
        [currentRootNetworkUuid, onNotification, workspaceId, panelId]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, { listenerCallbackMessage: handleNotification });
};
