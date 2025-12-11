/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const EDGE_THRESHOLD = 10;

export type SnapRect = { x: number; y: number; width: number; height: number };

const SNAP_ZONES = {
    LEFT_TOP: { x: 0, y: 0, width: 0.5, height: 0.5 },
    LEFT_BOTTOM: { x: 0, y: 0.5, width: 0.5, height: 0.5 },
    RIGHT_TOP: { x: 0.5, y: 0, width: 0.5, height: 0.5 },
    RIGHT_BOTTOM: { x: 0.5, y: 0.5, width: 0.5, height: 0.5 },
    LEFT: { x: 0, y: 0, width: 0.5, height: 1 },
    RIGHT: { x: 0.5, y: 0, width: 0.5, height: 1 },
    TOP: { x: 0, y: 0, width: 1, height: 0.5 },
    BOTTOM: { x: 0, y: 0.5, width: 1, height: 0.5 },
} as const;

export const getSnapZone = (mouseX: number, mouseY: number, containerRect: DOMRect): SnapRect | null => {
    const relX = mouseX - containerRect.left;
    const relY = mouseY - containerRect.top;
    const { width, height } = containerRect;

    const nearLeft = relX < EDGE_THRESHOLD;
    const nearRight = relX > width - EDGE_THRESHOLD;
    const nearTop = relY < EDGE_THRESHOLD;
    const nearBottom = relY > height - EDGE_THRESHOLD;

    // prioritize corners
    if (nearLeft && nearTop) return SNAP_ZONES.LEFT_TOP;
    if (nearLeft && nearBottom) return SNAP_ZONES.LEFT_BOTTOM;
    if (nearRight && nearTop) return SNAP_ZONES.RIGHT_TOP;
    if (nearRight && nearBottom) return SNAP_ZONES.RIGHT_BOTTOM;
    if (nearLeft) return SNAP_ZONES.LEFT;
    if (nearRight) return SNAP_ZONES.RIGHT;
    if (nearTop) return SNAP_ZONES.TOP;
    if (nearBottom) return SNAP_ZONES.BOTTOM;

    return null;
};
