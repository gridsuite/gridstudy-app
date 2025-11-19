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
import { getWindowConfig } from '../../components/workspace/constants/workspace.constants';
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

export interface SpreadsheetTarget {
    equipmentId: string;
    equipmentType: EquipmentType;
    timestamp: number;
}

export interface WorkspaceState {
    workspaces: WorkspaceConfig[];
    activeWorkspaceId: string;
    pendingSpreadsheetTarget: SpreadsheetTarget | null;
}

const DEFAULT_WORKSPACES = createDefaultWorkspaces();

const initialState: WorkspaceState = {
    workspaces: DEFAULT_WORKSPACES,
    activeWorkspaceId: DEFAULT_WORKSPACES[0].id,
    pendingSpreadsheetTarget: null,
};

const workspaceSlice = createSlice({
    name: 'workspace',
    initialState,
    reducers: {
        openWindow: (
            state,
            action: PayloadAction<{
                windowId: string;
                windowType: WindowType;
                title: string;
                data?: WindowData;
            }>
        ) => {
            const { windowId, windowType, title, data } = action.payload;
            const workspace = getActiveWorkspace(state);
            const config = getWindowConfig(windowType);

            workspace.windows[windowId] = {
                id: windowId,
                type: windowType,
                title,
                data,
                position: config.defaultPosition,
                size: config.defaultSize,
                zIndex: workspace.nextZIndex++,
                isMinimized: false,
                isMaximized: false,
                isPinned: false,
            };
            workspace.focusedWindowId = windowId;
        },

        closeWindow: (state, action: PayloadAction<string>) => {
            const workspace = getActiveWorkspace(state);
            delete workspace.windows[action.payload];
        },

        closeWindowsByType: (state, action: PayloadAction<WindowType>) => {
            const workspace = getActiveWorkspace(state);
            Object.entries(workspace.windows).forEach(([id, window]) => {
                if (window.type === action.payload) {
                    delete workspace.windows[id];
                }
            });
        },

        updateWindowData: (state, action: PayloadAction<{ windowId: string; data: WindowData }>) => {
            updateWindow(state, action.payload.windowId, (window) => {
                window.data = action.payload.data;
            });
        },

        updateWindowTitle: (state, action: PayloadAction<{ windowId: string; title: string }>) => {
            updateWindow(state, action.payload.windowId, (window) => {
                window.title = action.payload.title;
            });
        },

        switchWorkspace: (state, action: PayloadAction<string>) => {
            if (getWorkspaceById(state, action.payload)) {
                state.activeWorkspaceId = action.payload;
            }
        },

        renameWorkspace: (state, action: PayloadAction<{ workspaceId: string; newName: string }>) => {
            const workspace = getWorkspaceById(state, action.payload.workspaceId);
            if (workspace) {
                workspace.name = action.payload.newName;
            }
        },

        clearWorkspace: (state, action: PayloadAction<string>) => {
            const workspace = getWorkspaceById(state, action.payload);
            if (workspace) {
                workspace.workspace.windows = {};
            }
        },

        toggleWindow: (state, action: PayloadAction<WindowType>) => {
            const workspace = getActiveWorkspace(state);
            const existingWindows = Object.values(workspace.windows).filter((w) => w.type === action.payload);

            if (existingWindows.length > 0) {
                Object.entries(workspace.windows).forEach(([id, window]) => {
                    if (window.type === action.payload) {
                        delete workspace.windows[id];
                    }
                });
            } else {
                const config = getWindowConfig(action.payload);
                const newId = uuidv4();

                workspace.windows[newId] = {
                    id: newId,
                    type: action.payload,
                    title: config.title,
                    position: config.defaultPosition,
                    size: config.defaultSize,
                    zIndex: workspace.nextZIndex++,
                    isMinimized: false,
                    isMaximized: false,
                    isPinned: false,
                };
                workspace.focusedWindowId = newId;
            }
        },

        openOrFocusWindow: (
            state,
            action: PayloadAction<{ windowType: WindowType; customTitle?: string; customData?: WindowData }>
        ) => {
            const { windowType, customTitle, customData } = action.payload;
            const workspace = getActiveWorkspace(state);
            const existingWindow = Object.values(workspace.windows).find((w) => w.type === windowType);

            if (!existingWindow) {
                const config = getWindowConfig(windowType);
                const newId = uuidv4();

                workspace.windows[newId] = {
                    id: newId,
                    type: windowType,
                    title: customTitle || config.title,
                    data: customData,
                    position: config.defaultPosition,
                    size: config.defaultSize,
                    zIndex: workspace.nextZIndex++,
                    isMinimized: false,
                    isMaximized: false,
                    isPinned: false,
                };
                workspace.focusedWindowId = newId;
            } else {
                workspace.focusedWindowId = existingWindow.id;
                existingWindow.zIndex = workspace.nextZIndex++;
            }
        },

        openDiagram: (state, action: PayloadAction<{ id: string; diagramType: DiagramType; extraData?: any }>) => {
            const { id, diagramType, extraData = {} } = action.payload;
            const config = getWindowConfig(WindowType.DIAGRAM);
            let data: DiagramWindowData;

            switch (diagramType) {
                case DiagramType.VOLTAGE_LEVEL:
                    data = { diagramType, voltageLevelId: id, ...extraData };
                    break;
                case DiagramType.SUBSTATION:
                    data = { diagramType, substationId: id, ...extraData };
                    break;
                case DiagramType.NETWORK_AREA_DIAGRAM:
                    data = {
                        diagramType,
                        name: '',
                        voltageLevelIds: [id],
                        voltageLevelToExpandIds: [],
                        voltageLevelToOmitIds: [],
                        positions: [],
                        ...extraData,
                    };
                    break;
                default:
                    return;
            }

            const workspace = getActiveWorkspace(state);
            const newId = uuidv4();

            workspace.windows[newId] = {
                id: newId,
                type: WindowType.DIAGRAM,
                title: id,
                data,
                position: config.defaultPosition,
                size: config.defaultSize,
                zIndex: workspace.nextZIndex++,
                isMinimized: false,
                isMaximized: false,
                isPinned: false,
            };
            workspace.focusedWindowId = newId;
        },

        openNetworkAreaDiagram: (
            state,
            action: PayloadAction<{
                name: string;
                nadConfigUuid?: UUID;
                filterUuid?: UUID;
                voltageLevelIds?: string[];
                voltageLevelToExpandIds?: string[];
                voltageLevelToOmitIds?: string[];
                positions?: DiagramConfigPosition[];
            }>
        ) => {
            const {
                name,
                nadConfigUuid,
                filterUuid,
                voltageLevelIds = [],
                voltageLevelToExpandIds = [],
                voltageLevelToOmitIds = [],
                positions = [],
            } = action.payload;

            const config = getWindowConfig(WindowType.DIAGRAM);
            const nadTitle = name === '' ? voltageLevelIds.join(', ') : name;
            const data: DiagramWindowData = {
                diagramType: DiagramType.NETWORK_AREA_DIAGRAM,
                name,
                nadConfigUuid,
                filterUuid,
                voltageLevelIds,
                voltageLevelToExpandIds,
                voltageLevelToOmitIds,
                positions,
            };

            const workspace = getActiveWorkspace(state);
            const newId = uuidv4();

            workspace.windows[newId] = {
                id: newId,
                type: WindowType.DIAGRAM,
                title: nadTitle,
                data,
                position: config.defaultPosition,
                size: config.defaultSize,
                zIndex: workspace.nextZIndex++,
                isMinimized: false,
                isMaximized: false,
                isPinned: false,
            };
            workspace.focusedWindowId = newId;
        },

        showInSpreadsheet: (state, action: PayloadAction<{ equipmentId: string; equipmentType: EquipmentType }>) => {
            // First open/focus the spreadsheet window
            const workspace = getActiveWorkspace(state);
            const existingWindow = Object.values(workspace.windows).find((w) => w.type === WindowType.SPREADSHEET);

            if (!existingWindow) {
                const config = getWindowConfig(WindowType.SPREADSHEET);
                const newId = uuidv4();

                workspace.windows[newId] = {
                    id: newId,
                    type: WindowType.SPREADSHEET,
                    title: config.title,
                    position: config.defaultPosition,
                    size: config.defaultSize,
                    zIndex: workspace.nextZIndex++,
                    isMinimized: false,
                    isMaximized: false,
                    isPinned: false,
                };
                workspace.focusedWindowId = newId;
            } else {
                workspace.focusedWindowId = existingWindow.id;
                existingWindow.zIndex = workspace.nextZIndex++;
            }

            state.pendingSpreadsheetTarget = {
                equipmentId: action.payload.equipmentId,
                equipmentType: action.payload.equipmentType,
                timestamp: Date.now(),
            };
        },

        consumeSpreadsheetTarget: (state) => {
            state.pendingSpreadsheetTarget = null;
        },

        updateWindowPosition: (
            state,
            action: PayloadAction<{ windowId: string; position: { x: number; y: number } }>
        ) => {
            updateWindow(state, action.payload.windowId, (window) => {
                window.position = action.payload.position;
            });
        },

        updateWindowSize: (
            state,
            action: PayloadAction<{ windowId: string; size: { width: number; height: number } }>
        ) => {
            updateWindow(state, action.payload.windowId, (window) => {
                window.size = action.payload.size;
            });
        },

        focusWindow: (state, action: PayloadAction<string>) => {
            const workspace = getActiveWorkspace(state);
            const window = workspace.windows[action.payload];
            if (window) {
                workspace.focusedWindowId = action.payload;
                window.zIndex = workspace.nextZIndex++;
            }
        },

        toggleMinimize: (state, action: PayloadAction<string>) => {
            updateWindow(state, action.payload, (window) => {
                window.isMinimized = !window.isMinimized;
            });
        },

        toggleMaximize: (state, action: PayloadAction<string>) => {
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

        togglePin: (state, action: PayloadAction<string>) => {
            updateWindow(state, action.payload, (window) => {
                window.isPinned = !window.isPinned;
            });
        },

        snapWindow: (
            state,
            action: PayloadAction<{ windowId: string; rect: { x: number; y: number; width: number; height: number } }>
        ) => {
            const { windowId, rect } = action.payload;
            updateWindow(state, windowId, (window) => {
                window.position = { x: rect.x, y: rect.y };
                window.size = { width: rect.width, height: rect.height };
            });
        },
    },
});

export const {
    openWindow,
    closeWindow,
    closeWindowsByType,
    updateWindowData,
    updateWindowTitle,
    switchWorkspace,
    renameWorkspace,
    clearWorkspace,
    toggleWindow,
    openOrFocusWindow,
    openDiagram,
    openNetworkAreaDiagram,
    showInSpreadsheet,
    consumeSpreadsheetTarget,
    updateWindowPosition,
    updateWindowSize,
    focusWindow,
    toggleMinimize,
    toggleMaximize,
    togglePin,
    snapWindow,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
