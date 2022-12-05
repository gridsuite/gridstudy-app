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
import { useTheme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import { fetchSvg } from '../../../utils/rest-api';
import { SingleLineDiagramViewer } from '@powsybl/diagram-viewer';
import {
    commonStyle,
    commonSldStyle,
    MAX_HEIGHT_VOLTAGE_LEVEL,
    MAX_WIDTH_VOLTAGE_LEVEL,
    setWidthAndHeight,
    renderIntoPaperWrapper,
    NoSvg,
} from './utils';
import { useIntlRef, useSnackMessage } from '@gridsuite/commons-ui';

const customSldStyle = (theme) => {
    return {
        '& .sld-in .sld-label': {
            display: 'none',
        },
        '& .sld-out .sld-label': {
            display: 'none',
        },
        '& .sld-arrow-in': {
            display: 'none',
        },
        '& .sld-arrow-out': {
            display: 'none',
        },
        '& .arrow': {
            fill: theme.palette.text.primary,
            pointerEvents: 'none',
        },
    };
};

const useStyles = makeStyles((theme) => ({
    divSld: { ...commonSldStyle(theme, customSldStyle(theme)) },
    ...commonStyle(theme, {}),
}));

const PositionDiagram = forwardRef((props, ref) => {
    const [svg, setSvg] = useState(NoSvg);
    const svgUrl = useRef('');
    const svgDraw = useRef();
    const { snackError } = useSnackMessage();
    const intlRef = useIntlRef();
    const svgRef = useRef();
    const { totalWidth, svgType, disabled } = props;

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
    const [finalPaperWidth, setFinalPaperWidth] = useState();
    const [finalPaperHeight, setFinalPaperHeight] = useState();
    const [svgFinalWidth, setSvgFinalWidth] = useState();
    const [svgFinalHeight, setSvgFinalHeight] = useState();

    const [serverHeight, setServerHeight] = useState();
    const [serverWidth, setServerWidth] = useState();

    useLayoutEffect(() => {
        setSvgFinalWidth(serverWidth);
        setFinalPaperWidth(serverWidth + 10);
        setSvgFinalHeight(serverHeight);
        setFinalPaperHeight(serverHeight + 10);
    }, [serverWidth, serverHeight]);

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
            setSvg(NoSvg);
        }
    }, [props.svgUrl, forceState, snackError, intlRef]);

    // shouldResetPreferredSizes doesn't need to be a ref, but it makes the static checks happy
    // const shouldResetPreferredSizes = useRef();
    // shouldResetPreferredSizes.current = false;
    // useLayoutEffect(() => {
    //     shouldResetPreferredSizes.current = true;
    //     // Note: these deps must be kept in sync with the ones of the useLayoutEffect where setSvgPreferredWidth and setSvgPreferredHeight
    //     // are called. Because we want to reset them in all cases, except when only svgFinalWidth and svgFinalHeight have changed
    //     // so we use the same deps but without svgFinalWidth and svgFinalHeight
    //     // TODO is there a better way to do this??
    // }, [network, svg, currentNode, svgType, theme, ref, disabled]);

    useLayoutEffect(() => {
        if (disabled) return;

        if (svg.svg) {
            const minWidth = svgFinalWidth;
            const minHeight = svgFinalHeight;

            let viewboxMaxWidth = MAX_WIDTH_VOLTAGE_LEVEL;
            let viewboxMaxHeight = MAX_HEIGHT_VOLTAGE_LEVEL;
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

            // if (shouldResetPreferredSizes.current) {
            //     setSvgPreferredHeight(sldViewer.getHeight());
            //     setSvgPreferredWidth(sldViewer.getWidth());
            // }

            setServerHeight(sldViewer.getHeight());
            setServerWidth(sldViewer.getWidth());

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

    const onCloseHandler = useCallback(() => {
        if (props.onClose !== null) {
            setSvg(NoSvg);
            props.onClose();
        }
    }, [props]);

    let { sizeWidth, sizeHeight } = setWidthAndHeight(
        svg,
        finalPaperWidth,
        finalPaperHeight,
        loadingState,
        totalWidth,
        MAX_WIDTH_VOLTAGE_LEVEL
    );

    const PositionDiagramElement = useCallback(
        () => {
            return (
                <>
                    <Box>
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
                </>
            );
        },
        // Note: dispatch doesn't change
        [classes, loadingState, props.diagramTitle, svg.svg, onCloseHandler]
    );

    return renderIntoPaperWrapper(
        svg,
        ref,
        classes,
        sizeWidth,
        sizeHeight,
        PositionDiagramElement()
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
