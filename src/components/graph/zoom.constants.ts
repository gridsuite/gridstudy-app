/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const DETAIL_LEVELS = {
    MINIMAL: 'minimal',
    REDUCED: 'reduced',
    STANDARD: 'standard',
} as const;

export type DetailLevel = (typeof DETAIL_LEVELS)[keyof typeof DETAIL_LEVELS];

export const ZOOM_THRESHOLDS = {
    MINIMAL_MAX: 0.3,
    STANDARD_MIN: 0.5,
} as const;
