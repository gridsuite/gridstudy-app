/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Middleware, MiddlewareAPI } from '@reduxjs/toolkit';
import type { UUID } from 'node:crypto';
import type { PanelState } from '../../components/workspace/types/workspace.types';
import { syncPanels, deletePanels } from '../../services/study/workspace';
import type { RootState, AppDispatch } from '../store';

const SYNC_DEBOUNCE_MS = 1000;

let dirtyPanels = new Set<UUID>();
let deletedPanels = new Set<UUID>();
let syncTimeout: NodeJS.Timeout | null = null;

export const workspaceSyncMiddleware: Middleware =
    (store: MiddlewareAPI<AppDispatch, RootState>) => (next) => (action: unknown) => {
        const result = next(action);

        if (typeof action === 'object' && action !== null && 'type' in action) {
            const typedAction = action as { type: string; payload?: any };

            if (typedAction.type === 'workspace/updatePanels') {
                const panels = typedAction.payload as PanelState[];
                panels.forEach((p) => dirtyPanels.add(p.id));
                scheduleSync(store);
            } else if (typedAction.type === 'workspace/deletePanels') {
                const ids = typedAction.payload as UUID[];
                ids.forEach((id) => {
                    deletedPanels.add(id);
                    dirtyPanels.delete(id);
                });
                scheduleSync(store);
            }
        }

        return result;
    };

function scheduleSync(store: MiddlewareAPI<AppDispatch, RootState>) {
    if (syncTimeout) {
        clearTimeout(syncTimeout);
    }

    syncTimeout = setTimeout(() => {
        syncToBackend(store);
    }, SYNC_DEBOUNCE_MS);
}

async function syncToBackend(store: MiddlewareAPI<AppDispatch, RootState>) {
    const state = store.getState();
    const { activeWorkspace } = state.workspace;
    const studyUuid = state.studyUuid;

    if (!activeWorkspace || !studyUuid) {
        dirtyPanels.clear();
        deletedPanels.clear();
        return;
    }

    const promises: Promise<void>[] = [];

    if (dirtyPanels.size > 0) {
        const panelsToSync = Array.from(dirtyPanels)
            .map((id) => activeWorkspace.panels.find((p: PanelState) => p.id === id))
            .filter((p): p is PanelState => p !== undefined);

        if (panelsToSync.length > 0) {
            promises.push(syncPanels(studyUuid, activeWorkspace.id, panelsToSync));
        }
        dirtyPanels.clear();
    }

    if (deletedPanels.size > 0) {
        const idsToDelete = Array.from(deletedPanels);
        promises.push(deletePanels(studyUuid, activeWorkspace.id, idsToDelete));
        deletedPanels.clear();
    }

    try {
        await Promise.all(promises);
    } catch (error) {
        console.error('Failed to sync workspace changes:', error);
    }
}
