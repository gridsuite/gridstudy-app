/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useLayoutEffect, useRef, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RunningStatus } from '../../utils/running-status';
import {
    MIN_HEIGHT,
    MIN_WIDTH,
    MAX_HEIGHT_NETWORK_AREA_DIAGRAM,
    MAX_WIDTH_NETWORK_AREA_DIAGRAM,
    styles,
    DiagramType,
} from '../diagram-common';
import { CSS_RULE, NetworkAreaDiagramViewer, DiagramMetadata } from '@powsybl/network-viewer';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import { mergeSx } from '../../utils/functions';
import ComputingType from '../../computing-status/computing-type';
import { AppState } from 'redux/reducer';
import { storeNetworkAreaDiagramNodeMovement } from '../../../redux/actions';
import { PARAM_INIT_NAD_WITH_GEO_DATA } from '../../../utils/config-params';
import { getNadIdentifier } from '../diagram-utils';
import { UUID } from 'crypto';

export function getValueFromThreshold(
    value: number,
    threshold: number,
    aboveThreshold: string,
    belowThreshold: string
) {
    return value > threshold ? aboveThreshold : belowThreshold;
}

function between(x, min, max) {
    return x >= min && x <= max;
}

function getBranchStrokeWidth(value: number) {
    if (between(value, 0, 1000)) {
        return '3';
    }
    if (between(value, 1000, 3000)) {
        return '10';
    }
    if (between(value, 3000, 6000)) {
        return '20';
    }
    if (between(value, 6000, 9000)) {
        return '30';
    }
    return '40';
}

const dynamicCssRules: CSS_RULE[] = [
    {
        cssSelector: '.nad-edge-infos', // data on edges (arrows and values)
        cssDeclaration: { display: (value: number) => getValueFromThreshold(value, 2500, 'none', 'block') },
        currentValue: { display: 'none' },
    },
    {
        cssSelector: '.nad-label-box', // tooltips linked to nodes
        cssDeclaration: { display: (value: number) => getValueFromThreshold(value, 3500, 'none', 'block') },
        currentValue: { display: 'none' },
    },
    {
        cssSelector: '.nad-text-edges', // visual link between nodes and their tooltip
        cssDeclaration: { display: (value: number) => getValueFromThreshold(value, 3500, 'none', 'block') },
        currentValue: { display: 'none' },
    },
    {
        cssSelector: '[class^="nad-vl0to30"], [class*=" nad-vl0to30"]',
        cssDeclaration: { display: (value: number) => getValueFromThreshold(value, 3500, 'none', 'block') },
        currentValue: { display: 'block' },
    },
    {
        cssSelector: '[class^="nad-vl30to50"], [class*=" nad-vl30to50"]',
        cssDeclaration: { display: (value: number) => getValueFromThreshold(value, 12000, 'none', 'block') },
        currentValue: { display: 'block' },
    },
    {
        cssSelector: '[class^="nad-vl50to70"], [class*=" nad-vl50to70"]',
        cssDeclaration: { display: (value: number) => getValueFromThreshold(value, 27000, 'none', 'block') },
        currentValue: { display: 'block' },
    },
    {
        cssSelector: '[class^="nad-vl70to120"], [class*=" nad-vl70to120"]',
        cssDeclaration: { display: (value: number) => getValueFromThreshold(value, 27000, 'none', 'block') },
        currentValue: { display: 'block' },
    },
    {
        cssSelector: '[class^="nad-vl120to180"], [class*=" nad-vl120to180"]',
        cssDeclaration: { display: (value: number) => getValueFromThreshold(value, 36000, 'none', 'block') },
        currentValue: { display: 'block' },
    },
    {
        cssSelector: '[class^="nad-vl180to300"], [class*=" nad-vl180to300"]',
        cssDeclaration: { display: (value: number) => getValueFromThreshold(value, 80000, 'none', 'block') },
        currentValue: { display: 'block' },
    },
    {
        cssSelector: '.nad-disconnected .nad-edge-path',
        cssDeclaration: {
            'stroke-dasharray': (value: number) => getValueFromThreshold(value, 2500, '10, 10', '0.5%, 0.5%'),
        },
        currentValue: { 'stroke-dasharray': '0.5%, 0.5%' },
    },
    {
        cssSelector: '.nad-branch-edges .nad-edge-path, .nad-3wt-edges .nad-edge-path',
        cssDeclaration: { 'stroke-width': (value: number) => getBranchStrokeWidth(value) },
        currentValue: { 'stroke-width': '40' },
    },
    {
        cssSelector: '.nad-branch-edges .nad-winding, .nad-3wt-nodes .nad-winding',
        cssDeclaration: { 'stroke-width': (value: number) => getValueFromThreshold(value, 1000, '0.25%', '3') },
        currentValue: { display: '0.25%' },
    },
    {
        cssSelector: '.nad-vl-nodes circle.nad-unknown-busnode',
        cssDeclaration: { 'stroke-width': (value: number) => getValueFromThreshold(value, 1000, '0.25%', '3') },
        currentValue: { 'stroke-width': '0.25%' },
    },
];

