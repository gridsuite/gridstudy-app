/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { PanelType } from '../../components/workspace/types/workspace.types';
import type { Workspace, NADPanelMetadata, SLDPanelMetadata } from '../../components/workspace/types/workspace.types';
import type { UUID } from 'node:crypto';

const getActiveWorkspace = (state: RootState): Workspace | undefined =>
    state.workspace.workspaces.find((w) => w.id === state.workspace.activeWorkspaceId);

export const selectActiveWorkspace = getActiveWorkspace;

export const selectPanelsRecord = createSelector([getActiveWorkspace], (workspace) => workspace?.panels ?? {});

export const selectPanel = createSelector(
    [selectPanelsRecord, (_state: RootState, panelId: UUID) => panelId],
    (panels, panelId) => panels[panelId]
);

export const selectPanelMetadata = createSelector([selectPanel], (panel) => panel?.metadata);

export const selectIsPanelTypeOpen = createSelector(
    [selectPanelsRecord, (_state: RootState, panelType: PanelType) => panelType],
    (panels, panelType): boolean => Object.values(panels).some((p) => p.type === panelType && !p.isClosed)
);

// Build set of all SLD panel IDs that are associated with NAD panels
const selectAssociatedSldIds = createSelector([selectPanelsRecord], (panels): Set<UUID> => {
    const associatedSldIds = new Set<UUID>();
    Object.values(panels).forEach((panel) => {
        if (panel.type === PanelType.NAD) {
            const nadMetadata = panel.metadata as NADPanelMetadata | undefined;
            nadMetadata?.associatedVoltageLevelPanels?.forEach((id) => associatedSldIds.add(id));
        }
    });
    return associatedSldIds;
});

export const selectOpenPanelIds = createSelector(
    [selectPanelsRecord, selectAssociatedSldIds],
    (panels, associatedSldIds) => {
        return Object.keys(panels).filter((id) => {
            const panel = panels[id as UUID];
            // Exclude attached SLDs (they render inside NAD panels, not in workspace)
            const isAttachedSld = associatedSldIds.has(id as UUID);
            return !panel.isClosed && !isAttachedSld;
        }) as UUID[];
    }
);

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

export const selectFocusedPanelId = createSelector(
    [getActiveWorkspace],
    (workspace) => workspace?.focusedPanelId ?? null
);

export const selectWorkspaces = (state: RootState) => state.workspace.workspaces;

export const selectActiveWorkspaceId = (state: RootState) => state.workspace.activeWorkspaceId;

// Get the array of associated SLD panel IDs from NAD metadata
export const selectAssociatedPanelIds = createSelector([selectPanelMetadata], (metadata): UUID[] => {
    const nadMetadata = metadata as NADPanelMetadata | undefined;
    return nadMetadata?.associatedVoltageLevelPanels || [];
});

// Get minimal panel data (zIndex, isClosed) for associated panels only
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
        if (associatedPanelIds.length === 0) {
            return [];
        }
        return associatedPanelIds
            .map((panelId) => {
                const panel = panels[panelId];
                return (panel?.metadata as SLDPanelMetadata | undefined)?.diagramId;
            })
            .filter((id): id is string => !!id);
    }
);

// Get visible (non-closed) associated SLD panels for a NAD panel
export const selectVisibleAssociatedSldPanels = createSelector(
    [selectAssociatedPanelIds, selectPanelsRecord],
    (associatedPanelIds, panels) => associatedPanelIds.filter((id) => panels[id] && !panels[id].isClosed)
);

// Get associated panel details (id, title, isVisible) for rendering chips
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
    [selectPanelsRecord, (_state: RootState, sldPanelId: UUID) => sldPanelId],
    (panels, sldPanelId) => {
        const nadPanel = Object.values(panels).find(
            (panel) =>
                panel.type === PanelType.NAD &&
                (panel.metadata as NADPanelMetadata | undefined)?.associatedVoltageLevelPanels?.includes(sldPanelId)
        );
        return nadPanel?.id ?? null;
    }
);

// Find SLD panel ID for a voltage level within a NAD's associated panels
export const selectAssociatedSldByVoltageLevelId = createSelector(
    [
        (_state: RootState, nadPanelId: UUID, _voltageLevelId: string) => nadPanelId,
        (_state: RootState, _nadPanelId: UUID, voltageLevelId: string) => voltageLevelId,
        selectPanelsRecord,
    ],
    (nadPanelId, voltageLevelId, panels) => {
        const nadMetadata = panels[nadPanelId]?.metadata as NADPanelMetadata | undefined;
        const associatedPanelIds = nadMetadata?.associatedVoltageLevelPanels || [];

        return associatedPanelIds.find((panelId) => {
            const metadata = panels[panelId]?.metadata as SLDPanelMetadata | undefined;
            return metadata?.diagramId === voltageLevelId;
        });
    }
);
