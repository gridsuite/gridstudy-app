/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useLayoutEffect, useRef, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { RunningStatus } from '../../utils/running-status';
import {
    MIN_HEIGHT,
    MIN_WIDTH,
    MAX_HEIGHT_NETWORK_AREA_DIAGRAM,
    MAX_WIDTH_NETWORK_AREA_DIAGRAM,
    styles,
    DiagramType,
} from '../diagram-common';
import { NetworkAreaDiagramViewer, THRESHOLD_STATUS } from '@powsybl/diagram-viewer';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import { mergeSx } from '../../utils/functions';
import ComputingType from 'components/computing-status/computing-type';
import { storeNetworkAreaDiagramNodeMovement } from '../../../redux/actions';

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

function NetworkAreaDiagramContent(props) {
    const { diagramSizeSetter } = props;
    const dispatch = useDispatch();
    const svgRef = useRef();
    const diagramViewerRef = useRef();
    const currentNode = useSelector((state) => state.currentTreeNode);
    const loadFlowStatus = useSelector((state) => state.computingStatus[ComputingType.LOAD_FLOW]);
    const nadNodeMovements = useSelector((state) => state.nadNodeMovements);
    const diagramStates = useSelector((state) => state.diagramStates);

    const onMoveNodeCallback = useCallback(
        (equipmentId, nodeId, x, y, xOrig, yOrig) => {
            dispatch(storeNetworkAreaDiagramNodeMovement(nodeId, x, y));
        },
        [dispatch]
    );

    // TODO CHARLY Pour le moment, la liste des IDs n'est pas la bonne solution : si on transforme un VL en VL avec ring
    // TODO dans un autre node de l'arbre, alors on a des bugs visuels.
    // TODO De même, on ne gère pas correctement la profondeur : openNadIds reste le même.
    const openNadIds = useMemo(() => {
        return diagramStates
            .filter((diagram) => diagram.svgType === DiagramType.NETWORK_AREA_DIAGRAM)
            .map((diagram) => diagram.id)
            .sort((a, b) => a.localeCompare(b))
            .join(',');
    }, [diagramStates]);

    /**
     * DIAGRAM CONTENT BUILDING
     */

    useLayoutEffect(() => {
        if (props.svg && !props.loadingState) {
            const diagramViewer = new NetworkAreaDiagramViewer(
                svgRef.current,
                props.svg,
                MIN_WIDTH,
                MIN_HEIGHT,
                MAX_WIDTH_NETWORK_AREA_DIAGRAM,
                MAX_HEIGHT_NETWORK_AREA_DIAGRAM,
                onMoveNodeCallback,
                null,
                null,
                true,
                true,
                dynamicCssRules
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
                diagramViewer.setViewBox(diagramViewerRef.current.getViewBox());
            }

            // APPLYING THE SAVED MOVEMENTS ON THIS NAD'S NODES (if there are saved movements for the current NAD)
            const correspondingMovements = nadNodeMovements.filter((movement) => movement.nadIds === openNadIds);
            if (correspondingMovements.length > 0) {
                correspondingMovements.forEach((movement) => {
                    // TODO CHARLY vérifier qu'on ne repasse pas dans onMoveNodeCallback à chaque itération et que ça ne repasse pas par le redux pour rien
                    diagramViewer.moveNodeToCoordonates(movement.id, movement.x, movement.y);
                });
            }
            diagramViewerRef.current = diagramViewer;
        }
    }, [
        props.diagramId,
        props.svgType,
        props.svg,
        currentNode,
        props.loadingState,
        diagramSizeSetter,
        onMoveNodeCallback,
        openNadIds,
        nadNodeMovements, // TODO CHARLY attention, ça ressemble à de la dépendance cyclique
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
                style={{ height: '100%' }}
            />
        </>
    );
}

NetworkAreaDiagramContent.propTypes = {
    svgType: PropTypes.string,
    svg: PropTypes.string,
    loadingState: PropTypes.bool,
    diagramSizeSetter: PropTypes.func,
    diagramId: PropTypes.string,
};

export default NetworkAreaDiagramContent;
