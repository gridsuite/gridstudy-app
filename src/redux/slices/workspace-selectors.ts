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

export const selectWorkspaces = (state: RootState) => state.workspace.workspacesMetadata;

export const selectActiveWorkspaceId = (state: RootState) => state.workspace.activeWorkspace?.id ?? null;

export const selectFocusedPanelId = createSelector([selectPanels], (panels): UUID | null => {
    const nonMinimized = panels.filter(
        (p) => !p.minimized && !(p.type === PanelType.SLD_VOLTAGE_LEVEL && p.parentNadPanelId)
    );
    if (nonMinimized.length === 0) return null;

    const focused = nonMinimized.reduce(
        (max, p) => ((p.zIndex ?? 0) > (max.zIndex ?? 0) ? p : max),
        nonMinimized.at(-1)!
    );
    return focused.id;
});

export const selectOpenPanels = createSelector([selectPanels], (panels) => {
    const attachedSldIds = new Set<UUID>();
    panels.forEach((panel) => {
        if (panel.type === PanelType.SLD_VOLTAGE_LEVEL && panel.parentNadPanelId) {
            attachedSldIds.add(panel.id);
        }
    });

    return panels.filter((p) => {
        // Filter out attached SLD panels
        if (attachedSldIds.has(p.id)) return false;

        // Keep diagram panels mounted even when minimized
        if (p.type === PanelType.NAD || p.type === PanelType.SLD_VOLTAGE_LEVEL || p.type === PanelType.SLD_SUBSTATION) {
            return true;
        }

        // Other panels are filtered out when minimized
        return !p.minimized;
    });
});

export const selectOpenPanelIds = createSelector([selectOpenPanels], (panels) => panels.map((p) => p.id));

export const selectAssociatedPanels = createSelector(
    [selectPanels, (_state: RootState, nadPanelId: UUID) => nadPanelId],
    (panels, nadPanelId): SLDVoltageLevelPanel[] => {
        return panels.filter(
            (p): p is SLDVoltageLevelPanel =>
                p.type === PanelType.SLD_VOLTAGE_LEVEL && p.parentNadPanelId === nadPanelId
        );
    }
);

export const selectPanelByType = createSelector(
    [selectPanels, (_state: RootState, panelType: PanelType) => panelType],
    (panels, panelType) => panels.find((p) => p.type === panelType)
);

export const selectExistingSLD = createSelector(
    [selectPanels, (_state: RootState, equipmentId: string) => equipmentId],
    (panels, equipmentId) => {
        return panels.find(
            (p) =>
                (p.type === PanelType.SLD_VOLTAGE_LEVEL || p.type === PanelType.SLD_SUBSTATION) &&
                p.equipmentId === equipmentId &&
                (p.type === PanelType.SLD_SUBSTATION || !p.parentNadPanelId)
        );
    }
);

export const selectAssociatedVoltageLevelIds = createSelector(
    [selectPanels, (_state: RootState, nadPanelId: UUID) => nadPanelId],
    (panels, nadPanelId): string[] => {
        return panels
            .filter((p) => p.type === PanelType.SLD_VOLTAGE_LEVEL && p.parentNadPanelId === nadPanelId)
            .map((p) => (p as SLDVoltageLevelPanel).equipmentId);
    }
);

export const selectVisibleAssociatedSldPanelIds = createSelector([selectAssociatedPanels], (panels): UUID[] =>
    panels.filter((p) => !p.minimized).map((p) => p.id)
);

export const selectFocusedAssociatedSldId = createSelector([selectAssociatedPanels], (panels): UUID | null => {
    const visible = panels.filter((p) => !p.minimized);
    if (visible.length === 0) return null;
    const focused = visible.reduce((max, p) => ((p.zIndex ?? 0) > (max.zIndex ?? 0) ? p : max), visible[0]);
    return focused.id;
});

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
    (panel): { equipmentId: string; navigationHistory: string[]; parentNadPanelId: UUID | undefined } | undefined => {
        if (!panel || (panel.type !== PanelType.SLD_VOLTAGE_LEVEL && panel.type !== PanelType.SLD_SUBSTATION)) {
            return undefined;
        }
        return {
            equipmentId: panel.equipmentId,
            navigationHistory: panel.type === PanelType.SLD_VOLTAGE_LEVEL ? panel.navigationHistory || [] : [],
            parentNadPanelId: panel.type === PanelType.SLD_VOLTAGE_LEVEL ? panel.parentNadPanelId : undefined,
        };
    }
);

export const selectNadDiagramFields = createSelector([selectPanel], (panel) => {
    if (!panel || panel.type !== PanelType.NAD) return undefined;
    return {
        title: panel.title,
        nadConfigUuid: panel.nadConfigUuid,
        filterUuid: panel.filterUuid,
        currentFilterUuid: panel.currentFilterUuid,
        initialVoltageLevelIds: panel.initialVoltageLevelIds,
        voltageLevelToOmitIds: panel.voltageLevelToOmitIds,
        currentNadConfigUuid: panel.currentNadConfigUuid,
    };
});

export const selectNadNavigationHistory = createSelector([selectPanel], (panel): string[] | undefined => {
    if (!panel || panel.type !== PanelType.NAD) return undefined;
    return panel.navigationHistory;
});
