/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { WindowType } from '../types/workspace.types';
import type { WindowSize, WindowPosition } from '../types/workspace.types';

export const Z_INDEX_BASE = 100;

export const WORKSPACE_MENU_VALUE = 'workspace-menu';

export const STANDARD_WINDOW_IDS = {
    SPREADSHEET: 'spreadsheet',
    TREE: 'tree',
    LOGS: 'logs',
    RESULTS: 'results',
    PARAMETERS: 'parameters',
    MAP: 'map',
    NODE_EDITOR: 'node-editor',
} as const;

export const MIN_WINDOW_SIZE: WindowSize = {
    width: 200,
    height: 150,
};

export const DEFAULT_WINDOW_POSITION_OFFSET_MIN = 50;
export const DEFAULT_WINDOW_POSITION_OFFSET_MAX = 200;

interface WindowConfig {
    defaultSize: WindowSize;
    defaultPosition: WindowPosition;
    title: string;
    minSize?: WindowSize;
}

export const DEFAULT_WINDOW_CONFIGS: Record<WindowType, WindowConfig> = {
    [WindowType.TREE]: {
        title: 'Tree',
        defaultSize: { width: 400, height: 500 },
        minSize: { width: 300, height: 300 },
        defaultPosition: { x: 0, y: 0 },
    },
    [WindowType.DIAGRAM]: {
        title: 'Diagram',
        defaultSize: { width: 700, height: 500 },
        minSize: { width: 500, height: 400 },
        defaultPosition: { x: 50, y: 0 },
    },
    [WindowType.MAP]: {
        title: 'Map',
        defaultSize: { width: 800, height: 600 },
        minSize: { width: 500, height: 500 },
        defaultPosition: { x: 100, y: 100 },
    },
    [WindowType.SPREADSHEET]: {
        title: 'Spreadsheet',
        defaultSize: { width: 1000, height: 500 },
        minSize: { width: 600, height: 400 },
        defaultPosition: { x: 100, y: 0 },
    },
    [WindowType.PARAMETERS]: {
        title: 'parameters',
        defaultSize: { width: 900, height: 500 },
        minSize: { width: 500, height: 400 },
        defaultPosition: { x: 250, y: 0 },
    },
    [WindowType.LOGS]: {
        title: 'Logs',
        defaultSize: { width: 900, height: 500 },
        minSize: { width: 600, height: 300 },
        defaultPosition: { x: 200, y: 0 },
    },
    [WindowType.RESULTS]: {
        title: 'Results',
        defaultSize: { width: 1000, height: 500 },
        minSize: { width: 600, height: 400 },
        defaultPosition: { x: 150, y: 0 },
    },
    [WindowType.NODE_EDITOR]: {
        title: 'modifications',
        defaultSize: { width: 400, height: 500 },
        minSize: { width: 300, height: 300 },
        defaultPosition: { x: 50, y: 0 },
    },
    [WindowType.EVENT_SCENARIO]: {
        title: 'DynamicSimulation',
        defaultSize: { width: 400, height: 500 },
        minSize: { width: 300, height: 300 },
        defaultPosition: { x: 50, y: 0 },
    },
};

export const getWindowConfig = (type: WindowType): WindowConfig => {
    return DEFAULT_WINDOW_CONFIGS[type];
};
