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
    PARAM_SUBSTATION_LAYOUT,
    PARAM_USE_NAME,
} from '../../utils/config-params';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    getSubstationSingleLineDiagram,
    getVoltageLevelSingleLineDiagram,
    updateSwitchState,
} from '../../utils/rest-api';
import { getNetworkAreaDiagramUrl } from '../../utils/rest-api';
import PropTypes from 'prop-types';
import { Chip, Stack } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import makeStyles from '@mui/styles/makeStyles';
import { useDiagram, ViewState, SvgType } from './diagram-common';
import { isNodeBuilt } from '../graph/util/model-functions';
import { AutoSizer } from 'react-virtualized';
import Diagram from './diagram';
import { SLD_DISPLAY_MODE } from '../network/constants';
import { isBlankOrEmpty } from '../util/validation-functions';

const useDisplayView = (network, studyUuid, currentNode) => {
    const paramUseName = useSelector((state) => state[PARAM_USE_NAME]);
    const centerName = useSelector((state) => state[PARAM_CENTER_LABEL]);
    const diagonalName = useSelector((state) => state[PARAM_DIAGONAL_LABEL]);
    const substationLayout = useSelector(
        (state) => state[PARAM_SUBSTATION_LAYOUT]
    );

    const componentLibrary = useSelector(
        (state) => state[PARAM_COMPONENT_LIBRARY]
    );

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
                      SLD_DISPLAY_MODE.STATE_VARIABLE
                  )
                : null,
        [
            currentNode,
            studyUuid,
            paramUseName,
            centerName,
            diagonalName,
            componentLibrary,
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
                      componentLibrary
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
                let name =
                    paramUseName && !isBlankOrEmpty(substation.name)
                        ? substation.name
                        : id;
                const countryName = substation?.countryName;
                if (countryName) {
                    name += ' \u002D ' + countryName;
                }
                const svgUrl = checkAndGetSubstationSingleLineDiagramUrl(id);

                return {
                    id: id,
                    ref: React.createRef(),
                    state: state,
                    name: name,
                    svgUrl: svgUrl,
                    svgType: SvgType.SUBSTATION,
                };
            }

            function createVoltageLevelDiagramView(id, state) {
                const voltageLevel = network.getVoltageLevel(id);
                if (!voltageLevel) return;
                let name =
                    paramUseName && !isBlankOrEmpty(voltageLevel.name)
                        ? voltageLevel.name
                        : id;
                const substation = network.getSubstation(id);
                const countryName = substation?.countryName;
                if (countryName) {
                    name += ' \u002D ' + countryName;
                }
                const svgUrl = checkAndGetVoltageLevelSingleLineDiagramUrl(id);

                return {
                    id: id,
                    ref: React.createRef(),
                    state: state,
                    name: name,
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
                    const name =
                        paramUseName && voltageLevel?.name
                            ? voltageLevel?.name
                            : voltageLevel?.id;
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
            paramUseName,
            checkAndGetSubstationSingleLineDiagramUrl,
            checkAndGetVoltageLevelSingleLineDiagramUrl,
            checkAndGetNetworkAreaDiagramUrl,
        ]
    );
};

