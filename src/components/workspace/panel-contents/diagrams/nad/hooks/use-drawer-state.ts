/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState, useEffect, useCallback } from 'react';
import type { UUID } from 'node:crypto';
import { NAD_SLD_CONSTANTS } from '../constants';

interface UseDrawerStateParams {
    focusedPanelId: UUID | null;
    fullscreenPanelId: UUID | null;
    onClearFocus: () => void;
}

export function useDrawerState({ focusedPanelId, fullscreenPanelId, onClearFocus }: UseDrawerStateParams) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [heightPercent, setHeightPercent] = useState<number>(NAD_SLD_CONSTANTS.DRAWER_DEFAULT_HEIGHT_PERCENT);

    // Auto-expand drawer when focusing a panel
    useEffect(() => {
        if (focusedPanelId && isCollapsed) {
            setIsCollapsed(false);
        }
    }, [focusedPanelId, isCollapsed]);

    // Handle fullscreen mode
    useEffect(() => {
        if (fullscreenPanelId) {
            setHeightPercent(NAD_SLD_CONSTANTS.DRAWER_FULLSCREEN_HEIGHT_PERCENT);
            setIsCollapsed(false);
        }
    }, [fullscreenPanelId]);

    const toggleCollapse = useCallback(() => {
        setIsCollapsed((prev) => {
            const newCollapsedState = !prev;
            // Clear focus when collapsing to prevent auto-expansion
            if (newCollapsedState) {
                onClearFocus();
            }
            return newCollapsedState;
        });
    }, [onClearFocus]);

    const setHeight = useCallback((height: number) => {
        setHeightPercent(height);
    }, []);

    return {
        isCollapsed,
        heightPercent,
        toggleCollapse,
        setHeight,
    };
}
