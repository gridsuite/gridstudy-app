/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Theme } from '@mui/material';
import { DETAIL_LEVELS } from './zoom.constants';

/**
 * Zoom-based styling configuration
 * Uses CSS custom properties (--tree-zoom) for efficient scaling without re-renders
 * Formula: baseValue + scaleFactor * (1/zoom - 1)
 */

const SCALING = {
    borderWidth: { base: { light: 1, dark: 3 }, scale: 1.5 },
    iconSize: { base: 15, scale: 10 },
    iconStrokeWidth: { base: 0.3, scale: 0.15 },
    labeledGroupBorder: { base: 3, scale: 2 },
    edgeWidth: { base: 1, scale: 1 },
    borderRadius: { base: 8, scale: 2 },
} as const;

/**
 * Generate CSS calc() expression for zoom-based scaling
 * calc(base + scale * (1/var(--tree-zoom) - 1))
 */
function cssScale(base: number, scale: number): string {
    return `calc(${base}px + ${scale}px * (1 / var(--tree-zoom, 1) - 1))`;
}

export const zoomStyles = {
    // Dynamic styling using CSS custom properties
    borderWidth: (theme: Theme, selected = false): string => {
        const base =
            theme.palette.mode === 'dark' && selected ? SCALING.borderWidth.base.dark : SCALING.borderWidth.base.light;
        return cssScale(base, SCALING.borderWidth.scale);
    },

    borderRadius: (theme: Theme): string => {
        return cssScale(SCALING.borderRadius.base, SCALING.borderRadius.scale);
    },

    edgeWidth: (theme: Theme): string => {
        return cssScale(SCALING.edgeWidth.base, SCALING.edgeWidth.scale);
    },

    iconSize: (theme: Theme): string => {
        return cssScale(SCALING.iconSize.base, SCALING.iconSize.scale);
    },

    iconStrokeWidth: (theme: Theme): string => {
        return cssScale(SCALING.iconStrokeWidth.base, SCALING.iconStrokeWidth.scale);
    },

    labeledGroupBorder: (theme: Theme) => {
        const width = cssScale(SCALING.labeledGroupBorder.base, SCALING.labeledGroupBorder.scale);
        const radius = cssScale(SCALING.borderRadius.base, SCALING.borderRadius.scale);
        const style = theme.tree?.detailLevel === DETAIL_LEVELS.MINIMAL ? 'solid' : 'dashed';
        return {
            border: `${style} ${width} #8B8F8F`,
            borderRadius: radius,
        };
    },

    // Visibility
    visibility: {
        showHandles: (theme: Theme) => theme.tree?.detailLevel === DETAIL_LEVELS.STANDARD,
        showNodeContent: (theme: Theme) => theme.tree?.detailLevel !== DETAIL_LEVELS.MINIMAL,
        showLabeledGroupLabel: (theme: Theme) => theme.tree?.detailLevel !== DETAIL_LEVELS.MINIMAL,
        showBuildStatusLabel: (theme: Theme) => theme.tree?.detailLevel === DETAIL_LEVELS.STANDARD,
        showBuildButton: (theme: Theme) => theme.tree?.detailLevel === DETAIL_LEVELS.STANDARD,
        showGlobalBuildStatus: (theme: Theme) => theme.tree?.detailLevel !== DETAIL_LEVELS.MINIMAL,
    },

    // Layout
    layout: {
        useFullHeightFooter: (theme: Theme) => theme.tree?.detailLevel === DETAIL_LEVELS.MINIMAL,
        getCompactChipSize: (theme: Theme, size: number = 3) => ({
            borderRadius: '50%',
            width: theme.spacing(size),
            height: theme.spacing(size),
            minWidth: 'auto',
            padding: 0,
            '& .MuiChip-label': { padding: 0, overflow: 'hidden', display: 'none' },
            '& .MuiChip-icon': { margin: 0 },
        }),
        getLargeChipSize: (theme: Theme): React.CSSProperties | undefined =>
            theme.tree?.detailLevel === DETAIL_LEVELS.MINIMAL
                ? zoomStyles.layout.getCompactChipSize(theme, 6)
                : undefined,
    },
};
