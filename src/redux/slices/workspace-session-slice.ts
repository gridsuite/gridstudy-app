/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UUID } from 'node:crypto';
import { updatePanels, deletePanels, setActiveWorkspace } from './workspace-slice';

interface PanelTempData {
    initialVoltageLevelIds?: string[];
    targetEquipmentId?: string;
    targetEquipmentType?: string;
}

interface WorkspaceSessionState {
    focusedPanelId: UUID | null;
    zIndexMap: Record<UUID, number>; // panelId -> z-index
    nextZIndex: number;
    tempData: Record<UUID, PanelTempData>; // panelId -> temporary data
}

const initialState: WorkspaceSessionState = {
    focusedPanelId: null,
    zIndexMap: {},
    nextZIndex: 1,
    tempData: {},
};

const workspaceSessionSlice = createSlice({
    name: 'workspaceSession',
    initialState,
    reducers: {
        setFocusedPanel: (state, action: PayloadAction<UUID | null>) => {
            state.focusedPanelId = action.payload;
            if (action.payload) {
                state.zIndexMap[action.payload] = state.nextZIndex++;
            }
        },
        updateZIndex: (state, action: PayloadAction<UUID>) => {
            state.zIndexMap[action.payload] = state.nextZIndex++;
        },
        setTempData: (state, action: PayloadAction<{ panelId: UUID; data: PanelTempData }>) => {
            state.tempData[action.payload.panelId] = action.payload.data;
        },
        clearTempData: (state, action: PayloadAction<UUID>) => {
            delete state.tempData[action.payload];
        },
        clearAllTempData: (state) => {
            state.tempData = {};
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(updatePanels, (state, action) => {
                action.payload.forEach((panel) => {
                    if (!state.zIndexMap[panel.id]) {
                        state.zIndexMap[panel.id] = state.nextZIndex++;
                    }
                });
            })
            .addCase(deletePanels, (state, action) => {
                action.payload.forEach((panelId) => {
                    delete state.zIndexMap[panelId];
                    delete state.tempData[panelId];
                    if (state.focusedPanelId === panelId) {
                        state.focusedPanelId = null;
                    }
                });
            })
            .addCase(setActiveWorkspace, (state, action) => {
                state.focusedPanelId = null;
                state.zIndexMap = {};
                state.tempData = {};
                state.nextZIndex = 1;

                action.payload?.panels?.forEach((panel, index) => {
                    state.zIndexMap[panel.id] = index + 1;
                });
                state.nextZIndex = (action.payload?.panels?.length ?? 0) + 1;
            });
    },
});

export const { setFocusedPanel, updateZIndex, setTempData, clearTempData, clearAllTempData } =
    workspaceSessionSlice.actions;
export default workspaceSessionSlice.reducer;
