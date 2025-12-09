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
    type NADPanelMetadata,
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
    closeOrHidePanel,
} from './workspace-helpers';
import { NAD_SLD_CONSTANTS } from '../../components/workspace/panel-contents/diagrams/nad/constants';

const DEFAULT_WORKSPACES = createDefaultWorkspaces();

const initialState: WorkspacesState = {
    workspaces: DEFAULT_WORKSPACES,
    activeWorkspaceId: DEFAULT_WORKSPACES[0].id,
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
            const workspace = state.workspaces.find((w) => w.id === action.payload.workspaceId);
            if (workspace) {
                workspace.name = action.payload.newName;
            }
        },

        clearWorkspace: (state, action: PayloadAction<UUID>) => {
            const workspace = state.workspaces.find((w) => w.id === action.payload);
            if (workspace) {
                Object.keys(workspace.panels).forEach((id) => deletePanel(workspace, id as UUID));
            }
        },

        // ==================== Panel Lifecycle ====================
        togglePanel: (state, action: PayloadAction<PanelType>) => {
            const workspace = getActiveWorkspace(state);
            const existingPanel = Object.values(workspace.panels).find((p) => p.type === action.payload);

            if (existingPanel) {
                if (existingPanel.isClosed) {
                    existingPanel.isClosed = false;
                    bringToFront(workspace, existingPanel.id);
                } else if (workspace.focusedPanelId === existingPanel.id) {
                    closeOrHidePanel(workspace, existingPanel.id);
                } else {
                    bringToFront(workspace, existingPanel.id);
                }
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
            closeOrHidePanel(workspace, action.payload);
        },

        closePanelsByType: (state, action: PayloadAction<PanelType>) => {
            const workspace = getActiveWorkspace(state);
            Object.values(workspace.panels)
                .filter((panel) => panel.type === action.payload)
                .forEach((panel) => closeOrHidePanel(workspace, panel.id));
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
                    ...currentMetadata,
                    diagramId: voltageLevelId,
                    navigationHistory: updatedHistory,
                };
            });
        },

        // Add voltage level to NAD panel navigation history
        addToNadNavigationHistory: (state, action: PayloadAction<{ panelId: UUID; voltageLevelId: string }>) => {
            const { panelId, voltageLevelId } = action.payload;

            updatePanel(state, panelId, (panel) => {
                const metadata = panel.metadata as NADPanelMetadata;
                const currentHistory = metadata.navigationHistory || [];
                if (currentHistory.includes(voltageLevelId)) {
                    return;
                }

                // Add new voltage level to the end
                const updatedHistory = [...currentHistory, voltageLevelId];
                // Keep only the last N items based on configured max
                const limitedHistory = updatedHistory.slice(-NAD_SLD_CONSTANTS.MAX_NAVIGATION_HISTORY);

                panel.metadata = {
                    ...metadata,
                    navigationHistory: limitedHistory,
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

        // ==================== Panel Association Operations ====================
        associateSldToNad: (state, action: PayloadAction<{ sldPanelId: UUID; nadPanelId: UUID }>) => {
            const { sldPanelId, nadPanelId } = action.payload;

            // Update SLD panel metadata to reference NAD and close it
            updatePanel(state, sldPanelId, (panel) => {
                const metadata = panel.metadata as SLDPanelMetadata;
                panel.metadata = {
                    ...metadata,
                    associatedToNadPanel: nadPanelId,
                };
                panel.isClosed = true;
            });

            // Update NAD panel metadata to include SLD in associated list (prevent duplicates)
            updatePanel(state, nadPanelId, (panel) => {
                const metadata = panel.metadata as NADPanelMetadata;
                const associatedPanels = metadata.associatedVoltageLevelPanels || [];
                // Only add if not already associated
                if (!associatedPanels.includes(sldPanelId)) {
                    panel.metadata = {
                        ...metadata,
                        associatedVoltageLevelPanels: [...associatedPanels, sldPanelId],
                    };
                }
            });
        },

        dissociateSldFromNad: (state, action: PayloadAction<UUID>) => {
            const sldPanelId = action.payload;
            const workspace = getActiveWorkspace(state);
            const sldPanel = workspace.panels[sldPanelId];

            if (sldPanel) {
                const metadata = sldPanel.metadata as SLDPanelMetadata;
                const nadPanelId = metadata.associatedToNadPanel;

                // Remove from NAD panel's associated list
                if (nadPanelId && workspace.panels[nadPanelId]) {
                    updatePanel(state, nadPanelId, (panel) => {
                        const nadMetadata = panel.metadata as NADPanelMetadata;
                        panel.metadata = {
                            ...nadMetadata,
                            associatedVoltageLevelPanels: (nadMetadata.associatedVoltageLevelPanels || []).filter(
                                (id) => id !== sldPanelId
                            ),
                        };
                    });
                }

                // Update SLD panel to remove association reference and restore visibility
                updatePanel(state, sldPanelId, (panel) => {
                    const sldMetadata = panel.metadata as SLDPanelMetadata;
                    panel.metadata = {
                        ...sldMetadata,
                        associatedToNadPanel: null,
                    };
                    panel.isClosed = false;
                    // Update orderIndex to place at end of dock
                    panel.orderIndex = workspace.nextOrderIndex++;
                });

                // Bring the dissociated SLD panel to front
                bringToFront(workspace, sldPanelId);
            }
        },

        createNadAndAssociateSld: (
            state,
            action: PayloadAction<{ sldPanelId: UUID; voltageLevelId: string; voltageLevelName: string }>
        ) => {
            const { sldPanelId, voltageLevelId, voltageLevelName } = action.payload;
            const workspace = getActiveWorkspace(state);
            const sldPanel = workspace.panels[sldPanelId];

            // Create NAD panel with the voltage level, using SLD's position and size
            const nadPanelId = createPanel(workspace, PanelType.NAD, {
                title: voltageLevelName,
                metadata: {
                    initialVoltageLevelIds: [voltageLevelId],
                    associatedVoltageLevelPanels: [sldPanelId],
                },
                position: sldPanel ? { ...sldPanel.position } : undefined,
                size: sldPanel ? { ...sldPanel.size } : undefined,
            });

            // Update SLD panel to reference the new NAD and close it
            updatePanel(state, sldPanelId, (panel) => {
                const metadata = panel.metadata as SLDPanelMetadata;
                panel.metadata = {
                    ...metadata,
                    associatedToNadPanel: nadPanelId,
                };
                panel.isClosed = true;
            });
        },

        openSldAndAssociateToNad: (state, action: PayloadAction<{ voltageLevelId: string; nadPanelId: UUID }>) => {
            const { voltageLevelId, nadPanelId } = action.payload;
            const workspace = getActiveWorkspace(state);
            const nadPanel = workspace.panels[nadPanelId];

            if (!nadPanel) return;

            const nadMetadata = nadPanel.metadata as NADPanelMetadata;
            const associatedPanelIds = nadMetadata.associatedVoltageLevelPanels || [];

            const existingAssociatedPanelId = associatedPanelIds.find((associatedPanelId) => {
                const panel = workspace.panels[associatedPanelId];
                const sldMetadata = panel?.metadata as SLDPanelMetadata | undefined;
                return sldMetadata?.diagramId === voltageLevelId;
            });

            if (existingAssociatedPanelId) {
                return;
            }

            // Create a new SLD panel
            const metadata: SLDPanelMetadata = {
                diagramId: voltageLevelId,
                navigationHistory: [],
            };

            const sldPanelId = createPanel(workspace, PanelType.SLD_VOLTAGE_LEVEL, {
                title: voltageLevelId,
                metadata,
            });

            // Update SLD panel to reference NAD and close it
            updatePanel(state, sldPanelId, (panel) => {
                const metadata = panel.metadata as SLDPanelMetadata;
                panel.metadata = {
                    ...metadata,
                    associatedToNadPanel: nadPanelId,
                };
                panel.isClosed = true;
            });

            // Update NAD panel metadata to include SLD in associated list
            updatePanel(state, nadPanelId, (panel) => {
                const metadata = panel.metadata as NADPanelMetadata;
                const associatedPanels = metadata.associatedVoltageLevelPanels || [];
                panel.metadata = {
                    ...metadata,
                    associatedVoltageLevelPanels: [...associatedPanels, sldPanelId],
                };
            });
        },

        closeAllAssociatedSlds: (state, action: PayloadAction<UUID>) => {
            const nadPanelId = action.payload;
            const workspace = getActiveWorkspace(state);
            const nadPanel = workspace.panels[nadPanelId];

            if (!nadPanel) return;

            const nadMetadata = nadPanel.metadata as NADPanelMetadata;
            const associatedPanelIds = nadMetadata.associatedVoltageLevelPanels || [];

            // Delete all associated SLD panels
            associatedPanelIds.forEach((sldPanelId) => {
                deletePanel(workspace, sldPanelId);
            });

            // Clear the associated panels array in NAD metadata
            updatePanel(state, nadPanelId, (panel) => {
                const metadata = panel.metadata as NADPanelMetadata;
                panel.metadata = {
                    ...metadata,
                    associatedVoltageLevelPanels: [],
                };
            });
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
    closeAllAssociatedSlds,
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
    addToNadNavigationHistory,
    // Spreadsheet Operations
    showInSpreadsheet,
    // Panel Association Operations
    associateSldToNad,
    dissociateSldFromNad,
    createNadAndAssociateSld,
    openSldAndAssociateToNad,
} = workspacesSlice.actions;

export default workspacesSlice.reducer;
