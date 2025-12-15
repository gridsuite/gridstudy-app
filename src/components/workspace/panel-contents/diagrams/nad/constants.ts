/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const NAD_SLD_CONSTANTS = {
    MAX_NAVIGATION_HISTORY: 10,

    // React-RND defaults for floating SLD panels
    DEFAULT_RND_SIZE: { width: 600, height: 400 },
    MIN_RND_WIDTH: 138,
    MIN_RND_HEIGHT: 138,
    CHIP_BAR_HEIGHT: 48,
    TOP_CONTROLS_HEIGHT: 40, // Height of NAD diagram controls at the top

    // Layout positioning (relative values)
    PANEL_DEFAULT_WIDTH: 0.35,
    PANEL_DEFAULT_HEIGHT: 0.6,
    CASCADE_START_X: 0.01,
    CASCADE_START_Y: 0.5,
    CASCADE_OFFSET_X: 0.05,
    GRID_START_X: 0.01,
    GRID_GAP_X: 0.03,
    GRID_GAP_Y: 0.03,
} as const;
