/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import type { PanelState } from '../types/workspace.types';
import { syncPanels, deletePanels } from '../../../services/study/workspace';

const DEBOUNCE_DELAY_MS = 700;

function createPanelSyncManager() {
    const pendingUpdates = new Map<UUID, PanelState>();
    const pendingDeletes = new Set<UUID>();
    let currentStudyUuid: UUID | null = null;
    let currentWorkspaceId: UUID | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const flush = (): void => {
        if (!currentStudyUuid || !currentWorkspaceId) return;

        const studyUuid = currentStudyUuid;
        const workspaceId = currentWorkspaceId;
        const panelsToSync = Array.from(pendingUpdates.values());
        const panelIdsToDelete = Array.from(pendingDeletes);

        pendingUpdates.clear();
        pendingDeletes.clear();
        currentStudyUuid = null;
        currentWorkspaceId = null;

        if (panelsToSync.length > 0) {
            syncPanels(studyUuid, workspaceId, panelsToSync).catch((error) =>
                console.error('Failed to sync panels to backend:', error)
            );
        }

        if (panelIdsToDelete.length > 0) {
            deletePanels(studyUuid, workspaceId, panelIdsToDelete).catch((error) =>
                console.error('Failed to delete panels from backend:', error)
            );
        }
    };

    const debouncedFlush = (): void => {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            timeoutId = null;
            flush();
        }, DEBOUNCE_DELAY_MS);
    };

    return {
        queueSync(studyUuid: UUID, workspaceId: UUID, panels: PanelState[]): void {
            currentStudyUuid = studyUuid;
            currentWorkspaceId = workspaceId;

            panels.forEach((panel) => {
                pendingUpdates.set(panel.id, panel);
                pendingDeletes.delete(panel.id);
            });

            debouncedFlush();
        },

        queueDelete(studyUuid: UUID, workspaceId: UUID, panelIds: UUID[]): void {
            currentStudyUuid = studyUuid;
            currentWorkspaceId = workspaceId;

            panelIds.forEach((panelId) => {
                if (pendingUpdates.has(panelId)) {
                    pendingUpdates.delete(panelId);
                } else {
                    pendingDeletes.add(panelId);
                }
            });

            debouncedFlush();
        },
    };
}

export const panelSyncManager = createPanelSyncManager();
