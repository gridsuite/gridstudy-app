/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { PanelType } from '../../components/workspace/types/workspace.types';
import type { Workspace, PanelState, SLDVoltageLevelPanel } from '../../components/workspace/types/workspace.types';
import type { UUID } from 'node:crypto';

const getActiveWorkspace = (state: RootState): Workspace | null => state.workspace.activeWorkspace;

export const selectActiveWorkspace = getActiveWorkspace;

export const selectPanels = createSelector([getActiveWorkspace], (workspace): PanelState[] => workspace?.panels ?? []);

export const selectPanel = createSelector(
    [selectPanels, (_state: RootState, panelId: UUID) => panelId],
    (panels, panelId) => panels.find((p) => p.id === panelId)
);

export const selectWorkspacesMetadata = (state: RootState) => state.workspace.workspacesMetadata;

export const selectWorkspaces = selectWorkspacesMetadata;

export const selectActiveWorkspaceId = (state: RootState) => state.workspace.activeWorkspace?.id ?? null;

export const selectFocusedPanelId = (state: RootState) => state.workspace.focusedPanelId;

// Selector for visible panel IDs only (stable unless panels are added/removed/minimized)
export const selectVisiblePanelIds = createSelector([selectPanels], (panels): UUID[] =>
    panels.filter((p) => !p.isMinimized).map((p) => p.id)
);

export const selectIsPanelTypeOpen = createSelector(
    [selectPanels, (_state: RootState, panelType: PanelType) => panelType],
    (panels, panelType): boolean => panels.some((p) => p.type === panelType && !p.isMinimized)
);

export const selectOpenPanels = createSelector([selectPanels], (panels) => {
    const attachedSldIds = new Set<UUID>();
    panels.forEach((panel) => {
        if (panel.type === PanelType.SLD_VOLTAGE_LEVEL && panel.parentNadPanelId) {
            attachedSldIds.add(panel.id);
        }
    });

    return panels.filter((p) => !p.isMinimized && !attachedSldIds.has(p.id));
});

export const selectOpenPanelIds = createSelector([selectOpenPanels], (openPanels) => openPanels.map((p) => p.id));

export const selectAssociatedPanelIds = createSelector(
    [selectPanels, (_state: RootState, nadPanelId: UUID) => nadPanelId],
    (panels, nadPanelId): UUID[] => {
        return panels
            .filter((p) => p.type === PanelType.SLD_VOLTAGE_LEVEL && p.parentNadPanelId === nadPanelId)
            .map((p) => p.id);
    }
);

export const selectAssociatedVoltageLevelIds = createSelector(
    [selectPanels, (_state: RootState, nadPanelId: UUID) => nadPanelId],
    (panels, nadPanelId): string[] => {
        return panels
            .filter((p) => p.type === PanelType.SLD_VOLTAGE_LEVEL && p.parentNadPanelId === nadPanelId)
            .map((p) => (p as SLDVoltageLevelPanel).diagramId);
    }
);

export const selectVisibleAssociatedSldPanels = createSelector(
    [selectPanels, (_state: RootState, nadPanelId: UUID) => nadPanelId],
    (panels, nadPanelId): UUID[] => {
        return panels
            .filter(
                (p) => p.type === PanelType.SLD_VOLTAGE_LEVEL && p.parentNadPanelId === nadPanelId && !p.isMinimized
            )
            .map((p) => p.id);
    }
);

export const selectAssociatedPanelDetails = createSelector(
    [selectPanels, (_state: RootState, nadPanelId: UUID) => nadPanelId],
    (panels, nadPanelId) => {
        return panels
            .filter((p) => p.type === PanelType.SLD_VOLTAGE_LEVEL && p.parentNadPanelId === nadPanelId)
            .map((p) => ({
                id: p.id,
                title: p.title,
                isVisible: !p.isMinimized,
            }));
    }
);

export const selectNadForSld = createSelector(
    [selectPanels, (_state: RootState, sldPanelId: UUID) => sldPanelId],
    (panels, sldPanelId) => {
        const sldPanel = panels.find((p) => p.id === sldPanelId);
        if (sldPanel && sldPanel.type === PanelType.SLD_VOLTAGE_LEVEL) {
            return sldPanel.parentNadPanelId ?? null;
        }
        return null;
    }
);

export const selectAssociatedSldByVoltageLevelId = createSelector(
    [
        selectPanels,
        (_state: RootState, nadPanelId: UUID, _voltageLevelId: string) => nadPanelId,
        (_state: RootState, _nadPanelId: UUID, voltageLevelId: string) => voltageLevelId,
    ],
    (panels, nadPanelId, voltageLevelId) => {
        const associatedPanel = panels.find(
            (p) =>
                p.type === PanelType.SLD_VOLTAGE_LEVEL &&
                p.parentNadPanelId === nadPanelId &&
                p.diagramId === voltageLevelId
        );
        return associatedPanel?.id;
    }
);

// Field-specific selectors to prevent unnecessary re-renders
export const selectPanelTargetEquipment = createSelector(
    [selectPanel],
    (panel): { targetEquipmentId?: string; targetEquipmentType?: string } | undefined => {
        if (!panel || panel.type !== PanelType.SPREADSHEET) return undefined;
        return {
            targetEquipmentId: panel.targetEquipmentId,
            targetEquipmentType: panel.targetEquipmentType,
        };
    }
);

export const selectSldDiagramFields = createSelector(
    [selectPanel],
    (panel): { diagramId: string; navigationHistory: string[] } | undefined => {
        if (!panel || (panel.type !== PanelType.SLD_VOLTAGE_LEVEL && panel.type !== PanelType.SLD_SUBSTATION)) {
            return undefined;
        }
        return {
            diagramId: panel.diagramId,
            navigationHistory: panel.type === PanelType.SLD_VOLTAGE_LEVEL ? panel.navigationHistory || [] : [],
        };
    }
);

export const selectNadDiagramFields = createSelector(
    [selectPanel],
    (
        panel
    ):
        | {
              nadConfigUuid?: UUID;
              filterUuid?: UUID;
              currentFilterUuid?: UUID;
              initialVoltageLevelIds?: string[];
              voltageLevelToOmitIds?: string[];
              savedWorkspaceConfigUuid?: UUID;
          }
        | undefined => {
        if (!panel || panel.type !== PanelType.NAD) return undefined;
        return {
            nadConfigUuid: panel.nadConfigUuid,
            filterUuid: panel.filterUuid,
            currentFilterUuid: panel.currentFilterUuid,
            initialVoltageLevelIds: panel.initialVoltageLevelIds,
            voltageLevelToOmitIds: panel.voltageLevelToOmitIds,
            savedWorkspaceConfigUuid: panel.savedWorkspaceConfigUuid,
        };
    }
);

export const selectNadNavigationHistory = createSelector([selectPanel], (panel): string[] | undefined => {
    if (!panel || panel.type !== PanelType.NAD) return undefined;
    return panel.navigationHistory;
});
