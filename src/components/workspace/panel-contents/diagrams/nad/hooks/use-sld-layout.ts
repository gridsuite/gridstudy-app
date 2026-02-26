/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { UUID } from 'node:crypto';
import type { RootState } from '../../../../../../redux/store';
import { selectVisibleAssociatedSldPanelIds } from '../../../../../../redux/slices/workspace-selectors';
import { useWorkspacePanelActions } from '../../../../../workspace/hooks/use-workspace-panel-actions';
import { NAD_SLD_CONSTANTS } from '../constants';

export enum LayoutMode {
    GRID = 'grid',
    CASCADE = 'cascade',
}

export interface UseSldLayoutParams {
    readonly nadPanelId: UUID;
}

export interface UseSldLayoutReturn {
    readonly handleReorganize: (mode: LayoutMode) => void;
    readonly toggleHideAll: () => void;
}

/**
 * Hook to manage layout and visibility of SLD panels
 * Handles reorganization (grid/cascade) and show/hide all operations
 */
export const useSldLayout = ({ nadPanelId }: UseSldLayoutParams): UseSldLayoutReturn => {
    const { updatePanelGeometry, hideAssociatedSlds, showAssociatedSlds } = useWorkspacePanelActions();

    const visibleSldPanelIds = useSelector((state: RootState) => selectVisibleAssociatedSldPanelIds(state, nadPanelId));

    // Reorganize visible SLDs in grid or cascade layout
    const handleReorganize = useCallback(
        (mode: LayoutMode) => {
            const count = visibleSldPanelIds.length;

            if (count === 0) return;

            if (mode === LayoutMode.CASCADE) {
                visibleSldPanelIds.forEach((panelId, index) => {
                    updatePanelGeometry(panelId, {
                        position: {
                            x: NAD_SLD_CONSTANTS.CASCADE_START_X + index * NAD_SLD_CONSTANTS.CASCADE_OFFSET_X,
                            y: NAD_SLD_CONSTANTS.CASCADE_START_Y,
                        },
                        size: {
                            width: NAD_SLD_CONSTANTS.PANEL_DEFAULT_WIDTH,
                            height: NAD_SLD_CONSTANTS.PANEL_DEFAULT_HEIGHT,
                        },
                    });
                });
            } else {
                // Grid layout: calculate optimal grid dimensions
                const cols = Math.ceil(Math.sqrt(count));
                const rows = Math.ceil(count / cols);
                const panelWidth =
                    (NAD_SLD_CONSTANTS.GRID_AVAILABLE_SPACE - (cols - 1) * NAD_SLD_CONSTANTS.GRID_GAP_X) / cols;
                const panelHeight =
                    (NAD_SLD_CONSTANTS.GRID_AVAILABLE_SPACE - (rows - 1) * NAD_SLD_CONSTANTS.GRID_GAP_Y) / rows;
                const totalHeight = rows * panelHeight + (rows - 1) * NAD_SLD_CONSTANTS.GRID_GAP_Y;
                const startY = Math.max(
                    NAD_SLD_CONSTANTS.GRID_START_X,
                    NAD_SLD_CONSTANTS.GRID_VERTICAL_OFFSET - totalHeight
                );

                visibleSldPanelIds.forEach((panelId, index) => {
                    const col = index % cols;
                    const row = Math.floor(index / cols);

                    updatePanelGeometry(panelId, {
                        position: {
                            x: NAD_SLD_CONSTANTS.GRID_START_X + col * (panelWidth + NAD_SLD_CONSTANTS.GRID_GAP_X),
                            y: startY + row * (panelHeight + NAD_SLD_CONSTANTS.GRID_GAP_Y),
                        },
                        size: { width: panelWidth, height: panelHeight },
                    });
                });
            }
        },
        [updatePanelGeometry, visibleSldPanelIds]
    );

    // Toggle between hide all and show all SLDs
    const toggleHideAll = useCallback(() => {
        if (visibleSldPanelIds.length > 0) {
            hideAssociatedSlds(nadPanelId);
        } else {
            showAssociatedSlds(nadPanelId);
        }
    }, [visibleSldPanelIds.length, nadPanelId, hideAssociatedSlds, showAssociatedSlds]);

    return {
        handleReorganize,
        toggleHideAll,
    };
};
