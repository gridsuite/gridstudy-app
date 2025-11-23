/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { v4 as uuidv4 } from 'uuid';
import type { UUID } from 'node:crypto';
import { DiagramType } from '../../components/grid-layout/cards/diagrams/diagram.type';
import { getWindowConfig } from '../../components/workspace/constants/workspace.constants';
import {
    Workspace,
    WorkspacesState,
    WindowState,
    WindowType,
    WindowMetadata,
    SLDWindowMetadata,
} from '../../components/workspace/types/workspace.types';

// ==================== Workspace ====================
export const createDefaultWorkspaces = (): Record<UUID, Workspace> => {
    const workspaces: Record<UUID, Workspace> = {};
    for (let i = 0; i < 3; i++) {
        const id = uuidv4() as UUID;
        const workspace: Workspace = {
            id,
            name: `Workspace ${i + 1}`,
            windows: {},
            focusedWindowId: null,
        };

        if (i === 0) {
            const treeConfig = getWindowConfig(WindowType.TREE);
            const treeId = uuidv4() as UUID;
            workspace.windows[treeId] = {
                id: treeId,
                type: WindowType.TREE,
                title: treeConfig.title,
                metadata: undefined,
                position: { x: 0, y: 0 },
                size: treeConfig.defaultSize,
                isMinimized: false,
                isMaximized: true,
                isPinned: false,
            };

            workspace.focusedWindowId = treeId;
        }

        workspaces[id] = workspace;
    }
    return workspaces;
};

export const getActiveWorkspace = (state: WorkspacesState): Workspace => {
    const workspace = state.workspaces[state.activeWorkspaceId];
    if (!workspace) {
        throw new Error(`Active workspace ${state.activeWorkspaceId} not found`);
    }
    return workspace;
};

// ==================== Window ====================
export const updateWindow = (state: WorkspacesState, windowId: UUID, updater: (window: WindowState) => void): void => {
    const workspace = getActiveWorkspace(state);
    const window = workspace.windows[windowId];
    if (window) {
        updater(window);
    }
};

export const createWindow = (
    workspace: Workspace,
    windowType: WindowType,
    options: {
        title?: string;
        metadata?: WindowMetadata;
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
        isMinimized: false,
        isMaximized: false,
        isPinned: false,
    };
    workspace.focusedWindowId = newId;
    return newId;
};

// Bring window to front and restore if minimized
export const bringToFront = (workspace: Workspace, windowId: UUID) => {
    const window = workspace.windows[windowId];
    if (window) {
        workspace.focusedWindowId = windowId;
        if (window.isMinimized) {
            window.isMinimized = false;
        }
    }
};

export const findAndFocusWindow = (workspace: Workspace, windowType: WindowType): boolean => {
    const existingWindow = Object.values(workspace.windows).find((w) => w.type === windowType);
    if (existingWindow) {
        bringToFront(workspace, existingWindow.id);
        return true;
    }
    return false;
};

export const deleteWindow = (workspace: Workspace, windowId: UUID): void => {
    delete workspace.windows[windowId];
    if (workspace.focusedWindowId === windowId) {
        workspace.focusedWindowId = null;
    }
};

// Find diagram window by type and id (voltage level or substation)
export const findDiagramWindow = (
    workspace: Workspace,
    diagramType: DiagramType,
    id: string,
    excludeWindowId?: UUID
) => {
    return Object.values(workspace.windows).find((window) => {
        if (window.id === excludeWindowId || (window.type !== WindowType.SLD && window.type !== WindowType.NAD)) {
            return false;
        }
        const metadata = window.metadata as SLDWindowMetadata;
        return (
            (diagramType === DiagramType.VOLTAGE_LEVEL && metadata.voltageLevelId === id) ||
            (diagramType === DiagramType.SUBSTATION && metadata.substationId === id)
        );
    });
};
export const createSLDMetadata = (id: string, diagramType: DiagramType): SLDWindowMetadata => ({
    voltageLevelId: diagramType === DiagramType.VOLTAGE_LEVEL ? id : undefined,
    substationId: diagramType === DiagramType.SUBSTATION ? id : undefined,
});
