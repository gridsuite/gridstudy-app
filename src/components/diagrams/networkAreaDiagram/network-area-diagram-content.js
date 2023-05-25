/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useLayoutEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { RunningStatus } from '../../utils/running-status';
import {
    MIN_HEIGHT,
    MIN_WIDTH,
    MAX_HEIGHT_NETWORK_AREA_DIAGRAM,
    MAX_WIDTH_NETWORK_AREA_DIAGRAM,
    useDiagramStyles,
} from '../diagram-common';
import { NetworkAreaDiagramViewer } from '@powsybl/diagram-viewer';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';

function NetworkAreaDiagramContent(props) {
    const classes = useDiagramStyles();
    const { diagramSizeSetter } = props;
    const network = useSelector((state) => state.network);
    const svgRef = useRef();
    const diagramViewerRef = useRef();
    const currentNode = useSelector((state) => state.currentTreeNode);

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
            diagramSizeSetter(
                props.diagramId,
                props.svgType,
                diagramViewer.getWidth(),
                diagramViewer.getHeight()
            );

            // If a previous diagram was loaded and the diagram's size remained the same, we keep
            // the user's zoom and scoll state for the current render.
            if (
                diagramViewerRef.current &&
                diagramViewer.getWidth() ===
                    diagramViewerRef.current.getWidth() &&
                diagramViewer.getHeight() ===
                    diagramViewerRef.current.getHeight()
            ) {
                diagramViewer.setViewBox(diagramViewerRef.current.getViewBox());
            }

            diagramViewerRef.current = diagramViewer;
        }
    }, [
        network,
        props.diagramId,
        props.svgType,
        props.svg,
        currentNode,
        props.loadingState,
        diagramSizeSetter,
    ]);

    /**
     * RENDER
     */

    return (
        <>
            <Box height={2}>{props.loadingState && <LinearProgress />}</Box>
            <div
                ref={svgRef}
                className={clsx(
                    classes.divDiagram,
                    classes.divNetworkAreaDiagram,
                    {
                        [classes.divDiagramInvalid]:
                            props.loadFlowStatus !== RunningStatus.SUCCEED,
                    }
                )}
                style={{ height: '100%' }}
            />
        </>
    );
}

NetworkAreaDiagramContent.propTypes = {
    loadFlowStatus: PropTypes.any,
    svgType: PropTypes.string,
    svg: PropTypes.string,
    loadingState: PropTypes.bool,
    diagramSizeSetter: PropTypes.func,
    diagramId: PropTypes.string,
};

export default NetworkAreaDiagramContent;
