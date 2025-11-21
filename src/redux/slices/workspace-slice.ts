/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import type { UUID } from 'node:crypto';
import { EquipmentType } from '@gridsuite/commons-ui';
import type { DiagramConfigPosition } from '../../services/explore';
import { DiagramType } from '../../components/grid-layout/cards/diagrams/diagram.type';
import {
    getWindowConfig,
    DEFAULT_WINDOW_POSITION_OFFSET_MIN,
    DEFAULT_WINDOW_POSITION_OFFSET_MAX,
} from '../../components/workspace/constants/workspace.constants';
import {
    WindowType,
    type WindowData,
    type WorkspaceConfig,
    type DiagramWindowData,
} from '../../components/workspace/types/workspace.types';
import {
    createDefaultWorkspaces,
    getActiveWorkspace,
    getWorkspaceById,
    updateWindow,
} from '../../components/workspace/stores/workspace-helpers';

const STORAGE_KEY_PREFIX = 'gridstudy-workspaces';

const getStorageKey = (studyUuid: string | null) =>
    studyUuid ? `${STORAGE_KEY_PREFIX}-${studyUuid}` : STORAGE_KEY_PREFIX;

// ==================== Helper Functions ====================

/** Create a new window with default properties */
const createWindow = (
    workspace: WorkspaceConfig,
    windowType: WindowType,
    options: {
        title?: string;
        metadata?: WindowData;
        position?: { x: number; y: number };
        size?: { width: number; height: number };
    } = {}
) => {
    const config = getWindowConfig(windowType);
    const newId = uuidv4() as UUID;

    workspace.windows[newId] = {
        id: newId,
        type: windowType,
        title: options.title || config.title,
        metadata: options.metadata,
        position: options.position || config.defaultPosition,
        size: options.size || config.defaultSize,
        zIndex: workspace.nextZIndex++,
        isMinimized: false,
        isMaximized: false,
        isPinned: false,
    };
    workspace.focusedWindowId = newId;
    return newId;
};

/** Bring window to front and restore if minimized */
const bringToFront = (workspace: WorkspaceConfig, windowId: UUID) => {
    const window = workspace.windows[windowId];
    if (window) {
        workspace.focusedWindowId = windowId;
        window.zIndex = workspace.nextZIndex++;
        if (window.isMinimized) {
            window.isMinimized = false;
        }
    }
};

/** Find existing diagram window by type and ID */
const findDiagramWindow = (
    workspace: WorkspaceConfig,
    diagramType: DiagramType,
    id: string,
    excludeWindowId?: UUID
) => {
    return Object.values(workspace.windows).find((window) => {
        if (window.id === excludeWindowId || window.type !== WindowType.DIAGRAM) return false;
        const metadata = window.metadata as DiagramWindowData;
        if (diagramType === DiagramType.VOLTAGE_LEVEL) {
            return metadata.diagramType === DiagramType.VOLTAGE_LEVEL && metadata.voltageLevelId === id;
        }
        if (diagramType === DiagramType.SUBSTATION) {
            return metadata.diagramType === DiagramType.SUBSTATION && metadata.substationId === id;
        }
        return false;
    });
};

/** Get window with highest zIndex */
const getTopWindow = (workspace: WorkspaceConfig) => {
    const windows = Object.values(workspace.windows);
    if (windows.length === 0) return null;
    return windows.reduce((max, w) => (w.zIndex > max.zIndex ? w : max));
};

export const loadWorkspacesFromStorage = (studyUuid: string | null): Partial<WorkspaceState> | null => {
    try {
        const key = getStorageKey(studyUuid);
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.warn('Failed to load workspaces from storage:', error);
        return null;
    }
};

