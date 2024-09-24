/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
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
import ComputingType from 'components/computing-status/computing-type';
import EquipmentPopover from 'components/tooltips/equipment-popover';

const dynamicCssRules = [
    {
        cssSelector: '.nad-edge-infos', // data on edges (arrows and values)
        belowThresholdCssDeclaration: { display: 'block' },
        aboveThresholdCssDeclaration: { display: 'none' },
        threshold: 2200,
        thresholdStatus: THRESHOLD_STATUS.ABOVE,
    },
    {
        cssSelector: '.nad-label-box', // tooltips linked to nodes
        belowThresholdCssDeclaration: { display: 'block' },
        aboveThresholdCssDeclaration: { display: 'none' },
        threshold: 3000,
        thresholdStatus: THRESHOLD_STATUS.ABOVE,
    },
    {
        cssSelector: '.nad-text-edges', // visual link between nodes and their tooltip
        belowThresholdCssDeclaration: { display: 'block' },
        aboveThresholdCssDeclaration: { display: 'none' },
        threshold: 3000,
        thresholdStatus: THRESHOLD_STATUS.ABOVE,
    },
    {
        cssSelector: '[class^="nad-vl0to30"], [class*=" nad-vl0to30"]',
        belowThresholdCssDeclaration: { display: 'block' },
        aboveThresholdCssDeclaration: { display: 'none' },
        threshold: 4000,
        thresholdStatus: THRESHOLD_STATUS.BELOW,
    },
    {
        cssSelector: '[class^="nad-vl30to50"], [class*=" nad-vl30to50"]',
        belowThresholdCssDeclaration: { display: 'block' },
        aboveThresholdCssDeclaration: { display: 'none' },
        threshold: 4000,
        thresholdStatus: THRESHOLD_STATUS.BELOW,
    },
    {
        cssSelector: '[class^="nad-vl50to70"], [class*=" nad-vl50to70"]',
        belowThresholdCssDeclaration: { display: 'block' },
        aboveThresholdCssDeclaration: { display: 'none' },
        threshold: 9000,
        thresholdStatus: THRESHOLD_STATUS.BELOW,
    },
    {
        cssSelector: '[class^="nad-vl70to120"], [class*=" nad-vl70to120"]',
        belowThresholdCssDeclaration: { display: 'block' },
        aboveThresholdCssDeclaration: { display: 'none' },
        threshold: 9000,
        thresholdStatus: THRESHOLD_STATUS.BELOW,
    },
    {
        cssSelector: '[class^="nad-vl120to180"], [class*=" nad-vl120to180"]',
        belowThresholdCssDeclaration: { display: 'block' },
        aboveThresholdCssDeclaration: { display: 'none' },
        threshold: 12000,
        thresholdStatus: THRESHOLD_STATUS.BELOW,
    },
    {
        cssSelector: '[class^="nad-vl180to300"], [class*=" nad-vl180to300"]',
        belowThresholdCssDeclaration: { display: 'block' },
        aboveThresholdCssDeclaration: { display: 'none' },
        threshold: 20000,
        thresholdStatus: THRESHOLD_STATUS.BELOW,
    },
];

function NetworkAreaDiagramContent(props) {
    const { diagramSizeSetter } = props;
    const svgRef = useRef();
    const diagramViewerRef = useRef();
    const currentNode = useSelector((state) => state.currentTreeNode);
    const loadFlowStatus = useSelector((state) => state.computingStatus[ComputingType.LOAD_FLOW]);
    const [shouldDisplayTooltip, setShouldDisplayTooltip] = useState(false);
    const [anchorPosition, setAnchorPosition] = useState({ top: 0, left: 0 });
    const [hoveredEquipmentId, setHoveredEquipmentId] = useState('');
    const [hoveredEquipmentType, setHoveredEquipmentType] = useState('');
    const studyUuid = useSelector((state) => state.studyUuid);
    /**
     * DIAGRAM CONTENT BUILDING
     */
    const handleTogglePopover = useCallback(
        (shouldDisplay, anchorEl, mousePosition, equipmentId, equipmentType) => {
            console.log('=======cc======', shouldDisplay, mousePosition, equipmentId, equipmentType);
            setShouldDisplayTooltip(shouldDisplay);
            setAnchorPosition({
                top: mousePosition.y + 10, // Adjust for better positioning
                left: mousePosition.x + 10,
            });
            if (shouldDisplay) {
                setHoveredEquipmentId(equipmentId);
                setAnchorPosition({
                    top: mousePosition.y + 10, // Adjust for better positioning
                    left: mousePosition.x + 10,
                });
                //   setEquipmentPopoverAnchorEl(currentTarget);
                setHoveredEquipmentType(equipmentType);
            } else {
                setHoveredEquipmentId('');
                //  setEquipmentPopoverAnchorEl(null);
                setHoveredEquipmentType('');
            }
        },
        [setShouldDisplayTooltip, setAnchorPosition]
    );
    const displayTooltip = () => {
        return (
            <EquipmentPopover
                studyUuid={studyUuid}
                anchorEl={null}
                anchorPosition={anchorPosition}
                equipmentType={hoveredEquipmentType}
                equipmentId={hoveredEquipmentId}
                loadFlowStatus={loadFlowStatus}
            />
        );
    };

    useLayoutEffect(() => {
        if (props.svg) {
            const diagramViewer = new NetworkAreaDiagramViewer(
                svgRef.current,
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
                dynamicCssRules,
                handleTogglePopover
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
                diagramViewer.setViewBox(diagramViewerRef.current.getViewBox());
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
        handleTogglePopover,
    ]);

    /**
     * RENDER
     */

    return (
        <>
            <Box height={2}>{props.loadingState && <LinearProgress />}</Box>
            {shouldDisplayTooltip && displayTooltip()}

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
