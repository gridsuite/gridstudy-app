/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Theme } from '@mui/material';

/**
 * Zoom-based styling configuration
 * Centralizes all zoom-dependent styling decisions
 */

// Zoom scaling configuration: baseValue + scaleFactor * (1/zoom - 1)
const SCALING = {
    borderWidth: { base: { light: 1, dark: 3 }, scale: 1.5 },
    iconSize: { base: 14, scale: 10 },
    labeledGroupBorder: { base: 3, scale: 2 },
    edgeWidth: { base: 1, scale: 1 },
    borderRadius: { base: 8, scale: 2 },
} as const;

function scale(zoom: number, base: number, factor: number): number {
    return Math.round(base + factor * Math.max(0, 1 / zoom - 1));
}

export const zoomStyles = {
    // Dynamic styling
    borderWidth: (theme: Theme, selected = false): string => {
        const zoom = theme.tree?.zoom ?? 1;
        const base =
            theme.palette.mode === 'dark' && selected ? SCALING.borderWidth.base.dark : SCALING.borderWidth.base.light;
        return `${scale(zoom, base, SCALING.borderWidth.scale)}px`;
    },

    borderRadius: (theme: Theme): string => {
        const zoom = theme.tree?.zoom ?? 1;
        return `${scale(zoom, SCALING.borderRadius.base, SCALING.borderRadius.scale)}px`;
    },

    edgeWidth: (theme: Theme): string => {
        const zoom = theme.tree?.zoom ?? 1;
        return `${scale(zoom, SCALING.edgeWidth.base, SCALING.edgeWidth.scale)}px`;
    },

    iconSize: (theme: Theme): string => {
        const zoom = theme.tree?.zoom ?? 1;
        return `${scale(zoom, SCALING.iconSize.base, SCALING.iconSize.scale)}px`;
    },

    iconStrokeWidth: (theme: Theme): number => {
        const zoom = theme.tree?.zoom ?? 1;
        return 0.3 + Math.max(0, (1 / zoom - 1) * 0.15);
    },

    labeledGroupBorder: (theme: Theme) => {
        const zoom = theme.tree?.zoom ?? 1;
        const width = scale(zoom, SCALING.labeledGroupBorder.base, SCALING.labeledGroupBorder.scale);
        const radius = scale(zoom, SCALING.borderRadius.base, SCALING.borderRadius.scale);
        const style = theme.tree?.is.minimalDetail ? 'solid' : 'dashed';
        return {
            border: `${style} ${width}px #8B8F8F`,
            borderRadius: `${radius}px`,
        };
    },

    // Visibility
    visibility: {
        showHandles: (theme: Theme) => !theme.tree?.atMost.reducedDetail,
        showNodeContent: (theme: Theme) => !theme.tree?.atMost.minimalDetail,
        showLabeledGroupLabel: (theme: Theme) => !theme.tree?.atMost.minimalDetail,
        showBuildStatusLabel: (theme: Theme) => theme.tree?.atLeast.standardDetail ?? false,
        showBuildButton: (theme: Theme) => theme.tree?.atLeast.standardDetail ?? false,
        showGlobalBuildStatus: (theme: Theme) => !(theme.tree?.atMost.minimalDetail ?? false),
    },

    // Layout
    layout: {
        useFullHeightFooter: (theme: Theme) => theme.tree?.atMost.minimalDetail ?? false,
        getCompactChipSize: (theme: Theme, size: number = 3) => ({
            borderRadius: '50%',
            width: theme.spacing(size),
            height: theme.spacing(size),
            minWidth: 'auto',
            padding: 0,
            '& .MuiChip-label': { padding: 0, overflow: 'hidden', display: 'none' },
            '& .MuiChip-icon': { margin: 0 },
        }),
        getLargeChipSize: (theme: Theme) =>
            theme.tree?.atMost.minimalDetail ? zoomStyles.layout.getCompactChipSize(theme, 6) : undefined,
    },
};
