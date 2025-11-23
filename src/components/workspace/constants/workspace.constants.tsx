/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    AccountTree,
    TableChart,
    TextSnippet,
    Assessment,
    Settings,
    Tune,
    OfflineBolt,
    Public,
    Hub,
    GridGoldenratio,
} from '@mui/icons-material';
import { WindowType } from '../types/workspace.types';
import type { WindowSize, WindowPosition } from '../types/workspace.types';
import type { ReactElement } from 'react';

export const WORKSPACE_MENU_VALUE = 'workspace-menu';

export const DEFAULT_WINDOW_POSITION_OFFSET_MIN = 20;
export const DEFAULT_WINDOW_POSITION_OFFSET_MAX = 100;
interface WindowConfig {
    defaultSize: WindowSize;
    defaultPosition: WindowPosition;
    title: string;
    minSize?: WindowSize;
    icon: ReactElement;
}

export const DEFAULT_WINDOW_CONFIGS: Record<WindowType, WindowConfig> = {
    [WindowType.TREE]: {
        title: 'Tree',
        defaultSize: { width: 400, height: 500 },
        minSize: { width: 300, height: 300 },
        defaultPosition: { x: 0, y: 0 },
        icon: <AccountTree fontSize="inherit" sx={{ transform: 'scaleY(-1) rotate(-90deg)' }} />,
    },
    [WindowType.SLD]: {
        title: 'SLD',
        defaultSize: { width: 700, height: 500 },
        minSize: { width: 500, height: 400 },
        defaultPosition: { x: 50, y: 0 },
        icon: <GridGoldenratio fontSize="inherit" />,
    },
    [WindowType.NAD]: {
        title: 'NAD',
        defaultSize: { width: 700, height: 500 },
        minSize: { width: 500, height: 400 },
        defaultPosition: { x: 50, y: 0 },
        icon: <Hub fontSize="inherit" />,
    },
    [WindowType.MAP]: {
        title: 'Map',
        defaultSize: { width: 800, height: 600 },
        minSize: { width: 500, height: 500 },
        defaultPosition: { x: 100, y: 100 },
        icon: <Public fontSize="inherit" />,
    },
    [WindowType.SPREADSHEET]: {
        title: 'Spreadsheet',
        defaultSize: { width: 1000, height: 500 },
        minSize: { width: 600, height: 400 },
        defaultPosition: { x: 100, y: 0 },
        icon: <TableChart fontSize="inherit" />,
    },
    [WindowType.PARAMETERS]: {
        title: 'parameters',
        defaultSize: { width: 900, height: 500 },
        minSize: { width: 500, height: 400 },
        defaultPosition: { x: 250, y: 0 },
        icon: <Settings fontSize="inherit" />,
    },
    [WindowType.LOGS]: {
        title: 'Logs',
        defaultSize: { width: 900, height: 500 },
        minSize: { width: 600, height: 300 },
        defaultPosition: { x: 200, y: 0 },
        icon: <TextSnippet fontSize="inherit" />,
    },
    [WindowType.RESULTS]: {
        title: 'Results',
        defaultSize: { width: 1000, height: 500 },
        minSize: { width: 600, height: 400 },
        defaultPosition: { x: 150, y: 0 },
        icon: <Assessment fontSize="inherit" />,
    },
    [WindowType.NODE_EDITOR]: {
        title: 'modifications',
        defaultSize: { width: 400, height: 500 },
        minSize: { width: 300, height: 300 },
        defaultPosition: { x: 50, y: 0 },
        icon: <Tune fontSize="inherit" />,
    },
    [WindowType.EVENT_SCENARIO]: {
        title: 'DynamicSimulation',
        defaultSize: { width: 400, height: 500 },
        minSize: { width: 300, height: 300 },
        defaultPosition: { x: 50, y: 0 },
        icon: <OfflineBolt fontSize="inherit" />,
    },
};

export const getWindowConfig = (type: WindowType): WindowConfig => {
    const config = DEFAULT_WINDOW_CONFIGS[type];

    // Randomize position for SLD and NAD windows to avoid stacking
    if (type === WindowType.SLD || type === WindowType.NAD) {
        // secure random number between 0 and range
        const range = DEFAULT_WINDOW_POSITION_OFFSET_MAX - DEFAULT_WINDOW_POSITION_OFFSET_MIN;
        const randomValue = crypto.getRandomValues(new Uint32Array(1))[0];
        const randomOffset = DEFAULT_WINDOW_POSITION_OFFSET_MIN + (randomValue % range);

        return {
            ...config,
            defaultPosition: {
                x: randomOffset,
                y: randomOffset,
            },
        };
    }

    return config;
};
