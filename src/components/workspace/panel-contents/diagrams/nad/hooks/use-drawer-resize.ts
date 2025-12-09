/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';

interface UseDrawerResizeParams {
    containerRef: React.RefObject<HTMLDivElement | null>;
    heightPercent: number;
    setHeightPercent: (height: number) => void;
    minHeightPercent?: number;
    maxHeightPercent?: number;
}

interface UseDrawerResizeReturn {
    isResizing: boolean;
    handleResizeStart: (e: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * Hook to handle vertical resizing of the associated SLD drawer container
 * Calculates height as a percentage of the parent NAD container
 */
export function useDrawerResize({
    containerRef,
    heightPercent,
    setHeightPercent,
    minHeightPercent = 10,
    maxHeightPercent = 90,
}: UseDrawerResizeParams): UseDrawerResizeReturn {
    const [isResizing, setIsResizing] = useState(false);

    const handleResizeStart = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsResizing(true);

            const startY = e.clientY;
            const startHeightPercent = heightPercent;
            const parentElement = containerRef.current?.parentElement;
            if (!parentElement) return;

            const parentHeight = parentElement.clientHeight;

            const handleMouseMove = (moveEvent: MouseEvent) => {
                // Calculate delta in pixels (negative because we're dragging up to increase)
                const deltaY = startY - moveEvent.clientY;
                const deltaPercent = (deltaY / parentHeight) * 100;
                // Calculate new height percentage
                const newHeightPercent = Math.min(
                    Math.max(startHeightPercent + deltaPercent, minHeightPercent),
                    maxHeightPercent
                );
                setHeightPercent(newHeightPercent);
            };

            const handleMouseUp = () => {
                setIsResizing(false);
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        },
        [containerRef, heightPercent, setHeightPercent, minHeightPercent, maxHeightPercent]
    );

    return {
        isResizing,
        handleResizeStart,
    };
}
