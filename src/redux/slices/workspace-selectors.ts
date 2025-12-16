/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { PanelType } from '../../components/workspace/types/workspace.types';
import type { Workspace, SLDPanelMetadata } from '../../components/workspace/types/workspace.types';
import type { UUID } from 'node:crypto';
import { findNadForSld } from './workspace-helpers';

const getActiveWorkspace = (state: RootState): Workspace | undefined =>
    state.workspace.workspaces.find((w) => w.id === state.workspace.activeWorkspaceId);

export const selectActiveWorkspace = getActiveWorkspace;

export const selectPanelsRecord = createSelector([getActiveWorkspace], (workspace) => workspace?.panels ?? {});

// Map NAD panel IDs to their associated SLD panel IDs
const selectSldsByNad = createSelector([selectPanelsRecord], (panels): Map<UUID, UUID[]> => {
    const map = new Map<UUID, UUID[]>();
    Object.values(panels).forEach((panel) => {
        if (panel.type === PanelType.SLD_VOLTAGE_LEVEL || panel.type === PanelType.SLD_SUBSTATION) {
            const parentNadId = (panel.metadata as SLDPanelMetadata | undefined)?.parentNadPanelId;
            if (parentNadId) {
                const sldIds = map.get(parentNadId);
                if (sldIds) {
                    sldIds.push(panel.id);
                } else {
                    map.set(parentNadId, [panel.id]);
                }
            }
        }
    });
    return map;
});

export const selectPanel = createSelector(
    [selectPanelsRecord, (_state: RootState, panelId: UUID) => panelId],
    (panels, panelId) => panels[panelId]
);

export const selectPanelMetadata = createSelector([selectPanel], (panel) => panel?.metadata);

export const selectIsPanelTypeOpen = createSelector(
    [selectPanelsRecord, (_state: RootState, panelType: PanelType) => panelType],
    (panels, panelType): boolean => Object.values(panels).some((p) => p.type === panelType && !p.isClosed)
);

// Get all SLD panel IDs associated with NAD panels
const selectAssociatedSldIds = createSelector([selectSldsByNad], (sldsByNad): Set<UUID> => {
    const associatedSldIds = new Set<UUID>();
    sldsByNad.forEach((sldIds) => {
        sldIds.forEach((id) => associatedSldIds.add(id));
    });
    return associatedSldIds;
});

export const selectOpenPanels = createSelector(
    [selectPanelsRecord, selectAssociatedSldIds],
    (panels, associatedSldIds) => {
        return Object.values(panels)
            .filter((p) => {
                // Exclude attached SLDs (they render inside NAD panels, not in workspace)
                const isAttachedSld = associatedSldIds.has(p.id);
                return !p.isClosed && !isAttachedSld;
            })
            .sort((a, b) => a.orderIndex - b.orderIndex);
    }
);

export const selectOpenPanelIds = createSelector([selectOpenPanels], (openPanels) => openPanels.map((p) => p.id));

export const selectFocusedPanelId = createSelector(
    [getActiveWorkspace],
    (workspace) => workspace?.focusedPanelId ?? null
);

export const selectWorkspaces = (state: RootState) => state.workspace.workspaces;

export const selectActiveWorkspaceId = (state: RootState) => state.workspace.activeWorkspaceId;

// Get associated SLD panel IDs for a NAD panel
export const selectAssociatedPanelIds = createSelector(
    [selectSldsByNad, (_state: RootState, nadPanelId: UUID) => nadPanelId],
    (sldsByNad, nadPanelId): UUID[] => {
        return sldsByNad.get(nadPanelId) || [];
    }
);

// Get panel data (zIndex, isClosed) for associated SLD panels
export const selectAssociatedPanelsData = createSelector(
    [selectAssociatedPanelIds, selectPanelsRecord],
    (associatedPanelIds, allPanels): Record<UUID, { zIndex: number; isClosed: boolean }> => {
        const result: Record<UUID, { zIndex: number; isClosed: boolean }> = {};
        associatedPanelIds.forEach((id) => {
            const panel = allPanels[id];
            if (panel) {
                result[id] = {
                    zIndex: panel.zIndex,
                    isClosed: panel.isClosed,
                };
            }
        });
        return result;
    }
);

// Map associated panel IDs to their voltage level IDs
export const selectAssociatedVoltageLevelIds = createSelector(
    [selectAssociatedPanelIds, selectPanelsRecord],
    (associatedPanelIds, panels): string[] => {
        return associatedPanelIds
            .map((panelId) => {
                const panel = panels[panelId];
                return (panel?.metadata as SLDPanelMetadata | undefined)?.diagramId;
            })
            .filter((id): id is string => !!id);
    }
);

// Get visible associated SLD panels for a NAD panel
export const selectVisibleAssociatedSldPanels = createSelector(
    [selectAssociatedPanelIds, selectPanelsRecord],
    (associatedPanelIds, panels) => associatedPanelIds.filter((id) => panels[id] && !panels[id].isClosed)
);

// Get associated panel details for rendering chips
export const selectAssociatedPanelDetails = createSelector(
    [selectAssociatedPanelIds, selectPanelsRecord],
    (associatedPanelIds, panels) =>
        associatedPanelIds.map((id) => {
            const panel = panels[id];
            return {
                id,
                title: panel?.title,
                isVisible: panel && !panel.isClosed,
            };
        })
);

// Get NAD panel ID for a given SLD panel (null if not associated)
export const selectNadForSld = createSelector(
    [selectActiveWorkspace, (_state: RootState, sldPanelId: UUID) => sldPanelId],
    (workspace, sldPanelId) => {
        if (!workspace) return null;
        return findNadForSld(workspace, sldPanelId);
    }
);

// Find SLD panel ID for a voltage level in a NAD's associated panels
export const selectAssociatedSldByVoltageLevelId = createSelector(
    [
        selectSldsByNad,
        selectPanelsRecord,
        (_state: RootState, nadPanelId: UUID, _voltageLevelId: string) => nadPanelId,
        (_state: RootState, _nadPanelId: UUID, voltageLevelId: string) => voltageLevelId,
    ],
    (sldsByNad, panels, nadPanelId, voltageLevelId) => {
        const associatedPanelIds = sldsByNad.get(nadPanelId) || [];

        return associatedPanelIds.find((panelId) => {
            const metadata = panels[panelId]?.metadata as SLDPanelMetadata | undefined;
            return metadata?.diagramId === voltageLevelId;
        });
    }
);
