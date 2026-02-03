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
    EXPANDED_SIDEBAR_WIDTH: 160,
    CHIP_BAR_HEIGHT: 48,
    TOP_CONTROLS_HEIGHT: 40, // Height of NAD diagram controls at the top

    // Chip bar dimensions (in pixels) for calculating visible chip limit
    CHIP_WIDTH: 90, // Approximate width of a single chip
    COUNTER_CHIP_WIDTH: 40, // Width of the "+N" overflow counter chip
    BUTTON_WIDTH: 15, // Width of action buttons (hide/show, remove, reorganip bar dimensions (in pixels) for calculating visible chip limitze)

    // Layout positioning (relative values)
    PANEL_DEFAULT_WIDTH: 0.35,
    PANEL_DEFAULT_HEIGHT: 0.6,
    CASCADE_START_X: 0.01,
    CASCADE_START_Y: 0.5,
    CASCADE_OFFSET_X: 0.05,
    GRID_START_X: 0.01,
    GRID_GAP_X: 0.03,
    GRID_GAP_Y: 0.03,
    // Grid layout bounds: 0.98 ensures 2% margin from edges for available space
    GRID_AVAILABLE_SPACE: 0.98,
    // Grid vertical offset: 0.99 leaves 1% margin from bottom when calculating start Y position
    GRID_VERTICAL_OFFSET: 0.99,
} as const;
