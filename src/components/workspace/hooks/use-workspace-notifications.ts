/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectActiveWorkspaceId } from '../../../redux/slices/workspace-selectors';
import { updatePanels, deletePanels } from '../../../redux/slices/workspace-slice';
import { fetchPanels } from '../../../services/study/workspace';
import { useNotificationsListener, NotificationsUrlKeys } from '@gridsuite/commons-ui';
import type { UUID } from 'node:crypto';
import {
    isWorkspacePanelsUpdatedNotification,
    isWorkspacePanelsDeletedNotification,
} from '../../../types/notification-types';

/**
 * Hook that listens to workspace panel notifications from other tabs/clients.
 * When panels are updated or deleted by another client, this hook fetches the changes
 * and updates the local Redux store.
 *
 * Note: Actual sync to backend is handled manually in useWorkspaceActions.
 */
export function useWorkspaceNotifications(studyUuid: UUID | null | undefined) {
    const dispatch = useDispatch();
    const workspaceId = useSelector(selectActiveWorkspaceId);

    const handleNotification = useCallback(
        (event: MessageEvent) => {
            if (!studyUuid || !workspaceId) return;

            const eventData = JSON.parse(event.data);

            if (isWorkspacePanelsUpdatedNotification(eventData)) {
                const notificationWorkspaceId = eventData.headers?.workspaceUuid;

                // Only process notifications for the active workspace
                if (notificationWorkspaceId && notificationWorkspaceId === workspaceId) {
                    fetchPanels(studyUuid, notificationWorkspaceId, JSON.parse(eventData.payload))
                        .then((updatedPanels) => {
                            dispatch(updatePanels(updatedPanels));
                        })
                        .catch((error) => {
                            console.error('Failed to fetch updated panels:', error);
                        });
                }
            } else if (isWorkspacePanelsDeletedNotification(eventData)) {
                const notificationWorkspaceId = eventData.headers?.workspaceUuid;

                // Only process notifications for the active workspace
                if (notificationWorkspaceId && notificationWorkspaceId === workspaceId) {
                    try {
                        const panelIds: UUID[] = JSON.parse(eventData.payload);

                        dispatch(deletePanels(panelIds));
                    } catch (error) {
                        console.error('Failed to delete panels:', error);
                    }
                }
            }
        },
        [studyUuid, workspaceId, dispatch]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: handleNotification,
    });
}
