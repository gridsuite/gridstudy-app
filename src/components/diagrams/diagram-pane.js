/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useDispatch, useSelector } from 'react-redux';
import {
    PARAM_CENTER_LABEL,
    PARAM_COMPONENT_LIBRARY,
    PARAM_DIAGONAL_LABEL,
    PARAM_LANGUAGE,
    PARAM_SUBSTATION_LAYOUT,
    PARAM_USE_NAME,
} from '../../utils/config-params';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    getSubstationSingleLineDiagram,
    getVoltageLevelSingleLineDiagram,
} from '../../utils/rest-api';
import { getNetworkAreaDiagramUrl } from '../../utils/rest-api';
import PropTypes from 'prop-types';
import { Chip, Stack } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import TimelineIcon from '@mui/icons-material/Timeline';
import makeStyles from '@mui/styles/makeStyles';
import { useDiagram, ViewState, SvgType } from './diagram-common';
import { isNodeBuilt } from '../graph/util/model-functions';
import { AutoSizer } from 'react-virtualized';
import Diagram from './diagram';
import { SLD_DISPLAY_MODE } from '../network/constants';
import clsx from 'clsx';
import { useNameOrId } from '../util/equipmentInfosHandler';

const useDisplayView = (network, studyUuid, currentNode) => {
    const paramUseName = useSelector((state) => state[PARAM_USE_NAME]);
    const { getNameOrId } = useNameOrId();
    const centerName = useSelector((state) => state[PARAM_CENTER_LABEL]);
    const diagonalName = useSelector((state) => state[PARAM_DIAGONAL_LABEL]);
    const substationLayout = useSelector(
        (state) => state[PARAM_SUBSTATION_LAYOUT]
    );
    const componentLibrary = useSelector(
        (state) => state[PARAM_COMPONENT_LIBRARY]
    );
    const language = useSelector((state) => state[PARAM_LANGUAGE]);

    const checkAndGetVoltageLevelSingleLineDiagramUrl = useCallback(
        (voltageLevelId) =>
            isNodeBuilt(currentNode)
                ? getVoltageLevelSingleLineDiagram(
                      studyUuid,
                      currentNode?.id,
                      voltageLevelId,
                      paramUseName,
                      centerName,
                      diagonalName,
                      componentLibrary,
                      SLD_DISPLAY_MODE.STATE_VARIABLE,
                      language
                  )
                : null,
        [
            currentNode,
            studyUuid,
            paramUseName,
            centerName,
            diagonalName,
            componentLibrary,
            language,
        ]
    );

    const checkAndGetSubstationSingleLineDiagramUrl = useCallback(
        (voltageLevelId) =>
            isNodeBuilt(currentNode)
                ? getSubstationSingleLineDiagram(
                      studyUuid,
                      currentNode?.id,
                      voltageLevelId,
                      paramUseName,
                      centerName,
                      diagonalName,
                      substationLayout,
                      componentLibrary,
                      language
                  )
                : null,
        [
            centerName,
            componentLibrary,
            diagonalName,
            studyUuid,
            substationLayout,
            paramUseName,
            currentNode,
            language,
        ]
    );

    const checkAndGetNetworkAreaDiagramUrl = useCallback(
        (voltageLevelsIds, depth) =>
            isNodeBuilt(currentNode)
                ? getNetworkAreaDiagramUrl(
                      studyUuid,
                      currentNode?.id,
                      voltageLevelsIds,
                      depth
                  )
                : null,
        [studyUuid, currentNode]
    );

    return useCallback(
        (diagramState) => {
            function createSubstationDiagramView(id, state) {
                const substation = network.getSubstation(id);
                if (!substation) return;
                let label = getNameOrId(substation);
                const countryName = substation?.countryName;
                if (countryName) {
                    label += ' - ' + countryName;
                }
                const svgUrl = checkAndGetSubstationSingleLineDiagramUrl(id);

                return {
                    id: id,
                    ref: React.createRef(),
                    state: state,
                    name: label,
                    svgUrl: svgUrl,
                    svgType: SvgType.SUBSTATION,
                };
            }

            function createVoltageLevelDiagramView(id, state) {
                const voltageLevel = network.getVoltageLevel(id);
                if (!voltageLevel) return;
                let label = getNameOrId(voltageLevel);
                const substation = network.getSubstation(id);
                const countryName = substation?.countryName;
                if (countryName) {
                    label += ' - ' + countryName;
                }
                const svgUrl = checkAndGetVoltageLevelSingleLineDiagramUrl(id);

                return {
                    id: id,
                    ref: React.createRef(),
                    state: state,
                    name: label,
                    svgUrl: svgUrl,
                    svgType: SvgType.VOLTAGE_LEVEL,
                    substationId: substation?.id,
                };
            }

            function createNetworkAreaDiagramView(ids, state, depth = 0) {
                let displayedVoltageLevels = [];
                let nadTitle = '';
                if (ids) {
                    ids.forEach((id) =>
                        displayedVoltageLevels.push(network.getVoltageLevel(id))
                    );
                }

                if (displayedVoltageLevels.length === 0) return;
                displayedVoltageLevels.forEach((voltageLevel) => {
                    const name = getNameOrId(voltageLevel);
                    if (name !== undefined) {
                        nadTitle =
                            nadTitle + (nadTitle !== '' ? ' + ' : '') + name;
                    }
                });

                const svgUrl = checkAndGetNetworkAreaDiagramUrl(ids, depth);

                return {
                    id: displayedVoltageLevels[0]?.id,
                    ref: React.createRef(),
                    state: state,
                    name: nadTitle,
                    svgUrl: svgUrl,
                    svgType: SvgType.NETWORK_AREA_DIAGRAM,
                };
            }

            if (!network) return;
            if (diagramState.svgType === SvgType.VOLTAGE_LEVEL) {
                return createVoltageLevelDiagramView(
                    diagramState.id,
                    diagramState.state
                );
            } else if (diagramState.svgType === SvgType.SUBSTATION) {
                return createSubstationDiagramView(
                    diagramState.id,
                    diagramState.state
                );
            } else if (diagramState.svgType === SvgType.NETWORK_AREA_DIAGRAM) {
                return createNetworkAreaDiagramView(
                    diagramState.ids,
                    diagramState.state,
                    diagramState.depth
                );
            }
            return;
        },
        [
            network,
            checkAndGetSubstationSingleLineDiagramUrl,
            checkAndGetVoltageLevelSingleLineDiagramUrl,
            checkAndGetNetworkAreaDiagramUrl,
            getNameOrId,
        ]
    );
};

