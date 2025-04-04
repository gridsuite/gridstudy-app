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

    // const rightComponentDefaultSizePixel = 320 + rootNetworks.length * 80;
    const rightComponentDefaultSizePercentage = containerRef.current?.offsetWidth
        ? pixelsToPercents(rightComponentDefaultSizePixel, containerRef.current.offsetWidth)
        : 50;

    const [hasUserInterracted, setHasUserInterracted] = useState(false);
    const [rightPanelPixelSize, setRightPanelPixelSize] = useState(rightComponentDefaultSizePixel);

    const rightPanelPercentSize = useMemo(
        () =>
            containerRef?.current?.offsetWidth
                ? pixelsToPercents(rightPanelPixelSize, containerRef?.current?.offsetWidth)
                : 50,
        [rightPanelPixelSize, containerRef]
    );

    /**
     * If panel is open, an observer on container size is created
     *  This is used to update the layout when container size is updated
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
     *  when rightComponentDefaultSizePercentage is updated, the layout is updated as well
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
