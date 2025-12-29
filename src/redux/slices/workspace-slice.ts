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

            action.payload.forEach((updatedPanel) => {
                const index = state.activeWorkspace!.panels.findIndex((p) => p.id === updatedPanel.id);
                if (index >= 0) {
                    state.activeWorkspace!.panels[index] = {
                        ...state.activeWorkspace!.panels[index],
                        ...updatedPanel,
                    };
                } else {
                    state.activeWorkspace!.panels.push(updatedPanel);
                }
            });
        },

        deletePanels: (state, action: PayloadAction<UUID[]>) => {
            if (!state.activeWorkspace) return;

            state.activeWorkspace.panels = state.activeWorkspace.panels.filter(
                (panel) => !action.payload.includes(panel.id)
            );
        },

        clearWorkspace: (state) => {
            if (state.activeWorkspace) {
                state.activeWorkspace.panels = [];
            }
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
} = workspacesSlice.actions;

export default workspacesSlice.reducer;
