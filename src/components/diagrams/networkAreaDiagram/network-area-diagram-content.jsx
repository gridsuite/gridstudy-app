/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useLayoutEffect, useRef } from 'react';
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
import { NetworkAreaDiagramViewer } from '@powsybl/diagram-viewer';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import { mergeSx } from '../../utils/functions';
import ComputingType from 'components/computing-status/computing-type';

function NetworkAreaDiagramContent(props) {
    const { diagramSizeSetter } = props;
    const svgRef = useRef();
    const diagramViewerRef = useRef();
    const currentNode = useSelector((state) => state.currentTreeNode);
    const loadFlowStatus = useSelector((state) => state.computingStatus[ComputingType.LOAD_FLOW]);

    /**
     * DIAGRAM CONTENT BUILDING
     */

    useLayoutEffect(() => {
        if (props.svg) {
            const diagramViewer = new NetworkAreaDiagramViewer(
                svgRef.current,
                props.svg,
                MIN_WIDTH,
                MIN_HEIGHT,
                MAX_WIDTH_NETWORK_AREA_DIAGRAM,
                MAX_HEIGHT_NETWORK_AREA_DIAGRAM
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

NetworkAreaDiagramContent.propTypes = {
    svgType: PropTypes.string,
    svg: PropTypes.string,
    loadingState: PropTypes.bool,
    diagramSizeSetter: PropTypes.func,
    diagramId: PropTypes.string,
};

export default NetworkAreaDiagramContent;
