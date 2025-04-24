/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ImperativePanelGroupHandle } from 'react-resizable-panels';

const pixelsToPercents = (elementPixelSize: number, containerPixelSize: number) => {
    return containerPixelSize ? (elementPixelSize / containerPixelSize) * 100 : 50;
};

const percentsToPixels = (elementPercentSize: number, containerPixelSize: number) => {
    return (elementPercentSize * containerPixelSize) / 100;
};

interface UsePanelsSize {
    containerRef: React.RefObject<HTMLDivElement>;
    panelGroupRef: React.RefObject<ImperativePanelGroupHandle>;
    showRightPanel: boolean;
    rightComponentDefaultSizePixel: number;
    rightComponentMinSizePixel: number;
}

export const usePanelsSize = (props: UsePanelsSize) => {
    const { containerRef, panelGroupRef, showRightPanel, rightComponentDefaultSizePixel, rightComponentMinSizePixel } =
        props;
    const rightComponentMinSizePercentage = containerRef.current?.offsetWidth
        ? pixelsToPercents(rightComponentMinSizePixel, containerRef.current.offsetWidth)
        : 20;

    const rightComponentDefaultSizePercentage = containerRef.current?.offsetWidth
        ? pixelsToPercents(rightComponentDefaultSizePixel, containerRef.current.offsetWidth)
        : 50;

    const [hasUserInterracted, setHasUserInterracted] = useState(false);
    const [rightPanelPixelSize, setRightPanelPixelSize] = useState(rightComponentDefaultSizePixel);

    const rightPanelPercentSize = useMemo(
        () =>
            containerRef?.current?.offsetWidth
                ? pixelsToPercents(rightPanelPixelSize, containerRef?.current?.offsetWidth)
                : rightComponentDefaultSizePercentage,
        [rightPanelPixelSize, rightComponentDefaultSizePercentage, containerRef]
    );

    /**
     * If panel is open, an observer on container size is created
     * This is used to update the layout when container size is updated
     */
    useEffect(() => {
        if (!containerRef.current || !showRightPanel) {
            return;
        }

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                // to prevent warning if trying to set a size < minSize
                const newRightPanelPercentSize = Math.max(
                    pixelsToPercents(rightPanelPixelSize, entry.contentRect.width),
                    rightComponentMinSizePercentage
                );
                panelGroupRef.current?.setLayout([100 - newRightPanelPercentSize, newRightPanelPercentSize]);
            }
        });

        observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, [rightPanelPixelSize, showRightPanel, panelGroupRef, containerRef, rightComponentMinSizePercentage]);

    /**
     * If right panel isn't collapsed, and user hasn't manually resized the Panel :
     * when rightComponentDefaultSizePercentage is updated, the layout is updated as well
     */
    useEffect(() => {
        if (showRightPanel && !hasUserInterracted) {
            panelGroupRef.current?.setLayout([
                100 - rightComponentDefaultSizePercentage,
                rightComponentDefaultSizePercentage,
            ]);
        }
    }, [hasUserInterracted, rightComponentDefaultSizePercentage, showRightPanel, panelGroupRef]);

    /**
     * When user manually drags the Panel, two things are done :
     * - save the new size in pixel
     * - save the panels has been interacted with to prevent automatic resizing on rightComponentDefaultSizePercentage change
     */
    const onDragging = useCallback(
        (isDragging: boolean) => {
            // panelGroupRef.current?.getLayout() returns the current layout of PanelGroup
            // the result is a array of numbers, each number being the size in % of each panel
            // panelGroupRef.current?.getLayout()[1] represents the size in % of the right panel
            // since the right panel can be hidden, we need to check its size is not nullish before running the code below
            if (!panelGroupRef.current?.getLayout()[1] || !containerRef.current || isDragging) {
                return;
            }

            const containerPixelSize = containerRef.current?.offsetWidth;
            const rightPanelNewPercentSize = panelGroupRef.current?.getLayout()[1];
            setRightPanelPixelSize(
                (oldSize) => percentsToPixels(rightPanelNewPercentSize, containerPixelSize) ?? oldSize
            );
            setHasUserInterracted(true);
        },
        [containerRef, panelGroupRef]
    );

    return { rightComponentMinSizePercentage, rightPanelPercentSize, onDragging };
};
