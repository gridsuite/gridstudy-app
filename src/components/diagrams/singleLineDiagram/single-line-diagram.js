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
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { fetchSvg } from '../../../utils/rest-api';

import { fullScreenSingleLineDiagramId } from '../../../redux/actions';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import FullscreenIcon from '@mui/icons-material/Fullscreen';

import { AutoSizer } from 'react-virtualized';
import BaseEquipmentMenu from '../../menus/base-equipment-menu';
import withEquipmentMenu from '../../menus/equipment-menu';
import withLineMenu from '../../menus/line-menu';

import { equipments } from '../../network/network-equipments';
import { RunningStatus } from '../../util/running-status';
import { INVALID_LOADFLOW_OPACITY } from '../../../utils/colors';

import { useIntlRef, useSnackMessage } from '@gridsuite/commons-ui';

import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import MinimizeIcon from '@mui/icons-material/Minimize';
import clsx from 'clsx';
import AlertInvalidNode from '../../util/alert-invalid-node';
import { useIsAnyNodeBuilding } from '../../util/is-any-node-building-hook';
import Alert from '@mui/material/Alert';
import { isNodeBuilt, isNodeReadOnly } from '../../graph/util/model-functions';
import { SingleLineDiagramViewer } from '@powsybl/diagram-viewer';
import {
    BORDERS,
    commonStyle,
    commonSldStyle,
    MAP_BOTTOM_OFFSET,
    MAP_RIGHT_OFFSET,
    MAX_HEIGHT_SUBSTATION,
    MAX_HEIGHT_VOLTAGE_LEVEL,
    MAX_WIDTH_SUBSTATION,
    MAX_WIDTH_VOLTAGE_LEVEL,
    SvgType,
    renderIntoPaperWrapper,
    NoSvg,
} from './utils';

const customSldStyle = (theme) => {
    return {
        '& .arrow': {
            fill: theme.palette.text.primary,
        },
    };
};

const customStyle = (theme) => {
    return {
        divInvalid: {
            '& .sld-active-power, .sld-reactive-power, .sld-voltage, .sld-angle':
                {
                    opacity: INVALID_LOADFLOW_OPACITY,
                },
        },
        actionIcon: {
            padding: 0,
            borderRight: theme.spacing(1),
        },
        pinRotate: {
            padding: 0,
            borderRight: theme.spacing(1),
            transform: 'rotate(45deg)',
        },
        fullScreenIcon: {
            bottom: 5,
            right: 5,
            position: 'absolute',
            cursor: 'pointer',
        },
    };
};

const useStyles = makeStyles((theme) => ({
    divSld: commonSldStyle(theme, customSldStyle(theme)),
    ...commonStyle(theme, customStyle(theme)),
}));

function getEquipmentTypeFromFeederType(feederType) {
    switch (feederType) {
        case 'LINE':
            return equipments.lines;
        case 'LOAD':
            return equipments.loads;
        case 'BATTERY':
            return equipments.batteries;
        case 'DANGLING_LINE':
            return equipments.danglingLines;
        case 'GENERATOR':
            return equipments.generators;
        case 'VSC_CONVERTER_STATION':
            return equipments.vscConverterStations;
        case 'LCC_CONVERTER_STATION':
            return equipments.lccConverterStations;
        case 'HVDC_LINE':
            return equipments.hvdcLines;
        case 'CAPACITOR':
        case 'INDUCTOR':
            return equipments.shuntCompensators;
        case 'STATIC_VAR_COMPENSATOR':
            return equipments.staticVarCompensators;
        case 'TWO_WINDINGS_TRANSFORMER':
        case 'TWO_WINDINGS_TRANSFORMER_LEG':
        case 'PHASE_SHIFT_TRANSFORMER':
            return equipments.twoWindingsTransformers;
        case 'THREE_WINDINGS_TRANSFORMER':
        case 'THREE_WINDINGS_TRANSFORMER_LEG':
            return equipments.threeWindingsTransformers;
        default: {
            console.log('bad feeder type ', feederType);
            return null;
        }
    }
}

let initialWidth, initialHeight;