export const saveWorkspacesToStorage = (state: WorkspaceState, studyUuid: string | null) => {
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

export interface SpreadsheetTarget {
    equipmentId: string;
    equipmentType: EquipmentType;
}

export interface WorkspaceState {
    workspaces: Record<UUID, WorkspaceConfig>;
    activeWorkspaceId: UUID;
    pendingSpreadsheetTarget: SpreadsheetTarget | null;
}

const DEFAULT_WORKSPACES = createDefaultWorkspaces();
const DEFAULT_WORKSPACE_IDS = Object.keys(DEFAULT_WORKSPACES);

const initialState: WorkspaceState = {
    workspaces: DEFAULT_WORKSPACES,
    activeWorkspaceId: DEFAULT_WORKSPACE_IDS[0] as UUID,
    pendingSpreadsheetTarget: null,
};

const workspacesSlice = createSlice({
    name: 'workspace',
    initialState,
    reducers: {
        // ==================== Initialization ====================
        initializeWorkspaces: (state, action: PayloadAction<Partial<WorkspaceState>>) => {
            return { ...state, ...action.payload };
        },

        // ==================== Workspace Management ====================
        switchWorkspace: (state, action: PayloadAction<UUID>) => {
            if (getWorkspaceById(state, action.payload)) {
                state.activeWorkspaceId = action.payload;
            }
        },

        renameWorkspace: (state, action: PayloadAction<{ workspaceId: UUID; newName: string }>) => {
            const workspace = getWorkspaceById(state, action.payload.workspaceId);
            if (workspace) {
                workspace.name = action.payload.newName;
            }
        },

        clearWorkspace: (state, action: PayloadAction<UUID>) => {
            const workspace = getWorkspaceById(state, action.payload);
            if (workspace) {
                workspace.windows = {};
            }
        },

        // ==================== Window Lifecycle ====================
        toggleWindow: (state, action: PayloadAction<WindowType>) => {
            const workspace = getActiveWorkspace(state);
            const existingWindow = Object.values(workspace.windows).find((w) => w.type === action.payload);

            if (existingWindow) {
                const topWindow = getTopWindow(workspace);
                if (topWindow?.id === existingWindow.id) {
                    // Already on top, close it
                    delete workspace.windows[existingWindow.id];
                    if (workspace.focusedWindowId === existingWindow.id) {
                        workspace.focusedWindowId = null;
                    }
                } else {
                    bringToFront(workspace, existingWindow.id);
                }
            } else {
                createWindow(workspace, action.payload);
            }
        },

        openOrFocusWindow: (
            state,
            action: PayloadAction<{ windowType: WindowType; customTitle?: string; customData?: WindowData }>
        ) => {
            const { windowType, customTitle, customData } = action.payload;
            const workspace = getActiveWorkspace(state);
            const existingWindow = Object.values(workspace.windows).find((w) => w.type === windowType);

            if (existingWindow) {
                bringToFront(workspace, existingWindow.id);
            } else {
                createWindow(workspace, windowType, { title: customTitle, metadata: customData });
            }
        },

        closeWindow: (state, action: PayloadAction<UUID>) => {
            const workspace = getActiveWorkspace(state);
            delete workspace.windows[action.payload];
        },

        closeWindowsByType: (state, action: PayloadAction<WindowType>) => {
            const workspace = getActiveWorkspace(state);
            Object.entries(workspace.windows).forEach(([id, window]) => {
                if (window.type === action.payload) {
                    delete workspace.windows[id as UUID];
                }
            });
        },

        // ==================== Window State Management ====================
        focusWindow: (state, action: PayloadAction<UUID>) => {
            bringToFront(getActiveWorkspace(state), action.payload);
        },

        updateWindowPosition: (
            state,
            action: PayloadAction<{ windowId: UUID; position: { x: number; y: number } }>
        ) => {
            updateWindow(state, action.payload.windowId, (window) => {
                window.position = action.payload.position;
            });
        },

        updateWindowSize: (
            state,
            action: PayloadAction<{ windowId: UUID; size: { width: number; height: number } }>
        ) => {
            updateWindow(state, action.payload.windowId, (window) => {
                window.size = action.payload.size;
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
                if (window.isMaximized) {
                    window.isMaximized = false;
                    if (window.restorePosition) {
                        window.position = window.restorePosition;
                    }
                    if (window.restoreSize) {
                        window.size = window.restoreSize;
                    }
                } else {
                    window.isMaximized = true;
                    window.restorePosition = window.position;
                    window.restoreSize = window.size;
                    window.position = { x: 0, y: 0 };
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
            action: PayloadAction<{ windowId: UUID; metadata?: WindowData; title?: string }>
        ) => {
            updateWindow(state, action.payload.windowId, (window) => {
                if (action.payload.metadata !== undefined) {
                    window.metadata = action.payload.metadata;
                }
                if (action.payload.title !== undefined) {
                    window.title = action.payload.title;
                }
            });
        },

        // ==================== Diagram-Specific Operations ====================
        openDiagram: (state, action: PayloadAction<{ id: string; diagramType: DiagramType; extraData?: any }>) => {
            const { id, diagramType, extraData = {} } = action.payload;
            const workspace = getActiveWorkspace(state);

            // Check for existing diagram (prevent duplicates for VL/Substation)
            if (diagramType === DiagramType.VOLTAGE_LEVEL || diagramType === DiagramType.SUBSTATION) {
                const existingWindow = findDiagramWindow(workspace, diagramType, id);
                if (existingWindow) {
                    bringToFront(workspace, existingWindow.id);
                    return;
                }
            }

            // Build metadata based on diagram type
            let metadata: DiagramWindowData;
            switch (diagramType) {
                case DiagramType.VOLTAGE_LEVEL:
                    metadata = { diagramType, voltageLevelId: id, ...extraData };
                    break;
                case DiagramType.SUBSTATION:
                    metadata = { diagramType, substationId: id, ...extraData };
                    break;
                case DiagramType.NETWORK_AREA_DIAGRAM:
                    metadata = { diagramType, ...extraData };
                    break;
                default:
                    return;
            }

            // Create window with randomized position
            const position = {
                x: DEFAULT_WINDOW_POSITION_OFFSET_MIN + Math.random() * DEFAULT_WINDOW_POSITION_OFFSET_MAX,
                y: DEFAULT_WINDOW_POSITION_OFFSET_MIN + Math.random() * (DEFAULT_WINDOW_POSITION_OFFSET_MAX / 2),
            };

            createWindow(workspace, WindowType.DIAGRAM, { title: id, metadata, position });
        },

        replaceNadConfig: (
            state,
            action: PayloadAction<{ windowId: UUID; nadConfigUuid?: UUID; filterUuid?: UUID }>
        ) => {
            updateWindow(state, action.payload.windowId, (window) => {
                if (window.type === WindowType.DIAGRAM && window.metadata) {
                    const diagramMetadata = window.metadata as DiagramWindowData;
                    window.metadata = {
                        ...diagramMetadata,
                        nadConfigUuid: action.payload.nadConfigUuid,
                        filterUuid: action.payload.filterUuid,
                        savedWorkspaceConfigUuid: undefined, // Clear saved config when loading new
                    };
                }
            });
        },

        navigateDiagram: (state, action: PayloadAction<{ windowId: UUID; id: string; diagramType: DiagramType }>) => {
            const { windowId, id, diagramType } = action.payload;
            const workspace = getActiveWorkspace(state);

            // Check if another window already has this diagram
            if (diagramType === DiagramType.VOLTAGE_LEVEL || diagramType === DiagramType.SUBSTATION) {
                const existingWindow = findDiagramWindow(workspace, diagramType, id, windowId);
                if (existingWindow) {
                    bringToFront(workspace, existingWindow.id);
                    return;
                }
            }

            // Update current window's metadata
            updateWindow(state, windowId, (window) => {
                if (window.type === WindowType.DIAGRAM) {
                    window.metadata = {
                        diagramType,
                        voltageLevelId: diagramType === DiagramType.VOLTAGE_LEVEL ? id : undefined,
                        substationId: diagramType === DiagramType.SUBSTATION ? id : undefined,
                    };
                }
            });
        },

        // ==================== Spreadsheet-Specific Operations ====================
        showInSpreadsheet: (state, action: PayloadAction<{ equipmentId: string; equipmentType: EquipmentType }>) => {
            const workspace = getActiveWorkspace(state);
            const existingWindow = Object.values(workspace.windows).find((w) => w.type === WindowType.SPREADSHEET);

            if (existingWindow) {
                bringToFront(workspace, existingWindow.id);
            } else {
                createWindow(workspace, WindowType.SPREADSHEET);
            }

            state.pendingSpreadsheetTarget = {
                equipmentId: action.payload.equipmentId,
                equipmentType: action.payload.equipmentType,
            };
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
    openDiagram,
    navigateDiagram,
    replaceNadConfig,
    // Spreadsheet Operations
    showInSpreadsheet,
    consumeSpreadsheetTarget,
} = workspacesSlice.actions;

export default workspacesSlice.reducer;
