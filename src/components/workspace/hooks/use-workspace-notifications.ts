/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectActiveWorkspaceId } from '../../../redux/slices/workspace-selectors';
import {
    updatePanels,
    deletePanels,
    setWorkspacesMetadata,
    clearWorkspace,
} from '../../../redux/slices/workspace-slice';
import { getPanels, getWorkspacesMetadata } from '../../../services/study/workspace';
import { useNotificationsListener, NotificationsUrlKeys } from '@gridsuite/commons-ui';
import type { UUID } from 'node:crypto';
import {
    isWorkspacePanelsUpdatedNotification,
    isWorkspacePanelsDeletedNotification,
    isWorkspaceRenamedNotification,
    WorkspacePanelsUpdatedEventData,
    WorkspacePanelsDeletedEventData,
    WorkspaceRenamedEventData,
} from '../../../types/notification-types';
import { getClientId } from '../../../utils/client-id';

export function useWorkspaceNotifications(studyUuid: UUID | null | undefined) {
    const dispatch = useDispatch();
    const workspaceId = useSelector(selectActiveWorkspaceId);

    const handlePanelsUpdated = useCallback(
        (eventData: WorkspacePanelsUpdatedEventData) => {
            if (!studyUuid || !workspaceId) return;
            try {
                const panelIds = JSON.parse(eventData.payload) as UUID[];
                getPanels(studyUuid, workspaceId, panelIds)
                    .then((updatedPanels) => dispatch(updatePanels(updatedPanels)))
                    .catch((error) => console.error('Failed to fetch updated panels:', error));
            } catch (error) {
                console.error('Failed to parse panel IDs from notification:', error);
            }
        },
        [studyUuid, workspaceId, dispatch]
    );

    const handlePanelsDeleted = useCallback(
        (eventData: WorkspacePanelsDeletedEventData) => {
            try {
                const panelIds = JSON.parse(eventData.payload) as UUID[];
                if (panelIds.length === 0) {
                    dispatch(clearWorkspace());
                }
                dispatch(deletePanels(panelIds));
            } catch (error) {
                console.error('Failed to delete panels:', error);
            }
        },
        [dispatch]
    );

    const handleWorkspaceRenamed = useCallback(
        (_eventData: WorkspaceRenamedEventData) => {
            if (!studyUuid) return;
            getWorkspacesMetadata(studyUuid)
                .then((metadata) => dispatch(setWorkspacesMetadata(metadata)))
                .catch((error) => console.error('Failed to fetch workspaces metadata:', error));
        },
        [studyUuid, dispatch]
    );

    const handleNotification = useCallback(
        (event: MessageEvent) => {
            const eventData = JSON.parse(event.data);

            if (eventData.headers?.clientId === getClientId()) {
                return;
            }

            if (isWorkspaceRenamedNotification(eventData)) {
                handleWorkspaceRenamed(eventData);
                return;
            }

            const notificationWorkspaceId = eventData.headers?.workspaceUuid;
            if (notificationWorkspaceId !== workspaceId) {
                return;
            }

            if (isWorkspacePanelsUpdatedNotification(eventData)) {
                handlePanelsUpdated(eventData);
            } else if (isWorkspacePanelsDeletedNotification(eventData)) {
                handlePanelsDeleted(eventData);
            }
        },
        [workspaceId, handlePanelsUpdated, handlePanelsDeleted, handleWorkspaceRenamed]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: handleNotification,
    });
}
