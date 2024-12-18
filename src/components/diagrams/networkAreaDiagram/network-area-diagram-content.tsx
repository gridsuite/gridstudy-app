/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RunningStatus } from '../../utils/running-status';
import {
    DiagramType,
    MAX_HEIGHT_NETWORK_AREA_DIAGRAM,
    MAX_WIDTH_NETWORK_AREA_DIAGRAM,
    MIN_HEIGHT,
    MIN_WIDTH,
    styles,
} from '../diagram-common';
import {
    CSS_RULE,
    DiagramMetadata,
    NetworkAreaDiagramViewer,
    OnToggleNadHoverCallbackType,
} from '@powsybl/network-viewer';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import { mergeSx } from '../../utils/functions';
import ComputingType from '../../computing-status/computing-type';
import { AppState } from 'redux/reducer';
import { storeNetworkAreaDiagramNodeMovement } from '../../../redux/actions';
import { PARAM_INIT_NAD_WITH_GEO_DATA } from '../../../utils/config-params';
import { getNadIdentifier } from '../diagram-utils';
import EquipmentPopover from 'components/tooltips/equipment-popover';
import { UUID } from 'crypto';
import { Point } from '@svgdotjs/svg.js';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { FEEDER_TYPES } from 'components/utils/feederType';

const dynamicCssRules: CSS_RULE[] = [
    {
        cssSelector: '.nad-edge-infos', // data on edges (arrows and values)
        cssInRange: { display: 'block' },
        cssOutOfRange: { display: 'none' },
        min: 0,
        max: 2500,
    },
    {
        cssSelector: '.nad-label-box', // tooltips linked to nodes
        cssInRange: { display: 'block' },
        cssOutOfRange: { display: 'none' },
        min: 0,
        max: 3500,
    },
    {
        cssSelector: '.nad-text-edges', // visual link between nodes and their tooltip
        cssInRange: { display: 'block' },
        cssOutOfRange: { display: 'none' },
        min: 0,
        max: 3500,
    },
    {
        cssSelector: '[class^="nad-vl0to30"], [class*=" nad-vl0to30"]',
        cssInRange: { display: 'block' },
        cssOutOfRange: { display: 'none' },
        min: 0,
        max: 12000,
    },
    {
        cssSelector: '[class^="nad-vl30to50"], [class*=" nad-vl30to50"]',
        cssInRange: { display: 'block' },
        cssOutOfRange: { display: 'none' },
        min: 0,
        max: 12000,
    },
    {
        cssSelector: '[class^="nad-vl50to70"], [class*=" nad-vl50to70"]',
        cssInRange: { display: 'block' },
        cssOutOfRange: { display: 'none' },
        min: 0,
        max: 27000,
    },
    {
        cssSelector: '[class^="nad-vl70to120"], [class*=" nad-vl70to120"]',
        cssInRange: { display: 'block' },
        cssOutOfRange: { display: 'none' },
        min: 0,
        max: 27000,
    },
    {
        cssSelector: '[class^="nad-vl120to180"], [class*=" nad-vl120to180"]',
        cssInRange: { display: 'block' },
        cssOutOfRange: { display: 'none' },
        min: 0,
        max: 36000,
    },
    {
        cssSelector: '[class^="nad-vl180to300"], [class*=" nad-vl180to300"]',
        cssInRange: { display: 'block' },
        cssOutOfRange: { display: 'none' },
        min: 0,
        max: 80000,
    },
    {
        cssSelector: '.nad-disconnected .nad-edge-path',
        cssInRange: { 'stroke-dasharray': '10, 10' },
        cssOutOfRange: { 'stroke-dasharray': '0.5%, 0.5%' },
        min: 0,
        max: 2500,
    },
    {
        cssSelector:
            '.nad-branch-edges .nad-edge-path, .nad-3wt-edges .nad-edge-path, .nad-branch-edges .nad-winding, .nad-3wt-nodes .nad-winding, .nad-vl-nodes circle.nad-unknown-busnode',
        cssInRange: { 'stroke-width': '3px' }, // When zooming in on an edge, we want the line to grow as the user keeps on zooming
        min: 0,
        max: 1000, // After this zoom level, the line should use a percentage value to stay visible when zooming far away
    },
    // Between the zoom level 1000 and 45000, we use a work around to fix an issue with Chromium : see the
    // addStrokeWidthRulesForChromiumFix function that creates 20 rules (that cover 1000 to 45000) to create 20
    // "trigger" steps to force Chromium's update.
    {
        cssSelector:
            '.nad-branch-edges .nad-edge-path, .nad-3wt-edges .nad-edge-path, .nad-branch-edges .nad-winding, .nad-3wt-nodes .nad-winding, .nad-vl-nodes circle.nad-unknown-busnode',
        cssInRange: { 'stroke-width': '0.15%' },
        min: 45000,
        max: Infinity,
    },
];

