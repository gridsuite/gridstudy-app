/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {
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

import { fullScreenNetworkAreaDiagramId } from '../../../redux/actions';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

import { AutoSizer } from 'react-virtualized';

import { useSnackMessage } from '@gridsuite/commons-ui';

import { useIntl } from 'react-intl';

import { NetworkAreaDiagramViewer } from '@powsybl/diagram-viewer';
import { NAD_INVALID_LOADFLOW_OPACITY } from '../../../utils/colors';
import clsx from 'clsx';
import { RunningStatus } from '../../util/running-status';
import AlertInvalidNode from '../../util/alert-invalid-node';

const loadingWidth = 200;
const loadingHeight = 250;
const maxWidth = 1200;
const maxHeight = 650;
const minWidth = 500;
const minHeight = 400;
const errorWidth = maxWidth;
let initialWidth, initialHeight;

const useStyles = makeStyles((theme) => ({
    divNad: {
        '& svg': {
            // necessary because the default (inline-block) adds vertical space
            // to our otherwise pixel accurate computations (this makes a
            // scrollbar appear in fullscreen mode)
            display: 'block',
            width: '100%',
        },
        '& .nad-label-box': {
            color: theme.palette.text.primary,
            'font-family': theme.typography.fontFamily,
        },
        '& .nad-text-edges': {
            stroke: theme.palette.text.primary,
        },

        overflow: 'hidden',
    },
    divInvalid: {
        '& .nad-edge-infos': {
            opacity: NAD_INVALID_LOADFLOW_OPACITY,
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
    paperBorders: {
        borderLeft: '1px solid ' + theme.palette.action.disabled,
        borderBottom: '1px solid ' + theme.palette.action.disabledBackground,
        borderRight: '1px solid ' + theme.palette.action.hover,
    },
}));

const noSvg = { svg: null, metadata: null, error: null, svgUrl: null };

// To allow controls that are in the corners of the map to not be hidden in normal mode
// (but they are still hidden in fullscreen mode)
const mapRightOffset = 0; // Set as 0 for the moment as to not remove entirely the possibility
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

const SizedNetworkAreaDiagram = (props) => {
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
        currentNode,
        nadId,
        diagramTitle,
        svgUrl,
        onClose,
        depth,
        setDepth,
        loadFlowStatus,
        disabled,
    } = props;

    const network = useSelector((state) => state.network);

    const fullScreenNadId = useSelector((state) => state.fullScreenNadId);

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
            fullScreenNadId,
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
        fullScreenNadId,
        totalWidth,
        totalHeight,
        svgPreferredWidth,
        svgPreferredHeight,
        headerPreferredHeight,
        nadId,
    ]);

    useEffect(() => {
        if (!disabled && svgUrl) {
            updateLoadingState(true);
            setSvg(noSvg);
            svgRef.current.innerHTML = ''; // clear the previous svg before replacing
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
                .catch((error) => {
                    console.error(error.message);
                    snackError({
                        messageTxt: error.message,
                    });
                    updateLoadingState(false);
                    setSvg({
                        svg:
                            '<svg width="' +
                            minWidth +
                            '" height="' +
                            minHeight +
                            '" xmlns="http://www.w3.org/2000/svg" ' +
                            'viewBox="0 0 0 0">' +
                            '</svg>',
                        metadata: null,
                        error: null,
                        svgUrl: svgUrl,
                    });
                });
        } else {
            setSvg(noSvg);
        }
    }, [svgUrl, forceState, snackError, disabled]);

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
    }, [network, svg, currentNode, theme, nadId, svgUrl]);

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
                        fullScreenNadId ? totalWidth : svgFinalWidth
                    );
                    svgEl.setAttribute(
                        'height',
                        fullScreenNadId ? totalHeight - 40 : svgFinalHeight
                    );
                }
            }
        }
    }, [
        fullScreenNadId,
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
            onClose();
            setDepth(0);
        }
    };

    const showFullScreen = () => {
        dispatch(fullScreenNetworkAreaDiagramId(nadId));
    };

    const hideFullScreen = () => {
        dispatch(fullScreenNetworkAreaDiagramId(null));
    };

    let sizeWidth = initialWidth;
    let sizeHeight = initialHeight;

    if (svg.error) {
        sizeWidth = errorWidth;
    } else if (
        typeof finalPaperWidth != 'undefined' &&
        typeof finalPaperHeight != 'undefined'
    ) {
        sizeWidth = finalPaperWidth;
        sizeHeight = finalPaperHeight;
    }

    if (sizeHeight !== undefined) {
        initialHeight = sizeHeight;
    }
    if (sizeWidth !== undefined) {
        initialWidth = sizeWidth;
    }

    return svg.error ? (
        <></>
    ) : (
        <Paper
            elevation={4}
            square={true}
            className={classes.paperBorders}
            style={{
                pointerEvents: 'auto',
                width: loadingState ? loadingWidth : sizeWidth,
                minWidth: loadingState ? loadingWidth : 0,
                height: loadingState ? loadingHeight : sizeHeight,
                position: 'relative',
                direction: 'ltr',
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
            {<Box height={2}>{loadingState && <LinearProgress />}</Box>}
            {disabled ? (
                <Box position="relative" left={0} right={0} top={0}>
                    <AlertInvalidNode noMargin={true} />
                </Box>
            ) : (
                <Box position="relative">
                    <div
                        id="nad-svg"
                        ref={svgRef}
                        className={clsx(classes.divNad, {
                            [classes.divInvalid]:
                                loadFlowStatus !== RunningStatus.SUCCEED,
                        })}
                    />
                    {!loadingState && (
                        <div style={{ display: 'flex' }}>
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
                            {fullScreenNadId ? (
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
    );
};

const NetworkAreaDiagram = (props) => {
    // Hack : A key is added to the AutoSizer to force an update when the panel's size changes,
    // instead of only calculating the size on first load and keeping it after that.
    const studyDisplayMode = useSelector((state) => state.studyDisplayMode);
    return (
        <AutoSizer key={studyDisplayMode}>
            {({ width, height }) => (
                <SizedNetworkAreaDiagram
                    totalWidth={width}
                    totalHeight={height}
                    {...props}
                />
            )}
        </AutoSizer>
    );
};

NetworkAreaDiagram.propTypes = {
    onClose: PropTypes.func,
    diagramTitle: PropTypes.string.isRequired,
    svgUrl: PropTypes.string.isRequired,
    nadId: PropTypes.string,
    currentNode: PropTypes.object,
    depth: PropTypes.number.isRequired,
    loadFlowStatus: PropTypes.any,
    studyUuid: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
};

export default NetworkAreaDiagram;
