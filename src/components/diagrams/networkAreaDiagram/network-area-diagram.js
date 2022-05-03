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

import { fetchNADSvg, fetchSvg } from '../../../utils/rest-api';

import { SVG } from '@svgdotjs/svg.js';
import '@svgdotjs/svg.panzoom.js';
import Arrow from '../../../images/arrow.svg';
import ArrowHover from '../../../images/arrow_hover.svg';
import { fullScreenSingleLineDiagram } from '../../../redux/actions';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

import { AutoSizer } from 'react-virtualized';

import { RunningStatus } from '../../util/running-status';

import { useIntlRef, useSnackMessage } from '../../../utils/messages';

import { useIntl } from 'react-intl';

const loadingWidth = 150;
const maxWidthVoltageLevel = 800;
const maxHeightVoltageLevel = 700;
const errorWidth = maxWidthVoltageLevel;

const useStyles = makeStyles((theme) => ({
    divNad: {
        '& svg': {
            // necessary because the default (inline-block) adds vertical space
            // to our otherwise pixel accurate computations (this makes a
            // scrollbar appear in fullscreen mode)
            display: 'block',
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
    plusIcon: {
        bottom: 5,
        left: 30,
        position: 'absolute',
        cursor: 'pointer',
    },
    lessIcon: {
        bottom: 5,
        left: 5,
        position: 'absolute',
        cursor: 'pointer',
    },
    depth: {
        bottom: 25,
        left: 5,
        position: 'absolute',
    },
}));

const noSvg = { svg: null, metadata: null, error: null, svgUrl: null };

let arrowSvg;
let arrowHoverSvg;

fetch(Arrow)
    .then((data) => {
        return data.text();
    })
    .then((data) => {
        arrowSvg = data;
    });

fetch(ArrowHover)
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
const borders = 2;
// we use content-size: border-box so this needs to be included..
// Compute the paper and svg sizes. Returns undefined if the preferred sizes are undefined.
const computePaperAndSvgSizesIfReady = (
    fullScreen,
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
            svgWidth = Math.min(
                svgPreferredWidth,
                totalWidth - mapRightOffset,
                maxWidthVoltageLevel
            );
            svgHeight = Math.min(
                svgPreferredHeight,
                totalHeight - mapBottomOffset - headerPreferredHeight,
                maxHeightVoltageLevel
            );
            paperWidth = svgWidth + borders;
            paperHeight = svgHeight + headerPreferredHeight + borders;
        }
        return { paperWidth, paperHeight, svgWidth, svgHeight };
    }
};

