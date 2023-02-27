/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, {
    forwardRef,
    useImperativeHandle,
    useCallback,
    useState,
    useLayoutEffect,
    useRef,
    useEffect,
} from 'react';
import { setNetworkAreaDiagramNbVoltageLevels } from '../../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { RunningStatus } from '../../util/running-status';
import {
    MIN_HEIGHT,
    MIN_WIDTH,
    MAX_HEIGHT_NETWORK_AREA_DIAGRAM,
    MAX_WIDTH_NETWORK_AREA_DIAGRAM,
    NoSvg,
    useDiagramStyles,
} from '../diagram-common';
import { fetchSvg } from '../../../utils/rest-api';
import { isNodeInNotificationList } from '../../graph/util/model-functions';
import { useIntlRef, useSnackMessage } from '@gridsuite/commons-ui';
import { NetworkAreaDiagramViewer } from '@powsybl/diagram-viewer';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';

const NetworkAreaDiagramContent = forwardRef((props, ref) => {
    const [svg, setSvg] = useState(NoSvg);
    const classes = useDiagramStyles();
    const { diagramSizeSetter } = props;
    const network = useSelector((state) => state.network);
    const svgRef = useRef();
    const diagramViewerRef = useRef();
    const { snackError } = useSnackMessage();
    const intlRef = useIntlRef();
    const [forceState, updateState] = useState(false);
    const currentNode = useSelector((state) => state.currentTreeNode);
    const [loadingState, setLoadingState] = useState(false);
    const notificationIdList = useSelector((state) => state.notificationIdList);
    const dispatch = useDispatch();

    /**
     * MANUAL UPDATE SYSTEM
     */

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

    /**
     * DIAGRAM CONTENT BUILDING
     */

    const isNodeinNotifs = isNodeInNotificationList(
        currentNode,
        notificationIdList
    );

    useLayoutEffect(() => {
        if (svg.svg) {
            const diagramViewer = new NetworkAreaDiagramViewer(
                svgRef.current,
                svg.svg,
                MIN_WIDTH,
                MIN_HEIGHT,
                MAX_WIDTH_NETWORK_AREA_DIAGRAM,
                MAX_HEIGHT_NETWORK_AREA_DIAGRAM
            );

            // Update the diagram-pane's list of sizes with the width and height from the backend
            diagramSizeSetter(
                props.diagramId,
                props.svgType,
                diagramViewer.getWidth(),
                diagramViewer.getHeight()
            );

            // If a previous diagram was loaded and the diagram's size remained the same, we keep
            // the user's zoom and scoll state for the current render.
            if (
                diagramViewerRef.current &&
                diagramViewer.getWidth() ===
                    diagramViewerRef.current.getWidth() &&
                diagramViewer.getHeight() ===
                    diagramViewerRef.current.getHeight()
            ) {
                diagramViewer.setViewBox(diagramViewerRef.current.getViewBox());
            }

            diagramViewerRef.current = diagramViewer;
        }
    }, [
        network,
        props.svgUrl,
        props.diagramId,
        props.svgType,
        svg,
        currentNode,
        ref,
        loadingState,
        diagramSizeSetter,
    ]);

    useEffect(() => {
        if (props.svgUrl) {
            if (!isNodeinNotifs) {
                setLoadingState(true);
                fetchSvg(props.svgUrl)
                    .then((data) => {
                        if (data !== null) {
                            setSvg({
                                svg: data.svg,
                                metadata: data.metadata,
                                error: null,
                                svgUrl: props.svgUrl,
                            });
                            dispatch(
                                setNetworkAreaDiagramNbVoltageLevels(
                                    data?.metadata?.nbVoltageLevels
                                )
                            );
                        } else {
                            setSvg(NoSvg);
                        }
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
                            msg = `Voltage level not found`;
                        } else {
                            msg = error.message;
                        }
                        snackError({
                            messageTxt: msg,
                        });
                    })
                    .finally(() => {
                        setLoadingState(false);
                    });
            }
        } else {
            setSvg(NoSvg);
        }
    }, [
        props.svgUrl,
        forceState,
        snackError,
        intlRef,
        isNodeinNotifs,
        dispatch,
    ]);

    /**
     * RENDER
     */

    return (
        <>
            <Box height={2}>{loadingState && <LinearProgress />}</Box>
            <div
                ref={svgRef}
                className={clsx(
                    classes.divDiagram,
                    classes.divNetworkAreaDiagram,
                    {
                        [classes.divDiagramInvalid]:
                            props.loadFlowStatus !== RunningStatus.SUCCEED,
                    }
                )}
                style={{ height: '100%' }}
            />
        </>
    );
});

NetworkAreaDiagramContent.propTypes = {
    loadFlowStatus: PropTypes.any,
    svgType: PropTypes.string,
    svgUrl: PropTypes.string,
    diagramSizeSetter: PropTypes.func,
    diagramId: PropTypes.string,
};

export default NetworkAreaDiagramContent;
