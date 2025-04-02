/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Theme } from '@mui/material';
import { ReactNode, useEffect, useRef } from 'react';
import { ImperativePanelGroupHandle, Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';

interface NetworkModificationTreePanePanelsProps {
    leftComponent: ReactNode;
    rightComponent: ReactNode;
    showRightPanel?: boolean;
}

export const NetworkModificationTreePanePanels = ({
    leftComponent,
    rightComponent,
    showRightPanel = true,
}: NetworkModificationTreePanePanelsProps) => {
    // necessary to get container size in order to calculate % sizes from px
    const containerRef = useRef<HTMLDivElement>(null);
    // necessary to programatically resize layout
    const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);
    const rootNetworks = useSelector((state: AppState) => state.rootNetworks);

    const rightComponentMinSizePixel = 350;
    const rightComponentMinSizePercentage = containerRef.current?.offsetWidth
        ? (rightComponentMinSizePixel / containerRef.current?.offsetWidth) * 100
        : 20;

    const rightComponentDefaultSizePixel = 320 + rootNetworks.length * 80;
    const rightComponentDefaultSizePercentage = containerRef.current?.offsetWidth
        ? (rightComponentDefaultSizePixel / containerRef.current?.offsetWidth) * 100
        : 50;

    useEffect(() => {
        if (showRightPanel) {
            panelGroupRef.current?.setLayout([
                100 - rightComponentDefaultSizePercentage,
                rightComponentDefaultSizePercentage,
            ]);
        }
    }, [rightComponentDefaultSizePercentage, showRightPanel]);
    return (
        <Box width={'100%'} ref={containerRef}>
            <PanelGroup direction="horizontal" ref={panelGroupRef}>
                <Panel minSize={10}>{leftComponent}</Panel>
                {showRightPanel && (
                    <>
                        <Box
                            display={'flex'}
                            sx={(theme: Theme) => ({
                                backgroundColor: theme.aggrid.backgroundColor,
                                borderLeft: theme.aggrid.border,
                            })}
                            alignItems={'center'}
                        >
                            <PanelResizeHandle>
                                <DragIndicatorIcon fontSize="small" sx={{ padding: 0, margin: 0 }} />
                            </PanelResizeHandle>
                        </Box>
                        <Panel
                            minSize={rightComponentMinSizePercentage}
                            defaultSize={rightComponentDefaultSizePercentage}
                        >
                            {rightComponent}
                        </Panel>
                    </>
                )}
            </PanelGroup>
        </Box>
    );
};
