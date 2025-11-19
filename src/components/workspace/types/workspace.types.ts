/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export enum WindowType {
    TREE = 'TREE',
    SPREADSHEET = 'SPREADSHEET',
    LOGS = 'LOGS',
    RESULTS = 'RESULTS',
    PARAMETERS = 'PARAMETERS',
    DIAGRAM = 'DIAGRAM',
    MAP = 'MAP',
    NODE_EDITOR = 'NODE_EDITOR',
}

export interface SpreadsheetWindowData {
    equipmentId?: string;
    equipmentType?: string;
}

export interface DiagramWindowData {
    diagramType: string;
    name?: string;
    voltageLevelId?: string;
    substationId?: string;
    nadConfigUuid?: string;
    filterUuid?: string;
    savedWorkspaceConfigUuid?: string;
    voltageLevelIds?: string[];
    voltageLevelToExpandIds?: string[];
    voltageLevelToOmitIds?: string[];
    positions?: any[];
}

export type WindowData = SpreadsheetWindowData | DiagramWindowData | Record<string, never>;

export interface WindowPosition {
    x: number;
    y: number;
}

export interface WindowSize {
    width: number;
    height: number;
}

export interface WindowState {
    id: string;
    type: WindowType;
    title: string;
    data?: WindowData;
    keepMountedWhenMinimized?: boolean;
    position: WindowPosition;
    size: WindowSize;
    zIndex: number;
    isMinimized: boolean;
    isMaximized: boolean;
    isPinned: boolean;
    restorePosition?: WindowPosition;
    restoreSize?: WindowSize;
}

export interface WorkspaceState {
    windows: Record<string, WindowState>;
    focusedWindowId: string | null;
    nextZIndex: number;
}

export interface WorkspaceConfig {
    id: string;
    name: string;
    workspace: WorkspaceState;
}

export interface MultiWorkspaceState {
    workspaces: WorkspaceConfig[];
    activeWorkspaceId: string;
}
