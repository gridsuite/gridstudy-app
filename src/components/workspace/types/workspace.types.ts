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
    SLD = 'SLD',
    NAD = 'NAD',
    MAP = 'MAP',
    NODE_EDITOR = 'NODE_EDITOR',
    EVENT_SCENARIO = 'EVENT_SCENARIO',
}
export interface SLDWindowMetadata {
    voltageLevelId?: string;
    substationId?: string;
}

export interface NADWindowMetadata {
    nadConfigUuid?: UUID;
    filterUuid?: UUID;
    savedWorkspaceConfigUuid?: UUID;
    initialVoltageLevelIds?: string[];
}

export type WindowMetadata = SLDWindowMetadata | NADWindowMetadata | Record<string, never>;

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
    metadata?: WindowMetadata;
    position: WindowPosition;
    size: WindowSize;
    isMinimized: boolean;
    isMaximized: boolean;
    isPinned: boolean;
    restorePosition?: WindowPosition;
    restoreSize?: WindowSize;
}

export interface Workspace {
    id: UUID;
    name: string;
    windows: Record<UUID, WindowState>;
    focusedWindowId: UUID | null;
}

export interface WorkspacesState {
    workspaces: Record<UUID, Workspace>;
    activeWorkspaceId: UUID;
    pendingSpreadsheetTarget: { equipmentId: string; equipmentType: string } | null;
}
