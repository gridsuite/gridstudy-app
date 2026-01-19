/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { UUID } from 'node:crypto';
import { selectPanel, selectVisibleAssociatedSldPanels } from '../../../../../../redux/slices/workspace-selectors';
import { useWorkspaceActions } from '../../../../hooks/use-workspace-actions';
import { store } from '../../../../../../redux/store';
import type { RootState } from '../../../../../../redux/store';

export interface UseAssociatedSldsParams {
    readonly nadPanelId: UUID;
}

export interface UseAssociatedSldsReturn {
    readonly focusedSldId: UUID | null;
    readonly handleBringToFront: (sldPanelId: UUID) => void;
    readonly handleToggleSldVisibility: (sldPanelId: UUID) => void;
}

/**
 * Manages SLD panels associated with a NAD panel.
 * Derives focus state from zIndex in Redux and handles visibility toggles.
 */
export const useAssociatedSlds = ({ nadPanelId }: UseAssociatedSldsParams): UseAssociatedSldsReturn => {
    const { toggleMinimized, bringToFront } = useWorkspaceActions();

    const visibleSldPanels = useSelector((state: RootState) => selectVisibleAssociatedSldPanels(state, nadPanelId));

    // Determine focused SLD based on highest z-index
    const focusedSldId = useMemo(() => {
        if (visibleSldPanels.length === 0) return null;
        return visibleSldPanels.reduce(
            (focused, panel) => {
                if (!focused) return panel.id;
                const currentZIndex = panel.zIndex ?? 0;
                const focusedPanel = visibleSldPanels.find((p) => p.id === focused);
                const focusedZIndex = focusedPanel?.zIndex ?? 0;
                return currentZIndex > focusedZIndex ? panel.id : focused;
            },
            null as UUID | null
        );
    }, [visibleSldPanels]);

    const handleBringToFront = useCallback(
        (sldPanelId: UUID) => {
            bringToFront(sldPanelId);
        },
        [bringToFront]
    );

    const handleToggleSldVisibility = useCallback(
        (sldPanelId: UUID) => {
            const panel = selectPanel(store.getState(), sldPanelId);
            if (!panel) return;

            const isVisible = !panel.minimized;

            if (isVisible) {
                if (focusedSldId === sldPanelId) {
                    toggleMinimized(sldPanelId);
                } else {
                    bringToFront(sldPanelId);
                }
            } else {
                bringToFront(sldPanelId);
            }
        },
        [bringToFront, focusedSldId, toggleMinimized]
    );

    return {
        focusedSldId,
        handleBringToFront,
        handleToggleSldVisibility,
    };
};
