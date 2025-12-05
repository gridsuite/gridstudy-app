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
}

export interface NADPanelMetadata {
    nadConfigUuid?: UUID;
    filterUuid?: UUID;
    currentFilterUuid?: UUID;
    voltageLevelToOmitIds?: string[];
    savedWorkspaceConfigUuid?: UUID;
    initialVoltageLevelIds?: string[];
}

export interface SpreadsheetPanelMetadata {
    targetEquipmentId?: string;
    targetEquipmentType?: string;
}

export type PanelMetadata = SLDPanelMetadata | NADPanelMetadata | SpreadsheetPanelMetadata | Record<string, never>;

export interface PanelPosition {
    x: number;
    y: number;
}

export interface PanelSize {
    width: number;
    height: number;
}

export interface PanelState {
    id: UUID;
    type: PanelType;
    title: string;
    metadata?: PanelMetadata;
    position: PanelPosition;
    size: PanelSize;
    zIndex: number;
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
}

export interface WorkspacesState {
    workspaces: Workspace[];
    activeWorkspaceId: UUID;
}
