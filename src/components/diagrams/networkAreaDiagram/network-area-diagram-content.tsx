/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useLayoutEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RunningStatus } from '../../utils/running-status';
import {
    MIN_HEIGHT,
    MIN_WIDTH,
    MAX_HEIGHT_NETWORK_AREA_DIAGRAM,
    MAX_WIDTH_NETWORK_AREA_DIAGRAM,
    styles,
} from '../diagram-common';
import { NetworkAreaDiagramViewer, THRESHOLD_STATUS } from '@powsybl/diagram-viewer';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import { mergeSx } from '../../utils/functions';
import ComputingType from '../../computing-status/computing-type';
import { AppState } from 'redux/reducer';

const dynamicCssRules = [
    {
        cssSelector: '.nad-edge-infos', // data on edges (arrows and values)
        belowThresholdCssDeclaration: { display: 'block' },
        aboveThresholdCssDeclaration: { display: 'none' },
        threshold: 2500,
        thresholdStatus: THRESHOLD_STATUS.ABOVE,
    },
    {
        cssSelector: '.nad-label-box', // tooltips linked to nodes
        belowThresholdCssDeclaration: { display: 'block' },
        aboveThresholdCssDeclaration: { display: 'none' },
        threshold: 3500,
        thresholdStatus: THRESHOLD_STATUS.ABOVE,
    },
    {
        cssSelector: '.nad-text-edges', // visual link between nodes and their tooltip
        belowThresholdCssDeclaration: { display: 'block' },
        aboveThresholdCssDeclaration: { display: 'none' },
        threshold: 3500,
        thresholdStatus: THRESHOLD_STATUS.ABOVE,
    },
    {
        cssSelector: '[class^="nad-vl0to30"], [class*=" nad-vl0to30"]',
        belowThresholdCssDeclaration: { display: 'block' },
        aboveThresholdCssDeclaration: { display: 'none' },
        threshold: 12000,
        thresholdStatus: THRESHOLD_STATUS.BELOW,
    },
    {
        cssSelector: '[class^="nad-vl30to50"], [class*=" nad-vl30to50"]',
        belowThresholdCssDeclaration: { display: 'block' },
        aboveThresholdCssDeclaration: { display: 'none' },
        threshold: 12000,
        thresholdStatus: THRESHOLD_STATUS.BELOW,
    },
    {
        cssSelector: '[class^="nad-vl50to70"], [class*=" nad-vl50to70"]',
        belowThresholdCssDeclaration: { display: 'block' },
        aboveThresholdCssDeclaration: { display: 'none' },
        threshold: 27000,
        thresholdStatus: THRESHOLD_STATUS.BELOW,
    },
    {
        cssSelector: '[class^="nad-vl70to120"], [class*=" nad-vl70to120"]',
        belowThresholdCssDeclaration: { display: 'block' },
        aboveThresholdCssDeclaration: { display: 'none' },
        threshold: 27000,
        thresholdStatus: THRESHOLD_STATUS.BELOW,
    },
    {
        cssSelector: '[class^="nad-vl120to180"], [class*=" nad-vl120to180"]',
        belowThresholdCssDeclaration: { display: 'block' },
        aboveThresholdCssDeclaration: { display: 'none' },
        threshold: 36000,
        thresholdStatus: THRESHOLD_STATUS.BELOW,
    },
    {
        cssSelector: '[class^="nad-vl180to300"], [class*=" nad-vl180to300"]',
        belowThresholdCssDeclaration: { display: 'block' },
        aboveThresholdCssDeclaration: { display: 'none' },
        threshold: 80000,
        thresholdStatus: THRESHOLD_STATUS.BELOW,
    },
    {
        cssSelector: '.nad-disconnected .nad-edge-path',
        belowThresholdCssDeclaration: { 'stroke-dasharray': '10, 10' },
        aboveThresholdCssDeclaration: { 'stroke-dasharray': '0.5%, 0.5%' },
        threshold: 2500,
        thresholdStatus: THRESHOLD_STATUS.ABOVE,
    },
    {
        cssSelector: '.nad-branch-edges .nad-edge-path, .nad-3wt-edges .nad-edge-path',
        belowThresholdCssDeclaration: { 'stroke-width': '3' },
        aboveThresholdCssDeclaration: { 'stroke-width': '0.25%' },
        threshold: 1000,
        thresholdStatus: THRESHOLD_STATUS.ABOVE,
    },
    {
        cssSelector: '.nad-branch-edges .nad-winding, .nad-3wt-nodes .nad-winding',
        belowThresholdCssDeclaration: { 'stroke-width': '3' },
        aboveThresholdCssDeclaration: { 'stroke-width': '0.25%' },
        threshold: 1000,
        thresholdStatus: THRESHOLD_STATUS.ABOVE,
    },
    {
        cssSelector: '.nad-vl-nodes circle.nad-unknown-busnode',
        belowThresholdCssDeclaration: { 'stroke-width': '3' },
        aboveThresholdCssDeclaration: { 'stroke-width': '0.25%' },
        threshold: 1000,
        thresholdStatus: THRESHOLD_STATUS.ABOVE,
    },
];

type NetworkAreaDiagramContentProps = {
    svgType: string;
    svg: string;
    loadingState: boolean;
    diagramSizeSetter: (id: string, type: string, width: number, height: number) => void;
    diagramId: string;
};
function NetworkAreaDiagramContent(props: NetworkAreaDiagramContentProps) {
    const { diagramSizeSetter } = props;
    const svgRef = useRef();
    const diagramViewerRef = useRef<NetworkAreaDiagramViewer>();
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const loadFlowStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.LOAD_FLOW]);

    /**
     * DIAGRAM CONTENT BUILDING
     */

    useLayoutEffect(() => {
        if (props.svg) {
            const diagramViewer = new NetworkAreaDiagramViewer(
                svgRef.current!,
                props.svg,
                MIN_WIDTH,
                MIN_HEIGHT,
                MAX_WIDTH_NETWORK_AREA_DIAGRAM,
                MAX_HEIGHT_NETWORK_AREA_DIAGRAM,
                null,
                null,
                null,
                true,
                true,
                dynamicCssRules
            );

            // Update the diagram-pane's list of sizes with the width and height from the backend
            diagramSizeSetter(props.diagramId, props.svgType, diagramViewer.getWidth(), diagramViewer.getHeight());

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
        }
    }, [props.diagramId, props.svgType, props.svg, currentNode, props.loadingState, diagramSizeSetter]);

    /**
     * RENDER
     */

    return (
        <>
            <Box height={2}>{props.loadingState && <LinearProgress />}</Box>
            <Box
                ref={svgRef}
                sx={mergeSx(
                    styles.divDiagram,
                    styles.divNetworkAreaDiagram,
                    loadFlowStatus !== RunningStatus.SUCCEED && styles.divDiagramInvalid
                )}
                style={{ height: '100%' }}
            />
        </>
    );
}

export default NetworkAreaDiagramContent;
