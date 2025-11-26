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
} from '../../../../types/notification-types';

interface UseDiagramNotificationsProps {
    currentRootNetworkUuid: UUID;
    onNotification: () => void;
}

/**
 * Hook to listen for diagram-related notifications (loadflow results, study changes)
 * and trigger a refetch callback.
 */
export const useDiagramNotifications = ({ currentRootNetworkUuid, onNotification }: UseDiagramNotificationsProps) => {
    const handleNotification = useCallback(
        (event: MessageEvent) => {
            const eventData = JSON.parse(event.data);
            if (
                (isLoadflowResultNotification(eventData) ||
                    isShortCircuitResultNotification(eventData) ||
                    isStudyNotification(eventData)) &&
                eventData.headers.rootNetworkUuid === currentRootNetworkUuid
            ) {
                onNotification();
            }
        },
        [currentRootNetworkUuid, onNotification]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, { listenerCallbackMessage: handleNotification });
};
