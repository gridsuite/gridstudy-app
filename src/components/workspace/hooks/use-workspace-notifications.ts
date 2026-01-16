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
import { getClientId } from '../../../hooks/use-client-id';

export function useWorkspaceNotifications(studyUuid: UUID | null | undefined) {
    const dispatch = useDispatch();
    const workspaceId = useSelector(selectActiveWorkspaceId);

    const handlePanelsUpdated = useCallback(
        (eventData: any) => {
            try {
                const panelIds = JSON.parse(eventData.payload) as UUID[];
                fetchPanels(studyUuid!, workspaceId!, panelIds)
                    .then((updatedPanels) => dispatch(updatePanels(updatedPanels)))
                    .catch((error) => console.error('Failed to fetch updated panels:', error));
            } catch (error) {
                console.error('Failed to parse panel IDs from notification:', error);
            }
        },
        [studyUuid, workspaceId, dispatch]
    );

    const handlePanelsDeleted = useCallback(
        (eventData: any) => {
            try {
                const panelIds = JSON.parse(eventData.payload) as UUID[];
                dispatch(deletePanels(panelIds));
            } catch (error) {
                console.error('Failed to delete panels:', error);
            }
        },
        [dispatch]
    );

    const handleNotification = useCallback(
        (event: MessageEvent) => {
            if (!studyUuid || !workspaceId) return;

            const eventData = JSON.parse(event.data);

            if (eventData.headers?.clientId === getClientId()) return;

            const notificationWorkspaceId = eventData.headers?.workspaceUuid;
            if (notificationWorkspaceId !== workspaceId) return;

            if (isWorkspacePanelsUpdatedNotification(eventData)) {
                handlePanelsUpdated(eventData);
            } else if (isWorkspacePanelsDeletedNotification(eventData)) {
                handlePanelsDeleted(eventData);
            }
        },
        [studyUuid, workspaceId, handlePanelsUpdated, handlePanelsDeleted]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: handleNotification,
    });
}
