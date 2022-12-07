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
    const { svgType, disabled } = props;

    const network = useSelector((state) => state.network);

    const currentNode = useSelector((state) => state.currentTreeNode);

    const [loadingState, updateLoadingState] = useState(false);

    const theme = useTheme();

    // using many useState() calls with literal values only to
    // easily avoid recomputing stuff when updating with the same values
    const [serverHeight, setServerHeight] = useState(0);
    const [serverWidth, setServerWidth] = useState(0);

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
    }, [props.svgUrl, snackError, intlRef]);

    useLayoutEffect(() => {
        if (disabled) return;

        if (svg.svg) {
            let viewboxMaxWidth = MAX_WIDTH_VOLTAGE_LEVEL;
            let viewboxMaxHeight = MAX_HEIGHT_VOLTAGE_LEVEL;
            let selectionBackColor = theme.palette.background.paper;

            const sldViewer = new SingleLineDiagramViewer(
                svgRef.current, //container
                svg.svg, //svgContent
                svg.metadata, //svg metadata
                svgType,
                0,
                0,
                viewboxMaxWidth,
                viewboxMaxHeight,
                selectionBackColor //arrows color
            );

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
        disabled,
        loadingState,
    ]);

    useLayoutEffect(() => {
        if (serverWidth && serverHeight) {
            const divElt = svgRef.current;
            if (divElt != null) {
                const svgEl = divElt.getElementsByTagName('svg')[0];
                if (svgEl != null) {
                    svgEl.setAttribute('width', serverWidth);
                    svgEl.setAttribute('height', serverHeight);
                }
            }
        }
    }, [
        svg,
        svgType,
        theme,
        loadingState,
        network,
        ref,
        serverWidth,
        serverHeight,
    ]);

    const classes = useStyles();

    const onCloseHandler = useCallback(() => {
        if (props.onClose !== null) {
            setSvg(NoSvg);
            props.onClose();
        }
    }, [props]);

    const PositionDiagramElement = useCallback(() => {
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
    }, [classes, loadingState, props.diagramTitle, svg.svg, onCloseHandler]);

    return renderIntoPaperWrapper(
        svg,
        ref,
        classes,
        serverWidth,
        serverHeight,
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
