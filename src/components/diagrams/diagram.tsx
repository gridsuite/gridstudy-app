/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
import { AppState } from 'redux/reducer';
import { DiagramType } from './diagram.type';
import { useDiagram } from './use-diagram';

interface DiagramProps {
    align?: 'left' | 'right' | 'center';
    diagramId: string;
    diagramTitle: string;
    warningToDisplay?: string;
    pinned?: boolean;
    svgType: DiagramType;
    children?: React.ReactNode;
    width?: number;
    height?: number;
    fullscreenWidth?: number;
    fullscreenHeight?: number;
    loadingState?: boolean;
}

const Diagram: React.FC<DiagramProps> = ({
    align = 'left',
    diagramId,
    diagramTitle,
    warningToDisplay = '',
    pinned = false,
    svgType,
    children,
    width = LOADING_WIDTH,
    height = LOADING_HEIGHT,
    fullscreenWidth = LOADING_WIDTH,
    fullscreenHeight = LOADING_HEIGHT,
    loadingState,
}) => {
    const dispatch = useDispatch();
    const intl = useIntl();

    const { minimizeDiagramView, togglePinDiagramView, closeDiagramView } = useDiagram();

    const fullScreenDiagram = useSelector((state: AppState) => state.fullScreenDiagram);

    const shouldBeHidden: boolean =
        Boolean(fullScreenDiagram?.id) &&
        (fullScreenDiagram?.id !== diagramId || fullScreenDiagram?.svgType !== svgType);

    const shouldBeFullscreen: boolean = fullScreenDiagram?.id === diagramId && fullScreenDiagram?.svgType === svgType;

    const networkAreaDiagramDepth = useSelector((state: AppState) => state.networkAreaDiagramDepth);

    const nbVoltageLevels = useSelector((state: AppState) => state.networkAreaDiagramNbVoltageLevels);

    const incrementCounterDisabled = loadingState || nbVoltageLevels > NETWORK_AREA_DIAGRAM_NB_MAX_VOLTAGE_LEVELS;

    const decrementCounterDisabled = loadingState || networkAreaDiagramDepth === 0;

    /**
     * DIAGRAM CONTROL HANDLERS
     */

    const onMinimizeHandler = () => {
        minimizeDiagramView(diagramId, svgType);
        dispatch(setFullScreenDiagram(null));
    };

    const onTogglePinHandler = () => {
        togglePinDiagramView(diagramId, svgType);
    };

    const onCloseHandler = () => {
        dispatch(setFullScreenDiagram(null));
        closeDiagramView(diagramId, svgType);
        if (svgType === DiagramType.NETWORK_AREA_DIAGRAM) {
            dispatch(resetNetworkAreaDiagramDepth());
        }
    };

    const onShowFullScreenHandler = () => {
        dispatch(setFullScreenDiagram(diagramId, svgType));
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
            align={align}
            height={shouldBeFullscreen ? fullscreenHeight : height}
            width={shouldBeFullscreen ? fullscreenWidth : width}
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
                    diagramTitle={diagramTitle}
                    svgType={svgType}
                    diagramId={diagramId}
                    showMinimizeControl
                    onMinimize={onMinimizeHandler}
                    showTogglePinControl={svgType !== DiagramType.NETWORK_AREA_DIAGRAM}
                    onTogglePin={onTogglePinHandler}
                    pinned={pinned}
                    showCloseControl
                    onClose={onCloseHandler}
                />
                <Box sx={{ position: 'relative', top: '2em', height: '100%' }}>
                    {warningToDisplay ? (
                        <AlertCustomMessageNode message={warningToDisplay} noMargin />
                    ) : (
                        <>{children}</>
                    )}
                </Box>
                <DiagramFooter
                    showCounterControls={svgType === DiagramType.NETWORK_AREA_DIAGRAM}
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

export default Diagram;