const useStyles = makeStyles((theme) => ({
    minimizedDiagram: {
        bottom: '60px',
        position: 'absolute',
    },
    separator: {
        flexGrow: 1,
        display: 'flex',
        overflow: 'hidden',
    },
    availableDiagramSurfaceArea: {
        flexDirection: 'row',
        display: 'inline-flex',
        paddingRight: theme.spacing(6),
    },
    fullscreen: {
        paddingRight: 0,
    },
}));

export function DiagramPane({
    studyUuid,
    network,
    isComputationRunning,
    showInSpreadsheet,
    loadFlowStatus,
    currentNode,
    disabled,
    visible,
}) {
    const studyUpdatedForce = useSelector((state) => state.studyUpdated);

    const fullScreenDiagram = useSelector((state) => state.fullScreenDiagram);

    const [displayedDiagramHeights, setDisplayedDiagramHeights] = useState([]);
    const displayedDiagramHeightsRef = useRef();
    displayedDiagramHeightsRef.current = displayedDiagramHeights;

    const createView = useDisplayView(network, studyUuid, currentNode);

    const dispatch = useDispatch();

    const diagramStates = useSelector((state) => state.diagramStates);

    const networkAreaDiagramDepth = useSelector(
        (state) => state.networkAreaDiagramDepth
    );

    const { openDiagramView, closeDiagramView, closeDiagramViews } =
        useDiagram();

    const currentNodeRef = useRef();
    currentNodeRef.current = currentNode;

    const classes = useStyles();

    /**
     * BUILDS THE DIAGRAMS LIST
     */

    // Here, the goal is to build a list of view, each view corresponding to a diagram.
    // We get the diagram data from the redux store.
    // In the case of SLD, each SLD corresponds to one view, but in the case of NAD, each open NAD is merged
    // into one view.
    const views = useMemo(() => {
        if (!visible) {
            return [];
        }
        const views = [];
        const networkAreaIds = [];
        let networkAreaViewState = ViewState.OPENED;

        diagramStates.forEach((diagramState) => {
            if (diagramState.svgType === SvgType.NETWORK_AREA_DIAGRAM) {
                networkAreaIds.push(diagramState.id);
                networkAreaViewState = diagramState.state; // They should all be the same value
            } else {
                let singleLineDiagramView = createView(diagramState);
                // if current view cannot be found, it returns undefined
                // in this case, we remove it from diagram states
                if (singleLineDiagramView) {
                    views.push(singleLineDiagramView);
                } else {
                    closeDiagramView(diagramState.id, diagramState.svgType);
                }
            }
        });

        if (networkAreaIds.length > 0) {
            let networkAreaDiagramView = createView({
                ids: networkAreaIds,
                state: networkAreaViewState,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                depth: networkAreaDiagramDepth,
            });

            // if current view cannot be found, it returns undefined
            // in this case, we remove all the NAD from diagram states
            if (networkAreaDiagramView) {
                views.push(networkAreaDiagramView);
            } else {
                closeDiagramView(null, SvgType.NETWORK_AREA_DIAGRAM); // In this case, the ID is irrelevant
            }
        }
        return views;
    }, [
        diagramStates,
        visible,
        disabled,
        closeDiagramView,
        createView,
        dispatch,
        networkAreaDiagramDepth,
    ]);

    const viewsRef = useRef();
    viewsRef.current = views;

    const displayedDiagrams = views.filter((view) =>
        [ViewState.OPENED, ViewState.PINNED].includes(view.state)
    );
    const minimizedDiagrams = views.filter((view) =>
        [ViewState.MINIMIZED].includes(view.state)
    );

    /**
     * MINIMIZED DIAGRAMS' CONTROLS
     */

    const handleCloseDiagramView = useCallback(
        (id, type) => {
            closeDiagramView(id, type);
        },
        [closeDiagramView]
    );

    const handleOpenDiagramView = useCallback(
        (id, type) => {
            if (!network) {
                return;
            }
            openDiagramView(id, type);
        },
        [network, openDiagramView]
    );

    /**
     * FORCED UPDATE MECHANISM
     */

    // Updates a particular SLD diagram or every diagram for the current node
    const updateDiagram = useCallback((id) => {
        if (id) {
            viewsRef.current
                .find(
                    (diagramView) =>
                        diagramView.id === id &&
                        diagramView.svgType !== SvgType.NETWORK_AREA_DIAGRAM
                )
                ?.ref?.current?.reloadSvg();
        } else {
            viewsRef.current.forEach((diagramView) => {
                // We search an instance of the current node's ID inside the diagram's URL to determine if the diagram should be updated
                if (
                    diagramView.svgUrl &&
                    diagramView.svgUrl.indexOf(currentNodeRef.current?.id) !==
                        -1
                ) {
                    diagramView.ref?.current?.reloadSvg();
                }
            });
        }
    }, []);

    // This effect will trigger the diagrams' forced update
    useEffect(() => {
        if (studyUpdatedForce.eventData.headers && viewsRef.current) {
            if (
                studyUpdatedForce.eventData.headers['updateType'] === 'loadflow'
            ) {
                //TODO reload data more intelligently
                updateDiagram(undefined);
            } else if (
                studyUpdatedForce.eventData.headers['updateType'] === 'study'
            ) {
                //If the SLD of the deleted substation is open, we close it
                if (studyUpdatedForce.eventData.headers['deletedEquipmentId']) {
                    const deletedId =
                        studyUpdatedForce.eventData.headers[
                            'deletedEquipmentId'
                        ];
                    const vlToClose = viewsRef.current.filter(
                        (vl) =>
                            vl.substationId === deletedId || vl.id === deletedId
                    );
                    if (vlToClose.length > 0) {
                        closeDiagramViews([...vlToClose, deletedId]);
                    }

                    const substationsIds =
                        studyUpdatedForce.eventData.headers['substationsIds'];
                    viewsRef.current.forEach((v) => {
                        const vl = network.getVoltageLevel(v.id);
                        if (vl && substationsIds.includes(vl.substationId)) {
                            updateDiagram(vl.id);
                        }
                    });
                } else {
                    updateDiagram(undefined);
                }
            } else if (
                studyUpdatedForce.eventData.headers['updateType'] ===
                'buildCompleted'
            ) {
                if (
                    studyUpdatedForce.eventData.headers['node'] ===
                    currentNodeRef.current?.id
                ) {
                    updateDiagram(undefined);
                }
            }
        }
        // Note: studyUuid, and loadNetwork don't change
    }, [
        studyUpdatedForce,
        dispatch,
        studyUuid,
        updateDiagram,
        closeDiagramViews,
        network,
    ]);

    /**
     * DIAGRAM SIZE COMPUTATION
     */

    const [computedHeight, setComputedHeight] = useState();

    useEffect(() => {
        let displayedDiagramHeights_ =
            displayedDiagramHeightsRef.current?.filter((displayedHeight) =>
                views
                    .filter((sld) => sld.state !== ViewState.MINIMIZED)
                    .map((sld) => sld.id)
                    .includes(displayedHeight.id)
            );

        setDisplayedDiagramHeights(displayedDiagramHeights_);
    }, [views]);

    useEffect(() => {
        const initialHeights = [
            ...displayedDiagramHeights.map(
                (displayedHeight) => displayedHeight.initialHeight
            ),
        ];
        if (initialHeights.length > 0) {
            const newComputedHeight = Math.max(...initialHeights);
            if (newComputedHeight) {
                setComputedHeight(newComputedHeight);
            }
        }
    }, [displayedDiagramHeights]);

    /**
     * RENDER
     */

    return (
        <AutoSizer>
            {({ width, height }) => (
                <div
                    className={clsx(classes.availableDiagramSurfaceArea, {
                        [classes.fullscreen]: fullScreenDiagram?.id,
                    })}
                    style={{
                        width: width + 'px',
                        height: height + 'px',
                    }}
                >
                    {displayedDiagrams.map((diagramView) => (
                        <>
                            {
                                /* This hack will add a space between all the SLD and the NAD. This space takes all the remaining space on screen. */
                                diagramView.svgType ===
                                    SvgType.NETWORK_AREA_DIAGRAM && (
                                    <div
                                        className={classes.separator}
                                        key="separator"
                                    ></div>
                                )
                            }
                            <Diagram
                                diagramTitle={diagramView.name}
                                ref={diagramView.ref}
                                key={diagramView.svgType + diagramView.id}
                                disabled={disabled}
                                pinned={diagramView.state === ViewState.PINNED}
                                diagramId={diagramView.id}
                                svgType={diagramView.svgType}
                                svgUrl={diagramView.svgUrl}
                                studyUuid={studyUuid}
                                // Size computation
                                computedHeight={computedHeight}
                                totalHeight={height}
                                totalWidth={width}
                                numberToDisplay={displayedDiagrams.length}
                                setDisplayedDiagramHeights={
                                    setDisplayedDiagramHeights
                                }
                                // SLD specific
                                isComputationRunning={isComputationRunning}
                                loadFlowStatus={loadFlowStatus}
                                showInSpreadsheet={showInSpreadsheet}
                            />
                        </>
                    ))}
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1}
                        className={classes.minimizedDiagram}
                        style={{
                            display: !fullScreenDiagram?.id ? '' : 'none', // We hide this stack if a diagram is in fullscreen
                        }}
                    >
                        {minimizedDiagrams.map((diagramView) => (
                            <Chip
                                key={diagramView.svgType + diagramView.id}
                                icon={
                                    diagramView.svgType ===
                                    SvgType.NETWORK_AREA_DIAGRAM ? (
                                        <>
                                            <ArrowUpwardIcon />
                                            <TimelineIcon />
                                        </>
                                    ) : (
                                        <ArrowUpwardIcon />
                                    )
                                }
                                label={diagramView.name}
                                onClick={() =>
                                    handleOpenDiagramView(
                                        diagramView.id,
                                        diagramView.svgType
                                    )
                                }
                                onDelete={() =>
                                    handleCloseDiagramView(
                                        diagramView.id,
                                        diagramView.svgType
                                    )
                                }
                            />
                        ))}
                    </Stack>
                </div>
            )}
        </AutoSizer>
    );
}

DiagramPane.propTypes = {
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    network: PropTypes.object,
    showInSpreadsheet: PropTypes.func,
    isComputationRunning: PropTypes.bool,
    loadFlowStatus: PropTypes.any,
    onNextVoltageLevelClick: PropTypes.func,
    disabled: PropTypes.bool,
    visible: PropTypes.bool,
};
