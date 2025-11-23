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
import { PanelType, type WorkspacesState, type PanelMetadata } from '../../components/workspace/types/workspace.types';
import {
    createDefaultWorkspaces,
    getActiveWorkspace,
    updatePanel,
    createPanel,
    bringToFront,
    findDiagramPanel,
    findAndFocusPanel,
    deletePanel,
    createSLDPanelMetadata,
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
            Object.keys(workspace.panels).forEach((id) => deletePanel(workspace, id as UUID));
        },

        // ==================== Panel Lifecycle ====================
        togglePanel: (state, action: PayloadAction<PanelType>) => {
            const workspace = getActiveWorkspace(state);
            const existingPanel = Object.values(workspace.panels).find((p) => p.type === action.payload);

            if (existingPanel) {
                workspace.focusedPanelId === existingPanel.id
                    ? deletePanel(workspace, existingPanel.id)
                    : bringToFront(workspace, existingPanel.id);
            } else {
                createPanel(workspace, action.payload);
            }
        },

        openOrFocusPanel: (
            state,
            action: PayloadAction<{ panelType: PanelType; customTitle?: string; customData?: PanelMetadata }>
        ) => {
            const { panelType, customTitle, customData } = action.payload;
            const workspace = getActiveWorkspace(state);

            if (!findAndFocusPanel(workspace, panelType)) {
                createPanel(workspace, panelType, { title: customTitle, metadata: customData });
            }
        },

        closePanel: (state, action: PayloadAction<UUID>) => {
            const workspace = getActiveWorkspace(state);
            deletePanel(workspace, action.payload);
        },

        closePanelsByType: (state, action: PayloadAction<PanelType>) => {
            const workspace = getActiveWorkspace(state);
            Object.values(workspace.panels)
                .filter((panel) => panel.type === action.payload)
                .forEach((panel) => deletePanel(workspace, panel.id));
        },

        // ==================== Panel State Management ====================
        focusPanel: (state, action: PayloadAction<UUID>) => {
            bringToFront(getActiveWorkspace(state), action.payload);
        },

        updatePanelPosition: (state, action: PayloadAction<{ panelId: UUID; position: { x: number; y: number } }>) => {
            const { panelId, position } = action.payload;
            updatePanel(state, panelId, (panel) => {
                panel.position = position;
            });
        },

        updatePanelSize: (state, action: PayloadAction<{ panelId: UUID; size: { width: number; height: number } }>) => {
            const { panelId, size } = action.payload;
            updatePanel(state, panelId, (panel) => {
                panel.size = size;
            });
        },

        snapPanel: (
            state,
            action: PayloadAction<{ panelId: UUID; rect: { x: number; y: number; width: number; height: number } }>
        ) => {
            const { panelId, rect } = action.payload;
            updatePanel(state, panelId, (panel) => {
                panel.position = { x: rect.x, y: rect.y };
                panel.size = { width: rect.width, height: rect.height };
            });
        },

        toggleMinimize: (state, action: PayloadAction<UUID>) => {
            updatePanel(state, action.payload, (panel) => {
                panel.isMinimized = !panel.isMinimized;
            });
        },

        toggleMaximize: (state, action: PayloadAction<UUID>) => {
            updatePanel(state, action.payload, (panel) => {
                panel.isMaximized = !panel.isMaximized;
                if (panel.isMaximized) {
                    panel.restorePosition = panel.position;
                    panel.restoreSize = panel.size;
                    panel.position = { x: 0, y: 0 };
                } else {
                    panel.position = panel.restorePosition ?? panel.position;
                    panel.size = panel.restoreSize ?? panel.size;
                }
            });
        },

        togglePin: (state, action: PayloadAction<UUID>) => {
            updatePanel(state, action.payload, (panel) => {
                panel.isPinned = !panel.isPinned;
            });
        },

        updatePanelMetadata: (
            state,
            action: PayloadAction<{ panelId: UUID; metadata?: PanelMetadata; title?: string }>
        ) => {
            const { panelId, metadata, title } = action.payload;
            updatePanel(state, panelId, (panel) => {
                if (metadata !== undefined) panel.metadata = metadata;
                if (title !== undefined) panel.title = title;
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
            const existingPanel = findDiagramPanel(workspace, diagramType, id);

            if (existingPanel) {
                bringToFront(workspace, existingPanel.id);
            } else {
                createPanel(workspace, PanelType.SLD, {
                    title: id,
                    metadata: createSLDPanelMetadata(id, diagramType),
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
            createPanel(getActiveWorkspace(state), PanelType.NAD, {
                title: name,
                metadata: { nadConfigUuid, filterUuid, initialVoltageLevelIds },
            });
        },

        navigateSLD: (state, action: PayloadAction<{ panelId: UUID; id: string; diagramType: DiagramType }>) => {
            const { panelId, id, diagramType } = action.payload;
            const workspace = getActiveWorkspace(state);

            // Check if another panel already has this diagram
            const existingPanel = findDiagramPanel(workspace, diagramType, id, panelId);
            if (existingPanel) {
                bringToFront(workspace, existingPanel.id);
                return;
            }

            // Update current SLD panel
            updatePanel(state, panelId, (panel) => {
                panel.title = id;
                panel.metadata = createSLDPanelMetadata(id, diagramType);
            });
        },

        // ==================== Spreadsheet-Specific Operations ====================
        showInSpreadsheet: (state, action: PayloadAction<{ equipmentId: string; equipmentType: EquipmentType }>) => {
            const workspace = getActiveWorkspace(state);
            if (!findAndFocusPanel(workspace, PanelType.SPREADSHEET)) {
                createPanel(workspace, PanelType.SPREADSHEET);
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
    // Panel Lifecycle
    togglePanel,
    openOrFocusPanel,
    closePanel,
    closePanelsByType,
    // Panel State Management
    focusPanel,
    updatePanelPosition,
    updatePanelSize,
    snapPanel,
    toggleMinimize,
    toggleMaximize,
    togglePin,
    updatePanelMetadata,
    // Diagram Operations
    openSLD,
    openNAD,
    navigateSLD,
    // Spreadsheet Operations
    showInSpreadsheet,
    consumeSpreadsheetTarget,
} = workspacesSlice.actions;

export default workspacesSlice.reducer;
