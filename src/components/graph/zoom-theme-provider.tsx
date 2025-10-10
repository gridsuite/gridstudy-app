/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ReactNode, useMemo } from 'react';
import { ReactFlowState, useStore } from '@xyflow/react';
import { ThemeProvider, Theme } from '@mui/material';

const ZOOM_BREAKPOINTS = {
    MINIMAL_DETAIL: 0.3,
    REDUCED_DETAIL: 0.4,
    STANDARD_DETAIL: 0.5,
};

interface TreeTheme {
    zoom: number;
    is: {
        minimalDetail: boolean;
    };
    atMost: {
        minimalDetail: boolean;
        reducedDetail: boolean;
        standardDetail: boolean;
    };
    atLeast: {
        minimalDetail: boolean;
        standardDetail: boolean;
    };
}

declare module '@mui/material/styles' {
    interface Theme {
        tree: TreeTheme;
    }
}

export const ZoomThemeProvider = ({ children }: { children: ReactNode }) => {
    const zoom = useStore((s: ReactFlowState) => s.transform?.[2] ?? 1);

    const treeMeta = useMemo<TreeTheme>(() => {
        const isMinimalDetail = zoom <= ZOOM_BREAKPOINTS.MINIMAL_DETAIL;
        const isReducedDetail = zoom <= ZOOM_BREAKPOINTS.REDUCED_DETAIL;
        const isStandardDetail = zoom <= ZOOM_BREAKPOINTS.STANDARD_DETAIL;

        return {
            zoom,
            is: {
                minimalDetail: isMinimalDetail,
            },
            atMost: {
                minimalDetail: isMinimalDetail,
                reducedDetail: isReducedDetail,
                standardDetail: isStandardDetail,
            },
            atLeast: {
                minimalDetail: zoom >= ZOOM_BREAKPOINTS.MINIMAL_DETAIL,
                standardDetail: zoom >= ZOOM_BREAKPOINTS.STANDARD_DETAIL,
            },
        };
    }, [zoom]);

    const themeWithTree = useMemo(() => {
        return (outerTheme: Theme) => ({
            ...outerTheme,
            tree: treeMeta,
        });
    }, [treeMeta]);

    return <ThemeProvider theme={themeWithTree}>{children}</ThemeProvider>;
};
