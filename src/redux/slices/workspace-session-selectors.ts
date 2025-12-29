/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { UUID } from 'node:crypto';
import { selectPanels } from './workspace-selectors';

// Base selectors
const getWorkspaceSession = (state: RootState) => state.workspaceSession;

export const selectFocusedPanelId = createSelector([getWorkspaceSession], (session) => session?.focusedPanelId ?? null);

export const selectZIndexMap = createSelector([getWorkspaceSession], (session) => session?.zIndexMap ?? {});

export const selectTempData = createSelector(
    [getWorkspaceSession, (_state: RootState, panelId: UUID) => panelId],
    (session, panelId) => session?.tempData[panelId]
);

export const selectZIndexForPanel = createSelector(
    [selectZIndexMap, (_state: RootState, panelId: UUID) => panelId],
    (zIndexMap, panelId) => zIndexMap[panelId] ?? 0
);

// Panels with z-index for main workspace (excludes associated SLDs)
export const selectPanelsWithZIndex = createSelector([selectPanels, selectZIndexMap], (panels, zIndexMap) =>
    panels
        .filter((panel) => {
            if (panel.type === 'SLD_VOLTAGE_LEVEL') {
                return !panel.parentNadPanelId;
            }
            return true;
        })
        .map((panel) => ({
            ...panel,
            zIndex: zIndexMap[panel.id] ?? 0,
        }))
);

// Associated SLD panel data (includes z-index from session state)
export const selectAssociatedPanelsData = createSelector(
    [selectPanels, selectZIndexMap, (_state: RootState, nadPanelId: UUID) => nadPanelId],
    (panels, zIndexMap, nadPanelId): Record<UUID, { zIndex: number; isMinimized: boolean }> => {
        const result: Record<UUID, { zIndex: number; isMinimized: boolean }> = {};
        panels.forEach((panel) => {
            if (
                (panel.type === 'SLD_VOLTAGE_LEVEL' || panel.type === 'SLD_SUBSTATION') &&
                (panel as any).parentNadPanelId === nadPanelId
            ) {
                result[panel.id] = {
                    zIndex: zIndexMap[panel.id] ?? 0,
                    isMinimized: panel.isMinimized,
                };
            }
        });
        return result;
    }
);
