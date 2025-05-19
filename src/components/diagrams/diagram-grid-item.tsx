/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SingleLineDiagramViewer } from '@powsybl/network-viewer';
import { useLayoutEffect, useRef } from 'react';
import {
    MAX_HEIGHT_SUBSTATION,
    MAX_HEIGHT_VOLTAGE_LEVEL,
    MAX_WIDTH_SUBSTATION,
    MAX_WIDTH_VOLTAGE_LEVEL,
    MIN_HEIGHT,
    MIN_WIDTH,
    styles,
} from './diagram-common';
import { Diagram, DiagramType } from './diagram.type';
import { Box } from '@mui/material';
import { mergeSx } from '@gridsuite/commons-ui';

interface DiagramGridItemProps {
    diagram: Diagram;
}

const DiagramGridItem = ({ diagram }: DiagramGridItemProps) => {
    const svgRef = useRef<HTMLDivElement>();
    const diagramViewerRef = useRef<SingleLineDiagramViewer>();

    useLayoutEffect(() => {
        if (diagram.svg && svgRef.current && diagram.type === DiagramType.VOLTAGE_LEVEL) {
            // const isReadyForInteraction =
            //     !computationStarting && !isAnyNodeBuilding && !modificationInProgress && !props.loadingState;

            const diagramViewer = new SingleLineDiagramViewer(
                svgRef.current, //container
                diagram.svg.svg ?? '', //svgContent
                // diagram.svg.metadata ?? null, //svg metadata
                null,
                diagram.type, //svg type
                MIN_WIDTH, // minWidth
                MIN_HEIGHT, // minHeight

                // maxWidth
                diagram.type === DiagramType.VOLTAGE_LEVEL ? MAX_WIDTH_VOLTAGE_LEVEL : MAX_WIDTH_SUBSTATION,

                // maxHeight
                diagram.type === DiagramType.VOLTAGE_LEVEL ? MAX_HEIGHT_VOLTAGE_LEVEL : MAX_HEIGHT_SUBSTATION,

                // callback on the next voltage arrows
                //isReadyForInteraction ? handleNextVoltageLevelClick : null,
                null,
                // callback on the breakers
                // isReadyForInteraction && !isNodeReadOnly(currentNode) ? handleBreakerClick : null,
                null,
                // callback on the feeders
                // isReadyForInteraction ? showEquipmentMenu : null,
                null,
                // callback on the buses
                // isReadyForInteraction ? showBusMenu : null,
                null,
                // arrows color
                // theme.palette.background.paper,
                'red',
                // Toggle popover
                // handleTogglePopover
                null
            );

            // Update the diagram-pane's list of sizes with the width and height from the backend
            // diagramSizeSetter(props.diagramId, props.svgType, diagramViewer.getWidth(), diagramViewer.getHeight());

            // Rotate clicked switch while waiting for updated sld data
            // if (locallySwitchedBreaker) {
            //     const breakerToSwitchDom: HTMLElement | null = document.getElementById(locallySwitchedBreaker);
            //     if (breakerToSwitchDom?.classList.value.includes('sld-closed')) {
            //         breakerToSwitchDom.classList.replace('sld-closed', 'sld-open');
            //     } else if (breakerToSwitchDom?.classList.value.includes('sld-open')) {
            //         breakerToSwitchDom.classList.replace('sld-open', 'sld-closed');
            //     }
            // }

            // If a previous diagram was loaded and the diagram's size remained the same, we keep
            // the user's zoom and scoll state for the current render.
            if (
                diagramViewerRef.current &&
                diagramViewer.getWidth() === diagramViewerRef.current.getWidth() &&
                diagramViewer.getHeight() === diagramViewerRef.current.getHeight()
            ) {
                const viewBox = diagramViewerRef.current.getViewBox();
                if (viewBox) {
                    diagramViewer.setViewBox(viewBox);
                }
            }

            diagramViewerRef.current = diagramViewer;

            // Reapply invalid styles directly on the SVG
            // if (loadFlowStatus !== RunningStatus.SUCCEED && svgRef.current) {
            //     applyInvalidStyles(svgRef.current);
            // }
        }
    }, [diagram.svg, diagram.type]);

    return <Box ref={svgRef} sx={mergeSx(styles.divDiagram, styles.divSingleLineDiagram)} />;
};
export default DiagramGridItem;