const SizedNetworkAreaDiagram = forwardRef((props, ref) => {
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
        loadFlowStatus,
        workingNode,
        sldId,
    } = props;

    const network = useSelector((state) => state.network);

    const fullScreen = useSelector((state) => state.fullScreen);

    const [forceState, updateState] = useState(false);

    const [loadingState, updateLoadingState] = useState(false);

    const theme = useTheme();

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
            fullScreen,
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
        svgPreferredWidth,
        svgPreferredHeight,
        headerPreferredHeight,
        sldId,
    ]);

    useEffect(() => {
        if (props.svgUrl) {
            updateLoadingState(true);
            fetchNADSvg(props.svgUrl)
                .then((svg) => {
                    setSvg({
                        svg: svg,
                        metadata: null,
                        error: null,
                        svgUrl: props.svgUrl,
                    });
                    updateLoadingState(false);
                })
                .catch((errorMessage) => {
                    console.error(errorMessage);
                    setSvg({
                        svg: null,
                        metadata: null,
                        error: errorMessage,
                        svgUrl: props.svgUrl,
                    });
                    snackError(errorMessage);
                    updateLoadingState(false);
                });
        } else {
            setSvg(noSvg);
        }
    }, [props.svgUrl, forceState, snackError, intlRef]);

    useLayoutEffect(() => {
        if (svg.svg) {
            const divElt = svgRef.current;
            divElt.innerHTML = svg.svg;
            //need to add it there so the bbox has the right size
            // calculate svg width and height from svg bounding box
            const svgEl = divElt.getElementsByTagName('svg')[0];
            const bbox = svgEl.getBBox();
            const xOrigin = bbox.x - 20;
            const yOrigin = bbox.y - 20;
            const svgWidth = bbox.width + 40;
            const svgHeight = bbox.height + 40;

            const svgTmp = divElt.getElementsByTagName('svg')[0];
            const width = svgTmp.getAttribute('width');
            const height = svgTmp.getAttribute('height');

            setSvgPreferredHeight(height);
            setSvgPreferredWidth(width);

            svgTmp.removeAttribute('width');
            svgTmp.removeAttribute('height');

            // using svgdotjs panzoom component to pan and zoom inside the svg, using svg width and height previously calculated for size and viewbox
            divElt.innerHTML = ''; // clear the previous svg in div element before replacing
            const draw = SVG()
                .addTo(divElt)
                .size(width, height)
                .viewbox(xOrigin, yOrigin, svgWidth, svgHeight)
                .panZoom({
                    panning: true,
                    zoomMin: 0.5,
                    zoomMax: 200,
                    zoomFactor: 0.3,
                    margins: { top: 0, left: 0, right: 0, bottom: 0 },
                });
            draw.svg(svg.svg).node.firstElementChild.style.overflow = 'visible';

            // PowSyBl SLD introduced server side calculated SVG viewbox
            // waiting for deeper adaptation, remove it and still rely on client side computed viewbox
            draw.node.firstChild.removeAttribute('viewBox');

            // if (svgWidth > viewboxMaxWidth || svgHeight > viewboxMaxHeight) {
            //     //The svg is too big, display only the top left corner because that's
            //     //better for users than zooming out. Keep the same aspect ratio
            //     //so that panzoom's margins still work correctly.
            //     //I am not sure the offsetX and offsetY thing is correct. It seems
            //     //to help. When someone finds a big problem, then we can fix it.
            //     const newLvlX = svgWidth / viewboxMaxWidth;
            //     const newLvlY = svgHeight / viewboxMaxHeight;
            //     if (newLvlX > newLvlY) {
            //         const offsetY = (viewboxMaxHeight - svgHeight) / newLvlX;
            //         draw.zoom(newLvlX, {
            //             x: xOrigin,
            //             y: (yOrigin + viewboxMaxHeight - offsetY) / 2,
            //         });
            //     } else {
            //         const offsetX = (viewboxMaxWidth - svgWidth) / newLvlY;
            //         draw.zoom(newLvlY, {
            //             x: (xOrigin + viewboxMaxWidth - offsetX) / 2,
            //             y: yOrigin,
            //         });
            //     }
            // }
            draw.on('panStart', function (evt) {
                divElt.style.cursor = 'move';
            });
            draw.on('panEnd', function (evt) {
                divElt.style.cursor = 'default';
            });

            if (svgDraw.current && svgUrl.current === svg.svgUrl) {
                draw.viewbox(svgDraw.current.viewbox());
            }
            svgUrl.current = svg.svgUrl;

            svgDraw.current = draw;
        }
        // Note: onNextVoltageLevelClick and onBreakerClick don't change
    }, [network, svg, workingNode, theme, sldId, ref]);

    useLayoutEffect(() => {
        if (
            typeof svgFinalWidth != 'undefined' &&
            typeof svgFinalHeight != 'undefined'
        ) {
            const divElt = svgRef.current;
            if (divElt != null) {
                const svgEl = divElt.getElementsByTagName('svg')[0];

                if (svgEl != null) {
                    svgEl.setAttribute(
                        'width',
                        fullScreen ? totalWidth - 40 : svgPreferredWidth
                    );
                    svgEl.setAttribute(
                        'height',
                        fullScreen ? totalHeight - 40 : svgPreferredHeight
                    );
                }
            }
        }
    }, [
        svgFinalWidth,
        svgFinalHeight,
        //TODO, these are from the previous useLayoutEffect
        //how to refactor to avoid repeating them here ?
        svg,
        theme,
    ]);

    const classes = useStyles();

    const intl = useIntl();

    const onCloseHandler = () => {
        if (props.onClose !== null) {
            dispatch(fullScreenSingleLineDiagram(undefined));
            props.onClose(sldId);
            props.setDepth(0);
        }
    };

    const showFullScreen = () => {
        dispatch(fullScreenSingleLineDiagram(sldId));
    };

    const hideFullScreen = () => {
        dispatch(fullScreenSingleLineDiagram(undefined));
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

    return !svg.error ? (
        <Paper
            elevation={1}
            square={true}
            style={{
                pointerEvents: 'auto',
                width: sizeWidth,
                minWidth: loadingWidth,
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
                </Box>
                {
                    <div
                        id="sld-svg"
                        ref={svgRef}
                        className={
                            loadFlowStatus !== RunningStatus.SUCCEED
                                ? classes.divNad + ' ' + classes.divInvalid
                                : classes.divNad
                        }
                        dangerouslySetInnerHTML={{ __html: svg.svg }}
                    />
                }
                {!loadingState && (
                    <>
                        <Typography className={classes.depth}>
                            {intl.formatMessage({
                                id: 'depth',
                            }) + ' : ' +
                            props.depth}
                        </Typography>
                        <AddCircleIcon
                            onClick={() => props.setDepth(props.depth + 1)}
                            className={classes.plusIcon}
                        />
                        <RemoveCircleIcon
                            onClick={() =>
                                props.setDepth(props.depth === 0 ? 0 : props.depth - 1)
                            }
                            className={classes.lessIcon}
                        />
                        {fullScreen ? (
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
                    </>
                )}
            </Box>
        </Paper>
    ) : (
        <></>
    );
});

const NetworkAreaDiagram = forwardRef((props, ref) => {
    return (
        <AutoSizer>
            {({ width, height }) => (
                <SizedNetworkAreaDiagram
                    ref={ref}
                    totalWidth={width}
                    totalHeight={height}
                    {...props}
                />
            )}
        </AutoSizer>
    );
});

NetworkAreaDiagram.propTypes = {
    diagramTitle: PropTypes.string.isRequired,
    svgUrl: PropTypes.string.isRequired,
    sldId: PropTypes.string,
    onClose: PropTypes.func,
    isComputationRunning: PropTypes.bool.isRequired,
    workingNode: PropTypes.object,
    depth: PropTypes.number.isRequired,
    setDepth: PropTypes.func.isRequired,
};

export default NetworkAreaDiagram;
