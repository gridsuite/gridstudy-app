/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { v4 as uuidv4 } from 'uuid';
import type { UUID } from 'node:crypto';
import type {
    WorkspaceState,
    WorkspaceConfig,
    WindowState,
    MultiWorkspaceState,
    DiagramWindowData,
} from '../types/workspace.types';

export interface WorkspaceStoreState {
    workspaces: Record<UUID, WorkspaceConfig>;
    activeWorkspaceId: UUID;
}

export const createDefaultWorkspaces = (): Record<UUID, WorkspaceConfig> => {
    const workspaces: Record<UUID, WorkspaceConfig> = {};
    for (let i = 0; i < 3; i++) {
        const id = uuidv4() as UUID;
        workspaces[id] = {
            id,
            name: `Workspace ${i + 1}`,
            windows: {},
            focusedWindowId: null,
            nextZIndex: 100,
        };
    }
    return workspaces;
};

export const getActiveWorkspace = (state: WorkspaceStoreState): WorkspaceConfig => {
    const workspace = state.workspaces[state.activeWorkspaceId];
    if (!workspace) {
        throw new Error(`Active workspace ${state.activeWorkspaceId} not found`);
    }
    return workspace;
};

export const getWorkspaceById = (state: WorkspaceStoreState, workspaceId: UUID): WorkspaceConfig | undefined => {
    return state.workspaces[workspaceId];
};

export const updateWindow = (
    state: WorkspaceStoreState,
    windowId: UUID,
    updater: (window: WindowState) => void
): void => {
    const workspace = getActiveWorkspace(state);
    const window = workspace.windows[windowId];
    if (window) {
        updater(window);
    }
};
