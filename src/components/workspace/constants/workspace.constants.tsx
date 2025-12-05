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
    Adjust,
    Radar,
} from '@mui/icons-material';
import { PanelType } from '../types/workspace.types';
import type { PanelSize, PanelPosition } from '../types/workspace.types';
import type { ReactElement } from 'react';

export const WORKSPACE_MENU_VALUE = 'workspace-menu';

export const DEFAULT_WINDOW_POSITION_OFFSET_MIN = 20;
export const DEFAULT_WINDOW_POSITION_OFFSET_MAX = 100;
interface PanelConfig {
    defaultSize: PanelSize;
    defaultPosition: PanelPosition;
    title: string;
    minSize?: PanelSize;
    icon: ReactElement;
}

export const DEFAULT_PANEL_CONFIGS: Record<PanelType, PanelConfig> = {
    [PanelType.TREE]: {
        title: 'Tree',
        defaultSize: { width: 400, height: 500 },
        minSize: { width: 300, height: 300 },
        defaultPosition: { x: 0, y: 0 },
        icon: <AccountTree fontSize="inherit" sx={{ transform: 'scaleY(-1) rotate(-90deg)' }} />,
    },
    [PanelType.SLD_SUBSTATION]: {
        title: 'SUBSTATION',
        defaultSize: { width: 700, height: 500 },
        minSize: { width: 500, height: 400 },
        defaultPosition: { x: 50, y: 0 },
        icon: <Radar fontSize="inherit" />,
    },
    [PanelType.SLD_VOLTAGE_LEVEL]: {
        title: 'VOLTAGE LEVEL',
        defaultSize: { width: 700, height: 500 },
        minSize: { width: 500, height: 400 },
        defaultPosition: { x: 60, y: 0 },
        icon: <Adjust fontSize="inherit" />,
    },
    [PanelType.NAD]: {
        title: 'NAD',
        defaultSize: { width: 700, height: 500 },
        minSize: { width: 500, height: 400 },
        defaultPosition: { x: 70, y: 0 },
        icon: <Hub fontSize="inherit" />,
    },
    [PanelType.MAP]: {
        title: 'Map',
        defaultSize: { width: 800, height: 600 },
        minSize: { width: 500, height: 500 },
        defaultPosition: { x: 100, y: 100 },
        icon: <Public fontSize="inherit" />,
    },
    [PanelType.SPREADSHEET]: {
        title: 'Spreadsheet',
        defaultSize: { width: 1000, height: 500 },
        minSize: { width: 600, height: 400 },
        defaultPosition: { x: 100, y: 0 },
        icon: <TableChart fontSize="inherit" />,
    },
    [PanelType.PARAMETERS]: {
        title: 'parameters',
        defaultSize: { width: 900, height: 500 },
        minSize: { width: 500, height: 400 },
        defaultPosition: { x: 250, y: 0 },
        icon: <Settings fontSize="inherit" />,
    },
    [PanelType.LOGS]: {
        title: 'Logs',
        defaultSize: { width: 900, height: 500 },
        minSize: { width: 600, height: 300 },
        defaultPosition: { x: 200, y: 0 },
        icon: <TextSnippet fontSize="inherit" />,
    },
    [PanelType.RESULTS]: {
        title: 'Results',
        defaultSize: { width: 1000, height: 500 },
        minSize: { width: 600, height: 400 },
        defaultPosition: { x: 150, y: 0 },
        icon: <Assessment fontSize="inherit" />,
    },
    [PanelType.NODE_EDITOR]: {
        title: 'modifications',
        defaultSize: { width: 400, height: 500 },
        minSize: { width: 340, height: 300 },
        defaultPosition: { x: 50, y: 0 },
        icon: <Tune fontSize="inherit" />,
    },
    [PanelType.EVENT_SCENARIO]: {
        title: 'DynamicSimulation',
        defaultSize: { width: 400, height: 500 },
        minSize: { width: 300, height: 300 },
        defaultPosition: { x: 50, y: 0 },
        icon: <OfflineBolt fontSize="inherit" />,
    },
};

export const getPanelConfig = (type: PanelType): PanelConfig => {
    const config = DEFAULT_PANEL_CONFIGS[type];

    // Randomize position for SLD and NAD windows to avoid stacking
    if (type === PanelType.SLD_VOLTAGE_LEVEL || type === PanelType.SLD_SUBSTATION || type === PanelType.NAD) {
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
