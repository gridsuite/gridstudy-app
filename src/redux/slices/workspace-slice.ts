/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UUID } from 'node:crypto';
import { EquipmentType } from '@gridsuite/commons-ui';
import { DiagramType } from '../../components/grid-layout/cards/diagrams/diagram.type';
import {
    WindowType,
    type WorkspacesState,
    type WindowMetadata,
} from '../../components/workspace/types/workspace.types';
import {
    createDefaultWorkspaces,
    getActiveWorkspace,
    updateWindow,
    createWindow,
    bringToFront,
    findDiagramWindow,
    findAndFocusWindow,
    deleteWindow,
    createSLDMetadata,
} from './workspace-helpers';

const STORAGE_KEY_PREFIX = 'gridstudy-workspaces';

const getStorageKey = (studyUuid: string | null) =>
    studyUuid ? `${STORAGE_KEY_PREFIX}-${studyUuid}` : STORAGE_KEY_PREFIX;

export const loadWorkspacesFromStorage = (studyUuid: string | null): Partial<WorkspacesState> | null => {
    try {
        const key = getStorageKey(studyUuid);
        const data = localStorage.getItem(key);
        return data ? (JSON.parse(data) as Partial<WorkspacesState>) : null;
    } catch (error) {
        console.warn('Failed to load workspaces from storage:', error);
        return null;
    }
};

export const saveWorkspacesToStorage = (state: WorkspacesState, studyUuid: string | null) => {
    try {
        const key = getStorageKey(studyUuid);
        localStorage.setItem(
            key,
            JSON.stringify({
                workspaces: state.workspaces,
                activeWorkspaceId: state.activeWorkspaceId,
            })
        );
    } catch (error) {
        console.warn('Failed to save workspaces to storage:', error);
    }
};

const DEFAULT_WORKSPACES = createDefaultWorkspaces();
const DEFAULT_WORKSPACE_IDS = Object.keys(DEFAULT_WORKSPACES);

const initialState: WorkspacesState = {
    workspaces: DEFAULT_WORKSPACES,
    activeWorkspaceId: DEFAULT_WORKSPACE_IDS[0] as UUID,
    pendingSpreadsheetTarget: null,
};

