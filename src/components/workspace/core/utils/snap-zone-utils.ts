/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export type SnapZone = 'left' | 'right' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export type ZoneRect = { x: number; y: number; width: number; height: number };

export const SNAP_CONFIG = {
    EDGE_THRESHOLD: 10,
    CORNER_ZONE_RATIO: 0.2,
} as const;

export function calculateZoneRect(zone: SnapZone, containerWidth: number, containerHeight: number): ZoneRect {
    const halfW = containerWidth / 2;
    const halfH = containerHeight / 2;

    const positions: Record<SnapZone, ZoneRect> = {
        left: { x: 0, y: 0, width: halfW, height: containerHeight },
        right: { x: halfW, y: 0, width: halfW, height: containerHeight },
        top: { x: 0, y: 0, width: containerWidth, height: halfH },
        bottom: { x: 0, y: halfH, width: containerWidth, height: halfH },
        'top-left': { x: 0, y: 0, width: halfW, height: halfH },
        'top-right': { x: halfW, y: 0, width: halfW, height: halfH },
        'bottom-left': { x: 0, y: halfH, width: halfW, height: halfH },
        'bottom-right': { x: halfW, y: halfH, width: halfW, height: halfH },
    };

    return positions[zone];
}

interface EdgeDetection {
    atEdgeLeft: boolean;
    atEdgeRight: boolean;
    atEdgeTop: boolean;
    atEdgeBottom: boolean;
}

function detectEdges(relX: number, relY: number, width: number, height: number): EdgeDetection {
    return {
        atEdgeLeft: relX < SNAP_CONFIG.EDGE_THRESHOLD,
        atEdgeRight: relX > width - SNAP_CONFIG.EDGE_THRESHOLD,
        atEdgeTop: relY < SNAP_CONFIG.EDGE_THRESHOLD,
        atEdgeBottom: relY > height - SNAP_CONFIG.EDGE_THRESHOLD,
    };
}

interface CornerDetection {
    inTopQuarter: boolean;
    inBottomQuarter: boolean;
    inLeftQuarter: boolean;
    inRightQuarter: boolean;
}

function detectCornerZones(relX: number, relY: number, width: number, height: number): CornerDetection {
    const threshold = SNAP_CONFIG.CORNER_ZONE_RATIO;
    return {
        inTopQuarter: relY < height * threshold,
        inBottomQuarter: relY > height * (1 - threshold),
        inLeftQuarter: relX < width * threshold,
        inRightQuarter: relX > width * (1 - threshold),
    };
}

export function detectSnapZone(mouseX: number, mouseY: number, containerRect: DOMRect): SnapZone | null {
    const relX = mouseX - containerRect.left;
    const relY = mouseY - containerRect.top;
    const { width, height } = containerRect;

    const edges = detectEdges(relX, relY, width, height);
    const corners = detectCornerZones(relX, relY, width, height);

    //corner zones have priority over edge zones
    if (edges.atEdgeLeft && corners.inTopQuarter) return 'top-left';
    if (edges.atEdgeLeft && corners.inBottomQuarter) return 'bottom-left';
    if (edges.atEdgeRight && corners.inTopQuarter) return 'top-right';
    if (edges.atEdgeRight && corners.inBottomQuarter) return 'bottom-right';
    if (edges.atEdgeTop && corners.inLeftQuarter) return 'top-left';
    if (edges.atEdgeTop && corners.inRightQuarter) return 'top-right';
    if (edges.atEdgeBottom && corners.inLeftQuarter) return 'bottom-left';
    if (edges.atEdgeBottom && corners.inRightQuarter) return 'bottom-right';

    if (edges.atEdgeLeft) return 'left';
    if (edges.atEdgeRight) return 'right';
    if (edges.atEdgeTop) return 'top';
    if (edges.atEdgeBottom) return 'bottom';

    return null;
}
