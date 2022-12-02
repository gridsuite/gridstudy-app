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

import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { fetchSvg } from '../../../utils/rest-api';

import { AutoSizer } from 'react-virtualized';

import { useIntlRef, useSnackMessage } from '../../../utils/messages';

import { SingleLineDiagramViewer } from '@powsybl/diagram-viewer';
import { computePaperAndSvgSizesIfReady, setWidthAndHeight } from './utils';

const loadingWidth = 150;
const maxWidthVoltageLevel = 900;
const maxHeightVoltageLevel = 700;
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
        '& .sld-graph-label, .sld-label': {
            fill: theme.palette.text.primary,
            'font-family': theme.typography.fontFamily,
        },
        '& .sld-disconnector:not(.sld-fictitious), :not(.sld-breaker):not(.sld-disconnector):not(.sld-load-break-switch).sld-disconnected, .sld-feeder-disconnected, .sld-feeder-disconnected-connected':
            {
                stroke: theme.palette.text.primary,
            },
        '& .arrow': {
            fill: theme.palette.text.primary,
            pointerEvents: 'none',
        },
        '& .sld-in .sld-label': {
            display: 'none',
        },
        '& .sld-out .sld-label': {
            display: 'none',
        },
        '& .sld-flash, .sld-lock': {
            stroke: 'none',
            fill: theme.palette.text.primary,
        },
        '& .sld-arrow-in': {
            display: 'none',
        },
        '& .sld-arrow-out': {
            display: 'none',
        },
        overflow: 'hidden',
    },
    close: {
        padding: 0,
        borderRight: theme.spacing(1),
    },
    header: {
        padding: 5,
        display: 'flex',
        flexDirection: 'row',
        wordBreak: 'break-all',
        backgroundColor: theme.palette.background.default,
    },
    paperBorders: {
        borderLeft: '1px solid ' + theme.palette.action.disabled,
        borderBottom: '1px solid ' + theme.palette.action.disabledBackground,
        borderRight: '1px solid ' + theme.palette.action.hover,
    },
}));

const noSvg = { svg: null, metadata: null, error: null, svgUrl: null };

let initialWidth, initialHeight;
// To allow controls that are in the corners of the map to not be hidden in normal mode
// (but they are still hidden in fullscreen mode)
const mapRightOffset = 120;
const mapBottomOffset = 80;
const borders = 2; // we use content-size: border-box so this needs to be included..

const PositionDiagram = forwardRef((props, ref) => {
    const [svg, setSvg] = useState(noSvg);
    const svgUrl = useRef('');
    const svgDraw = useRef();
    const { snackError } = useSnackMessage();
    const intlRef = useIntlRef();
    const svgRef = useRef();
    const { totalWidth, totalHeight, svgType, disabled } = props;

    const network = useSelector((state) => state.network);

    const currentNode = useSelector((state) => state.currentTreeNode);

    const [forceState, updateState] = useState(false);

    const [loadingState, updateLoadingState] = useState(false);

    const theme = useTheme();

    const [modificationInProgress, setModificationInProgress] = useState(false);

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
            svgType,
            totalWidth,
            totalHeight,
            svgPreferredWidth,
            svgPreferredHeight,
            headerPreferredHeight,
            borders,
            maxWidthVoltageLevel,
            maxHeightVoltageLevel,
            mapRightOffset,
            mapBottomOffset
        );
        if (sizes) {
            setSvgFinalWidth(sizes.svgWidth);
            setFinalPaperWidth(sizes.paperWidth);
            setSvgFinalHeight(sizes.svgHeight);
            setFinalPaperHeight(sizes.paperHeight);
        }
    }, [
        totalWidth,
        totalHeight,
        svgType,
        svgPreferredWidth,
        svgPreferredHeight,
        headerPreferredHeight,
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
                })
                .catch((errorMessage) => {
                    console.error(errorMessage);
                    setSvg({
                        svg: null,
                        metadata: null,
                        error: errorMessage,
                        svgUrl: props.svgUrl,
                    });
                    snackError({
                        messageTxt: errorMessage,
                    });
                    updateLoadingState(false);
                });
        } else {
            setSvg(noSvg);
        }
    }, [props.svgUrl, forceState, snackError, intlRef]);

    // shouldResetPreferredSizes doesn't need to be a ref, but it makes the static checks happy
    const shouldResetPreferredSizes = useRef();
    shouldResetPreferredSizes.current = false;
    useLayoutEffect(() => {
        shouldResetPreferredSizes.current = true;
        // Note: these deps must be kept in sync with the ones of the useLayoutEffect where setSvgPreferredWidth and setSvgPreferredHeight
        // are called. Because we want to reset them in all cases, except when only svgFinalWidth and svgFinalHeight have changed
        // so we use the same deps but without svgFinalWidth and svgFinalHeight
        // TODO is there a better way to do this??
    }, [network, svg, currentNode, svgType, theme, ref, disabled]);

    useLayoutEffect(() => {
        if (disabled) return;

        if (svg.svg) {
            const minWidth = svgFinalWidth;
            const minHeight = svgFinalHeight;

            let viewboxMaxWidth = maxWidthVoltageLevel;
            let viewboxMaxHeight = maxHeightVoltageLevel;
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
                selectionBackColor //arrows color
            );

            if (shouldResetPreferredSizes.current) {
                setSvgPreferredHeight(sldViewer.getHeight());
                setSvgPreferredWidth(sldViewer.getWidth());
            }

            if (svgDraw.current && svgUrl.current === svg.svgUrl) {
                sldViewer.setViewBox(svgDraw.current.getViewBox());
            }
            svgUrl.current = svg.svgUrl;
            svgDraw.current = sldViewer;
        }
    }, [
        network,
        svg,
        currentNode,
        svgType,
        theme,
        ref,
        svgFinalHeight,
        svgFinalWidth,
        disabled,
        modificationInProgress,
        loadingState,
    ]);

    useLayoutEffect(() => {
        if (svgFinalWidth && svgFinalHeight) {
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
        svg,
        svgType,
        theme,
        loadingState,
        modificationInProgress,
        network,
        ref,
    ]);

    const classes = useStyles();

    const onCloseHandler = () => {
        if (props.onClose !== null) {
            setSvg(noSvg);
            props.onClose();
        }
    };

    let { sizeWidth, sizeHeight } = setWidthAndHeight(
        svg,
        finalPaperWidth,
        finalPaperHeight,
        loadingState,
        totalWidth,
        initialHeight,
        initialWidth,
        errorWidth
    );

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
            <Box position="relative">
                <div
                    ref={svgRef}
                    className={classes.divSld}
                    dangerouslySetInnerHTML={{ __html: svg.svg }}
                />
            </Box>
        </Paper>
    ) : (
        <></>
    );
});

PositionDiagram.propTypes = {
    diagramTitle: PropTypes.string.isRequired,
    svgUrl: PropTypes.string,
    onClose: PropTypes.func,
    svgType: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
};

export default PositionDiagram;
