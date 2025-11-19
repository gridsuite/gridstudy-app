/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type {
    WindowState,
    WindowType,
    WorkspaceState as WorkspaceStateType,
} from '../../components/workspace/types/workspace.types';

const selectWorkspaceState = (state: RootState) => state.workspace;

export const selectActiveWorkspace = createSelector(
    [selectWorkspaceState],
    (workspaceState): WorkspaceStateType | undefined => {
        const ws = workspaceState.workspaces.find((w: any) => w.id === workspaceState.activeWorkspaceId);
        return ws?.workspace;
    }
);

export const selectWindow = createSelector(
    [selectActiveWorkspace, (_state: RootState, windowId: string) => windowId],
    (workspace, windowId): WindowState | undefined => {
        return workspace?.windows[windowId];
    }
);

export const selectWindowDirect = (state: RootState, windowId: string): WindowState | undefined => {
    const workspaceState = state.workspace;
    const activeWorkspace = workspaceState.workspaces.find((w: any) => w.id === workspaceState.activeWorkspaceId);
    return activeWorkspace?.workspace.windows[windowId];
};

export const selectWindowContent = createSelector(
    [selectActiveWorkspace, (_state: RootState, windowId: string) => windowId],
    (workspace, windowId): { type: WindowType; title: string; data?: any } | undefined => {
        const window = workspace?.windows[windowId];
        if (!window) return undefined;
        return { type: window.type, title: window.title, data: window.data };
    }
);

export const selectWindowsByType = createSelector(
    [selectActiveWorkspace, (_state: RootState, windowType: WindowType) => windowType],
    (workspace, windowType): WindowState[] => {
        if (!workspace) return [];
        return Object.values(workspace.windows).filter((w) => w.type === windowType);
    }
);

export const selectIsWindowTypeOpen = createSelector(
    [selectActiveWorkspace, (_state: RootState, windowType: WindowType) => windowType],
    (workspace, windowType): boolean => {
        if (!workspace) return false;
        return Object.values(workspace.windows).some((w) => w.type === windowType);
    }
);

export const selectWindowCount = createSelector([selectActiveWorkspace], (workspace): number => {
    if (!workspace) return 0;
    return Object.keys(workspace.windows).length;
});

export const selectWindowIds = createSelector([selectActiveWorkspace], (workspace): string[] => {
    if (!workspace) return [];
    return Object.keys(workspace.windows);
});

export const selectWindows = createSelector([selectActiveWorkspace], (workspace): WindowState[] => {
    if (!workspace) return [];
    return Object.values(workspace.windows);
});

export const selectWorkspaces = createSelector([selectWorkspaceState], (workspaceState) => {
    return workspaceState.workspaces;
});

export const selectActiveWorkspaceId = createSelector([selectWorkspaceState], (workspaceState) => {
    return workspaceState.activeWorkspaceId;
});

export const selectPendingSpreadsheetTarget = createSelector([selectWorkspaceState], (workspaceState) => {
    return workspaceState.pendingSpreadsheetTarget;
});
