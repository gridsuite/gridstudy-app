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

export interface BasePanelLocalState {
    id: UUID;
    type: PanelType;
}

export interface TreePanelLocalState extends BasePanelLocalState {
    type: PanelType.TREE;
    viewport?: Viewport;
}

export type PanelLocalState = TreePanelLocalState;

interface WorkspaceLocalState {
    panels: Record<UUID, PanelLocalState>;
}

const WORKSPACE_STATE_KEY = `${LOCAL_STORAGE_KEY_PREFIX}:workspace-state`;

function getKey(studyUuid: UUID, workspaceId: UUID): string {
    return `${WORKSPACE_STATE_KEY}:${studyUuid}:${workspaceId}`;
}

function getWorkspaceLocalState(studyUuid: UUID, workspaceId: UUID): WorkspaceLocalState {
    try {
        const stored = localStorage.getItem(getKey(studyUuid, workspaceId));
        return stored ? (JSON.parse(stored) as WorkspaceLocalState) : { panels: {} };
    } catch {
        return { panels: {} };
    }
}

function saveWorkspaceLocalState(studyUuid: UUID, workspaceId: UUID, state: WorkspaceLocalState): void {
    localStorage.setItem(getKey(studyUuid, workspaceId), JSON.stringify(state));
}

export function getLocalStoragePanelState(
    studyUuid: UUID,
    workspaceId: UUID,
    panelId: UUID
): PanelLocalState | undefined {
    return getWorkspaceLocalState(studyUuid, workspaceId).panels[panelId];
}

export function saveLocalStoragePanelState(studyUuid: UUID, workspaceId: UUID, panelState: PanelLocalState): void {
    const state = getWorkspaceLocalState(studyUuid, workspaceId);
    saveWorkspaceLocalState(studyUuid, workspaceId, {
        ...state,
        panels: { ...state.panels, [panelState.id]: { ...state.panels[panelState.id], ...panelState } },
    });
}

export function deleteLocalStoragePanelStates(studyUuid: UUID, workspaceId: UUID, panelIds: UUID[]): void {
    const state = getWorkspaceLocalState(studyUuid, workspaceId);
    const panels = { ...state.panels };
    panelIds.forEach((id) => delete panels[id]);
    saveWorkspaceLocalState(studyUuid, workspaceId, { ...state, panels });
}