type NetworkAreaDiagramContentProps = {
    readonly svgType: DiagramType;
    readonly svg?: string;
    readonly svgMetadata?: DiagramMetadata;
    readonly loadingState: boolean;
    readonly diagramSizeSetter: (id: UUID, type: DiagramType, width: number, height: number) => void;
    readonly diagramId: UUID;
};
function NetworkAreaDiagramContent(props: NetworkAreaDiagramContentProps) {
    const { diagramSizeSetter } = props;
    const dispatch = useDispatch();
    const svgRef = useRef();

    const diagramViewerRef = useRef<NetworkAreaDiagramViewer>();
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const loadFlowStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.LOAD_FLOW]);
    const nadNodeMovements = useSelector((state: AppState) => state.nadNodeMovements);
    const diagramStates = useSelector((state: AppState) => state.diagramStates);
    const initNadWithGeoData = useSelector((state: AppState) => state[PARAM_INIT_NAD_WITH_GEO_DATA]);

    const nadIdentifier = useMemo(() => {
        return getNadIdentifier(diagramStates, initNadWithGeoData);
    }, [diagramStates, initNadWithGeoData]);

    const onMoveNodeCallback = useCallback(
        (equipmentId: string, nodeId: string, x: number, y: number, xOrig: number, yOrig: number) => {
            dispatch(storeNetworkAreaDiagramNodeMovement(nadIdentifier, equipmentId, x, y));
        },
        [dispatch, nadIdentifier]
    );

    /**
     * DIAGRAM CONTENT BUILDING
     */

    useLayoutEffect(() => {
        if (props.svg && svgRef.current) {
            const diagramViewer = new NetworkAreaDiagramViewer(
                svgRef.current,
                props.svg,
                props.svgMetadata ?? null,
                MIN_WIDTH,
                MIN_HEIGHT,
                MAX_WIDTH_NETWORK_AREA_DIAGRAM,
                MAX_HEIGHT_NETWORK_AREA_DIAGRAM,
                onMoveNodeCallback,
                null,
                null,
                true,
                true,
                dynamicCssRules,
                null
            );

            // Update the diagram-pane's list of sizes with the width and height from the backend
            diagramSizeSetter(props.diagramId, props.svgType, diagramViewer.getWidth(), diagramViewer.getHeight());

            // If a previous diagram was loaded and the diagram's size remained the same, we keep
            // the user's zoom and scroll state for the current render.
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

            // Repositioning the previously moved nodes
            const correspondingMovements = nadNodeMovements.filter(
                (movement) => movement.nadIdentifier === nadIdentifier
            );
            if (correspondingMovements.length > 0) {
                correspondingMovements.forEach((movement) => {
                    diagramViewer.moveNodeToCoordinates(movement.equipmentId, movement.x, movement.y);
                });
            }
            diagramViewerRef.current = diagramViewer;
        }
    }, [
        props.diagramId,
        props.svgType,
        props.svg,
        props.svgMetadata,
        currentNode,
        diagramSizeSetter,
        onMoveNodeCallback,
        nadIdentifier,
        nadNodeMovements,
    ]);

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
            />
        </>
    );
}

export default NetworkAreaDiagramContent;