const workspacesSlice = createSlice({
    name: 'workspace',
    initialState,
    reducers: {
        // ==================== Initialization ====================
        initializeWorkspaces: (state, action: PayloadAction<Partial<WorkspacesState>>) => {
            return { ...state, ...action.payload };
        },

        // ==================== Workspace Management ====================
        switchWorkspace: (state, action: PayloadAction<UUID>) => {
            state.activeWorkspaceId = action.payload;
        },

        renameWorkspace: (state, action: PayloadAction<{ workspaceId: UUID; newName: string }>) => {
            state.workspaces[action.payload.workspaceId].name = action.payload.newName;
        },

        clearWorkspace: (state, action: PayloadAction<UUID>) => {
            const workspace = state.workspaces[action.payload];
            Object.keys(workspace.windows).forEach((id) => deleteWindow(workspace, id as UUID));
        },

        // ==================== Window Lifecycle ====================
        toggleWindow: (state, action: PayloadAction<WindowType>) => {
            const workspace = getActiveWorkspace(state);
            const existingWindow = Object.values(workspace.windows).find((w) => w.type === action.payload);

            if (existingWindow) {
                workspace.focusedWindowId === existingWindow.id
                    ? deleteWindow(workspace, existingWindow.id)
                    : bringToFront(workspace, existingWindow.id);
            } else {
                createWindow(workspace, action.payload);
            }
        },

        openOrFocusWindow: (
            state,
            action: PayloadAction<{ windowType: WindowType; customTitle?: string; customData?: WindowMetadata }>
        ) => {
            const { windowType, customTitle, customData } = action.payload;
            const workspace = getActiveWorkspace(state);

            if (!findAndFocusWindow(workspace, windowType)) {
                createWindow(workspace, windowType, { title: customTitle, metadata: customData });
            }
        },

        closeWindow: (state, action: PayloadAction<UUID>) => {
            const workspace = getActiveWorkspace(state);
            deleteWindow(workspace, action.payload);
        },

        closeWindowsByType: (state, action: PayloadAction<WindowType>) => {
            const workspace = getActiveWorkspace(state);
            Object.values(workspace.windows)
                .filter((window) => window.type === action.payload)
                .forEach((window) => deleteWindow(workspace, window.id));
        },

        // ==================== Window State Management ====================
        focusWindow: (state, action: PayloadAction<UUID>) => {
            bringToFront(getActiveWorkspace(state), action.payload);
        },

        updateWindowPosition: (
            state,
            action: PayloadAction<{ windowId: UUID; position: { x: number; y: number } }>
        ) => {
            const { windowId, position } = action.payload;
            updateWindow(state, windowId, (window) => {
                window.position = position;
            });
        },

        updateWindowSize: (
            state,
            action: PayloadAction<{ windowId: UUID; size: { width: number; height: number } }>
        ) => {
            const { windowId, size } = action.payload;
            updateWindow(state, windowId, (window) => {
                window.size = size;
            });
        },

        snapWindow: (
            state,
            action: PayloadAction<{ windowId: UUID; rect: { x: number; y: number; width: number; height: number } }>
        ) => {
            const { windowId, rect } = action.payload;
            updateWindow(state, windowId, (window) => {
                window.position = { x: rect.x, y: rect.y };
                window.size = { width: rect.width, height: rect.height };
            });
        },

        toggleMinimize: (state, action: PayloadAction<UUID>) => {
            updateWindow(state, action.payload, (window) => {
                window.isMinimized = !window.isMinimized;
            });
        },

        toggleMaximize: (state, action: PayloadAction<UUID>) => {
            updateWindow(state, action.payload, (window) => {
                window.isMaximized = !window.isMaximized;
                if (window.isMaximized) {
                    window.restorePosition = window.position;
                    window.restoreSize = window.size;
                    window.position = { x: 0, y: 0 };
                } else {
                    window.position = window.restorePosition ?? window.position;
                    window.size = window.restoreSize ?? window.size;
                }
            });
        },

        togglePin: (state, action: PayloadAction<UUID>) => {
            updateWindow(state, action.payload, (window) => {
                window.isPinned = !window.isPinned;
            });
        },

        updateWindowMetadata: (
            state,
            action: PayloadAction<{ windowId: UUID; metadata?: WindowMetadata; title?: string }>
        ) => {
            const { windowId, metadata, title } = action.payload;
            updateWindow(state, windowId, (window) => {
                if (metadata !== undefined) window.metadata = metadata;
                if (title !== undefined) window.title = title;
            });
        },

        // ==================== Diagram-Specific Operations ====================
        openSLD: (
            state,
            action: PayloadAction<{
                id: string;
                diagramType: DiagramType.VOLTAGE_LEVEL | DiagramType.SUBSTATION;
            }>
        ) => {
            const { id, diagramType } = action.payload;
            const workspace = getActiveWorkspace(state);
            const existingWindow = findDiagramWindow(workspace, diagramType, id);

            if (existingWindow) {
                bringToFront(workspace, existingWindow.id);
            } else {
                createWindow(workspace, WindowType.SLD, {
                    title: id,
                    metadata: createSLDMetadata(id, diagramType),
                });
            }
        },

        openNAD: (
            state,
            action: PayloadAction<{
                name: string;
                nadConfigUuid?: UUID;
                filterUuid?: UUID;
                initialVoltageLevelIds?: string[];
            }>
        ) => {
            const { name, nadConfigUuid, filterUuid, initialVoltageLevelIds } = action.payload;
            createWindow(getActiveWorkspace(state), WindowType.NAD, {
                title: name,
                metadata: { nadConfigUuid, filterUuid, initialVoltageLevelIds },
            });
        },

        navigateSLD: (state, action: PayloadAction<{ windowId: UUID; id: string; diagramType: DiagramType }>) => {
            const { windowId, id, diagramType } = action.payload;
            const workspace = getActiveWorkspace(state);

            // Check if another window already has this diagram
            const existingWindow = findDiagramWindow(workspace, diagramType, id, windowId);
            if (existingWindow) {
                bringToFront(workspace, existingWindow.id);
                return;
            }

            // Update current SLD window
            updateWindow(state, windowId, (window) => {
                window.title = id;
                window.metadata = createSLDMetadata(id, diagramType);
            });
        },

        // ==================== Spreadsheet-Specific Operations ====================
        showInSpreadsheet: (state, action: PayloadAction<{ equipmentId: string; equipmentType: EquipmentType }>) => {
            const workspace = getActiveWorkspace(state);
            if (!findAndFocusWindow(workspace, WindowType.SPREADSHEET)) {
                createWindow(workspace, WindowType.SPREADSHEET);
            }
            state.pendingSpreadsheetTarget = action.payload;
        },

        consumeSpreadsheetTarget: (state) => {
            state.pendingSpreadsheetTarget = null;
        },
    },
});

export const {
    // Initialization
    initializeWorkspaces,
    // Workspace Management
    switchWorkspace,
    renameWorkspace,
    clearWorkspace,
    // Window Lifecycle
    toggleWindow,
    openOrFocusWindow,
    closeWindow,
    closeWindowsByType,
    // Window State Management
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
    snapWindow,
    toggleMinimize,
    toggleMaximize,
    togglePin,
    updateWindowMetadata,
    // Diagram Operations
    openSLD,
    openNAD,
    navigateSLD,
    // Spreadsheet Operations
    showInSpreadsheet,
    consumeSpreadsheetTarget,
} = workspacesSlice.actions;

export default workspacesSlice.reducer;
