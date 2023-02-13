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
    networkAreaDiagramNbVoltageLevels,
} from '../../redux/actions';

import { AutoSizer } from 'react-virtualized';

import { useIntl } from 'react-intl';

import clsx from 'clsx';
import { RunningStatus } from '../util/running-status';
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
} from './diagram-common';
import makeStyles from '@mui/styles/makeStyles';
import DiagramHeader from './diagram-header';
import DiagramFooter from './diagram-footer';
import DiagramResizableBox from './diagram-resizable-box';

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
        openDiagramView,
        minimizeDiagramView,
        togglePinDiagramView,
        closeDiagramView,
    } = useDiagram();

    const network = useSelector((state) => state.network);

    const currentNode = useSelector((state) => state.currentTreeNode);

    const fullScreenDiagram = useSelector((state) => state.fullScreenDiagram);

    const notificationIdList = useSelector((state) => state.notificationIdList);

    const [forceState, updateState] = useState(false);

    const networkAreaDiagramDepth = useSelector(
        (state) => state.networkAreaDiagramDepth
    );

    const [loadingState, updateLoadingState] = useState(false);

    const [locallySwitchedBreaker, setLocallySwitchedBreaker] = useState();

    const isAnyNodeBuilding = useIsAnyNodeBuilding();

    const MenuBranch = withBranchMenu(BaseEquipmentMenu);

    const [modificationInProgress, setModificationInProgress] = useState(false);

    const errorWidth = MAX_WIDTH_VOLTAGE_LEVEL;

    const [errorMessage, setErrorMessage] = useState('');

    const forceUpdate = useCallback(() => {
        updateState((s) => !s);
    }, []);

    useImperativeHandle(
        ref,
        () => ({
            reloadSvg: forceUpdate,
        }),
        // Note: forceUpdate doesn't change
        [forceUpdate]
    );

    const handleBreakerClick = useCallback(
        (breakerId, open, switchElement) => {
            updateSwitchState(
                props.studyUuid,
                currentNode?.id,
                breakerId,
                open
            ).catch((error) => {
                console.error(error.message);
                setErrorMessage(error.message);
            });
        },
        [props.studyUuid, currentNode]
    );

    const handleNextVoltageLevelClick = useCallback(
        (id) => {
            // This function is called by powsybl-diagram-viewer when clicking on a navigation arrow in a single line diagram.
            // At the moment, there is no plan to open something other than a voltage-level by using these navigation arrows.
            if (!network) {
                return;
            }
            openDiagramView(id, SvgType.VOLTAGE_LEVEL);
        },
        [network, openDiagramView]
    );

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

    // using many useState() calls with literal values only to
    // easily avoid recomputing stuff when updating with the same values
    const [svgPreferredWidth, setSvgPreferredWidth] = useState();
    const [svgPreferredHeight, setSvgPreferredHeight] = useState();
    const [headerPreferredHeight, setHeaderPreferredHeight] = useState();
    const [finalPaperWidth, setFinalPaperWidth] = useState();
    const [finalPaperHeight, setFinalPaperHeight] = useState();
    const [svgFinalWidth, setSvgFinalWidth] = useState();
    const [svgFinalHeight, setSvgFinalHeight] = useState();

    // Here, the goal is to update the parent's list of heights with the newly computed height of this diagram.
    const setDisplayedDiagramHeights = props.setDisplayedDiagramHeights;
    useEffect(() => {
        if (finalPaperHeight) {
            setDisplayedDiagramHeights((displayedDiagramHeights) => {
                return [
                    ...displayedDiagramHeights.filter(
                        // We remove any old diagram that matches the current diagram...
                        (diagram) =>
                            diagram.id !== props.diagramId ||
                            diagram.svgType !== props.svgType
                    ),
                    {
                        // ...and then insert the current diagram's height
                        id: props.diagramId,
                        svgType: props.svgType,
                        initialHeight: finalPaperHeight,
                    },
                ];
            });
        }
    }, [
        finalPaperHeight,
        setDisplayedDiagramHeights,
        props.diagramId,
        props.svgType,
    ]);

    // After getting the SVG, we will calculate the diagram's ideal size
    useLayoutEffect(() => {
        const sizes = computePaperAndSvgSizesIfReady(
            fullScreenDiagram?.id,
            props.svgType,
            props.totalWidth,
            props.totalHeight,
            svgPreferredWidth,
            svgPreferredHeight,
            headerPreferredHeight
        );

        if (sizes) {
            if (
                !fullScreenDiagram?.id &&
                sizes.svgWidth * props.numberToDisplay > props.totalWidth
            ) {
                setSvgFinalWidth(props.totalWidth / props.numberToDisplay);
                setFinalPaperWidth(props.totalWidth / props.numberToDisplay);

                const adjustedHeight =
                    sizes.svgHeight *
                    (props.totalWidth / props.numberToDisplay / sizes.svgWidth);

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
        props.totalWidth,
        props.totalHeight,
        props.svgType,
        svgPreferredWidth,
        svgPreferredHeight,
        headerPreferredHeight,
        props.numberToDisplay,
        props.diagramId,
    ]);

    const isNodeinNotifs = isNodeInNotificationList(
        currentNode,
        notificationIdList
    );

    useEffect(() => {
        if (props.svgUrl) {
            if (!isNodeinNotifs) {
                const isDiagramTypeSld =
                    props.svgType === SvgType.VOLTAGE_LEVEL ||
                    props.svgType === SvgType.SUBSTATION;

                updateLoadingState(true);
                fetchSvg(props.svgUrl)
                    .then((data) => {
                        if (data !== null) {
                            setSvg({
                                svg: data.svg,
                                metadata: data.metadata,
                                error: null,
                                svgUrl: props.svgUrl,
                            });
                            if (
                                props.svgType === SvgType.NETWORK_AREA_DIAGRAM
                            ) {
                                dispatch(
                                    networkAreaDiagramNbVoltageLevels(
                                        data?.metadata?.nbVoltageLevels
                                    )
                                );
                            }
                        } else {
                            setSvg(NoSvg);
                        }
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
            }
        } else {
            setSvg(NoSvg);
        }
    }, [
        props.svgUrl,
        forceState,
        snackError,
        intlRef,
        props.diagramId,
        props.svgType,
        isNodeinNotifs,
        dispatch,
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
        props.isComputationRunning,
        isAnyNodeBuilding,
        equipmentMenu,
        showEquipmentMenu,
        props.svgType,
        theme,
        props.diagramId,
        ref,
        props.disabled,
    ]);

    useLayoutEffect(() => {
        if (props.disabled) return;

        if (svg.svg) {
            if (props.svgType === SvgType.NETWORK_AREA_DIAGRAM) {
                const diagramViewer = new NetworkAreaDiagramViewer(
                    svgRef.current,
                    svg.svg,
                    svgFinalWidth,
                    svgFinalHeight,
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

                diagramViewerRef.current = diagramViewer;
            } else {
                // props.svgType is of Single Line Diagram type
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
                        ? handleNextVoltageLevelClick
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
                                  handleBreakerClick(
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
                    svgFinalWidth,
                    svgFinalHeight,
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
            }
        }
    }, [
        network,
        props.diagramId,
        props.svgUrl,
        svg,
        currentNode,
        props.isComputationRunning,
        isAnyNodeBuilding,
        equipmentMenu,
        showEquipmentMenu,
        props.svgType,
        theme,
        ref,
        svgFinalHeight,
        svgFinalWidth,
        props.disabled,
        modificationInProgress,
        loadingState,
        locallySwitchedBreaker,
        networkAreaDiagramDepth,
        handleBreakerClick,
        handleNextVoltageLevelClick,
    ]);

    useLayoutEffect(() => {
        if (svgFinalWidth != null && svgFinalHeight != null) {
            const divElt = svgRef.current;
            if (divElt != null) {
                const svgEl = divElt.getElementsByTagName('svg')[0];
                if (svgEl != null) {
                    svgEl.setAttribute('width', svgFinalWidth);
                    svgEl.setAttribute(
                        'height',
                        props.computedHeight ?? svgFinalHeight
                    );
                }
            }
            setModificationInProgress(false);
        }
    }, [
        svgFinalWidth,
        svgFinalHeight,
        //TODO, these are from the previous useLayoutEffect
        //how to refactor to avoid repeating them here ?
        svg,
        props.onNextVoltageLevelClick,
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
        props.computedHeight,
    ]);

    const displayBranchMenu = () => {
        return (
            equipmentMenu.display &&
            (equipmentMenu.equipmentType === equipments.lines ||
                equipmentMenu.equipmentType ===
                    equipments.twoWindingsTransformers) && (
                <MenuBranch
                    id={equipmentMenu.equipmentId}
                    equipmentType={equipmentMenu.equipmentType}
                    position={equipmentMenu.position}
                    handleClose={closeEquipmentMenu}
                    handleViewInSpreadsheet={handleViewInSpreadsheet}
                    currentNode={currentNode}
                    studyUuid={props.studyUuid}
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
    } else if (finalPaperWidth != null && finalPaperHeight != null) {
        sizeWidth = finalPaperWidth;
        sizeHeight = finalPaperHeight;
    } else if (initialWidth !== undefined || loadingState) {
        sizeWidth = initialWidth;
    } else {
        sizeWidth = props.totalWidth; // happens during initialization if initial width value is undefined
    }

    if (sizeWidth !== undefined) {
        initialWidth = sizeWidth; // setting initial width for the next SLD.
    }
    if (sizeHeight !== undefined) {
        initialHeight = sizeHeight; // setting initial height for the next SLD.
    }

    if (!fullScreenDiagram?.id && props.computedHeight) {
        sizeHeight = props.computedHeight;
    }

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

    const contentRender = () => {
        return (
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
                {props.disabled ? (
                    <Box position="relative" left={0} right={0} top={0}>
                        <AlertInvalidNode noMargin={true} />
                    </Box>
                ) : (
                    <Box height={'100%'}>
                        {errorMessage && (
                            <Alert severity="error">{errorMessage}</Alert>
                        )}
                        {(props.svgType === SvgType.VOLTAGE_LEVEL ||
                            props.svgType === SvgType.SUBSTATION) && (
                            <>
                                <div
                                    ref={svgRef}
                                    className={clsx(classes.divSld, {
                                        [classes.divInvalid]:
                                            props.loadFlowStatus !==
                                            RunningStatus.SUCCEED,
                                    })}
                                    dangerouslySetInnerHTML={{
                                        __html: svg.svg,
                                    }}
                                    style={{ height: '100%' }}
                                />
                                {displayBranchMenu()}
                                {displayMenu(equipments.loads, 'load-menus')}
                                {displayMenu(
                                    equipments.batteries,
                                    'battery-menus'
                                )}
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
                        {props.svgType === SvgType.NETWORK_AREA_DIAGRAM && (
                            <div
                                id="nad-svg"
                                ref={svgRef}
                                className={clsx(classes.divNad, {
                                    [classes.divInvalid]:
                                        props.loadFlowStatus !==
                                        RunningStatus.SUCCEED,
                                })}
                                style={{ height: '100%' }}
                            />
                        )}

                        {!loadingState && (
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
                        )}
                    </Box>
                )}
            </Paper>
        );
    };

    return !svg.error ? (
        <DiagramResizableBox
            align={props.align}
            height={sizeHeight}
            width={sizeWidth}
            // We disable the resizeBox if a diagram is in fullscreen
            disableResize={fullScreenDiagram?.id}
            // We hide this diagram if another diagram is in fullscreen mode.
            hide={
                fullScreenDiagram?.id &&
                (fullScreenDiagram.id !== props.diagramId ||
                    fullScreenDiagram.svgType !== props.svgType)
            }
        >
            {contentRender()}
        </DiagramResizableBox>
    ) : (
        <></>
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

    // Size computation
    computedHeight: PropTypes.number,
    totalHeight: PropTypes.number,
    totalWidth: PropTypes.number,
    numberToDisplay: PropTypes.number,
    setDisplayedDiagramHeights: PropTypes.func,

    // SLD specific
    isComputationRunning: PropTypes.bool.isRequired,
    loadFlowStatus: PropTypes.any,
    showInSpreadsheet: PropTypes.func,
};

export default Diagram;
