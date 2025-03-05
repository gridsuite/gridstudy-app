/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { forwardRef, useEffect, useLayoutEffect, useRef, useState, Ref } from 'react';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
import { SingleLineDiagramViewer, SLDMetadata } from '@powsybl/network-viewer';
import { styles, MAX_HEIGHT_VOLTAGE_LEVEL, MAX_WIDTH_VOLTAGE_LEVEL, NoSvg, MIN_WIDTH, Svg } from '../diagram-common';
import { mergeSx, useIntlRef, useSnackMessage } from '@gridsuite/commons-ui';
import { Paper } from '@mui/material';
import DiagramHeader from '../diagram-header';
import { fetchSvg } from '../../../services/study';
import { AppState } from 'redux/reducer';

interface PositionDiagramProps {
    diagramTitle: string;
    svgUrl: string | null;
    onClose: () => void;
    svgType: string;
    disabled?: boolean;
}

const PositionDiagram = forwardRef((props: PositionDiagramProps, ref: Ref<HTMLDivElement>) => {
    const [svg, setSvg] = useState<Svg>({
        svg: null,
        metadata: null,
        additionalMetadata: null,
        error: null,
        svgUrl: null,
    });
    const svgUrl = useRef('');
    const svgDraw = useRef<SingleLineDiagramViewer | null>(null);
    const { snackError } = useSnackMessage();
    const intlRef = useIntlRef();
    const svgRef = useRef<HTMLDivElement>();
    const { svgType, disabled } = props;

    const currentNode = useSelector((state: AppState) => state.currentTreeNode);

    const [loadingState, updateLoadingState] = useState<boolean>(false);

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
                            ...data,
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
                        additionalMetadata: null,
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
        if (disabled) {
            return;
        }

        if (svg.svg) {
            let viewboxMaxWidth = MAX_WIDTH_VOLTAGE_LEVEL;
            let viewboxMaxHeight = MAX_HEIGHT_VOLTAGE_LEVEL;
            let selectionBackColor = theme.palette.background.paper;
            const container = svgRef.current;
            if (!container) {
                return;
            }

            const sldViewer = new SingleLineDiagramViewer(
                container, //container
                svg.svg, //svgContent
                svg.metadata as SLDMetadata, //svg metadata
                svgType,
                0,
                0,
                viewboxMaxWidth,
                viewboxMaxHeight,
                null,
                null,
                null,
                null,
                selectionBackColor, //arrows color
                null
            );

            setServerHeight(sldViewer.getHeight());
            setServerWidth(sldViewer.getWidth());
            if (svgDraw.current && svgUrl.current === svg.svgUrl) {
                const viewBox = svgDraw.current.getViewBox();
                if (viewBox) {
                    sldViewer.setViewBox(viewBox);
                }
            }
            if (svg.svgUrl) {
                svgUrl.current = svg.svgUrl;
            }
            svgDraw.current = sldViewer;
        }
    }, [svg, currentNode, svgType, theme, ref, disabled, loadingState]);

    useLayoutEffect(() => {
        if (serverWidth && serverHeight) {
            const divElt = svgRef.current;
            if (divElt != null) {
                const svgEl = divElt.getElementsByTagName('svg')[0] as SVGElement;
                if (svgEl != null) {
                    svgEl.setAttribute('width', serverWidth.toString());
                    svgEl.setAttribute('height', serverHeight.toString());
                }
            }
        }
    }, [svg, svgType, theme, loadingState, ref, serverWidth, serverHeight]);

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
            sx={styles.paperBorders}
            style={{
                pointerEvents: 'auto',
                width: serverWidth,
                minWidth: MIN_WIDTH,
                height: serverHeight,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <Box>
                <DiagramHeader diagramTitle={props.diagramTitle} showCloseControl onClose={onCloseHandler} />
            </Box>
            {<Box height={2}>{loadingState && <LinearProgress />}</Box>}
            <Box sx={{ position: 'relative', top: '2em', height: '100%' }}>
                <Box
                    ref={svgRef}
                    sx={mergeSx(styles.divDiagram, styles.divSingleLineDiagram, styles.divDiagramReadOnly)}
                />
            </Box>
        </Paper>
    ) : (
        <></>
    );
});

export default PositionDiagram;
