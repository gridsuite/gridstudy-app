/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type {
    PanelType,
    Workspace,
    NADPanelMetadata,
    SLDPanelMetadata,
} from '../../components/workspace/types/workspace.types';
import type { UUID } from 'node:crypto';

const getActiveWorkspace = (state: RootState): Workspace | undefined =>
    state.workspace.workspaces.find((w) => w.id === state.workspace.activeWorkspaceId);

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

export const selectOpenPanelIds = createSelector(
    [selectPanelsRecord],
    (panels) => Object.keys(panels).filter((id) => !panels[id as UUID].isClosed) as UUID[]
);

export const selectOpenPanels = createSelector([selectPanelsRecord], (panels) =>
    Object.values(panels)
        .filter((p) => !p.isClosed)
        .sort((a, b) => a.orderIndex - b.orderIndex)
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

// Map associated panel IDs to their voltage level IDs
export const selectAssociatedVoltageLevelIds = createSelector(
    [selectAssociatedPanelIds, selectPanelsRecord],
    (associatedPanelIds, panels): string[] => {
        if (associatedPanelIds.length === 0) {
            return associatedPanelIds;
        }

        return associatedPanelIds
            .map((panelId) => {
                const panel = panels[panelId];
                return (panel?.metadata as SLDPanelMetadata | undefined)?.diagramId;
            })
            .filter((id): id is string => Boolean(id));
    }
);
