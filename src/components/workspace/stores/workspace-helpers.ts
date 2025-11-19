/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
    WorkspaceState,
    WorkspaceConfig,
    WindowState,
    MultiWorkspaceState,
    DiagramWindowData,
} from '../types/workspace.types';

export interface WorkspaceStoreState {
    workspaces: WorkspaceConfig[];
    activeWorkspaceId: string;
}

export const createDefaultWorkspaces = (): WorkspaceConfig[] => {
    return Array.from({ length: 3 }, (_, i) => ({
        id: uuidv4(),
        name: `Workspace ${i + 1}`,
        workspace: { windows: {}, focusedWindowId: null, nextZIndex: 100 },
    }));
};

export const getActiveWorkspace = (state: WorkspaceStoreState): WorkspaceState => {
    const workspace = state.workspaces.find((w) => w.id === state.activeWorkspaceId);
    if (!workspace) {
        throw new Error(`Active workspace ${state.activeWorkspaceId} not found`);
    }
    return workspace.workspace;
};

export const getWorkspaceById = (state: WorkspaceStoreState, workspaceId: string): WorkspaceConfig | undefined => {
    return state.workspaces.find((w) => w.id === workspaceId);
};

export const updateWindow = (
    state: WorkspaceStoreState,
    windowId: string,
    updater: (window: WindowState) => void
): void => {
    const workspace = getActiveWorkspace(state);
    const window = workspace.windows[windowId];
    if (window) {
        updater(window);
    }
};

export const sanitizeMultiWorkspaceForStorage = (multiWorkspace: MultiWorkspaceState): MultiWorkspaceState => {
    return {
        ...multiWorkspace,
        workspaces: multiWorkspace.workspaces.map((config) => ({
            ...config,
            workspace: {
                focusedWindowId: config.workspace.focusedWindowId,
                nextZIndex: config.workspace.nextZIndex,
                windows: Object.fromEntries(
                    Object.entries(config.workspace.windows).map(([id, window]) => {
                        if (
                            window.data &&
                            'diagramType' in window.data &&
                            window.data.diagramType === 'network-area-diagram'
                        ) {
                            const nadData = window.data as DiagramWindowData;
                            // Only persist minimal NAD data - don't store voltageLevelIds and positions
                            // These will be fetched from backend using savedWorkspaceConfigUuid
                            return [
                                id,
                                {
                                    ...window,
                                    data: {
                                        diagramType: nadData.diagramType,
                                        name: nadData.name,
                                        nadConfigUuid: nadData.nadConfigUuid,
                                        filterUuid: nadData.filterUuid,
                                        savedWorkspaceConfigUuid: nadData.savedWorkspaceConfigUuid,
                                    },
                                },
                            ];
                        }
                        return [id, window];
                    })
                ),
            },
        })),
    };
};
