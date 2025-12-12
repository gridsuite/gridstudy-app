/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';

export enum PanelType {
    TREE = 'TREE',
    SPREADSHEET = 'SPREADSHEET',
    LOGS = 'LOGS',
    RESULTS = 'RESULTS',
    PARAMETERS = 'PARAMETERS',
    SLD_VOLTAGE_LEVEL = 'SLD_VOLTAGE_LEVEL',
    SLD_SUBSTATION = 'SLD_SUBSTATION',
    NAD = 'NAD',
    MAP = 'MAP',
    NODE_EDITOR = 'NODE_EDITOR',
    EVENT_SCENARIO = 'EVENT_SCENARIO',
}

export interface SLDPanelMetadata {
    diagramId: string;
    navigationHistory?: string[];
    associatedToNadPanel?: UUID | null; // Reference to parent NAD panel when associated
}

export interface NADPanelMetadata {
    nadConfigUuid?: UUID;
    filterUuid?: UUID;
    currentFilterUuid?: UUID;
    voltageLevelToOmitIds?: string[];
    savedWorkspaceConfigUuid?: UUID;
    initialVoltageLevelIds?: string[];
    associatedVoltageLevelPanels?: UUID[]; // Array of associated SLD panel IDs
    navigationHistory?: string[]; // History of clicked voltage levels
}

export interface SpreadsheetPanelMetadata {
    targetEquipmentId?: string;
    targetEquipmentType?: string;
}

export type PanelMetadata = SLDPanelMetadata | NADPanelMetadata | SpreadsheetPanelMetadata | Record<string, never>;

// Position and size stored as relative values (0-1) to container
export interface PanelPosition {
    x: number; // 0-1
    y: number; // 0-1
}

// relative size (0-1) exept for minSize which is in pixels
// to avoid panels too small to be usable on small screens
// e.g relative size 0.2 on a 800px width screen would be 160px only
export interface PanelSize {
    width: number;
    height: number;
}

export interface RelativeLayout {
    x: number; // 0-1
    y: number; // 0-1
    width: number; // 0-1
    height: number; // 0-1
}

export interface PanelState {
    id: UUID;
    type: PanelType;
    title: string;
    metadata?: PanelMetadata;
    position: PanelPosition;
    size: PanelSize;
    zIndex: number;
    orderIndex: number;
    isMinimized: boolean;
    isMaximized: boolean;
    isPinned: boolean;
    isClosed: boolean;
    restorePosition?: PanelPosition;
    restoreSize?: PanelSize;
}

export interface Workspace {
    id: UUID;
    name: string;
    panels: Record<UUID, PanelState>;
    focusedPanelId: UUID | null;
    nextZIndex: number;
    nextOrderIndex: number;
}

export interface WorkspacesState {
    workspaces: Workspace[];
    activeWorkspaceId: UUID;
}
