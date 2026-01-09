/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { useCallback } from 'react';
import { NotificationsUrlKeys, useNotificationsListener } from '@gridsuite/commons-ui';
import {
    isLoadflowResultNotification,
    isShortCircuitResultNotification,
    isStudyNotification,
    isWorkspaceNadConfigUpdatedNotification,
} from '../../../../types/notification-types';
import { getClientId } from '../../../../hooks/use-client-id';

interface UseDiagramNotificationsProps {
    currentRootNetworkUuid: UUID;
    onNotification: (forceSavedConfig: boolean) => void;
    savedNadConfigUuid?: UUID;
}

/**
 * Hook to listen for diagram-related notifications (loadflow results, study changes, NAD config updates)
 * and trigger a refetch callback.
 */
export const useDiagramNotifications = ({
    currentRootNetworkUuid,
    onNotification,
    savedNadConfigUuid,
}: UseDiagramNotificationsProps) => {
    const handleNotification = useCallback(
        (event: MessageEvent) => {
            const eventData = JSON.parse(event.data);

            const isRootNetworkNotification =
                (isLoadflowResultNotification(eventData) ||
                    isShortCircuitResultNotification(eventData) ||
                    isStudyNotification(eventData)) &&
                eventData.headers.rootNetworkUuid === currentRootNetworkUuid;

            // NAD config update: only trigger if this panel uses that saved config
            // Ignore our own NAD config updates (local-first: we already have the latest state)
            const isMatchingNadConfigNotification =
                savedNadConfigUuid &&
                isWorkspaceNadConfigUpdatedNotification(eventData) &&
                eventData.payload === savedNadConfigUuid.toString() &&
                eventData.headers?.clientId !== getClientId();

            if (isRootNetworkNotification) {
                onNotification(false);
            } else if (isMatchingNadConfigNotification) {
                onNotification(true);
            }
        },
        [currentRootNetworkUuid, onNotification, savedNadConfigUuid]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, { listenerCallbackMessage: handleNotification });
};
