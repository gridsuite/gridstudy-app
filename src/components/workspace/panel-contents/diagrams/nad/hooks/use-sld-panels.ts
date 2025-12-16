/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import type { UUID } from 'node:crypto';
import type { RootState } from '../../../../../../redux/store';
import {
    selectAssociatedPanelIds,
    selectVisibleAssociatedSldPanels,
    selectAssociatedPanelsData,
} from '../../../../../../redux/slices/workspace-selectors';
import { closePanel, updatePanelZIndex, openPanel } from '../../../../../../redux/slices/workspace-slice';

export interface UseSldPanelsParams {
    readonly nadPanelId: UUID;
}

export interface UseSldPanelsReturn {
    readonly associatedPanelIds: UUID[];
    readonly visibleSldPanels: UUID[];
    readonly focusedSldId: UUID | null;
    readonly handleBringToFront: (sldPanelId: UUID) => void;
    readonly handleToggleSldVisibility: (sldPanelId: UUID) => void;
}

/**
 * Hook to manage SLD panels associated with a NAD panel
 * Handles visibility, focus, and z-index management
 */
export const useSldPanels = ({ nadPanelId }: UseSldPanelsParams): UseSldPanelsReturn => {
    const dispatch = useDispatch();

    const selectPanelsDataForNad = useCallback(
        (state: RootState) => selectAssociatedPanelsData(state, nadPanelId),
        [nadPanelId]
    );
    const panelsData = useSelector(selectPanelsDataForNad, shallowEqual);

    const associatedPanelIds = useSelector(
        (state: RootState) => selectAssociatedPanelIds(state, nadPanelId),
        shallowEqual
    );
    const visibleSldPanels = useSelector(
        (state: RootState) => selectVisibleAssociatedSldPanels(state, nadPanelId),
        shallowEqual
    );

    // Determine focused SLD based on highest z-index
    const focusedSldId = useMemo(() => {
        return visibleSldPanels.reduce<UUID | null>((maxId, id) => {
            if (maxId === null) return id;
            const maxPanel = panelsData[maxId];
            const currentPanel = panelsData[id];
            return currentPanel?.zIndex > maxPanel?.zIndex ? id : maxId;
        }, null);
    }, [visibleSldPanels, panelsData]);

    const handleBringToFront = useCallback(
        (sldPanelId: UUID) => {
            dispatch(updatePanelZIndex(sldPanelId));
        },
        [dispatch]
    );

    const handleToggleSldVisibility = useCallback(
        (sldPanelId: UUID) => {
            const panel = panelsData[sldPanelId];
            if (!panel) return;

            const isVisible = !panel.isClosed;

            if (isVisible) {
                // If already visible, check if it's focused (highest z-index)
                if (focusedSldId === sldPanelId) {
                    // If focused, close it
                    dispatch(closePanel(sldPanelId));
                } else {
                    handleBringToFront(sldPanelId);
                }
            } else {
                // If not visible, open and focus the panel
                dispatch(openPanel(sldPanelId));
                handleBringToFront(sldPanelId);
            }
        },
        [dispatch, panelsData, focusedSldId, handleBringToFront]
    );

    return {
        associatedPanelIds,
        visibleSldPanels,
        focusedSldId,
        handleBringToFront,
        handleToggleSldVisibility,
    };
};
