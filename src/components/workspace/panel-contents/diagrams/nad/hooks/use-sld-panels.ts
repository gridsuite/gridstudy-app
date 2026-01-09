/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import type { UUID } from 'node:crypto';
import { selectPanels } from '../../../../../../redux/slices/workspace-selectors';
import { useWorkspaceActions } from '../../../../hooks/use-workspace-actions';

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
 * Tracks local focus state and handles visibility toggles.
 */
export const useAssociatedSlds = ({ nadPanelId: _nadPanelId }: UseAssociatedSldsParams): UseAssociatedSldsReturn => {
    const panels = useSelector(selectPanels, shallowEqual);
    const { toggleMinimized, bringToFront } = useWorkspaceActions();

    const [focusedSldId, setFocusedSldId] = useState<UUID | null>(null);

    const handleBringToFront = useCallback(
        (sldPanelId: UUID) => {
            setFocusedSldId(sldPanelId);
            bringToFront(sldPanelId);
        },
        [bringToFront]
    );

    const handleToggleSldVisibility = useCallback(
        (sldPanelId: UUID) => {
            const panel = panels.find((p) => p.id === sldPanelId);
            if (!panel) return;

            const isVisible = !panel.minimized;

            if (isVisible) {
                if (focusedSldId === sldPanelId) {
                    toggleMinimized(sldPanelId);
                    setFocusedSldId(null);
                } else {
                    handleBringToFront(sldPanelId);
                }
            } else {
                toggleMinimized(sldPanelId);
                handleBringToFront(sldPanelId);
            }
        },
        [panels, focusedSldId, handleBringToFront, toggleMinimized]
    );

    return {
        focusedSldId,
        handleBringToFront,
        handleToggleSldVisibility,
    };
};
