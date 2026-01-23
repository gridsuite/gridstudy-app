/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useReactFlow } from '@xyflow/react';
import { Box } from '@mui/material';
import type { UUID } from 'node:crypto';
import { selectPanel } from '../../../redux/slices/workspace-selectors';
import type { RootState } from '../../../redux/store';
import NetworkModificationTreePane from 'components/network-modification-tree-pane';

interface TreePanelContentProps {
    panelId: UUID;
    studyUuid: UUID;
    currentRootNetworkUuid: UUID;
}

export const TreePanelContent = ({ panelId, studyUuid, currentRootNetworkUuid }: TreePanelContentProps) => {
    const panelState = useSelector((state: RootState) => selectPanel(state, panelId));
    const containerRef = useRef<HTMLDivElement>(null);
    const { getViewport, setViewport } = useReactFlow();
    const prevSizeRef = useRef<{ width: number; height: number } | null>(null);

    // Adjust viewport on panel resize
    useEffect(() => {
        const actualWidth = containerRef.current?.offsetWidth;
        const actualHeight = containerRef.current?.offsetHeight;

        if (actualWidth && actualHeight && prevSizeRef.current) {
            const currentViewport = getViewport();
            const widthScale = actualWidth / prevSizeRef.current.width;
            const heightScale = actualHeight / prevSizeRef.current.height;
            const scale = (widthScale + heightScale) / 2;
            const newZoom = currentViewport.zoom * scale;

            // Calculate new x and y to keep the graph centered
            const centerGraphX =
                -currentViewport.x / currentViewport.zoom + prevSizeRef.current.width / 2 / currentViewport.zoom;
            const centerGraphY =
                -currentViewport.y / currentViewport.zoom + prevSizeRef.current.height / 2 / currentViewport.zoom;

            const newX = -centerGraphX * newZoom + actualWidth / 2;
            const newY = -centerGraphY * newZoom + actualHeight / 2;

            setViewport({ x: newX, y: newY, zoom: newZoom }, { duration: 100 });
        }

        if (actualWidth && actualHeight) {
            prevSizeRef.current = { width: actualWidth, height: actualHeight };
        }
    }, [panelState?.size, panelState?.maximized, getViewport, setViewport]);

    return (
        <Box ref={containerRef} sx={{ width: '100%', height: '100%' }}>
            <NetworkModificationTreePane studyUuid={studyUuid} currentRootNetworkUuid={currentRootNetworkUuid} />
        </Box>
    );
};
