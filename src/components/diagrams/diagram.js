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
import { fetchSvg } from '../../utils/rest-api';
import {
    decrementNetworkAreaDiagramDepth,
    incrementNetworkAreaDiagramDepth,
    resetNetworkAreaDiagramDepth,
    setFullScreenDiagram,
} from '../../redux/actions';

import { AutoSizer } from 'react-virtualized';

import { useIntl } from 'react-intl';

import clsx from 'clsx';
import { RunningStatus } from '../util/running-status';
import AlertInvalidNode from '../util/alert-invalid-node';
import BaseEquipmentMenu from '../menus/base-equipment-menu';
import withEquipmentMenu from '../menus/equipment-menu';
import withLineMenu from '../menus/line-menu';
import { equipments } from '../network/network-equipments';
import { useIntlRef, useSnackMessage } from '@gridsuite/commons-ui';
import { useIsAnyNodeBuilding } from '../util/is-any-node-building-hook';
import Alert from '@mui/material/Alert';
import { isNodeBuilt, isNodeReadOnly } from '../graph/util/model-functions';
import {
    NetworkAreaDiagramViewer,
    SingleLineDiagramViewer,
} from '@powsybl/diagram-viewer';
import {
    SvgType,
    getEquipmentTypeFromFeederType,
    useDiagram,
    computePaperAndSvgSizesIfReady,
    commonDiagramStyle,
    commonSldStyle,
    commonNadStyle,
    MAX_HEIGHT_SUBSTATION,
    MAX_HEIGHT_VOLTAGE_LEVEL,
    MAX_HEIGHT_NETWORK_AREA_DIAGRAM,
    MAX_WIDTH_SUBSTATION,
    MAX_WIDTH_VOLTAGE_LEVEL,
    MAX_WIDTH_NETWORK_AREA_DIAGRAM,
    NoSvg,
    LOADING_WIDTH,
    MAX_ZOOM,
    MIN_ZOOM_RATIO,
} from './diagram-common';
import makeStyles from '@mui/styles/makeStyles';
import DiagramHeader from './diagram-header';
import DiagramFooter from './diagram-footer';

const customSldStyle = (theme) => {
    return {
        '& .arrow': {
            fill: theme.palette.text.primary,
        },
    };
};

const useStyles = makeStyles((theme) => ({
    divSld: commonSldStyle(theme, customSldStyle(theme)),
    divNad: commonNadStyle(theme),
    ...commonDiagramStyle(theme),
}));

let initialWidth, initialHeight;

