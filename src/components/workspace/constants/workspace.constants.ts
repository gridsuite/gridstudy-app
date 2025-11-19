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

interface WindowConfig {
    defaultSize: WindowSize;
    defaultPosition: WindowPosition;
    title: string;
    minSize?: WindowSize;
}

export const DEFAULT_WINDOW_CONFIGS: Record<WindowType, WindowConfig> = {
    [WindowType.TREE]: {
        title: 'Tree',
        defaultSize: { width: 400, height: 600 },
        defaultPosition: { x: 50, y: 50 },
        minSize: { width: 300, height: 400 },
    },
    [WindowType.SPREADSHEET]: {
        title: 'Spreadsheet',
        defaultSize: { width: 800, height: 600 },
        defaultPosition: { x: 100, y: 100 },
        minSize: { width: 400, height: 300 },
    },
    [WindowType.LOGS]: {
        title: 'Logs',
        defaultSize: { width: 600, height: 400 },
        defaultPosition: { x: 150, y: 150 },
        minSize: { width: 300, height: 200 },
    },
    [WindowType.RESULTS]: {
        title: 'Results',
        defaultSize: { width: 700, height: 500 },
        defaultPosition: { x: 200, y: 200 },
        minSize: { width: 400, height: 300 },
    },
    [WindowType.PARAMETERS]: {
        title: 'parameters',
        defaultSize: { width: 500, height: 400 },
        defaultPosition: { x: 250, y: 250 },
        minSize: { width: 300, height: 250 },
    },
    [WindowType.DIAGRAM]: {
        title: 'Diagram',
        defaultSize: { width: 800, height: 600 },
        defaultPosition: { x: 300, y: 300 },
        minSize: { width: 400, height: 300 },
    },
    [WindowType.MAP]: {
        title: 'OpenMapCard',
        defaultSize: { width: 900, height: 700 },
        defaultPosition: { x: 150, y: 100 },
        minSize: { width: 500, height: 400 },
    },
    [WindowType.NODE_EDITOR]: {
        title: 'NodeEditor',
        defaultSize: { width: 600, height: 500 },
        defaultPosition: { x: 200, y: 150 },
        minSize: { width: 400, height: 300 },
    },
};

export const getWindowConfig = (type: WindowType): WindowConfig => {
    return DEFAULT_WINDOW_CONFIGS[type];
};
