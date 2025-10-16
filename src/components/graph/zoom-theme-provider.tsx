/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ReactNode, useEffect, useMemo, useRef } from 'react';
import { ReactFlowState, useStore } from '@xyflow/react';
import { ThemeProvider, Theme } from '@mui/material';
import { DETAIL_LEVELS, ZOOM_THRESHOLDS, type DetailLevel } from './zoom.constants';

interface TreeTheme {
    detailLevel: DetailLevel;
}

declare module '@mui/material/styles' {
    interface Theme {
        tree: TreeTheme;
    }
}

function getDetailLevel(zoom: number): DetailLevel {
    if (zoom <= ZOOM_THRESHOLDS.MINIMAL_MAX) {
        return DETAIL_LEVELS.MINIMAL;
    } else if (zoom < ZOOM_THRESHOLDS.STANDARD_MIN) {
        return DETAIL_LEVELS.REDUCED;
    } else {
        return DETAIL_LEVELS.STANDARD;
    }
}

export const ZoomThemeProvider = ({ children }: { children: ReactNode }) => {
    const zoom = useStore((s: ReactFlowState) => s.transform?.[2] ?? 1);
    const containerRef = useRef<HTMLDivElement>(null);

    // Update CSS variable for dynamic scaling calculations (borders, icons)
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.style.setProperty('--tree-zoom', zoom.toString());
        }
    }, [zoom]);

    // Calculate detail level
    const treeMeta = useMemo<TreeTheme>(() => {
        return { detailLevel: getDetailLevel(zoom) };
    }, [zoom]);

    const themeWithTree = useMemo(() => {
        return (outerTheme: Theme) => ({
            ...outerTheme,
            tree: treeMeta,
        });
    }, [treeMeta]);

    return (
        <div ref={containerRef} style={{ height: '100%', width: '100%' }}>
            <ThemeProvider theme={themeWithTree}>{children}</ThemeProvider>
        </div>
    );
};