const Diagram = forwardRef((props, ref) => {
    const [svg, setSvg] = useState(NoSvg);

    const dispatch = useDispatch();
    const { snackError } = useSnackMessage();
    const intlRef = useIntlRef();

    const svgRef = useRef();
    const diagramViewerRef = useRef();

    const theme = useTheme();
    const classes = useStyles();
    const intl = useIntl();
    const {
        computedHeight,
        disabled,
        loadFlowStatus,
        numberToDisplay,
        setDisplayedDiagramHeights,
        totalHeight,
        totalWidth,
    } = props;

    const { minimizeDiagramView, togglePinDiagramView, closeDiagramView } =
        useDiagram();

    const diagramType = useCallback(() => {
        switch (props.svgType) {
            case SvgType.SUBSTATION:
            case SvgType.VOLTAGE_LEVEL:
                return 'SLD';
            case SvgType.NETWORK_AREA_DIAGRAM:
                return 'NAD';
            default:
                console.error('type inconnu diagramType');
        }
    }, [props.svgType]);

    const network = useSelector((state) => state.network);

    const currentNode = useSelector((state) => state.currentTreeNode);

    const fullScreenDiagram = useSelector((state) => state.fullScreenDiagram);

    const [forceState, updateState] = useState(false);

    const networkAreaDiagramDepth = useSelector(
        (state) => state.networkAreaDiagramDepth
    );

    const [loadingState, updateLoadingState] = useState(false);

    const [locallySwitchedBreaker, setLocallySwitchedBreaker] = useState();

    const isAnyNodeBuilding = useIsAnyNodeBuilding();

    const MenuLine = withLineMenu(BaseEquipmentMenu);

    const [modificationInProgress, setModificationInProgress] = useState(false);

    const errorWidth = MAX_WIDTH_VOLTAGE_LEVEL;

    const forceUpdate = useCallback(() => {
        updateState((s) => !s);
    }, []);

    // SLD
    const [equipmentMenu, setEquipmentMenu] = useState({
        position: [-1, -1],
        equipmentId: null,
        equipmentType: null,
        svgId: null,
        display: null,
    });

    const showEquipmentMenu = useCallback(
        (equipmentId, equipmentType, svgId, x, y) => {
            setEquipmentMenu({
                position: [x, y],
                equipmentId: equipmentId,
                equipmentType: getEquipmentTypeFromFeederType(equipmentType),
                svgId: svgId,
                display: true,
            });
        },
        []
    );

    const hasDiagramSizeRemainedTheSame = (
        oldWidth,
        oldHeight,
        newWidth,
        newHeight
    ) => {
        return oldWidth === newWidth && oldHeight === newHeight;
    };

    const closeEquipmentMenu = useCallback(() => {
        setEquipmentMenu({
            display: false,
        });
    }, []);

    const handleViewInSpreadsheet = () => {
        props.showInSpreadsheet(equipmentMenu);
        closeEquipmentMenu();
    };

    useImperativeHandle(
        ref,
        () => ({
            reloadSvg: forceUpdate,
        }),
        // Note: forceUpdate doesn't change
        [forceUpdate]
    );

    // using many useState() calls with literal values only to
    // easily avoid recomputing stuff when updating with the same values
    const [svgPreferredWidth, setSvgPreferredWidth] = useState();
    const [svgPreferredHeight, setSvgPreferredHeight] = useState();
    const [headerPreferredHeight, setHeaderPreferredHeight] = useState();
    const [finalPaperWidth, setFinalPaperWidth] = useState();
    const [finalPaperHeight, setFinalPaperHeight] = useState();
    const [svgFinalWidth, setSvgFinalWidth] = useState();
    const [svgFinalHeight, setSvgFinalHeight] = useState();

    useEffect(() => {
        if (finalPaperHeight) {
            setDisplayedDiagramHeights((displayedDiagramHeights) => {
                return [
                    ...displayedDiagramHeights.filter(
                        (diagram) => diagram.id !== props.diagramId
                    ),
                    { id: props.diagramId, initialHeight: finalPaperHeight },
                ];
            });
        }
    }, [finalPaperHeight, setDisplayedDiagramHeights, props.diagramId]);

    // After getting the SVG, we will calculate the diagram's ideal size
    useLayoutEffect(() => {
        const sizes = computePaperAndSvgSizesIfReady(
            fullScreenDiagram?.id,
            props.svgType,
            totalWidth,
            totalHeight,
            svgPreferredWidth,
            svgPreferredHeight,
            headerPreferredHeight
        );

        if (sizes) {
            if (
                !fullScreenDiagram?.id &&
                sizes.svgWidth * numberToDisplay > totalWidth
            ) {
                setSvgFinalWidth(totalWidth / numberToDisplay);
                setFinalPaperWidth(totalWidth / numberToDisplay);

                const adjustedHeight =
                    sizes.svgHeight *
                    (totalWidth / numberToDisplay / sizes.svgWidth);

                setSvgFinalHeight(adjustedHeight);
                setFinalPaperHeight(
                    adjustedHeight + (sizes.paperHeight - sizes.svgHeight)
                );
            } else {
                setSvgFinalWidth(sizes.svgWidth);
                setFinalPaperWidth(sizes.paperWidth);
                setSvgFinalHeight(sizes.svgHeight);
                setFinalPaperHeight(sizes.paperHeight);
            }
        }
    }, [
        fullScreenDiagram,
        totalWidth,
        totalHeight,
        props.svgType,
        svgPreferredWidth,
        svgPreferredHeight,
        headerPreferredHeight,
        numberToDisplay,
        props.diagramId,
    ]);

    useEffect(() => {
        if (props.svgUrl) {
            const isDiagramTypeSld = diagramType() === 'SLD';
            const acceptJson = isDiagramTypeSld;

            updateLoadingState(true);
            fetchSvg(props.svgUrl, acceptJson)
                .then((data) => {
                    setSvg({
                        svg: acceptJson ? data.svg : data,
                        metadata: isDiagramTypeSld ? data.metadata : null,
                        error: null,
                        svgUrl: props.svgUrl,
                    });
                })
                .catch((error) => {
                    console.error(error.message);
                    setSvg({
                        svg: null,
                        metadata: null,
                        error: error.message,
                        svgUrl: props.svgUrl,
                    });
                    let msg;
                    if (error.status === 404) {
                        msg = `Voltage level ${props.diagramId} not found`; // TODO change this error message
                    } else {
                        msg = error.message;
                    }
                    snackError({
                        messageTxt: msg,
                    });
                })
                .finally(() => {
                    updateLoadingState(false);
                    if (isDiagramTypeSld) {
                        setLocallySwitchedBreaker();
                    }
                });
        } else {
            setSvg(NoSvg);
        }
    }, [
        props.svgUrl,
        forceState,
        snackError,
        intlRef,
        props.diagramId,
        diagramType,
    ]);

    // shouldResetPreferredSizes doesn't need to be a ref, but it makes the static checks happy
    const shouldResetPreferredSizes = useRef();
    shouldResetPreferredSizes.current = false;
    useLayoutEffect(() => {
        shouldResetPreferredSizes.current = true;
        // Note: these deps must be kept in sync with the ones of the useLayoutEffect where setSvgPreferredWidth and setSvgPreferredHeight
        // are called. Because we want to reset them in all cases, except when only svgFinalWidth and svgFinalHeight have changed
        // so we use the same deps but without svgFinalWidth and svgFinalHeight
        // TODO is there a better way to do this??
    }, [
        network,
        svg,
        currentNode,
        props.onNextVoltageLevelClick,
        props.onBreakerClick,
        props.isComputationRunning,
        isAnyNodeBuilding,
        equipmentMenu,
        showEquipmentMenu,
        props.svgType,
        theme,
        props.diagramId,
        ref,
        disabled,
    ]);

    useLayoutEffect(() => {
        if (disabled) return;

        if (svg.svg) {
            if (diagramType() === 'NAD') {
                const minWidth = svgFinalWidth;
                const minHeight = svgFinalHeight;

                const diagramViewer = new NetworkAreaDiagramViewer(
                    svgRef.current,
                    svg.svg,
                    minWidth,
                    minHeight,
                    MAX_WIDTH_NETWORK_AREA_DIAGRAM,
                    MAX_HEIGHT_NETWORK_AREA_DIAGRAM
                );
                setSvgPreferredHeight(diagramViewer.getHeight());
                setSvgPreferredWidth(diagramViewer.getWidth());

                //if original nad size has not changed (nad structure has remained the same), we keep the same zoom
                if (
                    diagramViewerRef.current &&
                    hasDiagramSizeRemainedTheSame(
                        diagramViewerRef.current.getOriginalWidth(),
                        diagramViewerRef.current.getOriginalHeight(),
                        diagramViewer.getOriginalWidth(),
                        diagramViewer.getOriginalHeight()
                    )
                ) {
                    diagramViewer.setViewBox(
                        diagramViewerRef.current.getViewBox()
                    );
                }

                // we set min/max zoom for network area diagram
                const minZoom =
                    MIN_ZOOM_RATIO /
                    (networkAreaDiagramDepth === 0
                        ? 1
                        : networkAreaDiagramDepth);
                diagramViewer.svgDraw.panZoom({
                    zoomMin: minZoom,
                    zoomMax: MAX_ZOOM,
                });

                diagramViewerRef.current = diagramViewer;
            } else if (diagramType() === 'SLD') {
                const minWidth = svgFinalWidth;
                const minHeight = svgFinalHeight;

                let viewboxMaxWidth =
                    props.svgType === SvgType.VOLTAGE_LEVEL
                        ? MAX_WIDTH_VOLTAGE_LEVEL
                        : MAX_WIDTH_SUBSTATION;
                let viewboxMaxHeight =
                    props.svgType === SvgType.VOLTAGE_LEVEL
                        ? MAX_HEIGHT_VOLTAGE_LEVEL
                        : MAX_HEIGHT_SUBSTATION;
                let onNextVoltageCallback =
                    !props.isComputationRunning &&
                    !isAnyNodeBuilding &&
                    !modificationInProgress &&
                    !loadingState
                        ? props.onNextVoltageLevelClick
                        : null;
                let onBreakerCallback =
                    !props.isComputationRunning &&
                    !isAnyNodeBuilding &&
                    !isNodeReadOnly(currentNode) &&
                    !modificationInProgress &&
                    !loadingState
                        ? (breakerId, newSwitchState, switchElement) => {
                              if (!modificationInProgress) {
                                  setModificationInProgress(true);
                                  updateLoadingState(true);
                                  setLocallySwitchedBreaker(switchElement);
                                  props.onBreakerClick(
                                      breakerId,
                                      newSwitchState,
                                      switchElement
                                  );
                              }
                          }
                        : null;
                let onEquipmentMenuCallback =
                    !props.isComputationRunning &&
                    !isAnyNodeBuilding &&
                    !modificationInProgress &&
                    !loadingState
                        ? showEquipmentMenu
                        : null;

                let selectionBackColor = theme.palette.background.paper;

                const diagramViewer = new SingleLineDiagramViewer(
                    svgRef.current, //container
                    svg.svg, //svgContent
                    svg.metadata, //svg metadata
                    props.svgType,
                    minWidth,
                    minHeight,
                    viewboxMaxWidth,
                    viewboxMaxHeight,
                    onNextVoltageCallback, //callback on the next voltage arrows
                    onBreakerCallback, // callback on the breakers
                    onEquipmentMenuCallback, //callback on the feeders
                    selectionBackColor //arrows color
                );

                if (shouldResetPreferredSizes.current) {
                    setSvgPreferredHeight(diagramViewer.getHeight());
                    setSvgPreferredWidth(diagramViewer.getWidth());
                }

                //Rotate clicked switch while waiting for updated sld data
                if (locallySwitchedBreaker) {
                    const breakerToSwitchDom = document.getElementById(
                        locallySwitchedBreaker.id
                    );
                    if (
                        breakerToSwitchDom.classList.value.includes(
                            'sld-closed'
                        )
                    ) {
                        breakerToSwitchDom.classList.replace(
                            'sld-closed',
                            'sld-open'
                        );
                    } else if (
                        breakerToSwitchDom.classList.value.includes('sld-open')
                    ) {
                        breakerToSwitchDom.classList.replace(
                            'sld-open',
                            'sld-closed'
                        );
                    }
                }

                //if original sld size has not changed (sld structure has remained the same), we keep the same zoom
                if (
                    diagramViewerRef.current &&
                    hasDiagramSizeRemainedTheSame(
                        diagramViewerRef.current.getOriginalWidth(),
                        diagramViewerRef.current.getOriginalHeight(),
                        diagramViewer.getOriginalWidth(),
                        diagramViewer.getOriginalHeight()
                    )
                ) {
                    diagramViewer.setViewBox(
                        diagramViewerRef.current.getViewBox()
                    );
                }

                // on sld resizing, we need to refresh zoom to avoid exceeding max or min zoom
                // this is due to a svg.panzoom.js package's behaviour
                diagramViewer.refreshZoom();

                diagramViewerRef.current = diagramViewer;
            } else {
                console.error('diagramType manquant #2');
                alert('check console');
            }
        }
    }, [
        network,
        props.diagramId,
        props.svgUrl,
        svg,
        currentNode,
        props.onNextVoltageLevelClick,
        props.onBreakerClick,
        props.isComputationRunning,
        isAnyNodeBuilding,
        equipmentMenu,
        showEquipmentMenu,
        props.svgType,
        theme,
        ref,
        svgFinalHeight,
        svgFinalWidth,
        disabled,
        modificationInProgress,
        loadingState,
        locallySwitchedBreaker,
        diagramType,
        networkAreaDiagramDepth,
    ]);

    useLayoutEffect(() => {
        if (
            typeof svgFinalWidth != 'undefined' &&
            typeof svgFinalHeight != 'undefined'
        ) {
            const divElt = svgRef.current;
            if (divElt != null) {
                const svgEl = divElt.getElementsByTagName('svg')[0];
                if (svgEl != null) {
                    svgEl.setAttribute('width', svgFinalWidth);
                    svgEl.setAttribute(
                        'height',
                        computedHeight ? computedHeight : svgFinalHeight
                    );
                }
            }
            setModificationInProgress(false);
        } else {
        }
    }, [
        svgFinalWidth,
        svgFinalHeight,
        //TODO, these are from the previous useLayoutEffect
        //how to refactor to avoid repeating them here ?
        svg,
        props.onNextVoltageLevelClick,
        props.onBreakerClick,
        props.isComputationRunning,
        props.svgType,
        theme,
        equipmentMenu,
        showEquipmentMenu,
        locallySwitchedBreaker,
        loadingState,
        modificationInProgress,
        isAnyNodeBuilding,
        network,
        ref,
        fullScreenDiagram,
        computedHeight,
    ]);

    /*const onCloseHandler = () => {
        dispatch(setFullScreenDiagram(null));
        closeDiagramView(props.diagramId, props.svgType);
        if (props.svgType === SvgType.NETWORK_AREA_DIAGRAM) {
            setDepth(0);
        }
    };

    const showFullScreen = useCallback(
        () => dispatch(setFullScreenDiagram(props.diagramId, props.svgType)),
        [dispatch, props.diagramId, props.svgType]
    );

    const hideFullScreen = useCallback(
        () => dispatch(setFullScreenDiagram(null)),
        [dispatch]
    );*/

    const displayMenuLine = () => {
        return (
            equipmentMenu.display &&
            equipmentMenu.equipmentType === equipments.lines && (
                <MenuLine
                    id={equipmentMenu.equipmentId}
                    position={equipmentMenu.position}
                    handleClose={closeEquipmentMenu}
                    handleViewInSpreadsheet={handleViewInSpreadsheet}
                    currentNode={currentNode}
                    modificationInProgress={modificationInProgress}
                    setModificationInProgress={(value) =>
                        setModificationInProgress(value)
                    }
                />
            )
        );
    };

    const displayMenu = (equipmentType, menuId) => {
        const Menu = withEquipmentMenu(
            BaseEquipmentMenu,
            menuId,
            equipmentType
        );
        return (
            equipmentMenu.display &&
            equipmentMenu.equipmentType === equipmentType && (
                <Menu
                    id={equipmentMenu.equipmentId}
                    position={equipmentMenu.position}
                    handleClose={closeEquipmentMenu}
                    handleViewInSpreadsheet={handleViewInSpreadsheet}
                />
            )
        );
    };

    let sizeWidth,
        sizeHeight = initialHeight;
    if (svg.error) {
        sizeWidth = errorWidth;
    } else if (
        typeof finalPaperWidth != 'undefined' &&
        typeof finalPaperHeight != 'undefined'
    ) {
        sizeWidth = finalPaperWidth;
        sizeHeight = finalPaperHeight;
    } else if (initialWidth !== undefined || loadingState) {
        sizeWidth = initialWidth;
    } else {
        sizeWidth = totalWidth; // happens during initialization if initial width value is undefined
    }

    if (!isNodeBuilt(currentNode)) {
        sizeWidth = totalWidth / numberToDisplay; // prevents the diagram from becoming too big if the current node is not built
    }

    if (sizeWidth !== undefined) {
        initialWidth = sizeWidth; // setting initial width for the next SLD.
    }
    if (sizeHeight !== undefined) {
        initialHeight = sizeHeight; // setting initial height for the next SLD.
    }

    if (!fullScreenDiagram?.id && computedHeight) {
        sizeHeight = computedHeight;
    }

    /**
     * CONTROL HANDLERS
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

    /*const pinDiagram = useCallback(() => {
        onTogglePin(props.diagramId, props.svgType);
    }, [props.diagramId, props.svgType, onTogglePin]);

    const minimizeDiagram = useCallback(() => {
        onMinimize(props.diagramId, props.svgType);
        hideFullScreen();
    }, [onMinimize, props.diagramId, props.svgType, hideFullScreen]);
*/
    return !svg.error ? (
        <Paper
            ref={ref}
            elevation={4}
            square={true}
            className={classes.paperBorders}
            style={{
                flewGrow: 0, // allows a separator to take all the available space
                pointerEvents: 'auto',
                width: sizeWidth,
                minWidth: LOADING_WIDTH,
                height: sizeHeight,
                position: 'relative', //workaround chrome78 bug https://codepen.io/jonenst/pen/VwKqvjv
                overflow: 'hidden',
                // We hide this diagram if another diagram is in fullscreen mode.
                display:
                    !fullScreenDiagram?.id ||
                    (props.diagramId === fullScreenDiagram.id &&
                        props.svgType === fullScreenDiagram.svgType)
                        ? ''
                        : 'none',
            }}
        >
            <Box>
                <AutoSizer
                    onResize={({ height }) => {
                        setHeaderPreferredHeight(height);
                    }}
                >
                    {() => /* just for measuring the header */ {}}
                </AutoSizer>

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
            </Box>
            {<Box height={2}>{loadingState && <LinearProgress />}</Box>}
            {disabled ? (
                <Box position="relative" left={0} right={0} top={0}>
                    <AlertInvalidNode noMargin={true} />
                </Box>
            ) : (
                <Box>
                    {props.updateSwitchMsg && (
                        <Alert severity="error">{props.updateSwitchMsg}</Alert>
                    )}
                    {diagramType() === 'SLD' && (
                        <div
                            ref={svgRef}
                            className={clsx(classes.divSld, {
                                [classes.divInvalid]:
                                    loadFlowStatus !== RunningStatus.SUCCEED,
                            })}
                            dangerouslySetInnerHTML={{
                                __html: svg.svg,
                            }}
                        />
                    )}
                    {diagramType() === 'NAD' && (
                        <div
                            id="nad-svg"
                            ref={svgRef}
                            className={clsx(classes.divNad, {
                                [classes.divInvalid]:
                                    loadFlowStatus !== RunningStatus.SUCCEED,
                            })}
                        />
                    )}
                    {diagramType() === 'SLD' && (
                        <>
                            {displayMenuLine()}
                            {displayMenu(equipments.loads, 'load-menus')}
                            {displayMenu(equipments.batteries, 'battery-menus')}
                            {displayMenu(
                                equipments.danglingLines,
                                'dangling-line-menus'
                            )}
                            {displayMenu(
                                equipments.generators,
                                'generator-menus'
                            )}
                            {displayMenu(
                                equipments.staticVarCompensators,
                                'static-var-compensator-menus'
                            )}
                            {displayMenu(
                                equipments.shuntCompensators,
                                'shunt-compensator-menus'
                            )}
                            {displayMenu(
                                equipments.twoWindingsTransformers,
                                'two-windings-transformer-menus'
                            )}
                            {displayMenu(
                                equipments.threeWindingsTransformers,
                                'three-windings-transformer-menus'
                            )}
                            {displayMenu(
                                equipments.hvdcLines,
                                'hvdc-line-menus'
                            )}
                            {displayMenu(
                                equipments.lccConverterStations,
                                'lcc-converter-station-menus'
                            )}
                            {displayMenu(
                                equipments.vscConverterStations,
                                'vsc-converter-station-menus'
                            )}
                        </>
                    )}

                    {!loadingState && (
                        <DiagramFooter
                            showCounterControls={
                                props.svgType === SvgType.NETWORK_AREA_DIAGRAM
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
                    )}
                </Box>
            )}
        </Paper>
    ) : (
        <></>
    );
});

Diagram.defaultProps = {
    pinned: false,
};

Diagram.propTypes = {
    diagramId: PropTypes.string.isRequired,
    svgType: PropTypes.string.isRequired,

    //depth: PropTypes.number,
    diagramTitle: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    isComputationRunning: PropTypes.bool.isRequired,
    minimize: PropTypes.func,
    numberToDisplay: PropTypes.number,
    onBreakerClick: PropTypes.func,
    loadFlowStatus: PropTypes.any,
    onNextVoltageLevelClick: PropTypes.func,
    pin: PropTypes.func,
    pinned: PropTypes.bool,
    svgUrl: PropTypes.string,
    updateSwitchMsg: PropTypes.string,
};

export default Diagram;
