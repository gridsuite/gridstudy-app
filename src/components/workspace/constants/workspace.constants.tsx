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

export const DEFAULT_WINDOW_POSITION_OFFSET_MIN = 0.02; // 2%

interface PanelConfig {
    defaultSize: PanelSize; // Relative (0-1)
    defaultPosition: PanelPosition; // Relative (0-1)
    title: string;
    minSize?: PanelSize; // Pixels
    icon: ReactElement;
}

export const DEFAULT_PANEL_CONFIGS: Record<PanelType, PanelConfig> = {
    [PanelType.TREE]: {
        title: 'Tree',
        defaultSize: { width: 0.2, height: 0.6 }, // 20% width, 60% height
        minSize: { width: 300, height: 300 },
        defaultPosition: { x: 0, y: 0 },
        icon: <AccountTree fontSize="inherit" sx={{ transform: 'scaleY(-1) rotate(-90deg)' }} />,
    },
    [PanelType.SLD_SUBSTATION]: {
        title: 'SUBSTATION',
        defaultSize: { width: 0.3, height: 0.5 },
        minSize: { width: 500, height: 400 },
        defaultPosition: { x: 0.05, y: 0 },
        icon: <Radar fontSize="inherit" />,
    },
    [PanelType.SLD_VOLTAGE_LEVEL]: {
        title: 'VOLTAGE LEVEL',
        defaultSize: { width: 0.3, height: 0.5 },
        minSize: { width: 500, height: 400 },
        defaultPosition: { x: 0.1, y: 0 },
        icon: <Adjust fontSize="inherit" />,
    },
    [PanelType.NAD]: {
        title: 'NAD',
        defaultSize: { width: 0.3, height: 0.5 },
        minSize: { width: 500, height: 400 },
        defaultPosition: { x: 0.15, y: 0 },
        icon: <Hub fontSize="inherit" />,
    },
    [PanelType.MAP]: {
        title: 'Map',
        defaultSize: { width: 0.6, height: 0.6 },
        minSize: { width: 500, height: 500 },
        defaultPosition: { x: 0.1, y: 0.1 },
        icon: <Public fontSize="inherit" />,
    },
    [PanelType.SPREADSHEET]: {
        title: 'Spreadsheet',
        defaultSize: { width: 0.5, height: 0.6 },
        minSize: { width: 600, height: 400 },
        defaultPosition: { x: 0.1, y: 0 },
        icon: <TableChart fontSize="inherit" />,
    },
    [PanelType.PARAMETERS]: {
        title: 'parameters',
        defaultSize: { width: 0.5, height: 0.6 },
        minSize: { width: 600, height: 400 },
        defaultPosition: { x: 0.25, y: 0 },
        icon: <Settings fontSize="inherit" />,
    },
    [PanelType.LOGS]: {
        title: 'Logs',
        defaultSize: { width: 0.5, height: 0.6 },
        minSize: { width: 600, height: 400 },
        defaultPosition: { x: 0.2, y: 0 },
        icon: <TextSnippet fontSize="inherit" />,
    },
    [PanelType.RESULTS]: {
        title: 'Results',
        defaultSize: { width: 0.5, height: 0.6 },
        minSize: { width: 600, height: 400 },
        defaultPosition: { x: 0.15, y: 0 },
        icon: <Assessment fontSize="inherit" />,
    },
    [PanelType.NODE_EDITOR]: {
        title: 'modifications',
        defaultSize: { width: 0.2, height: 0.6 },
        minSize: { width: 300, height: 300 },
        defaultPosition: { x: 0.05, y: 0 },
        icon: <Tune fontSize="inherit" />,
    },
    [PanelType.EVENT_SCENARIO]: {
        title: 'DynamicSimulation',
        defaultSize: { width: 0.2, height: 0.6 },
        minSize: { width: 300, height: 300 },
        defaultPosition: { x: 0.05, y: 0 },
        icon: <OfflineBolt fontSize="inherit" />,
    },
};

export const getPanelConfig = (type: PanelType): PanelConfig => {
    const config = DEFAULT_PANEL_CONFIGS[type];

    // Randomize position for SLD and NAD windows to avoid stacking
    if (type === PanelType.SLD_VOLTAGE_LEVEL || type === PanelType.SLD_SUBSTATION || type === PanelType.NAD) {
        const randomValue = crypto.getRandomValues(new Uint32Array(1))[0];
        const offset = DEFAULT_WINDOW_POSITION_OFFSET_MIN + (randomValue % 60) / 1000;

        return {
            ...config,
            defaultPosition: { x: offset, y: offset },
        };
    }

    return config;
};
