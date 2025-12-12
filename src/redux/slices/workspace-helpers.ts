/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { v4 as uuidv4 } from 'uuid';
import type { UUID } from 'node:crypto';
import { getPanelConfig } from '../../components/workspace/constants/workspace.constants';
import {
    Workspace,
    WorkspacesState,
    PanelState,
    PanelType,
    PanelMetadata,
    SLDPanelMetadata,
    NADPanelMetadata,
    RelativeLayout,
} from '../../components/workspace/types/workspace.types';

// ==================== Utilities ====================
export const isDiagramPanel = (panelType: PanelType): boolean => {
    return (
        panelType === PanelType.SLD_VOLTAGE_LEVEL ||
        panelType === PanelType.SLD_SUBSTATION ||
        panelType === PanelType.NAD
    );
};

// ==================== Workspace ====================
const createPanelFromLayout = (
    workspace: Workspace,
    panelType: PanelType,
    layout: RelativeLayout,
    options: { title?: string; metadata?: PanelMetadata } = {}
): UUID => {
    const config = getPanelConfig(panelType);
    const newId = uuidv4() as UUID;

    workspace.panels[newId] = {
        id: newId,
        type: panelType,
        title: options.title || config.title,
        metadata: options.metadata,
        position: {
            x: layout.x,
            y: layout.y,
        },
        size: {
            width: layout.width,
            height: layout.height,
        },
        zIndex: workspace.nextZIndex++,
        orderIndex: workspace.nextOrderIndex++,
        isMinimized: false,
        isMaximized: false,
        isPinned: false,
        isClosed: false,
    };

    return newId;
};

export const createDefaultWorkspaces = (): Workspace[] => {
    const workspaces: Workspace[] = [];
    for (let i = 0; i < 3; i++) {
        const id = uuidv4() as UUID;
        const workspace: Workspace = {
            id,
            name: `Workspace ${i + 1}`,
            panels: {},
            focusedPanelId: null,
            nextZIndex: 1,
            nextOrderIndex: 1,
        };

        if (i === 0) {
            // Default workspace: Tree (75% width) + Modifications (25% width), side by side
            const treeId = createPanelFromLayout(workspace, PanelType.TREE, {
                x: 0,
                y: 0,
                width: 0.75,
                height: 1,
            });

            createPanelFromLayout(workspace, PanelType.NODE_EDITOR, {
                x: 0.75,
                y: 0,
                width: 0.25,
                height: 1,
            });

            workspace.focusedPanelId = treeId;
        }

        workspaces.push(workspace);
    }
    return workspaces;
};

export const getActiveWorkspace = (state: WorkspacesState): Workspace => {
    const workspace = state.workspaces.find((w) => w.id === state.activeWorkspaceId);
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
        zIndex: workspace.nextZIndex++,
        orderIndex: workspace.nextOrderIndex++,
        isMinimized: false,
        isMaximized: false,
        isPinned: false,
        isClosed: false,
    };
    workspace.focusedPanelId = newId;
    return newId;
};

// Bring panel to front and restore if minimized
export const bringToFront = (workspace: Workspace, panelId: UUID) => {
    const panel = workspace.panels[panelId];
    if (panel) {
        workspace.focusedPanelId = panelId;
        panel.zIndex = workspace.nextZIndex++;
        if (panel.isMinimized) {
            panel.isMinimized = false;
        }
    }
};

export const findAndFocusPanel = (workspace: Workspace, panelType: PanelType): boolean => {
    const existingPanel = Object.values(workspace.panels).find((p) => p.type === panelType);
    if (existingPanel) {
        existingPanel.isClosed = false;
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

export const closeOrHidePanel = (workspace: Workspace, panelId: UUID): void => {
    const panel = workspace.panels[panelId];
    if (!panel) return;

    // If closing a NAD panel, delete all associated SLDs
    if (panel.type === PanelType.NAD) {
        const nadMetadata = panel.metadata as NADPanelMetadata | undefined;
        const associatedPanelIds = nadMetadata?.associatedVoltageLevelPanels || [];
        associatedPanelIds.forEach((sldPanelId) => {
            deletePanel(workspace, sldPanelId);
        });
    }

    // Check if this is an attached SLD (associated with a NAD panel)
    const isAttachedSld =
        (panel.type === PanelType.SLD_VOLTAGE_LEVEL || panel.type === PanelType.SLD_SUBSTATION) &&
        (panel.metadata as SLDPanelMetadata | undefined)?.associatedToNadPanel;

    // Regular diagram panels (not attached) should be deleted
    if (!isAttachedSld && isDiagramPanel(panel.type)) {
        deletePanel(workspace, panelId);
    } else {
        // Attached SLDs and non-diagram panels should be hidden
        panel.isClosed = true;
        if (workspace.focusedPanelId === panelId) {
            workspace.focusedPanelId = null;
        }
    }
};

// Find diagram panel by panel type and id
export const findDiagramPanel = (workspace: Workspace, panelType: PanelType, id: string, excludePanelId?: UUID) => {
    return Object.values(workspace.panels).find((panel) => {
        if (panel.id === excludePanelId || panel.type !== panelType) {
            return false;
        }

        if (panelType === PanelType.SLD_VOLTAGE_LEVEL || panelType === PanelType.SLD_SUBSTATION) {
            const metadata = panel.metadata as SLDPanelMetadata;
            // Exclude attached SLDs
            if (metadata.associatedToNadPanel) {
                return false;
            }
            return metadata.diagramId === id;
        }

        return false;
    });
};
