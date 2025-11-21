/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';

export enum WindowType {
    TREE = 'TREE',
    SPREADSHEET = 'SPREADSHEET',
    LOGS = 'LOGS',
    RESULTS = 'RESULTS',
    PARAMETERS = 'PARAMETERS',
    DIAGRAM = 'DIAGRAM',
    MAP = 'MAP',
    NODE_EDITOR = 'NODE_EDITOR',
    EVENT_SCENARIO = 'EVENT_SCENARIO',
}

export interface SpreadsheetWindowData {
    equipmentId?: string;
    equipmentType?: string;
}

export interface DiagramWindowData {
    diagramType: string;
    // SLD-specific fields
    voltageLevelId?: string;
    substationId?: string;
    // NAD-specific fields (only config references, not voluminous data)
    nadConfigUuid?: UUID;
    filterUuid?: UUID;
    savedWorkspaceConfigUuid?: UUID;
    // Transient initialization data (consumed once on mount, then cleared, not persisted)
    initialVoltageLevelIds?: string[];
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
    id: UUID;
    type: WindowType;
    title: string;
    metadata?: WindowData;
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
    windows: Record<UUID, WindowState>;
    focusedWindowId: UUID | null;
    nextZIndex: number;
}

export interface WorkspaceConfig {
    id: UUID;
    name: string;
    windows: Record<UUID, WindowState>;
    focusedWindowId: UUID | null;
    nextZIndex: number;
}

export interface MultiWorkspaceState {
    workspaces: Record<UUID, WorkspaceConfig>;
    activeWorkspaceId: UUID;
}
