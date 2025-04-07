/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Theme } from '@mui/material';
import { ReactNode, useRef } from 'react';
import { ImperativePanelGroupHandle, Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { usePanelsSize } from './spreadsheet/network-modification-tree-pane-panels-handlers';

interface NetworkModificationTreePanePanelsProps {
    leftComponent: ReactNode;
    rightComponent: ReactNode;
    showRightPanel?: boolean;
}

const styles = {
    panelHandlerContainer: (theme: Theme) => ({
        backgroundColor: theme.aggrid.backgroundColor,
    }),
};
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

    const rightComponentDefaultSizePixel = 320 + rootNetworks.length * 80;

    // we want to set sizes in pixel, but Panel only deals with sizes in %
    // this makes the conversion, and handle the resizing when the layout is updated
    const { rightPanelPercentSize, rightComponentMinSizePercentage, onDragging } = usePanelsSize({
        containerRef: containerRef,
        panelGroupRef: panelGroupRef,
        rightComponentDefaultSizePixel: rightComponentDefaultSizePixel,
        rightComponentMinSizePixel: 350,
        showRightPanel: showRightPanel,
    });

    return (
        <Box width={'100%'} ref={containerRef}>
            <PanelGroup direction="horizontal" ref={panelGroupRef}>
                <Panel id={'left-panel'} order={0} minSize={10}>
                    {leftComponent}
                </Panel>
                {showRightPanel && (
                    <>
                        <Box display={'flex'} sx={styles.panelHandlerContainer} alignItems={'center'}>
                            <PanelResizeHandle onDragging={onDragging}>
                                <DragIndicatorIcon fontSize="small" sx={{ padding: 0, margin: 0 }} />
                            </PanelResizeHandle>
                        </Box>
                        <Panel
                            id={'right-panel'}
                            order={1}
                            minSize={rightComponentMinSizePercentage}
                            defaultSize={rightPanelPercentSize}
                        >
                            {rightComponent}
                        </Panel>
                    </>
                )}
            </PanelGroup>
        </Box>
    );
};
