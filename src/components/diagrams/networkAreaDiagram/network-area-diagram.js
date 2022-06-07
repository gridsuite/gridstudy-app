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

import { fetchNADSvg } from '../../../utils/rest-api';

import { fullScreenNetworkAreaDiagram } from '../../../redux/actions';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

import { AutoSizer } from 'react-virtualized';

import { useSnackMessage } from '../../../utils/messages';

import { useIntl } from 'react-intl';

import { NetworkAreaDiagramViewer } from '@powsybl/diagram-viewer';

const loadingWidth = 150;
const maxWidth = 1200;
const maxHeight = 650;
const minWidth = 500;
const minHeight = 400;
const errorWidth = maxWidth;

const useStyles = makeStyles((theme) => ({
    divNad: {
        '& svg': {
            // necessary because the default (inline-block) adds vertical space
            // to our otherwise pixel accurate computations (this makes a
            // scrollbar appear in fullscreen mode)
            display: 'block',
        },
        '&  .nad-text-nodes': {
            fill: theme.palette.text.primary,
            'font-family': theme.typography.fontFamily,
        },
        overflow: 'hidden',
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

// To allow controls that are in the corners of the map to not be hidden in normal mode
// (but they are still hidden in fullscreen mode)
const mapRightOffset = 120;
const mapBottomOffset = 80;
const borders = 2; // we use content-size: border-box so this needs to be included..
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

const SizedNetworkAreaDiagram = forwardRef((props, ref) => {
    const [svg, setSvg] = useState(noSvg);
    const dispatch = useDispatch();
    const { snackError } = useSnackMessage();
    const svgRef = useRef();
    const theme = useTheme();
    const classes = useStyles();
    const intl = useIntl();
    const {
        totalWidth,
        totalHeight,
        workingNode,
        nadId,
        diagramTitle,
        svgUrl,
        onClose,
        depth,
        setDepth,
    } = props;

    const network = useSelector((state) => state.network);

    const fullScreen = useSelector((state) => state.fullScreenNad);

    const [forceState, updateState] = useState(false);

    const studyUpdatedForce = useSelector((state) => state.studyUpdated);

    const [loadingState, updateLoadingState] = useState(false);

    const forceUpdate = useCallback(() => {
        updateState((s) => !s);
    }, []);

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
        nadId,
    ]);

    useEffect(() => {
        if (svgUrl) {
            updateLoadingState(true);
            setSvg(noSvg);
            fetchNADSvg(svgUrl)
                .then((svg) => {
                    setSvg({
                        svg: svg,
                        metadata: null,
                        error: null,
                        svgUrl: svgUrl,
                    });
                    updateLoadingState(false);
                })
                .catch((errorMessage) => {
                    console.error(errorMessage);
                    setSvg({
                        svg: null,
                        metadata: null,
                        error: errorMessage,
                        svgUrl: svgUrl,
                    });
                    snackError(errorMessage);
                    updateLoadingState(false);
                });
        } else {
            setSvg(noSvg);
        }
    }, [svgUrl, forceState, snackError]);

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
                studyUpdatedForce.eventData.headers['updateType'] === 'study'
            ) {
                updateNad();
            }
        }
        // Note: studyUuid, and loadNetwork don't change
    }, [studyUpdatedForce, updateNad]);

    useLayoutEffect(() => {
        if (svg.svg) {
            const nad = new NetworkAreaDiagramViewer(
                svgRef.current,
                svg.svg,
                minWidth,
                minHeight,
                maxWidth,
                maxHeight
            );
            setSvgPreferredHeight(nad.getHeight());
            setSvgPreferredWidth(nad.getWidth());
        }
    }, [network, svg, workingNode, theme, nadId, ref, svgUrl]);

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
        fullScreen,
        svgFinalWidth,
        svgFinalHeight,
        svgPreferredWidth,
        svgPreferredHeight,
        totalWidth,
        totalHeight,
        svg,
        theme,
    ]);

    const onCloseHandler = () => {
        if (onClose !== null) {
            dispatch(fullScreenNetworkAreaDiagram(undefined));
            onClose(nadId);
            setDepth(0);
        }
    };

    const showFullScreen = () => {
        dispatch(fullScreenNetworkAreaDiagram(nadId));
    };

    const hideFullScreen = () => {
        dispatch(fullScreenNetworkAreaDiagram(undefined));
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
                position: 'relative',
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
                        <Typography>{diagramTitle}</Typography>
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
                {<div id="nad-svg" ref={svgRef} className={classes.divNad} />}
                {!loadingState && (
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
                                setDepth(depth === 0 ? 0 : depth - 1)
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
    onClose: PropTypes.func,
    diagramTitle: PropTypes.string.isRequired,
    svgUrl: PropTypes.string.isRequired,
    nadId: PropTypes.string,
    workingNode: PropTypes.object,
    depth: PropTypes.number.isRequired,
    setDepth: PropTypes.func.isRequired,
};

export default NetworkAreaDiagram;