// Compute the paper and svg sizes. Returns undefined if the preferred sizes are undefined.
const computePaperAndSvgSizesIfReady = (
    fullScreen,
    svgType,
    totalWidth,
    totalHeight,
    svgPreferredWidth,
    svgPreferredHeight,
    headerPreferredHeight
) => {
    if (
        typeof svgPreferredWidth != 'undefined' &&
        typeof headerPreferredHeight != 'undefined'
    ) {
        let paperWidth, paperHeight, svgWidth, svgHeight;
        if (fullScreen) {
            paperWidth = totalWidth;
            paperHeight = totalHeight;
            svgWidth = totalWidth - BORDERS;
            svgHeight = totalHeight - headerPreferredHeight - BORDERS;
        } else {
            let maxWidth, maxHeight;
            if (svgType === SvgType.VOLTAGE_LEVEL) {
                maxWidth = MAX_WIDTH_VOLTAGE_LEVEL;
                maxHeight = MAX_HEIGHT_VOLTAGE_LEVEL;
            } else {
                maxWidth = MAX_WIDTH_SUBSTATION;
                maxHeight = MAX_HEIGHT_SUBSTATION;
            }
            svgWidth = Math.min(
                svgPreferredWidth,
                totalWidth - MAP_RIGHT_OFFSET,
                maxWidth
            );
            svgHeight = Math.min(
                svgPreferredHeight,
                totalHeight - MAP_BOTTOM_OFFSET - headerPreferredHeight,
                maxHeight
            );
            paperWidth = svgWidth + BORDERS;
            paperHeight = svgHeight + headerPreferredHeight + BORDERS;
        }
        return { paperWidth, paperHeight, svgWidth, svgHeight };
    }
};

