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
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import { fetchSvg } from '../../utils/rest-api';
import {
    setFullScreenDiagramId,
    openNetworkAreaDiagram,
} from '../../redux/actions';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

import { AutoSizer } from 'react-virtualized';

import { useIntl } from 'react-intl';

import clsx from 'clsx';
import { RunningStatus } from '../util/running-status';
import AlertInvalidNode from '../util/alert-invalid-node';
import MinimizeIcon from '@mui/icons-material/Minimize';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import BaseEquipmentMenu from '../menus/base-equipment-menu';
import withEquipmentMenu from '../menus/equipment-menu';
import withLineMenu from '../menus/line-menu';
import { equipments } from '../network/network-equipments';
import { useIntlRef, useSnackMessage } from '@gridsuite/commons-ui';
import { useIsAnyNodeBuilding } from '../util/is-any-node-building-hook';
import Alert from '@mui/material/Alert';
import { isNodeBuilt, isNodeReadOnly } from '../graph/util/model-functions';
import { NetworkAreaDiagramViewer, SingleLineDiagramViewer } from '@powsybl/diagram-viewer';
import {
    SvgType,
    getEquipmentTypeFromFeederType,
    useDiagram,
    BORDERS,
    commonDiagramStyle,
    commonSldStyle,
    commonNadStyle,
    MAP_BOTTOM_OFFSET,
    //MAP_RIGHT_OFFSET,
    MAX_HEIGHT_SUBSTATION,
    MAX_HEIGHT_VOLTAGE_LEVEL,
    MAX_HEIGHT_NETWORK_AREA_DIAGRAM,
    MAX_WIDTH_SUBSTATION,
    MAX_WIDTH_VOLTAGE_LEVEL,
    MAX_WIDTH_NETWORK_AREA_DIAGRAM,
    NoSvg,
    LOADING_WIDTH
} from "./diagram-common";
import makeStyles from "@mui/styles/makeStyles";

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

// Compute the paper and svg sizes. Returns undefined if the preferred sizes are undefined.
const computePaperAndSvgSizesIfReady = (
    // TODO déplacer dans le diagram-common ?
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
            let tempMaxWidth, tempMaxHeight;
            if (svgType === SvgType.VOLTAGE_LEVEL) {
                tempMaxWidth = MAX_WIDTH_VOLTAGE_LEVEL;
                tempMaxHeight = MAX_HEIGHT_VOLTAGE_LEVEL;
            } else if (svgType === SvgType.SUBSTATION) {
                tempMaxWidth = MAX_WIDTH_SUBSTATION;
                tempMaxHeight = MAX_HEIGHT_SUBSTATION;
            } else if (svgType === SvgType.NETWORK_AREA_DIAGRAM) {
                tempMaxWidth = MAX_WIDTH_NETWORK_AREA_DIAGRAM;
                tempMaxHeight = MAX_HEIGHT_NETWORK_AREA_DIAGRAM;
            } else {
                console.error('type inconnu svgType');
            }
            svgWidth = Math.min(
                svgPreferredWidth,
                svgType !== SvgType.NETWORK_AREA_DIAGRAM
                    ? totalWidth //- MAP_RIGHT_OFFSET
                    : totalWidth, // MAP_RIGHT_OFFSET = 120 pour SLD, 0 pour NAD
                tempMaxWidth
            );
            svgHeight = Math.min(
                svgPreferredHeight,
                totalHeight - MAP_BOTTOM_OFFSET - headerPreferredHeight,
                tempMaxHeight
            );
            paperWidth = svgWidth + BORDERS;
            paperHeight = svgHeight + headerPreferredHeight + BORDERS;
        }
        return { paperWidth, paperHeight, svgWidth, svgHeight };
    }
};

