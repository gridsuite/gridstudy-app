/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState, useCallback, RefObject, useEffect } from 'react';
import { Box } from '@mui/material';
import type { MuiStyles } from '@gridsuite/commons-ui';
import { detectSnapZone, calculateZoneRect, type SnapZone, type ZoneRect } from './utils/snap-zone-utils';
import type { UUID } from 'node:crypto';

const styles = {
    snapZone: {
        position: 'absolute',
        backgroundColor: 'rgba(25, 118, 210, 0.15)',
        border: '2px solid',
        borderColor: 'primary.main',
        pointerEvents: 'none',
        zIndex: 99998,
        transition: 'all 0.15s',
    },
} as const satisfies MuiStyles;

interface SnapZonesProps {
    windowId: UUID;
    mouseX: number;
    mouseY: number;
    onSnap: (windowId: UUID, rect: { x: number; y: number; width: number; height: number }) => void;
    containerRef: RefObject<HTMLDivElement>;
}

export function SnapZones({ windowId, mouseX, mouseY, onSnap, containerRef }: SnapZonesProps) {
    const [activeZone, setActiveZone] = useState<SnapZone | null>(null);

    const getZoneRect = useCallback(
        (zone: SnapZone): ZoneRect => {
            if (!containerRef.current) {
                return { x: 0, y: 0, width: 0, height: 0 };
            }

            return calculateZoneRect(zone, containerRef.current.offsetWidth, containerRef.current.offsetHeight);
        },
        [containerRef]
    );

    // Detect which snap zone the cursor is in
    const detectZone = useCallback((): SnapZone | null => {
        if (!containerRef.current) {
            return null;
        }

        const rect = containerRef.current.getBoundingClientRect();
        return detectSnapZone(mouseX, mouseY, rect);
    }, [mouseX, mouseY, containerRef]);

    useEffect(() => {
        const zone = detectZone();
        setActiveZone(zone);

        if (zone) {
            const handleMouseUp = () => {
                const rect = getZoneRect(zone);
                onSnap(windowId, rect);
            };

            window.addEventListener('mouseup', handleMouseUp, { once: true });
            return () => window.removeEventListener('mouseup', handleMouseUp);
        }
    }, [detectZone, getZoneRect, windowId, onSnap]);

    if (!activeZone) {
        return null;
    }

    const zoneRect = getZoneRect(activeZone);

    return (
        <Box
            sx={{
                ...styles.snapZone,
                left: zoneRect.x,
                top: zoneRect.y,
                width: zoneRect.width,
                height: zoneRect.height,
            }}
        />
    );
}
