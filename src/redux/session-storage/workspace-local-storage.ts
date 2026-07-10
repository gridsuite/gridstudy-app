/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { LOCAL_STORAGE_KEY_PREFIX } from '../../utils/config-params';
import { PanelType } from '../../components/workspace/types/workspace.types';
import { Viewport } from '@xyflow/react';
import { ViewBoxLike } from '@svgdotjs/svg.js';

export interface BasePanelLocalState {
    id: UUID;
    type: PanelType;
    zIndex?: number;
}

export interface TreePanelLocalState extends BasePanelLocalState {
    type: PanelType.TREE;
    viewport?: Viewport;
}

export interface NADPanelLocalState extends BasePanelLocalState {
    type: PanelType.NAD;
    viewBox?: ViewBoxLike;
}

export type OtherPanelLocalState = BasePanelLocalState & {
    type: Exclude<PanelType, PanelType.TREE | PanelType.NAD>;
};

export type PanelLocalState = TreePanelLocalState | NADPanelLocalState | OtherPanelLocalState;

interface WorkspacesLocalState {
    activeWorkspaceId?: UUID;
    workspaces: Record<UUID, WorkspaceLocalState>;
}

interface WorkspaceLocalState {
    panels: Record<UUID, PanelLocalState>;
}

const WORKSPACES_STATE_KEY = `${LOCAL_STORAGE_KEY_PREFIX}:workspaces-state`;

function getWorkspacesKey(studyUuid: UUID): string {
    return `${WORKSPACES_STATE_KEY}:${studyUuid}`;
}

function getWorkspacesLocalState(studyUuid: UUID): WorkspacesLocalState {
    try {
        const stored = localStorage.getItem(getWorkspacesKey(studyUuid));
        return stored ? (JSON.parse(stored) as WorkspacesLocalState) : { workspaces: {} };
    } catch {
        return { workspaces: {} };
    }
}

function saveWorkspacesLocalState(studyUuid: UUID, state: WorkspacesLocalState): void {
    try {
        localStorage.setItem(getWorkspacesKey(studyUuid), JSON.stringify(state));
    } catch {
        // Ignore persistence failure to keep UI flows functional
    }
}

function getWorkspaceLocalState(studyUuid: UUID, workspaceId: UUID): WorkspaceLocalState {
    return getWorkspacesLocalState(studyUuid).workspaces[workspaceId] ?? { panels: {} };
}

function saveWorkspaceLocalState(studyUuid: UUID, workspaceId: UUID, workspaceState: WorkspaceLocalState): void {
    const state = getWorkspacesLocalState(studyUuid);
    saveWorkspacesLocalState(studyUuid, {
        ...state,
        workspaces: { ...state.workspaces, [workspaceId]: workspaceState },
    });
}

export function getLocalStoragePanelStates(studyUuid: UUID, workspaceId: UUID): Record<UUID, PanelLocalState> {
    return getWorkspaceLocalState(studyUuid, workspaceId).panels;
}

export function getLocalStoragePanelState(
    studyUuid: UUID,
    workspaceId: UUID,
    panelId: UUID
): PanelLocalState | undefined {
    return getWorkspaceLocalState(studyUuid, workspaceId).panels[panelId];
}

export function saveLocalStoragePanelState(studyUuid: UUID, workspaceId: UUID, panelState: PanelLocalState): void {
    const workspaceState = getWorkspaceLocalState(studyUuid, workspaceId);
    saveWorkspaceLocalState(studyUuid, workspaceId, {
        ...workspaceState,
        panels: {
            ...workspaceState.panels,
            [panelState.id]: { ...workspaceState.panels[panelState.id], ...panelState },
        },
    });
}

export function saveLocalStoragePanelZIndex(
    studyUuid: UUID,
    workspaceId: UUID,
    panelId: UUID,
    panelType: PanelType,
    zIndex: number
): void {
    saveLocalStoragePanelsZIndex(studyUuid, workspaceId, [{ id: panelId, type: panelType, zIndex }]);
}

export function saveLocalStoragePanelsZIndex(
    studyUuid: UUID,
    workspaceId: UUID,
    panels: { id: UUID; type: PanelType; zIndex: number }[]
): void {
    const workspaceState = getWorkspaceLocalState(studyUuid, workspaceId);
    const updatedPanels = { ...workspaceState.panels };
    for (const { id, type, zIndex } of panels) {
        const existing = updatedPanels[id];
        updatedPanels[id] = existing ? { ...existing, zIndex } : ({ id, type, zIndex } as PanelLocalState);
    }
    saveWorkspaceLocalState(studyUuid, workspaceId, { ...workspaceState, panels: updatedPanels });
}

export function deleteLocalStoragePanelStates(studyUuid: UUID, workspaceId: UUID, panelIds: UUID[]): void {
    const workspaceState = getWorkspaceLocalState(studyUuid, workspaceId);
    const panels = { ...workspaceState.panels };
    panelIds.forEach((id) => delete panels[id]);
    saveWorkspaceLocalState(studyUuid, workspaceId, { ...workspaceState, panels });
}

export function getLocalStorageActiveWorkspaceId(studyUuid: UUID): UUID | null {
    return getWorkspacesLocalState(studyUuid).activeWorkspaceId ?? null;
}

export function saveLocalStorageActiveWorkspaceId(studyUuid: UUID, workspaceId: UUID): void {
    const state = getWorkspacesLocalState(studyUuid);
    saveWorkspacesLocalState(studyUuid, { ...state, activeWorkspaceId: workspaceId });
}

export function clearLocalStorageWorkspaceState(studyUuid: UUID, workspaceId: UUID): void {
    const state = getWorkspacesLocalState(studyUuid);
    const workspaces = { ...state.workspaces };
    delete workspaces[workspaceId];
    saveWorkspacesLocalState(studyUuid, { ...state, workspaces });
}