const Diagram = forwardRef((props, ref) => {
    const [svg, setSvg] = useState(NoSvg);
    const svgUrl = useRef(''); // TODO CHARLY dans Nad, utilisé comme Props
    const svgDraw = useRef();
    const dispatch = useDispatch();
    const { snackError } = useSnackMessage();
    const intlRef = useIntlRef();
    const svgRef = useRef();
    const theme = useTheme();
    const classes = useStyles();
    const intl = useIntl();
    const {
        computedHeight,
        //currentNode, // on utilise plutôt celui du SLD : via le useSelector
        depth,
        disabled,
        loadFlowStatus,
        numberToDisplay,
        onMinimize,
        onTogglePin,
        pinned,
        setDisplayedDiagramHeights,
        diagramId,
        svgType,
        //onClose,
        setDepth,
        totalHeight,
        totalWidth,
    } = props;

    const [closeDiagramView] = useDiagram();

    const diagramType = useCallback(() => {
        switch (svgType) {
            case SvgType.SUBSTATION:
            case SvgType.VOLTAGE_LEVEL:
                return 'SLD';
            case SvgType.NETWORK_AREA_DIAGRAM:
                return 'NAD';
            default:
                console.error('type inconnu diagramType');
        }
    }, [svgType]);

    const network = useSelector((state) => state.network);

    const currentNode = useSelector((state) => state.currentTreeNode);

    //const fullScreenSldId = useSelector((state) => state.fullScreenSldId);
    //const fullScreenNadId = useSelector((state) => state.fullScreenNadId);
    const fullScreenDiagramId = useSelector(
        (state) => state.fullScreenDiagramId
    );

    const [forceState, updateState] = useState(false);

    const [loadingState, updateLoadingState] = useState(false);

    // NAD
    const studyUpdatedForce = useSelector((state) => state.studyUpdated);

    const nadRef = useRef();

    // SLD
    const [locallySwitchedBreaker, setLocallySwitchedBreaker] = useState();

    const isAnyNodeBuilding = useIsAnyNodeBuilding();

    const MenuLine = withLineMenu(BaseEquipmentMenu);

    const [modificationInProgress, setModificationInProgress] = useState(false);

    const errorWidth = MAX_WIDTH_VOLTAGE_LEVEL;

    // COMMUN
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

    // COMMUN
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
                        (diagram) => diagram.id !== diagramId
                    ),
                    { id: diagramId, initialHeight: finalPaperHeight },
                ];
            });
        }
    }, [finalPaperHeight, setDisplayedDiagramHeights, diagramId]);

    useLayoutEffect(() => {
        const sizes = computePaperAndSvgSizesIfReady(
            fullScreenDiagramId,
            svgType,
            totalWidth,
            totalHeight,
            svgPreferredWidth,
            svgPreferredHeight,
            headerPreferredHeight
        );

        if (sizes) {
            if (
                !fullScreenDiagramId &&
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
        fullScreenDiagramId,
        totalWidth,
        totalHeight,
        svgType,
        svgPreferredWidth,
        svgPreferredHeight,
        headerPreferredHeight,
        numberToDisplay,
        diagramId,
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
                        msg = `Voltage level ${diagramId} not found`; // TODO change this error message
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
    }, [props.svgUrl, forceState, snackError, intlRef, diagramId]);

    // SLD
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
        diagramId,
        ref,
        disabled,
    ]);

    // NAD
    const updateNad = useCallback(() => {
        if (svgRef.current) {
            forceUpdate();
        }
    }, [forceUpdate]);

    useEffect(() => {
        if (studyUpdatedForce.eventData.headers) {
            if (
                studyUpdatedForce.eventData.headers['updateType'] ===
                    'loadflow' ||
                studyUpdatedForce.eventData.headers['updateType'] === 'study' ||
                studyUpdatedForce.eventData.headers['updateType'] ===
                    'buildCompleted'
            ) {
                updateNad();
            }
        }
        // Note: studyUuid, and loadNetwork don't change // TODO commentaire obsolete
    }, [studyUpdatedForce, updateNad]);

    useLayoutEffect(() => {
        if (disabled) return;

        if (svg.svg) {
            if (diagramType() === 'NAD') {
                const minWidth = svgFinalWidth;
                const minHeight = svgFinalHeight;

                const nad = new NetworkAreaDiagramViewer(
                    svgRef.current,
                    svg.svg,
                    minWidth,
                    minHeight,
                    MAX_WIDTH_NETWORK_AREA_DIAGRAM,
                    MAX_HEIGHT_NETWORK_AREA_DIAGRAM
                );
                setSvgPreferredHeight(nad.getHeight());
                setSvgPreferredWidth(nad.getWidth());

                //if original nad size has not changed (nad structure has remained the same), we keep the same zoom
                if (
                    nadRef.current &&
                    hasDiagramSizeRemainedTheSame(
                        nadRef.current.getOriginalWidth(),
                        nadRef.current.getOriginalHeight(),
                        nad.getOriginalWidth(),
                        nad.getOriginalHeight()
                    )
                ) {
                    nad.setViewBox(nadRef.current.getViewBox());
                }

                nadRef.current = nad;
            } else if (diagramType() === 'SLD') {
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
                    hasDiagramSizeRemainedTheSame(
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
                //sldViewer.refreshZoom(); // TODO CHARLY Voir avec Kevin pourquoi ça ne fonctionne pas ici

                svgUrl.current = svg.svgUrl;
                svgDraw.current = sldViewer;
            } else {
                console.error('diagramType manquant #2');
                alert('check console');
            }
        }
    }, [
        network,
        diagramId,
        props.svgUrl,
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
        fullScreenDiagramId,
        computedHeight,
    ]);

    // NAD // TODO CHARLY adapter ça
    /*const onCloseHandlerNAD = () => {
        if (onClose !== null) {
            onClose(); // TODO CHARLY
            setDepth(0); // TODO CHARLY
        }
    };*/

    // SLD
    const onCloseHandler = () => {
        dispatch(setFullScreenDiagramId(undefined));
        closeDiagramView({id:diagramId, svgType:svgType});
        if (svgType === SvgType.NETWORK_AREA_DIAGRAM) {
            dispatch(openNetworkAreaDiagram([])); // TODO CHARLY corriger ça [MAYBE DONE]
            setDepth(0); // TODO CHARLY goes nowhere, A CORRIGER
        }
    };

    const showFullScreen = useCallback(
        // TODO CHARLY ajouter un type ici ?
        () => dispatch(setFullScreenDiagramId(diagramId)),
        [dispatch, diagramId]
    );

    const hideFullScreen = useCallback(
        () => dispatch(setFullScreenDiagramId(undefined)),
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

    // COMMUN
    let sizeWidth,
        sizeHeight = initialHeight;
    if (svg.error) {
        // TODO CHARLY voir maj Hugo ici (jusqu'au return) maybe (pas clair)
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

    if (!fullScreenDiagramId && computedHeight) {
        sizeHeight = computedHeight;
    }

    const pinDiagram = useCallback(
        () => {
            console.error("diagram.js:pinDiagram", diagramId, svgType);
            onTogglePin(diagramId, svgType);
            },
        [diagramId, svgType, onTogglePin]
    );

    const minimizeDiagram = useCallback(() => {
        console.error("diagram.js:minimizeDiagram", diagramId, svgType);
        onMinimize(diagramId, svgType);
        hideFullScreen();
    }, [onMinimize, diagramId, svgType, hideFullScreen]);

    // MIX EN COURS
    return !svg.error ? (
        <Paper
            ref={ref}
            elevation={4}
            square={true}
            className={classes.paperBorders}
            style={{
                pointerEvents: 'auto',
                width: sizeWidth,
                minWidth: LOADING_WIDTH,
                height: sizeHeight,
                position: 'relative', //workaround chrome78 bug https://codepen.io/jonenst/pen/VwKqvjv
                overflow: 'hidden',
                display:
                    !fullScreenDiagramId || diagramId === fullScreenDiagramId // TODO CHARLY ici faire la différence entre un diagramID de type NAD et SLD, pour éviter de fermer le mauvais si SLD et NAD du meme truc sont ouverts
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
                                onClick={minimizeDiagram}
                            >
                                <MinimizeIcon />
                            </IconButton>
                            <IconButton
                                className={
                                    pinned
                                        ? classes.actionIcon
                                        : classes.pinRotate
                                }
                                onClick={pinDiagram}
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
                    {/*
                    // TODO CHARLY Corriger le problème d'ID manquant quand on ferme/ouvre un interrupteur dans un SLD (et vérifier si c'est pareil sur le code de main)
                    */}
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
                        <div style={{ display: 'flex' }}>
                            {diagramType() === 'NAD' && (
                                <>
                                    <Typography className={classes.depth}>
                                        {intl.formatMessage({
                                            id: 'depth',
                                        }) +
                                            ' : ' +
                                            depth}
                                    </Typography>
                                    <AddCircleIcon
                                        onClick={() => setDepth(depth + 1)}
                                        className={classes.plusIcon}
                                    />
                                    <RemoveCircleIcon
                                        onClick={() =>
                                            setDepth(
                                                depth === 0 ? 0 : depth - 1
                                            )
                                        }
                                        className={classes.lessIcon}
                                    />
                                </>
                            )}
                            {fullScreenDiagramId ? (
                                <FullscreenExitIcon
                                    onClick={hideFullScreen}
                                    className={classes.fullScreenIcon}
                                />
                            ) : (
                                <FullscreenIcon
                                    onClick={showFullScreen}
                                    className={classes.fullScreenIcon}
                                />
                            )}
                        </div>
                    )}
                </Box>
            )}
        </Paper>
    ) : (
        <></>
    );
});

Diagram.propTypes = {
    //depth: PropTypes.number.isRequired, // TODO maybe not required
    depth: PropTypes.number,
    diagramTitle: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    isComputationRunning: PropTypes.bool.isRequired,
    minimize: PropTypes.func,
    numberToDisplay: PropTypes.number,
    onBreakerClick: PropTypes.func,
    loadFlowStatus: PropTypes.any,
    //studyUuid: PropTypes.string.isRequired,
    //onClose: PropTypes.func,
    onNextVoltageLevelClick: PropTypes.func,
    pin: PropTypes.func,
    pinned: PropTypes.bool,
    diagramId: PropTypes.string,
    svgType: PropTypes.string.isRequired,
    svgUrl: PropTypes.string,
    //updateSwitchMsg: PropTypes.string.isRequired, // TODO was required for SLD
    updateSwitchMsg: PropTypes.string,
};

export default Diagram;
