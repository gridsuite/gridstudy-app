/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { PanelState, PanelType, Workspace } from '../../components/workspace/types/workspace.types';
import type { UUID } from 'node:crypto';

const getActiveWorkspace = (state: RootState): Workspace | undefined => {
    return state.workspace.workspaces[state.workspace.activeWorkspaceId];
};

export const selectPanel = createSelector(
    [(state: RootState) => getActiveWorkspace(state)?.panels, (_state: RootState, panelId: UUID) => panelId],
    (panels, panelId) => panels?.[panelId]
);

export const selectIsPanelTypeOpen = createSelector(
    [(state: RootState) => getActiveWorkspace(state), (_state: RootState, panelType: PanelType) => panelType],
    (workspace, panelType): boolean => {
        if (!workspace) return false;
        return Object.values(workspace.panels).some((p) => p.type === panelType);
    }
);

export const selectPanelIds = (state: RootState): UUID[] => {
    const workspace = getActiveWorkspace(state);
    return workspace ? (Object.keys(workspace.panels) as UUID[]) : [];
};

export const selectPanels = (state: RootState): PanelState[] => {
    const workspace = getActiveWorkspace(state);
    return workspace ? Object.values(workspace.panels) : [];
};

export const selectFocusedPanelId = (state: RootState): UUID | null => {
    const workspace = getActiveWorkspace(state);
    return workspace?.focusedPanelId ?? null;
};
