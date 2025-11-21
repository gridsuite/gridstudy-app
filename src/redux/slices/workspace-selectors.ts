/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { WindowState, WindowType, WorkspaceConfig } from '../../components/workspace/types/workspace.types';
import type { UUID } from 'node:crypto';

const getActiveWorkspace = (state: RootState): WorkspaceConfig | undefined => {
    return state.workspace.workspaces[state.workspace.activeWorkspaceId];
};

export const selectWindow = createSelector(
    [(state: RootState) => getActiveWorkspace(state)?.windows, (_state: RootState, windowId: UUID) => windowId],
    (windows, windowId) => windows?.[windowId]
);

export const selectIsWindowTypeOpen = createSelector(
    [(state: RootState) => getActiveWorkspace(state), (_state: RootState, windowType: WindowType) => windowType],
    (workspace, windowType): boolean => {
        if (!workspace) return false;
        return Object.values(workspace.windows).some((w) => w.type === windowType);
    }
);

export const selectWindowIds = createSelector([getActiveWorkspace], (workspace): UUID[] => {
    return workspace ? (Object.keys(workspace.windows) as UUID[]) : [];
});

export const selectWindows = createSelector([getActiveWorkspace], (workspace): WindowState[] => {
    return workspace ? Object.values(workspace.windows) : [];
});

export const selectWorkspaces = createSelector(
    [(state: RootState) => state.workspace.workspaces],
    (workspaces): WorkspaceConfig[] => Object.values(workspaces)
);

export const selectActiveWorkspaceId = (state: RootState) => state.workspace.activeWorkspaceId;

export const selectFocusedWindowId = createSelector([getActiveWorkspace], (workspace): UUID | null => {
    return workspace?.focusedWindowId ?? null;
});

export const selectPendingSpreadsheetTarget = (state: RootState) => state.workspace.pendingSpreadsheetTarget;
