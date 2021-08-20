/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
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

import { FormattedMessage } from 'react-intl';

import { useDispatch, useSelector } from 'react-redux';
import { selectItemNetwork } from '../redux/actions';

import Box from '@material-ui/core/Box';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Alert from '@material-ui/lab/Alert';
import LinearProgress from '@material-ui/core/LinearProgress';

import { fetchSvg } from '../utils/rest-api';

import SldViewer from 'sld-svg/sld-viewer.js';
import '@svgdotjs/svg.panzoom.js';
import useTheme from '@material-ui/core/styles/useTheme';
import Arrow from '../images/arrow.svg';
import ArrowHover from '../images/arrow_hover.svg';
import { fullScreenSingleLineDiagram } from '../redux/actions';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import FullscreenIcon from '@material-ui/icons/Fullscreen';

import { AutoSizer } from 'react-virtualized';
import LineMenu from './line-menu';
import { RunningStatus } from './util/running-status';
import { INVALID_LOADFLOW_OPACITY } from '../utils/colors';

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

const SVG_NS = 'http://www.w3.org/2000/svg';

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
        '& .sld-disconnector.sld-constant-color, :not(.sld-breaker).sld-disconnected, .sld-feeder-disconnected, .sld-feeder-disconnected-connected': {
            stroke: theme.palette.text.primary,
        },
        '& .arrow': {
            fill: theme.palette.text.primary,
        },
        '& .sld-flash, .sld-lock': {
            stroke: 'none',
            fill: theme.palette.text.primary,
        },
    },
    divInvalid: {
        '& .sld-arrow-p, .sld-arrow-q': {
            opacity: INVALID_LOADFLOW_OPACITY,
        },
    },
    close: {
        padding: 0,
    },
    header: {
        padding: 5,
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: theme.palette.background.default,
    },
    fullScreenIcon: {
        bottom: 5,
        right: 5,
        position: 'absolute',
        cursor: 'pointer',
    },
}));

const noSvg = { svg: null, metadata: null, error: null, svgUrl: null };

const LINE_COMPONENT_TYPES = new Set(['LINE']);

let arrowSvg;
let arrowHoverSvg;

const arrowPromise = fetch(Arrow)
    .then((data) => {
        return data.text();
    })
    .then((data) => {
        arrowSvg = data;
    });

const arrowHoverPromise = fetch(ArrowHover)
    .then((data) => {
        return data.text();
    })
    .then((data) => {
        arrowHoverSvg = data;
    });

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