const SingleLineDiagram = forwardRef((props, ref) => {
    const [svg, setSvg] = useState(NoSvg);
    const svgUrl = useRef('');
    const svgDraw = useRef();
    const dispatch = useDispatch();
    const { snackError } = useSnackMessage();
    const intlRef = useIntlRef();
    const svgRef = useRef();
    const {
        totalWidth,
        totalHeight,
        svgType,
        loadFlowStatus,
        numberToDisplay,
        sldId,
        pinned,
        onTogglePin,
        onMinimize,
        disabled,
        computedHeight,
        setDisplayedSldHeights,
    } = props;

    const network = useSelector((state) => state.network);

    const currentNode = useSelector((state) => state.currentTreeNode);

    const fullScreenSldId = useSelector((state) => state.fullScreenSldId);

    const [forceState, updateState] = useState(false);

    const [loadingState, updateLoadingState] = useState(false);

    const [locallySwitchedBreaker, setLocallySwitchedBreaker] = useState();

    const isAnyNodeBuilding = useIsAnyNodeBuilding();

    const MenuLine = withLineMenu(BaseEquipmentMenu);

    const theme = useTheme();

    const [modificationInProgress, setModificationInProgress] = useState(false);

    const errorWidth = MAX_WIDTH_VOLTAGE_LEVEL;

    const forceUpdate = useCallback(() => {
        updateState((s) => !s);
    }, []);

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

    const hasSldSizeRemainedTheSame = (
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
            setDisplayedSldHeights((displayedSldHeights) => {
                return [
                    ...displayedSldHeights.filter((sld) => sld.id !== sldId),
                    { id: sldId, initialHeight: finalPaperHeight },
                ];
            });
        }
    }, [finalPaperHeight, setDisplayedSldHeights, sldId]);

    useLayoutEffect(() => {
        const sizes = computePaperAndSvgSizesIfReady(
            fullScreenSldId,
            svgType,
            totalWidth,
            totalHeight,
            svgPreferredWidth,
            svgPreferredHeight,
            headerPreferredHeight,
            BORDERS,
            MAX_WIDTH_VOLTAGE_LEVEL,
            MAX_HEIGHT_VOLTAGE_LEVEL,
            MAX_WIDTH_SUBSTATION,
            MAX_HEIGHT_SUBSTATION,
            MAP_RIGHT_OFFSET,
            MAP_BOTTOM_OFFSET
        );
        if (sizes) {
            if (
                !fullScreenSldId &&
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
        fullScreenSldId,
        totalWidth,
        totalHeight,
        svgType,
        svgPreferredWidth,
        svgPreferredHeight,
        headerPreferredHeight,
        numberToDisplay,
        sldId,
    ]);

    useEffect(() => {
        // We use isNodeBuilt here instead of the "disabled" props to avoid
        // triggering this effect when changing current node
        if (props.svgUrl) {
            updateLoadingState(true);
            fetchSvg(props.svgUrl)
                .then((data) => {
                    setSvg({
                        svg: data.svg,
                        metadata: data.metadata,
                        error: null,
                        svgUrl: props.svgUrl,
                    });
                    updateLoadingState(false);
                    setLocallySwitchedBreaker();
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
                        msg = `Voltage level ${sldId} not found`;
                    } else {
                        msg = error.message;
                    }
                    snackError({
                        messageTxt: msg,
                    });
                    updateLoadingState(false);
                    setLocallySwitchedBreaker();
                });
        } else {
            setSvg(NoSvg);
        }
    }, [props.svgUrl, forceState, snackError, intlRef, sldId]);

    const { onNextVoltageLevelClick, onBreakerClick, isComputationRunning } =
        props;

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
        onNextVoltageLevelClick,
        onBreakerClick,
        isComputationRunning,
        isAnyNodeBuilding,
        equipmentMenu,
        showEquipmentMenu,
        svgType,
        theme,
        sldId,
        ref,
        disabled,
    ]);

    useLayoutEffect(() => {
        if (disabled) return;

        if (svg.svg) {
            const minWidth = svgFinalWidth;
            const minHeight = svgFinalHeight;

            let viewboxMaxWidth =
                svgType === SvgType.VOLTAGE_LEVEL
                    ? MAX_WIDTH_VOLTAGE_LEVEL
                    : MAX_WIDTH_SUBSTATION;
            let viewboxMaxHeight =
                svgType === SvgType.VOLTAGE_LEVEL
                    ? MAX_HEIGHT_VOLTAGE_LEVEL
                    : MAX_HEIGHT_SUBSTATION;
            let onNextVoltageCallback =
                !isComputationRunning &&
                !isAnyNodeBuilding &&
                !modificationInProgress &&
                !loadingState
                    ? onNextVoltageLevelClick
                    : null;
            let onBreakerCallback =
                !isComputationRunning &&
                !isAnyNodeBuilding &&
                !isNodeReadOnly(currentNode) &&
                !modificationInProgress &&
                !loadingState
                    ? (breakerId, newSwitchState, switchElement) => {
                          if (!modificationInProgress) {
                              setModificationInProgress(true);
                              updateLoadingState(true);
                              setLocallySwitchedBreaker(switchElement);
                              onBreakerClick(
                                  breakerId,
                                  newSwitchState,
                                  switchElement
                              );
                          }
                      }
                    : null;
            let onEquipmentMenuCallback =
                !isComputationRunning &&
                !isAnyNodeBuilding &&
                !modificationInProgress &&
                !loadingState
                    ? showEquipmentMenu
                    : null;

            let selectionBackColor = theme.palette.background.paper;

            const sldViewer = new SingleLineDiagramViewer(
                svgRef.current, //container
                svg.svg, //svgContent
                svg.metadata, //svg metadata
                svgType,
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
                setSvgPreferredHeight(sldViewer.getHeight());
                setSvgPreferredWidth(sldViewer.getWidth());
            }

            //Rotate clicked switch while waiting for updated sld data
            if (locallySwitchedBreaker) {
                const breakerToSwitchDom = document.getElementById(
                    locallySwitchedBreaker.id
                );
                if (breakerToSwitchDom.classList.value.includes('sld-closed')) {
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
                svgDraw.current &&
                hasSldSizeRemainedTheSame(
                    svgDraw.current.getOriginalWidth(),
                    svgDraw.current.getOriginalHeight(),
                    sldViewer.getOriginalWidth(),
                    sldViewer.getOriginalHeight()
                )
            ) {
                sldViewer.setViewBox(svgDraw.current.getViewBox());
            }

            // on sld resizing, we need to refresh zoom to avoid exceeding max or min zoom
            // this is due to a svg.panzoom.js package's behaviour
            sldViewer.refreshZoom();

            svgUrl.current = svg.svgUrl;
            svgDraw.current = sldViewer;
        }

        // Note: onNextVoltageLevelClick and onBreakerClick don't change
        // Note: these deps must be kept in sync with the ones of the useLayoutEffect shouldResetPreferredSizes
        // is set to true. Because we want to reset svgPreferredWidth and svgPreferredHeight in all cases, except when only svgFinalWidth and svgFinalHeight have changed
        // so we use the same deps but without svgFinalWidth and svgFinalHeight
        // TODO is there a better way to do this??
    }, [
        network,
        svg,
        currentNode,
        onNextVoltageLevelClick,
        onBreakerClick,
        isComputationRunning,
        isAnyNodeBuilding,
        equipmentMenu,
        showEquipmentMenu,
        svgType,
        theme,
        sldId,
        ref,
        svgFinalHeight,
        svgFinalWidth,
        disabled,
        modificationInProgress,
        loadingState,
        locallySwitchedBreaker,
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
        onNextVoltageLevelClick,
        onBreakerClick,
        isComputationRunning,
        svgType,
        theme,
        equipmentMenu,
        showEquipmentMenu,
        locallySwitchedBreaker,
        loadingState,
        modificationInProgress,
        isAnyNodeBuilding,
        network,
        ref,
        computedHeight,
    ]);

    const classes = useStyles();

    const onCloseHandler = () => {
        if (props.onClose !== null) {
            dispatch(fullScreenSingleLineDiagramId(undefined));
            props.onClose(sldId);
        }
    };

    const showFullScreen = useCallback(
        () => dispatch(fullScreenSingleLineDiagramId(sldId)),
        [dispatch, sldId]
    );

    const hideFullScreen = useCallback(
        () => dispatch(fullScreenSingleLineDiagramId(undefined)),
        [dispatch]
    );

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

    if (!isNodeBuilt(currentNode)) {
        sizeWidth = totalWidth / numberToDisplay;
    }

    if (sizeWidth !== undefined) {
        initialWidth = sizeWidth; // setting initial width for the next SLD.
    }
    if (sizeHeight !== undefined) {
        initialHeight = sizeHeight; // setting initial height for the next SLD.
    }

    if (!fullScreenSldId && computedHeight) {
        sizeHeight = computedHeight;
    }

    const pinSld = useCallback(() => onTogglePin(sldId), [sldId, onTogglePin]);

    const minimizeSld = useCallback(() => {
        onMinimize(sldId);
        hideFullScreen();
    }, [onMinimize, sldId, hideFullScreen]);

    const SingleLineDiagramElement = () => {
        return (
            <>
                <Box>
                    <AutoSizer
                        onResize={({ height }) => {
                            setHeaderPreferredHeight(height);
                        }}
                    >
                        {() => /* just for measuring the header */ {}}
                    </AutoSizer>

                    <Box className={classes.header}>
                        <Box flexGrow={1}>
                            <Typography>{props.diagramTitle}</Typography>
                        </Box>
                        <Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                }}
                            >
                                <IconButton
                                    className={classes.actionIcon}
                                    onClick={minimizeSld}
                                >
                                    <MinimizeIcon />
                                </IconButton>
                                <IconButton
                                    className={
                                        pinned
                                            ? classes.actionIcon
                                            : classes.pinRotate
                                    }
                                    onClick={pinSld}
                                >
                                    {pinned ? (
                                        <PushPinIcon />
                                    ) : (
                                        <PushPinOutlinedIcon />
                                    )}
                                </IconButton>
                                <IconButton
                                    className={classes.close}
                                    onClick={onCloseHandler}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                        </Box>
                    </Box>
                </Box>
                {<Box height={2}>{loadingState && <LinearProgress />}</Box>}
                {disabled ? (
                    <Box position="relative" left={0} right={0} top={0}>
                        <AlertInvalidNode noMargin={true} />
                    </Box>
                ) : (
                    <Box>
                        {props.updateSwitchMsg && (
                            <Alert severity="error">
                                {props.updateSwitchMsg}
                            </Alert>
                        )}
                        {
                            <div
                                ref={svgRef}
                                className={clsx(classes.divSld, {
                                    [classes.divInvalid]:
                                        loadFlowStatus !==
                                        RunningStatus.SUCCEED,
                                })}
                                dangerouslySetInnerHTML={{
                                    __html: svg.svg,
                                }}
                            />
                        }
                        {displayMenuLine()}
                        {displayMenu(equipments.loads, 'load-menus')}
                        {displayMenu(equipments.batteries, 'battery-menus')}
                        {displayMenu(
                            equipments.danglingLines,
                            'dangling-line-menus'
                        )}
                        {displayMenu(equipments.generators, 'generator-menus')}
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
                        {displayMenu(equipments.hvdcLines, 'hvdc-line-menus')}
                        {displayMenu(
                            equipments.lccConverterStations,
                            'lcc-converter-station-menus'
                        )}
                        {displayMenu(
                            equipments.vscConverterStations,
                            'vsc-converter-station-menus'
                        )}

                        {!loadingState &&
                            (fullScreenSldId ? (
                                <FullscreenExitIcon
                                    onClick={hideFullScreen}
                                    className={classes.fullScreenIcon}
                                />
                            ) : (
                                <FullscreenIcon
                                    onClick={showFullScreen}
                                    className={classes.fullScreenIcon}
                                />
                            ))}
                    </Box>
                )}
            </>
        );
    };

    return renderIntoPaperWrapper(
        svg,
        ref,
        classes,
        sizeWidth,
        sizeHeight,
        SingleLineDiagramElement()
    );
});

SingleLineDiagram.propTypes = {
    diagramTitle: PropTypes.string.isRequired,
    svgUrl: PropTypes.string,
    sldId: PropTypes.string,
    numberToDisplay: PropTypes.number,
    onClose: PropTypes.func,
    updateSwitchMsg: PropTypes.string.isRequired,
    isComputationRunning: PropTypes.bool.isRequired,
    svgType: PropTypes.string.isRequired,
    onNextVoltageLevelClick: PropTypes.func,
    onBreakerClick: PropTypes.func,
    pinned: PropTypes.bool,
    pin: PropTypes.func,
    minimize: PropTypes.func,
    disabled: PropTypes.bool,
};

export default SingleLineDiagram;