// WORK AROUND FOR CHROMIUM :
// Chromium do not always update the SVG's polylines when their stroke-width is defined with a percentage.
// To force updates when zooming, we add a lot of new rules to cover a lot more zoom levels. Each of these rules
// only slightly differ from each other, but because their values are differents, the browser picks up the change
// and update the displayed lines.
/**
 * Create CSS rules to fix an issue with Chromium's display when zooming.
 * The rules will cover zoom levels from minRange to maxRange, divided in nbSteps individual rules.
 * @param nbSteps number of rules to create
 * @param minRange the lowest min value of the first rule
 * @param maxRange the highest max value of the last rule
 */
function addStrokeWidthRulesForChromiumFix(nbSteps: number, minRange: number, maxRange: number): CSS_RULE[] {
    const basePercentage = 0.2;
    const stepSize = (maxRange - minRange) / nbSteps;

    return Array.from({ length: nbSteps }, (_, i) => {
        const min = minRange + i * stepSize;
        const max = minRange + (i + 1) * stepSize;
        const strokeWidth = `${(basePercentage - i * 0.002).toFixed(4)}%`;

        return {
            cssSelector:
                '.nad-branch-edges .nad-edge-path, .nad-3wt-edges .nad-edge-path, .nad-branch-edges .nad-winding, .nad-3wt-nodes .nad-winding, .nad-vl-nodes circle.nad-unknown-busnode',
            cssInRange: { 'stroke-width': strokeWidth },
            min,
            max,
        };
    });
}

const dynamicCssRulesChromiumFix = [...dynamicCssRules, ...addStrokeWidthRulesForChromiumFix(20, 1000, 45000)];

const equipmentsWithPopover = [
    EQUIPMENT_TYPES.LINE,
    EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER,
    FEEDER_TYPES.PHASE_SHIFT_TRANSFORMER,
];

type NetworkAreaDiagramContentProps = {
    readonly svgType: DiagramType;
    readonly svg?: string;
    readonly svgMetadata?: DiagramMetadata;
    readonly loadingState: boolean;
    readonly diagramSizeSetter: (id: UUID, type: DiagramType, width: number, height: number) => void;
    readonly diagramId: UUID;
    visible: boolean;
};
function NetworkAreaDiagramContent(props: NetworkAreaDiagramContentProps) {
    const { diagramSizeSetter, visible } = props;
    const dispatch = useDispatch();
    const svgRef = useRef();

    const diagramViewerRef = useRef<NetworkAreaDiagramViewer>();
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const loadFlowStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.LOAD_FLOW]);
    const nadNodeMovements = useSelector((state: AppState) => state.nadNodeMovements);
    const diagramStates = useSelector((state: AppState) => state.diagramStates);
    const initNadWithGeoData = useSelector((state: AppState) => state[PARAM_INIT_NAD_WITH_GEO_DATA]);
    const [shouldDisplayTooltip, setShouldDisplayTooltip] = useState(false);
    const [anchorPosition, setAnchorPosition] = useState({ top: 0, left: 0 });
    const [hoveredEquipmentId, setHoveredEquipmentId] = useState('');
    const [hoveredEquipmentType, setHoveredEquipmentType] = useState('');
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    const nadIdentifier = useMemo(() => {
        return getNadIdentifier(diagramStates, initNadWithGeoData);
    }, [diagramStates, initNadWithGeoData]);

    const onMoveNodeCallback = useCallback(
        (equipmentId: string, nodeId: string, x: number, y: number, xOrig: number, yOrig: number) => {
            dispatch(storeNetworkAreaDiagramNodeMovement(nadIdentifier, equipmentId, x, y));
        },
        [dispatch, nadIdentifier]
    );

    const OnToggleHoverCallback: OnToggleNadHoverCallbackType = useCallback(
        (shouldDisplay: boolean, mousePosition: Point | null, equipmentId: string, equipmentType: string) => {
            if (mousePosition) {
                const anchorPosition = {
                    top: mousePosition.y + 10,
                    left: mousePosition.x + 10,
                };

                setAnchorPosition(anchorPosition);
                setHoveredEquipmentId(equipmentId);
                setHoveredEquipmentType(equipmentType);

                // Only show tooltip if the equipment type is in the hoverable list
                const isEquipmentHoverable = equipmentsWithPopover.includes(equipmentType);
                setShouldDisplayTooltip(shouldDisplay && isEquipmentHoverable); // Show or hide based on shouldDisplay
            } else {
                setShouldDisplayTooltip(false);
            }
        },

        [setShouldDisplayTooltip, setAnchorPosition]
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
                dynamicCssRulesChromiumFix,
                OnToggleHoverCallback
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
        OnToggleHoverCallback,
        nadIdentifier,
        nadNodeMovements,
    ]);

    /**
     * RENDER
     */

    return (
        <>
            <Box height={2}>{props.loadingState && <LinearProgress />}</Box>
            {visible && shouldDisplayTooltip && (
                <EquipmentPopover
                    studyUuid={studyUuid}
                    anchorPosition={anchorPosition}
                    anchorEl={null}
                    equipmentType={hoveredEquipmentType}
                    equipmentId={hoveredEquipmentId}
                    loadFlowStatus={loadFlowStatus}
                />
            )}
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