const SizedSingleLineDiagram = forwardRef((props, ref) => {
    const [svg, setSvg] = useState(noSvg);
    const svgUrl = useRef('');
    const svgDraw = useRef();
    const dispatch = useDispatch();

    const network = useSelector((state) => state.network);

    const fullScreen = useSelector((state) => state.fullScreen);

    const [forceState, updateState] = useState(false);

    const [loadingState, updateLoadingState] = useState(false);

    const theme = useTheme();

    const forceUpdate = useCallback(() => {
        updateState((s) => !s);
    }, []);

    const [lineMenu, setLineMenu] = useState({
        position: [-1, -1],
        lineId: null,
        svgId: null,
        display: null,
    });

    const showLineMenu = useCallback((branchId, svgId, x, y) => {
        setLineMenu({
            position: [x, y],
            lineId: branchId,
            svgId: svgId,
            display: true,
        });
    }, []);

    const closeLineMenu = useCallback(() => {
        setLineMenu({
            display: false,
        });
    }, []);

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

    const { totalWidth, totalHeight, svgType, loadFlowStatus } = props;

    useLayoutEffect(() => {
        const sizes = computePaperAndSvgSizesIfReady(
            fullScreen,
            svgType,
            totalWidth,
            totalHeight,
            svgPreferredWidth,
            svgPreferredHeight,
            headerPreferredHeight
        );
        if (typeof sizes != 'undefined') {
            setSvgFinalWidth(sizes.svgWidth);
            setSvgFinalHeight(sizes.svgHeight);
            setFinalPaperWidth(sizes.paperWidth);
            setFinalPaperHeight(sizes.paperHeight);
        }
    }, [
        fullScreen,
        totalWidth,
        totalHeight,
        svgType,
        svgPreferredWidth,
        svgPreferredHeight,
        headerPreferredHeight,
    ]);

    useEffect(() => {
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
                })
                .catch(function (error) {
                    console.error(error.message);
                    setSvg({
                        svg: null,
                        metadata: null,
                        error,
                        svgUrl: props.svgUrl,
                    });
                    updateLoadingState(false);
                });
        } else {
            setSvg(noSvg);
        }
    }, [props.svgUrl, forceState]);

    const {
        onNextVoltageLevelClick,
        onBreakerClick,
        isComputationRunning,
    } = props;

    function addFeederSelectionRect(svgText, theme) {
        svgText.style.setProperty('fill', theme.palette.background.paper);
        const selectionBackgroundColor = 'currentColor';
        const selectionPadding = 4;
        const bounds = svgText.getBBox();
        const selectionRect = document.createElementNS(SVG_NS, 'rect');
        selectionRect.setAttribute('class', 'sld-label-selection');
        const style = getComputedStyle(svgText);
        const padding_top = parseInt(style['padding-top']);
        const padding_left = parseInt(style['padding-left']);
        const padding_right = parseInt(style['padding-right']);
        const padding_bottom = parseInt(style['padding-bottom']);
        selectionRect.setAttribute('stroke-width', '0');
        selectionRect.setAttribute(
            'x',
            (
                bounds.x -
                parseInt(style['padding-left']) -
                selectionPadding
            ).toString()
        );
        selectionRect.setAttribute(
            'y',
            (
                bounds.y -
                parseInt(style['padding-top']) -
                selectionPadding
            ).toString()
        );
        selectionRect.setAttribute(
            'width',
            (
                bounds.width +
                padding_left +
                padding_right +
                2 * selectionPadding
            ).toString()
        );
        selectionRect.setAttribute(
            'height',
            (
                bounds.height +
                padding_top +
                padding_bottom +
                2 * selectionPadding
            ).toString()
        );
        selectionRect.setAttribute('fill', selectionBackgroundColor);
        selectionRect.setAttribute('rx', selectionPadding.toString());
        if (svgText.hasAttribute('transform')) {
            selectionRect.setAttribute(
                'transform',
                svgText.getAttribute('transform')
            );
        }
        svgText.parentNode.insertBefore(selectionRect, svgText);
    }

    const showFeederSelection = useCallback(
        (svgText) => {
            if (
                svgText.parentNode.getElementsByClassName('sld-label-selection')
                    .length === 0
            ) {
                addFeederSelectionRect(svgText, theme);
            }
        },
        [theme]
    );

    const hideFeederSelection = useCallback((svgText) => {
        svgText.style.removeProperty('fill');
        const selectionRect = svgText.parentNode.getElementsByClassName(
            'sld-label-selection'
        );
        if (selectionRect.length !== 0) {
            svgText.parentNode.removeChild(selectionRect[0]);
        }
    }, []);

    useLayoutEffect(() => {
        if (svg.svg) {
            //need to add it there so the bbox has the right size
            // addNavigationArrow(svg);
            // calculate svg width and height from svg bounding box
            const divElt = document.getElementById('sld-svg');
            const svgEl = divElt.getElementsByTagName('svg')[0];
            const bbox = svgEl.getBBox();
            const xOrigin = bbox.x - 40;
            const yOrigin = bbox.y - 55;
            const svgWidth = bbox.width + 60;
            const svgHeight = bbox.height + 70;

            setSvgPreferredWidth(svgWidth);
            setSvgPreferredHeight(svgHeight);

            let viewboxWidth = Math.min(
                svgWidth,
                svgType === SvgType.VOLTAGE_LEVEL
                    ? maxWidthVoltageLevel
                    : maxWidthSubstation
            );
            let viewboxHeight = Math.min(
                svgHeight,
                svgType === SvgType.VOLTAGE_LEVEL
                    ? maxHeightVoltageLevel
                    : maxHeightSubstation
            );

            // using svgdotjs panzoom component to pan and zoom inside the svg, using svg width and height previously calculated for size and viewbox
            divElt.innerHTML = ''; // clear the previous svg in div element before replacing

            const sldViewer = new SldViewer()
                .addTo('sld-svg')
                .size(svgWidth, svgHeight)
                .viewbox(xOrigin, yOrigin, viewboxWidth, viewboxHeight)
                .svg(svg.svg, svg.metadata)
                .panZoom({
                    panning: true,
                    zoomMin: svgType === SvgType.VOLTAGE_LEVEL ? 0.5 : 0.1,
                    zoomMax: 10,
                    zoomFactor: svgType === SvgType.VOLTAGE_LEVEL ? 0.3 : 0.15,
                    margins: { top: 100, left: 100, right: 100, bottom: 200 },
                });

            sldViewer.addCallbackOnSwitches(onBreakerClick);

            Promise.all([arrowPromise, arrowHoverPromise]).then(() => {
                sldViewer.addNavigationArrows(
                    {
                        arrowIcon: arrowSvg,
                        arrowHoverIcon: arrowHoverSvg,
                        backgroundColor: theme.palette.background.paper,
                        backgroundHoverColor: 'currentColor',
                        xOffset: 22,
                        yOffset: 65,
                    },
                    onNextVoltageLevelClick
                );
            });

            // handling the right click on a branch feeder (menu)
            if (!isComputationRunning) {
                const lineFeeders = svg.metadata.nodes.filter(
                    (element) =>
                        LINE_COMPONENT_TYPES.has(element.componentType) &&
                        // FIXME : currently ony lines (and not transformers) are taken into account
                        // This test must be removed
                        network.getLine(element.equipmentId)
                );
                lineFeeders.forEach((feeder) => {
                    const svgText = document
                        .getElementById(feeder.id)
                        .querySelector('text');
                    svgText.style.cursor = 'pointer';
                    svgText.addEventListener('mouseenter', function (event) {
                        showFeederSelection(event.currentTarget);
                    });
                    svgText.addEventListener('mouseleave', function (event) {
                        hideFeederSelection(event.currentTarget);
                    });
                    svgText.addEventListener('contextmenu', function (event) {
                        showLineMenu(
                            feeder.equipmentId,
                            feeder.id,
                            event.x,
                            event.y
                        );
                    });
                });

                if (lineMenu.display) {
                    showFeederSelection(
                        document
                            .getElementById(lineMenu.svgId)
                            .querySelector('text')
                    );
                }
            }

            if (svgDraw.current && svgUrl.current === svg.svgUrl) {
                // FIXME: add this function to the sld-viewer lib
                // draw.viewbox(svgDraw.current.viewbox());
                sldViewer.canvas.viewbox(svgDraw.current.viewbox());
            }
            svgUrl.current = svg.svgUrl;

            // svgDraw.current = draw;
            svgDraw.current = sldViewer.canvas;
        }
        // Note: onNextVoltageLevelClick and onBreakerClick don't change
    }, [
        network,
        svg,
        onNextVoltageLevelClick,
        onBreakerClick,
        isComputationRunning,
        lineMenu,
        showLineMenu,
        showFeederSelection,
        hideFeederSelection,
        svgType,
        theme,
    ]);

    useLayoutEffect(() => {
        if (
            typeof svgFinalWidth != 'undefined' &&
            typeof svgFinalHeight != 'undefined'
        ) {
            const divElt = document.getElementById('sld-svg');
            if (divElt != null) {
                const svgEl = divElt.getElementsByTagName('svg')[0];
                if (svgEl != null) {
                    svgEl.setAttribute('width', svgFinalWidth);
                    svgEl.setAttribute('height', svgFinalHeight);
                }
            }
        } else {
        }
    }, [
        svgFinalWidth,
        svgFinalHeight,
        //TODO, these are from the previous useLayoutEffect
        //how to refactor to avoid repeating them here ?
        svg,
        lineMenu,
        onNextVoltageLevelClick,
        onBreakerClick,
        isComputationRunning,
        svgType,
        theme,
    ]);

    const classes = useStyles();

    const onCloseHandler = () => {
        if (props.onClose !== null) {
            dispatch(selectItemNetwork(null));
            dispatch(fullScreenSingleLineDiagram(false));
            props.onClose();
        }
    };

    const showFullScreen = () => {
        dispatch(fullScreenSingleLineDiagram(true));
    };

    const hideFullScreen = () => {
        dispatch(fullScreenSingleLineDiagram(false));
    };

    let sizeWidth, sizeHeight;
    if (svg.error) {
        sizeWidth = errorWidth; // height is not set so height is auto;
    } else if (
        typeof finalPaperWidth != 'undefined' &&
        typeof finalPaperHeight != 'undefined'
    ) {
        sizeWidth = finalPaperWidth;
        sizeHeight = finalPaperHeight;
    } else if (loadingState) {
        sizeWidth = loadingWidth; // height is not set so height is auto; used for the first load
    } else {
        sizeWidth = totalWidth; // happens during initalization
    }

    return (
        <Paper
            elevation={1}
            variant="outlined"
            square="true"
            style={{
                pointerEvents: 'auto',
                width: sizeWidth,
                height: sizeHeight,
                position: 'relative', //workaround chrome78 bug https://codepen.io/jonenst/pen/VwKqvjv
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
                    <IconButton
                        className={classes.close}
                        onClick={onCloseHandler}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </Box>
            <Box position="relative">
                <Box position="absolute" left={0} right={0} top={0}>
                    {loadingState && (
                        <Box height={2}>
                            <LinearProgress />
                        </Box>
                    )}
                    {props.updateSwitchMsg && (
                        <Alert severity="error">{props.updateSwitchMsg}</Alert>
                    )}
                </Box>
                {svg.error ? (
                    <Typography variant="h5">
                        <FormattedMessage
                            id="svgNotFound"
                            values={{
                                svgUrl: svg.svgUrl,
                                error: svg.error.message,
                            }}
                        />
                    </Typography>
                ) : (
                    <div
                        id="sld-svg"
                        className={
                            loadFlowStatus !== RunningStatus.SUCCEED
                                ? classes.divSld + ' ' + classes.divInvalid
                                : classes.divSld
                        }
                        dangerouslySetInnerHTML={{ __html: svg.svg }}
                    />
                )}
                {lineMenu.display && (
                    <LineMenu
                        line={network.getLine(lineMenu.lineId)}
                        position={lineMenu.position}
                        handleClose={closeLineMenu}
                    />
                )}
                {!loadingState &&
                    !svg.error &&
                    (fullScreen ? (
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
        </Paper>
    );
});

const SingleLineDiagram = forwardRef((props, ref) => {
    return (
        <AutoSizer>
            {({ width, height }) => (
                <SizedSingleLineDiagram
                    ref={ref}
                    totalWidth={width}
                    totalHeight={height}
                    {...props}
                />
            )}
        </AutoSizer>
    );
});

SingleLineDiagram.propTypes = {
    diagramTitle: PropTypes.string.isRequired,
    svgUrl: PropTypes.string.isRequired,
    onClose: PropTypes.func,
    updateSwitchMsg: PropTypes.string.isRequired,
    isComputationRunning: PropTypes.bool.isRequired,
    svgType: PropTypes.string.isRequired,
    onNextVoltageLevelClick: PropTypes.func,
    onBreakerClick: PropTypes.func,
};

export default SingleLineDiagram;
