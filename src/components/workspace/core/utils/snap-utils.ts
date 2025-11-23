/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const EDGE_THRESHOLD = 10;

export type SnapRect = { x: number; y: number; width: number; height: number };

export const getSnapZone = (mouseX: number, mouseY: number, containerRect: DOMRect): SnapRect | null => {
    const relX = mouseX - containerRect.left;
    const relY = mouseY - containerRect.top;
    const { width, height } = containerRect;
    const halfW = width / 2;
    const halfH = height / 2;

    const nearLeft = relX < EDGE_THRESHOLD;
    const nearRight = relX > width - EDGE_THRESHOLD;
    const nearTop = relY < EDGE_THRESHOLD;
    const nearBottom = relY > height - EDGE_THRESHOLD;

    // prioritize corners
    if (nearLeft && nearTop) return { x: 0, y: 0, width: halfW, height: halfH };
    if (nearLeft && nearBottom) return { x: 0, y: halfH, width: halfW, height: halfH };
    if (nearRight && nearTop) return { x: halfW, y: 0, width: halfW, height: halfH };
    if (nearRight && nearBottom) return { x: halfW, y: halfH, width: halfW, height: halfH };
    if (nearLeft) return { x: 0, y: 0, width: halfW, height };
    if (nearRight) return { x: halfW, y: 0, width: halfW, height };
    if (nearTop) return { x: 0, y: 0, width, height: halfH };
    if (nearBottom) return { x: 0, y: halfH, width, height: halfH };

    return null;
};
