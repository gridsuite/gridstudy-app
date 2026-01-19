/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UUID } from 'node:crypto';
import {
    type WorkspacesState,
    type WorkspaceMetadata,
    type Workspace,
    type PanelState,
} from '../../components/workspace/types/workspace.types';

const initialState: WorkspacesState = {
    workspacesMetadata: [],
    activeWorkspace: null,
    focusedPanelId: null,
    nextZIndex: 1,
};

const workspacesSlice = createSlice({
    name: 'workspace',
    initialState,
    reducers: {
        setWorkspacesMetadata: (state, action: PayloadAction<WorkspaceMetadata[]>) => {
            state.workspacesMetadata = action.payload;
        },

        setActiveWorkspace: (state, action: PayloadAction<Workspace>) => {
            state.activeWorkspace = action.payload;
            // Initialize zIndex on panels if not present
            if (state.activeWorkspace) {
                state.activeWorkspace.panels.forEach((panel, index) => {
                    panel.zIndex ??= index + 1;
                });
                state.nextZIndex = state.activeWorkspace.panels.length + 1;
            }
            state.focusedPanelId = null;
        },

        renameWorkspace: (state, action: PayloadAction<{ workspaceId: UUID; newName: string }>) => {
            if (state.activeWorkspace?.id === action.payload.workspaceId) {
                state.activeWorkspace.name = action.payload.newName;
            }
            const metadata = state.workspacesMetadata.find((w) => w.id === action.payload.workspaceId);
            if (metadata) {
                metadata.name = action.payload.newName;
            }
        },

        updatePanels: (state, action: PayloadAction<PanelState[]>) => {
            if (!state.activeWorkspace) return;

            const activeWorkspace = state.activeWorkspace;

            action.payload.forEach((updatedPanel) => {
                const index = activeWorkspace.panels.findIndex((p) => p.id === updatedPanel.id);
                if (index >= 0) {
                    activeWorkspace.panels[index] = {
                        ...updatedPanel,
                        zIndex: updatedPanel.zIndex ?? activeWorkspace.panels[index].zIndex,
                    };
                    // If zIndex was explicitly set and it's higher than nextZIndex, update counter
                    if (updatedPanel.zIndex !== undefined && updatedPanel.zIndex >= state.nextZIndex) {
                        state.nextZIndex = updatedPanel.zIndex + 1;
                    }
                } else {
                    // New panel - assign baseline zIndex to not interfere with focused panel
                    updatedPanel.zIndex ??= 1;
                    activeWorkspace.panels.push(updatedPanel);
                }
            });
        },

        deletePanels: (state, action: PayloadAction<UUID[]>) => {
            if (!state.activeWorkspace) return;

            state.activeWorkspace.panels = state.activeWorkspace.panels.filter(
                (panel) => !action.payload.includes(panel.id)
            );

            // Clear focus if focused panel was deleted
            if (state.focusedPanelId && action.payload.includes(state.focusedPanelId)) {
                state.focusedPanelId = null;
            }
        },

        clearWorkspace: (state) => {
            if (state.activeWorkspace) {
                state.activeWorkspace.panels = [];
                // Update panel count in metadata
                const metadata = state.workspacesMetadata.find((w) => w.id === state.activeWorkspace?.id);
                if (metadata) {
                    metadata.panelCount = 0;
                }
            }
            state.focusedPanelId = null;
            state.nextZIndex = 1;
        },

        setFocusedPanelId: (state, action: PayloadAction<UUID | null>) => {
            state.focusedPanelId = action.payload;
        },
    },
});

export const {
    setWorkspacesMetadata,
    setActiveWorkspace,
    renameWorkspace,
    updatePanels,
    deletePanels,
    clearWorkspace,
    setFocusedPanelId,
} = workspacesSlice.actions;

export default workspacesSlice.reducer;
