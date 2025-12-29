/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import type { UUID } from 'node:crypto';
import type { RootState } from '../../../../../../redux/store';
import {
    selectAssociatedPanelIds,
    selectVisibleAssociatedSldPanels,
} from '../../../../../../redux/slices/workspace-selectors';
import { selectAssociatedPanelsData } from '../../../../../../redux/slices/workspace-session-selectors';
import { updateZIndex } from '../../../../../../redux/slices/workspace-session-slice';
import { useWorkspaceActions } from '../../../../hooks/use-workspace-actions';

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
 * Manages SLD panels associated with a NAD panel.
 * Tracks local focus state and handles visibility toggles.
 */
export const useSldPanels = ({ nadPanelId }: UseSldPanelsParams): UseSldPanelsReturn => {
    const dispatch = useDispatch();
    const { toggleMinimize, openPanel } = useWorkspaceActions();

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

    const [focusedSldId, setFocusedSldId] = useState<UUID | null>(null);

    const handleBringToFront = useCallback(
        (sldPanelId: UUID) => {
            setFocusedSldId(sldPanelId);
            dispatch(updateZIndex(sldPanelId));
        },
        [dispatch]
    );

    const handleToggleSldVisibility = useCallback(
        (sldPanelId: UUID) => {
            const panel = panelsData[sldPanelId];
            if (!panel) return;

            const isVisible = !panel.isMinimized;

            if (isVisible) {
                if (focusedSldId === sldPanelId) {
                    toggleMinimize(sldPanelId);
                    setFocusedSldId(null);
                } else {
                    handleBringToFront(sldPanelId);
                }
            } else {
                openPanel(sldPanelId);
                handleBringToFront(sldPanelId);
            }
        },
        [panelsData, focusedSldId, handleBringToFront, toggleMinimize, openPanel]
    );

    return {
        associatedPanelIds,
        visibleSldPanels,
        focusedSldId,
        handleBringToFront,
        handleToggleSldVisibility,
    };
};