const useStyles = makeStyles(() => ({
    minimizedSLD: {
        bottom: '60px',
        position: 'absolute',
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

    const [updateSwitchMsg, setUpdateSwitchMsg] = useState('');

    const [views, setViews] = useState([]);
    const fullScreenDiagram = useSelector((state) => state.fullScreenDiagram);

    const [displayedDiagrams, setDisplayedDiagrams] = useState([]);
    const [minimizedDiagrams, setMinimizedDiagrams] = useState([]);
    const [displayedSldHeights, setDisplayedSldHeights] = useState([]);
    const displayedSldHeightsRef = useRef();
    displayedSldHeightsRef.current = displayedSldHeights;

    const createView = useDisplayView(network, studyUuid, currentNode);

    const dispatch = useDispatch();

    const diagramStates = useSelector((state) => state.diagramStates);

    const [depth, setDepth] = useState(0);

    const viewsRef = useRef();
    viewsRef.current = views;

    const [
        openDiagramView,
        minimizeDiagramView,
        togglePinDiagramView,
        closeDiagramView,
        closeDiagramViews,
    ] = useDiagram();

    const currentNodeRef = useRef();
    currentNodeRef.current = currentNode;

    const updateSld = useCallback((id) => {
        if (id) {
            viewsRef.current
                .find((sld) => sld.id === id)
                ?.ref?.current?.reloadSvg();
        } else
            viewsRef.current.forEach((sld) => {
                if (
                    sld.svgUrl &&
                    sld.svgUrl.indexOf(currentNodeRef.current?.id) !== -1
                ) {
                    sld.ref?.current?.reloadSvg();
                }
            });
    }, []);

    const classes = useStyles();

    const handleUpdateSwitchState = useCallback(
        (breakerId, open, switchElement) => {
            updateSwitchState(studyUuid, currentNode?.id, breakerId, open).then(
                (response) => {
                    if (!response.ok) {
                        console.error(response);
                        setUpdateSwitchMsg(
                            response.status + ' : ' + response.statusText
                        );
                    }
                }
            );
        },
        [studyUuid, currentNode]
    );

    // Here, the goal is to setView with a list of view, each view corresponding to a diagram.
    // We get the diagram data from the redux store.
    // In the case of SLD, each SLD corresponds to one view, but in the case of NAD, each open NAD is merged
    // into one view.
    useEffect(() => {
        if (visible) {
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
                    depth: depth,
                });

                // if current view cannot be found, it returns undefined
                // in this case, we remove all the NAD from diagram states
                if (networkAreaDiagramView) {
                    views.push(networkAreaDiagramView);
                } else {
                    closeDiagramView(null, SvgType.NETWORK_AREA_DIAGRAM); // In this case, the ID is irrelevant
                }
            }
            setViews(views);
        }
    }, [
        diagramStates,
        visible,
        disabled,
        closeDiagramView,
        createView,
        dispatch,
        depth,
    ]);

    const handleOpenView = useCallback(
        (id, type) => {
            if (!network) return;
            openDiagramView(id, type);
        },
        [network, openDiagramView]
    );

    useEffect(() => {
        if (studyUpdatedForce.eventData.headers && viewsRef.current) {
            if (
                studyUpdatedForce.eventData.headers['updateType'] === 'loadflow'
            ) {
                //TODO reload data more intelligently
                updateSld();
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
                            updateSld(vl.id);
                        }
                    });
                } else {
                    updateSld();
                }
            } else if (
                studyUpdatedForce.eventData.headers['updateType'] ===
                'buildCompleted'
            ) {
                if (
                    studyUpdatedForce.eventData.headers['node'] ===
                    currentNodeRef.current?.id
                ) {
                    updateSld();
                }
            }
        }
        // Note: studyUuid, and loadNetwork don't change
    }, [
        studyUpdatedForce,
        dispatch,
        studyUuid,
        updateSld,
        closeDiagramViews,
        network,
    ]);

    useEffect(() => {
        setDisplayedDiagrams(
            views.filter((view) =>
                [ViewState.OPENED, ViewState.PINNED].includes(view.state)
            )
        );
        setMinimizedDiagrams(
            views.filter((view) => [ViewState.MINIMIZED].includes(view.state))
        );
    }, [views]);

    const [computedHeight, setComputedHeight] = useState();

    useEffect(() => {
        let displayedSldHeights_ = displayedSldHeightsRef.current;
        viewsRef.current.forEach((sld) => {
            if (sld.state === ViewState.MINIMIZED) {
                displayedSldHeights_ = displayedSldHeights_.filter(
                    (displayedHeight) => displayedHeight.id !== sld.id
                );
            }
        });
        displayedSldHeights_ = displayedSldHeights_.filter((displayedHeight) =>
            viewsRef.current.map((sld) => sld.id).includes(displayedHeight.id)
        );

        setDisplayedSldHeights(displayedSldHeights_);
    }, [views]);

    useEffect(() => {
        if (displayedSldHeights.length === 0) {
            setComputedHeight();
        }

        const initialHeights = [
            ...displayedSldHeights.map(
                (displayedHeight) => displayedHeight.initialHeight
            ),
        ];
        if (initialHeights.length > 0) {
            const newComputedHeight = Math.max(...initialHeights);
            if (newComputedHeight && !isNaN(newComputedHeight)) {
                setComputedHeight(newComputedHeight);
            }
        }
    }, [displayedSldHeights]);

    return (
        <AutoSizer>
            {({ width, height }) => {
                return (
                    <div
                        style={{ flexDirection: 'row', display: 'inline-flex' }}
                    >
                        {displayedDiagrams.map((diagramView) => (
                            <Diagram
                                computedHeight={computedHeight}
                                diagramTitle={diagramView.name}
                                disabled={disabled}
                                isComputationRunning={isComputationRunning}
                                key={diagramView.svgType + diagramView.id}
                                loadFlowStatus={loadFlowStatus}
                                numberToDisplay={displayedDiagrams.length}
                                onBreakerClick={handleUpdateSwitchState}
                                onMinimize={minimizeDiagramView}
                                onNextVoltageLevelClick={handleOpenView}
                                onTogglePin={togglePinDiagramView}
                                pinned={diagramView.state === ViewState.PINNED}
                                ref={diagramView.ref}
                                setDisplayedDiagramHeights={
                                    setDisplayedSldHeights
                                }
                                showInSpreadsheet={showInSpreadsheet}
                                diagramId={diagramView.id}
                                svgType={diagramView.svgType}
                                svgUrl={diagramView.svgUrl}
                                totalHeight={height}
                                totalWidth={width}
                                updateSwitchMsg={updateSwitchMsg}
                                depth={depth}
                                setDepth={setDepth}
                            />
                        ))}
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={1}
                            className={classes.minimizedSLD}
                            style={{
                                display: !fullScreenDiagram?.id ? '' : 'none', // We hide this stack if a diagram is in fullscreen
                            }}
                        >
                            {minimizedDiagrams.map((diagramView) => (
                                <Chip
                                    key={diagramView.svgType + diagramView.id}
                                    icon={<ArrowUpwardIcon />}
                                    label={diagramView.name}
                                    onClick={() =>
                                        handleOpenView(
                                            diagramView.id,
                                            diagramView.svgType
                                        )
                                    }
                                    onDelete={() =>
                                        closeDiagramView(
                                            diagramView.id,
                                            diagramView.svgType
                                        )
                                    }
                                />
                            ))}
                        </Stack>
                    </div>
                );
            }}
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
