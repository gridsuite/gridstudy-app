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
import Paper from '@mui/material/Paper';
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
import { isNodeReadOnly } from '../../graph/util/model-functions';
import { SingleLineDiagramViewer } from '@powsybl/diagram-viewer';

export const SubstationLayout = {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical',
    SMART: 'smart',
    SMARTHORIZONTALCOMPACTION: 'smartHorizontalCompaction',
    SMARTVERTICALCOMPACTION: 'smartVerticalCompaction',
};

export const SvgType = {
    VOLTAGE_LEVEL: 'voltage-level',
    SUBSTATION: 'substation',
};

const loadingWidth = 150;
const maxWidthVoltageLevel = 800;
const maxHeightVoltageLevel = 700;
const maxWidthSubstation = 1200;
const maxHeightSubstation = 700;
const errorWidth = maxWidthVoltageLevel;

const useStyles = makeStyles((theme) => ({
    divSld: {
        '& svg': {
            // necessary because the default (inline-block) adds vertical space
            // to our otherwise pixel accurate computations (this makes a
            // scrollbar appear in fullscreen mode)
            display: 'block',
        },
        '& polyline': {
            pointerEvents: 'none',
        },
        '& .sld-label, .sld-graph-label': {
            fill: theme.palette.text.primary,
            'font-family': theme.typography.fontFamily,
        },
        '& .sld-disconnector:not(.sld-fictitious), :not(.sld-breaker):not(.sld-disconnector):not(.sld-load-break-switch).sld-disconnected, .sld-feeder-disconnected, .sld-feeder-disconnected-connected':
            {
                stroke: theme.palette.text.primary,
            },
        '& .arrow': {
            fill: theme.palette.text.primary,
        },
        '& .sld-flash, .sld-lock': {
            stroke: 'none',
            fill: theme.palette.text.primary,
        },
        overflow: 'hidden',
    },
    divInvalid: {
        '& .sld-arrow-p, .sld-arrow-q': {
            opacity: INVALID_LOADFLOW_OPACITY,
        },
    },
    close: {
        padding: 0,
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
    header: {
        padding: 5,
        display: 'flex',
        flexDirection: 'row',
        wordBreak: 'break-all',
        backgroundColor: theme.palette.background.default,
    },
    fullScreenIcon: {
        bottom: 5,
        right: 5,
        position: 'absolute',
        cursor: 'pointer',
    },
    paperBorders: {
        borderLeft: '1px solid ' + theme.palette.action.disabled,
        borderBottom: '1px solid ' + theme.palette.action.disabledBackground,
        borderRight: '1px solid ' + theme.palette.action.hover,
    },
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

const noSvg = { svg: null, metadata: null, error: null, svgUrl: null };

let initialWidth, initialHeight;
// To allow controls that are in the corners of the map to not be hidden in normal mode
// (but they are still hidden in fullscreen mode)
const mapRightOffset = 120;
const mapBottomOffset = 80;
const borders = 2; // we use content-size: border-box so this needs to be included..
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
            svgWidth = totalWidth - borders;
            svgHeight = totalHeight - headerPreferredHeight - borders;
        } else {
            let maxWidth, maxHeight;
            if (svgType === SvgType.VOLTAGE_LEVEL) {
                maxWidth = maxWidthVoltageLevel;
                maxHeight = maxHeightVoltageLevel;
            } else {
                maxWidth = maxWidthSubstation;
                maxHeight = maxHeightSubstation;
            }
            svgWidth = Math.min(
                svgPreferredWidth,
                totalWidth - mapRightOffset,
                maxWidth
            );
            svgHeight = Math.min(
                svgPreferredHeight,
                totalHeight - mapBottomOffset - headerPreferredHeight,
                maxHeight
            );
            paperWidth = svgWidth + borders;
            paperHeight = svgHeight + headerPreferredHeight + borders;
        }
        return { paperWidth, paperHeight, svgWidth, svgHeight };
    }
};

const SingleLineDiagram = forwardRef((props, ref) => {
    const [svg, setSvg] = useState(noSvg);
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

    const closeEquipmentMenu = useCallback(() => {
        setEquipmentMenu({
            display: false,
        });
    }, []);

    function handleViewInSpreadsheet() {
        props.showInSpreadsheet(equipmentMenu);
        closeEquipmentMenu();
    }

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

    useLayoutEffect(() => {
        const sizes = computePaperAndSvgSizesIfReady(
            fullScreenSldId,
            svgType,
            totalWidth,
            totalHeight,
            svgPreferredWidth,
            svgPreferredHeight,
            headerPreferredHeight
        );
        if (typeof sizes != 'undefined') {
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
                    snackError({
                        messageTxt: error.message,
                    });
                    updateLoadingState(false);
                    setLocallySwitchedBreaker();
                });
        } else {
            setSvg(noSvg);
        }
    }, [props.svgUrl, forceState, snackError, intlRef]);

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
                    ? maxWidthVoltageLevel
                    : maxWidthSubstation;
            let viewboxMaxHeight =
                svgType === SvgType.VOLTAGE_LEVEL
                    ? maxHeightVoltageLevel
                    : maxHeightSubstation;
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

            if (svgDraw.current && svgUrl.current === svg.svgUrl) {
                sldViewer.setViewBox(svgDraw.current.getViewBox());
            }
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
                    svgEl.setAttribute('height', svgFinalHeight);
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

    function displayMenuLine() {
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
    }

    function displayMenu(equipmentType, menuId) {
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
    }

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

    if (sizeWidth !== undefined) {
        initialWidth = sizeWidth; // setting initial width for the next SLD.
    }
    if (sizeHeight !== undefined) {
        initialHeight = sizeHeight; // setting initial height for the next SLD.
    }

    const pinSld = useCallback(() => onTogglePin(sldId), [sldId, onTogglePin]);

    const minimizeSld = useCallback(() => {
        onMinimize(sldId);
        hideFullScreen();
    }, [onMinimize, sldId, hideFullScreen]);

    return !svg.error ? (
        <Paper
            ref={ref}
            elevation={4}
            square={true}
            className={classes.paperBorders}
            style={{
                pointerEvents: 'auto',
                width: sizeWidth,
                minWidth: loadingWidth,
                height: sizeHeight,
                position: 'relative', //workaround chrome78 bug https://codepen.io/jonenst/pen/VwKqvjv
                overflow: 'hidden',
                display:
                    !fullScreenSldId || sldId === fullScreenSldId ? '' : 'none',
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

                <Box className={classes.header}>
                    <Box flexGrow={1}>
                        <Typography>{props.diagramTitle}</Typography>
                    </Box>
                    <Box>
                        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
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
            {loadingState && (
                <Box height={2}>
                    <LinearProgress />
                </Box>
            )}
            {disabled ? (
                <Box position="relative" left={0} right={0} top={0}>
                    <AlertInvalidNode noMargin={true} />
                </Box>
            ) : (
                <Box position="relative">
                    {props.updateSwitchMsg && (
                        <Alert severity="error">{props.updateSwitchMsg}</Alert>
                    )}
                    {
                        <div
                            ref={svgRef}
                            className={clsx(classes.divSld, {
                                [classes.divInvalid]:
                                    loadFlowStatus !== RunningStatus.SUCCEED,
                            })}
                            dangerouslySetInnerHTML={{ __html: svg.svg }}
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
        </Paper>
    ) : (
        <></>
    );
});

SingleLineDiagram.propTypes = {
    diagramTitle: PropTypes.string.isRequired,
    svgUrl: PropTypes.string.isRequired,
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
