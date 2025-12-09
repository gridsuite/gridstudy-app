/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const NAD_SLD_CONSTANTS = {
    MAX_NAVIGATION_HISTORY: 10,

    SCROLL_INTO_VIEW_DELAY: 300,

    DRAWER_HEADER_HEIGHT: 32,

    DRAWER_MIN_HEIGHT_PERCENT: 25,

    DRAWER_MAX_HEIGHT_PERCENT: 85,

    DRAWER_DEFAULT_HEIGHT_PERCENT: 30,

    DRAWER_FULLSCREEN_HEIGHT_PERCENT: 20,

    FULLSCREEN_TOP_OFFSET: 40,

    FULLSCREEN_LEFT_OFFSET: 15,

    SIDEBAR_COLLAPSED_WIDTH: 55,

    SIDEBAR_EXPANDED_WIDTH: 175,

    FULLSCREEN_BOTTOM_OFFSET: 'calc(20% + 5px)',
} as const;
