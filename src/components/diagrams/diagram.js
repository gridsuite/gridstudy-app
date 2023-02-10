/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import PropTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
import { fetchSvg, updateSwitchState } from '../../utils/rest-api';
import {
    decrementNetworkAreaDiagramDepth,
    incrementNetworkAreaDiagramDepth,
    resetNetworkAreaDiagramDepth,
    setFullScreenDiagram,
} from '../../redux/actions';

import { AutoSizer } from 'react-virtualized';

import { useIntl } from 'react-intl';

import AlertInvalidNode from '../util/alert-invalid-node';
import BaseEquipmentMenu from '../menus/base-equipment-menu';
import withEquipmentMenu from '../menus/equipment-menu';
import withBranchMenu from '../menus/branch-menu';
import { equipments } from '../network/network-equipments';
import { useIntlRef, useSnackMessage } from '@gridsuite/commons-ui';
import { useIsAnyNodeBuilding } from '../util/is-any-node-building-hook';
import Alert from '@mui/material/Alert';
import {
    isNodeReadOnly,
    isNodeInNotificationList,
} from '../graph/util/model-functions';
import {
    NetworkAreaDiagramViewer,
    SingleLineDiagramViewer,
} from '@powsybl/diagram-viewer';
import {
    SvgType,
    getEquipmentTypeFromFeederType,
    useDiagram,
    computePaperAndSvgSizesIfReady,
    useDiagramStyles,
    MAX_HEIGHT_SUBSTATION,
    MAX_HEIGHT_VOLTAGE_LEVEL,
    MAX_HEIGHT_NETWORK_AREA_DIAGRAM,
    MAX_WIDTH_SUBSTATION,
    MAX_WIDTH_VOLTAGE_LEVEL,
    MAX_WIDTH_NETWORK_AREA_DIAGRAM,
    NoSvg,
    LOADING_WIDTH,
    LOADING_HEIGHT,
} from './diagram-common';
import DiagramHeader from './diagram-header';
import DiagramFooter from './diagram-footer';
import DiagramResizableBox from './diagram-resizable-box';
import SingleLineDiagramContent from './singleLineDiagram/single-line-diagram-content';
import NetworkAreaDiagramContent from './networkAreaDiagram/network-area-diagram-content';

let initialWidth, initialHeight;

const Diagram = forwardRef((props, ref) => {

    const dispatch = useDispatch();

    const svgRef = useRef();

    const classes = useDiagramStyles();
    const intl = useIntl();

    const {
        minimizeDiagramView,
        togglePinDiagramView,
        closeDiagramView,
    } = useDiagram();

    const fullScreenDiagram = useSelector((state) => state.fullScreenDiagram);


    const networkAreaDiagramDepth = useSelector(
        (state) => state.networkAreaDiagramDepth
    );

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
        if (props.svgType === SvgType.NETWORK_AREA_DIAGRAM) {
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
            // height={sizeHeight}
            // width={sizeWidth}
            height={2 * LOADING_HEIGHT}
            width={2 * LOADING_WIDTH}
            // We disable the resizeBox if a diagram is in fullscreen
            disableResize={fullScreenDiagram?.id}
            // We hide this diagram if another diagram is in fullscreen mode.
            hide={
                fullScreenDiagram?.id &&
                (fullScreenDiagram.id !== props.diagramId ||
                    fullScreenDiagram.svgType !== props.svgType)
            }
        >
            <Paper
                elevation={4}
                square={true}
                className={classes.paperBorders}
                style={{
                    pointerEvents: 'auto',
                    width: '100%',
                    minWidth: LOADING_WIDTH,
                    height: '100%',
                    position: 'relative', //workaround chrome78 bug https://codepen.io/jonenst/pen/VwKqvjv
                    overflow: 'hidden',
                }}
            >
                <DiagramHeader
                    diagramTitle={props.diagramTitle}
                    showMinimizeControl
                    onMinimize={onMinimizeHandler}
                    showTogglePinControl={
                        props.svgType !== SvgType.NETWORK_AREA_DIAGRAM
                    }
                    onTogglePin={onTogglePinHandler}
                    pinned={props.pinned}
                    showCloseControl
                    onClose={onCloseHandler}
                />

                {props.disabled ? (
                    <Box position="relative" left={0} right={0} top={0}>
                        <AlertInvalidNode noMargin={true} />
                    </Box>
                ) : (
                    <Box height={'100%'}>

                        {(props.svgType === SvgType.VOLTAGE_LEVEL ||
                            props.svgType === SvgType.SUBSTATION) && (
                            <SingleLineDiagramContent
                                ref={ref}
                                loadFlowStatus={props.loadFlowStatus}
                                svgType={props.svgType}
                                diagramId={props.diagramId}
                                disabled={props.disabled}
                                fullScreenActive={fullScreenDiagram?.id}
                                svgUrl={props.svgUrl}
                                studyUuid={props.studyUuid}
                                showInSpreadsheet={props.showInSpreadsheet}
                                computedHeight={props.computedHeight}
                                isComputationRunning={
                                    props.isComputationRunning
                                }
                                numberToDisplay={props.numberToDisplay}
                                setDisplayedDiagramHeights={
                                    props.setDisplayedDiagramHeights
                                }
                                totalHeight={props.totalHeight}
                            />
                        )}
                        {props.svgType === SvgType.NETWORK_AREA_DIAGRAM && (
                            <NetworkAreaDiagramContent
                                ref={ref}
                                loadFlowStatus={props.loadFlowStatus}
                                diagramId={props.diagramId}
                                disabled={props.disabled}
                                fullScreenActive={fullScreenDiagram?.id}
                                svgUrl={props.svgUrl}
                                studyUuid={props.studyUuid}

                            />
                        )}

                            <DiagramFooter
                                showCounterControls={
                                    props.svgType ===
                                    SvgType.NETWORK_AREA_DIAGRAM
                                }
                                counterText={intl.formatMessage({
                                    id: 'depth',
                                })}
                                counterValue={networkAreaDiagramDepth}
                                onIncrementCounter={onIncrementDepthHandler}
                                onDecrementCounter={onDecrementDepthHandler}
                                showFullscreenControl
                                fullScreenActive={fullScreenDiagram?.id}
                                onStartFullScreen={onShowFullScreenHandler}
                                onStopFullScreen={onHideFullScreenHandler}
                            />

                    </Box>
                )}
            </Paper>
        </DiagramResizableBox>
    );
});

Diagram.defaultProps = {
    pinned: false,
    disabled: false,
    align: 'left',
};

Diagram.propTypes = {
    diagramTitle: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    pinned: PropTypes.bool,
    diagramId: PropTypes.string.isRequired,
    svgType: PropTypes.string.isRequired,
    svgUrl: PropTypes.string,
    studyUuid: PropTypes.string.isRequired,
    align: PropTypes.string,
    loadFlowStatus: PropTypes.any,

    // Size computation
    computedHeight: PropTypes.number,
    totalHeight: PropTypes.number,
    totalWidth: PropTypes.number,
    numberToDisplay: PropTypes.number,
    setDisplayedDiagramHeights: PropTypes.func,

    // SLD specific
    isComputationRunning: PropTypes.bool.isRequired,
    showInSpreadsheet: PropTypes.func,
};

export default Diagram;
