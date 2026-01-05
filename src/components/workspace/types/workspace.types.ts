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
    MODIFICATIONS = 'MODIFICATIONS',
    EVENT_SCENARIO = 'EVENT_SCENARIO',
}

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

// Base panel interface - common fields for all panel types
interface BasePanel {
    id: UUID;
    title: string;
    position: PanelPosition;
    size: PanelSize;
    isMinimized: boolean; // For NAD/SLD: minimized to dock; For toggles: hidden
    isMaximized: boolean;
    isPinned: boolean;
    zIndex?: number; // Client-only, not persisted to backend
    restorePosition?: PanelPosition;
    restoreSize?: PanelSize;
}

export interface NADPanel extends BasePanel {
    type: PanelType.NAD;
    nadConfigUuid?: UUID;
    filterUuid?: UUID;
    currentFilterUuid?: UUID;
    voltageLevelToOmitIds?: string[];
    savedWorkspaceConfigUuid?: UUID;
    navigationHistory?: string[];
    initialVoltageLevelIds?: string[]; // For initial diagram load
}

export interface SLDVoltageLevelPanel extends BasePanel {
    type: PanelType.SLD_VOLTAGE_LEVEL;
    diagramId: string;
    parentNadPanelId?: UUID; // Reference to parent NAD panel if associated
    navigationHistory?: string[];
}

export interface SLDSubstationPanel extends BasePanel {
    type: PanelType.SLD_SUBSTATION;
    diagramId: string;
}

export interface SpreadsheetPanel extends BasePanel {
    type: PanelType.SPREADSHEET;
    targetEquipmentId?: string; // For scroll-to-equipment feature
    targetEquipmentType?: string; // For scroll-to-equipment feature
}

export interface GenericPanel extends BasePanel {
    type:
        | PanelType.TREE
        | PanelType.LOGS
        | PanelType.RESULTS
        | PanelType.PARAMETERS
        | PanelType.MAP
        | PanelType.MODIFICATIONS
        | PanelType.EVENT_SCENARIO;
}

export type PanelState = NADPanel | SLDVoltageLevelPanel | SLDSubstationPanel | SpreadsheetPanel | GenericPanel;

export interface WorkspaceMetadata {
    id: UUID;
    name: string;
    panelCount: number;
}

export interface Workspace {
    id: UUID;
    name: string;
    panels: PanelState[];
}

export interface WorkspacesState {
    workspacesMetadata: WorkspaceMetadata[];
    activeWorkspace: Workspace | null;
    focusedPanelId: UUID | null;
    nextZIndex: number;
}
