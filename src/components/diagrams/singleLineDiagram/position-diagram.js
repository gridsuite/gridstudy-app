/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {
    forwardRef,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
import { fetchSvg } from '../../../utils/rest-api';
import { SingleLineDiagramViewer } from '@powsybl/diagram-viewer';
import {
    useDiagramStyles,
    MAX_HEIGHT_VOLTAGE_LEVEL,
    MAX_WIDTH_VOLTAGE_LEVEL,
    NoSvg,
    LOADING_WIDTH,
} from '../diagram-common';
import { useIntlRef, useSnackMessage } from '@gridsuite/commons-ui';
import { Paper } from '@mui/material';
import DiagramHeader from '../diagram-header';
import clsx from 'clsx';

const PositionDiagram = forwardRef((props, ref) => {
    const [svg, setSvg] = useState(NoSvg);
    const classes = useDiagramStyles();
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
                    if (data !== null) {
                        setSvg({
                            svg: data.svg,
                            metadata: data.metadata,
                            error: null,
                            svgUrl: props.svgUrl,
                        });
                    } else {
                        setSvg(NoSvg);
                    }
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

    const onCloseHandler = () => {
        if (props.onClose !== null) {
            setSvg(NoSvg);
            props.onClose();
        }
    };

    return !svg.error ? (
        <Paper
            ref={ref}
            elevation={4}
            square={true}
            className={classes.paperBorders}
            style={{
                pointerEvents: 'auto',
                width: serverWidth,
                minWidth: LOADING_WIDTH,
                height: serverHeight,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <Box>
                <DiagramHeader
                    diagramTitle={props.diagramTitle}
                    showCloseControl
                    onClose={onCloseHandler}
                />
            </Box>
            {<Box height={2}>{loadingState && <LinearProgress />}</Box>}
            <Box position="relative">
                <div
                    ref={svgRef}
                    className={clsx(
                        classes.divDiagram,
                        classes.divSingleLineDiagram,
                        classes.divDiagramReadOnly
                    )}
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
