/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import {
    decrementNetworkAreaDiagramDepth,
    incrementNetworkAreaDiagramDepth,
    resetNetworkAreaDiagramDepth,
    setFullScreenDiagram,
} from '../../redux/actions';
import { useIntl } from 'react-intl';
import {
    DiagramType,
    useDiagram,
    styles,
    MIN_WIDTH,
    LOADING_WIDTH,
    NETWORK_AREA_DIAGRAM_NB_MAX_VOLTAGE_LEVELS,
    LOADING_HEIGHT,
} from './diagram-common';
import DiagramHeader from './diagram-header';
import DiagramFooter from './diagram-footer';
import DiagramResizableBox from './diagram-resizable-box';
import AlertCustomMessageNode from '../utils/alert-custom-message-node';

const Diagram = (props) => {
    const dispatch = useDispatch();
    const intl = useIntl();

    const { minimizeDiagramView, togglePinDiagramView, closeDiagramView } = useDiagram();

    const fullScreenDiagram = useSelector((state) => state.fullScreenDiagram);

    const shouldBeHidden =
        fullScreenDiagram?.id &&
        (fullScreenDiagram.id !== props.diagramId || fullScreenDiagram.svgType !== props.svgType);

    const shouldBeFullscreen =
        fullScreenDiagram?.id === props.diagramId && fullScreenDiagram?.svgType === props.svgType;

    const networkAreaDiagramDepth = useSelector((state) => state.networkAreaDiagramDepth);

    const nbVoltageLevels = useSelector((state) => state.networkAreaDiagramNbVoltageLevels);

    const incrementCounterDisabled = props.loadingState || nbVoltageLevels > NETWORK_AREA_DIAGRAM_NB_MAX_VOLTAGE_LEVELS;

    const decrementCounterDisabled = props.loadingState || networkAreaDiagramDepth === 0;

    /**
     * DIAGRAM CONTROL HANDLERS
     */

    const onMinimizeHandler = () => {
        minimizeDiagramView(props.diagramId, props.svgType);
        dispatch(setFullScreenDiagram(null));
    };

    const onTogglePinHandler = () => {
        togglePinDiagramView(props.diagramId, props.svgType);
    };

    const onCloseHandler = () => {
        dispatch(setFullScreenDiagram(null));
        closeDiagramView(props.diagramId, props.svgType);
        if (props.svgType === DiagramType.NETWORK_AREA_DIAGRAM) {
            dispatch(resetNetworkAreaDiagramDepth());
        }
    };

    const onShowFullScreenHandler = () => {
        dispatch(setFullScreenDiagram(props.diagramId, props.svgType));
    };

    const onHideFullScreenHandler = () => {
        dispatch(setFullScreenDiagram(null));
    };

    const onIncrementDepthHandler = () => {
        dispatch(incrementNetworkAreaDiagramDepth());
    };

    const onDecrementDepthHandler = () => {
        dispatch(decrementNetworkAreaDiagramDepth());
    };

    /**
     * RENDER
     */

    return (
        <DiagramResizableBox
            align={props.align}
            height={shouldBeFullscreen ? props.fullscreenHeight : props.height}
            width={shouldBeFullscreen ? props.fullscreenWidth : props.width}
            // We disable the resizeBox if a diagram is in fullscreen
            disableResize={!!fullScreenDiagram?.id}
            // We hide this diagram if another diagram is in fullscreen mode.
            hide={shouldBeHidden}
        >
            <Paper
                elevation={4}
                square={true}
                sx={styles.paperBorders}
                style={{
                    pointerEvents: 'auto',
                    width: '100%',
                    minWidth: MIN_WIDTH,
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <DiagramHeader
                    diagramTitle={props.diagramTitle}
                    svgType={props.svgType}
                    diagramId={props.diagramId}
                    showMinimizeControl
                    onMinimize={onMinimizeHandler}
                    showTogglePinControl={props.svgType !== DiagramType.NETWORK_AREA_DIAGRAM}
                    onTogglePin={onTogglePinHandler}
                    pinned={props.pinned}
                    showCloseControl
                    onClose={onCloseHandler}
                />
                <Box sx={{position: 'relative', top:'2em', height: '100%',}}>
                {props.warningToDisplay ? (
                    <AlertCustomMessageNode message={props.warningToDisplay} noMargin />
                ) : (
                    <>{props.children}</>
                )}
                </Box>
                <DiagramFooter
                    showCounterControls={props.svgType === DiagramType.NETWORK_AREA_DIAGRAM}
                    counterText={intl.formatMessage({
                        id: 'depth',
                    })}
                    counterValue={networkAreaDiagramDepth}
                    onIncrementCounter={onIncrementDepthHandler}
                    onDecrementCounter={onDecrementDepthHandler}
                    showFullscreenControl
                    fullScreenActive={shouldBeFullscreen}
                    onStartFullScreen={onShowFullScreenHandler}
                    onStopFullScreen={onHideFullScreenHandler}
                    incrementCounterDisabled={incrementCounterDisabled}
                    decrementCounterDisabled={decrementCounterDisabled}
                />
            </Paper>
        </DiagramResizableBox>
    );
};

Diagram.defaultProps = {
    pinned: false,
    warningToDisplay: '',
    align: 'left',
    width: LOADING_WIDTH,
    height: LOADING_HEIGHT,
    fullscreenWidth: LOADING_WIDTH,
    fullscreenHeight: LOADING_HEIGHT,
};

Diagram.propTypes = {
    align: PropTypes.string,
    diagramId: PropTypes.string,
    diagramTitle: PropTypes.string.isRequired,
    warningToDisplay: PropTypes.string,
    pinned: PropTypes.bool,
    svgType: PropTypes.string.isRequired,
    children: PropTypes.node,
    width: PropTypes.number,
    height: PropTypes.number,
    fullscreenWidth: PropTypes.number,
    fullscreenHeight: PropTypes.number,
    loadingState: PropTypes.bool,
};

export default Diagram;
