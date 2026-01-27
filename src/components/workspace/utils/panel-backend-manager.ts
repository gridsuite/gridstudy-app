/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import type { PanelState } from '../types/workspace.types';
import { updatePanels, deletePanels } from '../../../services/study/workspace';

const DEBOUNCE_DELAY_MS = 700;

export interface IPanelBackendManager {
    debounceUpdate(studyUuid: UUID, workspaceId: UUID, panels: PanelState[]): void;
    debounceDelete(studyUuid: UUID, workspaceId: UUID, panelIds: UUID[]): void;
}

export class PanelBackendManager implements IPanelBackendManager {
    private readonly pendingUpdates = new Map<UUID, PanelState>();
    private readonly pendingDeletes = new Set<UUID>();
    private currentStudyUuid: UUID | null = null;
    private currentWorkspaceId: UUID | null = null;
    private timeoutId: ReturnType<typeof setTimeout> | null = null;
    private readonly debounceDelayMs: number;

    constructor(debounceDelayMs: number = DEBOUNCE_DELAY_MS) {
        this.debounceDelayMs = debounceDelayMs;
    }

    private flush(): void {
        if (!this.currentStudyUuid || !this.currentWorkspaceId) return;

        const studyUuid = this.currentStudyUuid;
        const workspaceId = this.currentWorkspaceId;
        const panelsToUpdate = Array.from(this.pendingUpdates.values());
        const panelIdsToDelete = Array.from(this.pendingDeletes);

        this.pendingUpdates.clear();
        this.pendingDeletes.clear();
        this.currentStudyUuid = null;
        this.currentWorkspaceId = null;

        if (panelsToUpdate.length > 0) {
            updatePanels(studyUuid, workspaceId, panelsToUpdate).catch((error) =>
                console.error('Failed to update panels to backend:', error)
            );
        }

        if (panelIdsToDelete.length > 0) {
            deletePanels(studyUuid, workspaceId, panelIdsToDelete).catch((error) =>
                console.error('Failed to delete panels from backend:', error)
            );
        }
    }

    private debouncedFlush(): void {
        if (this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
        }
        this.timeoutId = setTimeout(() => {
            this.timeoutId = null;
            this.flush();
        }, this.debounceDelayMs);
    }

    debounceUpdate(studyUuid: UUID, workspaceId: UUID, panels: PanelState[]): void {
        this.currentStudyUuid = studyUuid;
        this.currentWorkspaceId = workspaceId;

        panels.forEach((panel) => {
            this.pendingUpdates.set(panel.id, panel);
            this.pendingDeletes.delete(panel.id);
        });

        this.debouncedFlush();
    }

    debounceDelete(studyUuid: UUID, workspaceId: UUID, panelIds: UUID[]): void {
        this.currentStudyUuid = studyUuid;
        this.currentWorkspaceId = workspaceId;

        panelIds.forEach((panelId) => {
            if (this.pendingUpdates.has(panelId)) {
                this.pendingUpdates.delete(panelId);
            } else {
                this.pendingDeletes.add(panelId);
            }
        });

        this.debouncedFlush();
    }
}

export const panelBackendManager = new PanelBackendManager();
