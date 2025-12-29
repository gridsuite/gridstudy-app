/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import type { UUID } from 'node:crypto';
import { useWorkspaceActions } from '../../../../../workspace/hooks/use-workspace-actions';
import { NAD_SLD_CONSTANTS } from '../constants';

export enum LayoutMode {
    GRID = 'grid',
    CASCADE = 'cascade',
}

export interface UseSldLayoutParams {
    readonly visibleSldPanels: UUID[];
    readonly associatedPanelIds: UUID[];
}

export interface UseSldLayoutReturn {
    readonly handleReorganize: (mode: LayoutMode) => void;
    readonly toggleHideAll: () => void;
}

/**
 * Hook to manage layout and visibility of SLD panels
 * Handles reorganization (grid/cascade) and show/hide all operations
 */
export const useSldLayout = ({ visibleSldPanels, associatedPanelIds }: UseSldLayoutParams): UseSldLayoutReturn => {
    const { updatePanelGeometry, minimizePanels, openSLDPanels } = useWorkspaceActions();

    // Reorganize visible SLDs in grid or cascade layout
    const handleReorganize = useCallback(
        (mode: LayoutMode) => {
            const count = visibleSldPanels.length;

            if (count === 0) return;

            if (mode === LayoutMode.CASCADE) {
                visibleSldPanels.forEach((sldPanelId, index) => {
                    updatePanelGeometry(sldPanelId, {
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

                visibleSldPanels.forEach((sldPanelId, index) => {
                    const col = index % cols;
                    const row = Math.floor(index / cols);

                    updatePanelGeometry(sldPanelId, {
                        position: {
                            x: NAD_SLD_CONSTANTS.GRID_START_X + col * (panelWidth + NAD_SLD_CONSTANTS.GRID_GAP_X),
                            y: startY + row * (panelHeight + NAD_SLD_CONSTANTS.GRID_GAP_Y),
                        },
                        size: { width: panelWidth, height: panelHeight },
                    });
                });
            }
        },
        [updatePanelGeometry, visibleSldPanels]
    );

    // Toggle between hide all and show all SLDs
    const toggleHideAll = useCallback(() => {
        if (visibleSldPanels.length > 0) {
            // Minimize all visible SLDs (keeps associations)
            minimizePanels(visibleSldPanels);
        } else {
            // Un-minimize all associated SLDs (bulk operation)
            openSLDPanels(associatedPanelIds);
        }
    }, [visibleSldPanels, associatedPanelIds, minimizePanels, openSLDPanels]);

    return {
        handleReorganize,
        toggleHideAll,
    };
};
