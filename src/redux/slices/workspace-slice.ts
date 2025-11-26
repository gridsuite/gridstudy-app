/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UUID } from 'node:crypto';
import { EquipmentType } from '@gridsuite/commons-ui';
import {
    PanelType,
    type WorkspacesState,
    type PanelMetadata,
    type SLDPanelMetadata,
} from '../../components/workspace/types/workspace.types';
import {
    createDefaultWorkspaces,
    getActiveWorkspace,
    updatePanel,
    createPanel,
    bringToFront,
    findDiagramPanel,
    findAndFocusPanel,
    deletePanel,
} from './workspace-helpers';

const DEFAULT_WORKSPACES = createDefaultWorkspaces();
const DEFAULT_WORKSPACE_IDS = Object.keys(DEFAULT_WORKSPACES);

const initialState: WorkspacesState = {
    workspaces: DEFAULT_WORKSPACES,
    activeWorkspaceId: DEFAULT_WORKSPACE_IDS[0] as UUID,
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

        updatePanelPositionAndSize: (
            state,
            action: PayloadAction<{
                panelId: UUID;
                position: { x: number; y: number };
                size: { width: number; height: number };
            }>
        ) => {
            const { panelId, position, size } = action.payload;
            updatePanel(state, panelId, (panel) => {
                panel.position = position;
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
                if (metadata !== undefined) panel.metadata = { ...panel.metadata, ...metadata };
                if (title !== undefined) panel.title = title;
            });
        },

        // ==================== Diagram-Specific Operations ====================
        openSLD: (
            state,
            action: PayloadAction<{
                id: string;
                panelType: PanelType.SLD_VOLTAGE_LEVEL | PanelType.SLD_SUBSTATION;
            }>
        ) => {
            const { id, panelType } = action.payload;
            const workspace = getActiveWorkspace(state);
            const existingPanel = findDiagramPanel(workspace, panelType, id);

            if (existingPanel) {
                bringToFront(workspace, existingPanel.id);
            } else {
                const metadata: SLDPanelMetadata = {
                    diagramId: id,
                    navigationHistory: panelType === PanelType.SLD_VOLTAGE_LEVEL ? [] : undefined,
                };

                createPanel(workspace, panelType, {
                    title: id,
                    metadata,
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

        navigateSLD: (
            state,
            action: PayloadAction<{ panelId: UUID; voltageLevelId: string; skipHistory?: boolean }>
        ) => {
            const { panelId, voltageLevelId, skipHistory } = action.payload;

            // Navigate within voltage level panel (substations open new windows via openSLD)
            updatePanel(state, panelId, (panel) => {
                const currentMetadata = panel.metadata as SLDPanelMetadata;
                const history = currentMetadata.navigationHistory || [];

                // Add current voltage level to history if:
                // 1. Not skipping history (navigating from history itself)
                // 2. Navigating to a different voltage level
                // 3. Current voltage level is not already at the first position in history
                const shouldAddToHistory =
                    !skipHistory &&
                    currentMetadata.diagramId !== voltageLevelId &&
                    history[0] !== currentMetadata.diagramId;

                const updatedHistory = shouldAddToHistory
                    ? [currentMetadata.diagramId, ...history].slice(0, 10)
                    : history;

                panel.title = voltageLevelId;
                panel.metadata = {
                    diagramId: voltageLevelId,
                    navigationHistory: updatedHistory,
                };
            });
        },

        // ==================== Spreadsheet-Specific Operations ====================
        showInSpreadsheet: (state, action: PayloadAction<{ equipmentId: string; equipmentType: EquipmentType }>) => {
            const workspace = getActiveWorkspace(state);
            const spreadsheetPanelExists = findAndFocusPanel(workspace, PanelType.SPREADSHEET);

            if (spreadsheetPanelExists) {
                // Update existing spreadsheet panel metadata
                const panel = Object.values(workspace.panels).find((p) => p.type === PanelType.SPREADSHEET);
                if (panel) {
                    panel.metadata = {
                        targetEquipmentId: action.payload.equipmentId,
                        targetEquipmentType: action.payload.equipmentType,
                    };
                }
            } else {
                // Create new spreadsheet panel with target equipment in metadata
                createPanel(workspace, PanelType.SPREADSHEET, {
                    metadata: {
                        targetEquipmentId: action.payload.equipmentId,
                        targetEquipmentType: action.payload.equipmentType,
                    },
                });
            }
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
    updatePanelPositionAndSize,
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
} = workspacesSlice.actions;

export default workspacesSlice.reducer;
