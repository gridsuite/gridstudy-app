/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { v4 as uuidv4 } from 'uuid';
import type { UUID } from 'node:crypto';
import { DiagramType } from '../../components/grid-layout/cards/diagrams/diagram.type';
import { getPanelConfig } from '../../components/workspace/constants/workspace.constants';
import {
    Workspace,
    WorkspacesState,
    PanelState,
    PanelType,
    PanelMetadata,
    SLDPanelMetadata,
} from '../../components/workspace/types/workspace.types';

// ==================== Workspace ====================
export const createDefaultWorkspaces = (): Record<UUID, Workspace> => {
    const workspaces: Record<UUID, Workspace> = {};
    for (let i = 0; i < 3; i++) {
        const id = uuidv4() as UUID;
        const workspace: Workspace = {
            id,
            name: `Workspace ${i + 1}`,
            panels: {},
            focusedPanelId: null,
        };

        if (i === 0) {
            const treeConfig = getPanelConfig(PanelType.TREE);
            const treeId = uuidv4() as UUID;
            workspace.panels[treeId] = {
                id: treeId,
                type: PanelType.TREE,
                title: treeConfig.title,
                metadata: undefined,
                position: { x: 0, y: 0 },
                size: treeConfig.defaultSize,
                isMinimized: false,
                isMaximized: true,
                isPinned: false,
            };

            workspace.focusedPanelId = treeId;
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

// ==================== Panel ====================
export const updatePanel = (state: WorkspacesState, panelId: UUID, updater: (panel: PanelState) => void): void => {
    const workspace = getActiveWorkspace(state);
    const panel = workspace.panels[panelId];
    if (panel) {
        updater(panel);
    }
};

export const createPanel = (
    workspace: Workspace,
    panelType: PanelType,
    options: {
        title?: string;
        metadata?: PanelMetadata;
        position?: { x: number; y: number };
        size?: { width: number; height: number };
    } = {}
) => {
    const config = getPanelConfig(panelType);
    const newId = uuidv4() as UUID;

    workspace.panels[newId] = {
        id: newId,
        type: panelType,
        title: options.title || config.title,
        metadata: options.metadata,
        position: options.position || config.defaultPosition,
        size: options.size || config.defaultSize,
        isMinimized: false,
        isMaximized: false,
        isPinned: false,
    };
    workspace.focusedPanelId = newId;
    return newId;
};

// Bring panel to front and restore if minimized
export const bringToFront = (workspace: Workspace, panelId: UUID) => {
    const panel = workspace.panels[panelId];
    if (panel) {
        workspace.focusedPanelId = panelId;
        if (panel.isMinimized) {
            panel.isMinimized = false;
        }
    }
};

export const findAndFocusPanel = (workspace: Workspace, panelType: PanelType): boolean => {
    const existingPanel = Object.values(workspace.panels).find((p) => p.type === panelType);
    if (existingPanel) {
        bringToFront(workspace, existingPanel.id);
        return true;
    }
    return false;
};

export const deletePanel = (workspace: Workspace, panelId: UUID): void => {
    delete workspace.panels[panelId];
    if (workspace.focusedPanelId === panelId) {
        workspace.focusedPanelId = null;
    }
};

// Find diagram panel by type and id (voltage level or substation)
export const findDiagramPanel = (workspace: Workspace, diagramType: DiagramType, id: string, excludePanelId?: UUID) => {
    return Object.values(workspace.panels).find((panel) => {
        if (panel.id === excludePanelId || (panel.type !== PanelType.SLD && panel.type !== PanelType.NAD)) {
            return false;
        }
        const metadata = panel.metadata as SLDPanelMetadata;
        return (
            (diagramType === DiagramType.VOLTAGE_LEVEL && metadata.voltageLevelId === id) ||
            (diagramType === DiagramType.SUBSTATION && metadata.substationId === id)
        );
    });
};
export const createSLDPanelMetadata = (id: string, diagramType: DiagramType): SLDPanelMetadata => ({
    voltageLevelId: diagramType === DiagramType.VOLTAGE_LEVEL ? id : undefined,
    substationId: diagramType === DiagramType.SUBSTATION ? id : undefined,
});
