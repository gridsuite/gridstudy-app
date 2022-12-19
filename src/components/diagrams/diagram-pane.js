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
import {
    getNameOrId,
    useDiagram,
    ViewState,
    SvgType,
} from './diagram-common';
import { isNodeBuilt } from '../graph/util/model-functions';
import { AutoSizer } from 'react-virtualized';
import Diagram from './diagram';
import { SLD_DISPLAY_MODE } from '../network/constants';

const useDisplayView = (network, studyUuid, currentNode) => {
    const useName = useSelector((state) => state[PARAM_USE_NAME]);
    const centerName = useSelector((state) => state[PARAM_CENTER_LABEL]);
    const diagonalName = useSelector((state) => state[PARAM_DIAGONAL_LABEL]);
    const substationLayout = useSelector(
        (state) => state[PARAM_SUBSTATION_LAYOUT]
    );

    const componentLibrary = useSelector(
        (state) => state[PARAM_COMPONENT_LIBRARY]
    );

    const voltageLevelsIdsForNad = useSelector(
        (state) => state.voltageLevelsIdsForNad
    );

    const checkAndGetVoltageLevelSingleLineDiagramUrl = useCallback(
        (voltageLevelId) =>
            isNodeBuilt(currentNode)
                ? getVoltageLevelSingleLineDiagram(
                      studyUuid,
                      currentNode?.id,
                      voltageLevelId,
                      useName,
                      centerName,
                      diagonalName,
                      componentLibrary,
                      SLD_DISPLAY_MODE.STATE_VARIABLE
                  )
                : null,
        [
            currentNode,
            studyUuid,
            useName,
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
                      useName,
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
            useName,
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
        [
            studyUuid,
            currentNode,
        ]
    );

    return useCallback(
        (view) => {
            function createSubstationSLD(substationId, state) {
                const substation = network.getSubstation(substationId);
                if (!substation) return;
                let name =
                    useName && substation.name ? substation.name : substationId;
                const countryName = substation?.countryName;
                if (countryName) {
                    name += ' \u002D ' + countryName;
                }
                const svgUrl = checkAndGetSubstationSingleLineDiagramUrl(substationId);

                return {
                    id: substationId,
                    ref: React.createRef(),
                    state,
                    name,
                    svgType: SvgType.SUBSTATION,
                    svgUrl,
                };
            }

            function createVoltageLevelSLD(vlId, state) {
                const vl = network.getVoltageLevel(vlId);
                if (!vl) return;
                let name = useName ? vl.name : vlId;

                const substation = network.getSubstation(vlId);
                const countryName = substation?.countryName;
                if (countryName) {
                    name += ' \u002D ' + countryName;
                }
                const svgUrl = checkAndGetVoltageLevelSingleLineDiagramUrl(vlId);

                return {
                    id: vlId,
                    ref: React.createRef(),
                    state,
                    name,
                    svgUrl,
                    svgType: SvgType.VOLTAGE_LEVEL,
                    substationId: substation?.id,
                };
            }

            function createNetworkAreaDiagram(state, depth=0) { // TODO CHARLY en cours de remix
                let displayedVoltageLevels = [];
                let nadTitle = '';
                if (voltageLevelsIdsForNad) {
                    voltageLevelsIdsForNad.forEach((id) =>
                        displayedVoltageLevels.push(network.getVoltageLevel(id))
                    );
                }

                if (displayedVoltageLevels.length === 0) return;
                displayedVoltageLevels.forEach((vl) => {
                    const name = useName && vl?.name ? vl?.name : vl?.id;
                    if (name !== undefined) {
                        nadTitle = nadTitle + (nadTitle !== '' ? ' + ' : '') + name;
                    }
                });

                const svgUrl = checkAndGetNetworkAreaDiagramUrl(voltageLevelsIdsForNad, depth); // TODO CHARLY passer le depth correctement

                return {
                    id: nadTitle,
                    ref: React.createRef(),
                    state,
                    nadTitle,
                    svgUrl,
                    svgType: SvgType.NETWORK_AREA_DIAGRAM,
                };
            }

            if (!network) return;
            if (view.svgType === SvgType.VOLTAGE_LEVEL)
                return createVoltageLevelSLD(view.id, view.state);
            else if (view.svgType === SvgType.SUBSTATION)
                return createSubstationSLD(view.id, view.state);
            else if (view.svgType === SvgType.NETWORK_AREA_DIAGRAM)
                return createNetworkAreaDiagram(view.state);
            else {
                console.error("diagram-pane:useDisplayView => Missing view.svgType !");
            }
        },
        [
            network,
            useName,
            checkAndGetSubstationSingleLineDiagramUrl,
            checkAndGetVoltageLevelSingleLineDiagramUrl,
            checkAndGetNetworkAreaDiagramUrl,
            voltageLevelsIdsForNad,
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
    // OLD SLD

    const studyUpdatedForce = useSelector((state) => state.studyUpdated);

    const [updateSwitchMsg, setUpdateSwitchMsg] = useState('');

    const [views, setViews] = useState([]);
    const fullScreenSldId = useSelector((state) => state.fullScreenSldId);

    const [displayedDiagrams, setDisplayedDiagrams] = useState([]);
    const [displayedSldHeights, setDisplayedSldHeights] = useState([]);
    const displayedSldHeightsRef = useRef();
    displayedSldHeightsRef.current = displayedSldHeights;

    const createView = useDisplayView(network, studyUuid, currentNode);

    const dispatch = useDispatch();

    const diagramStates = useSelector((state) => state.diagramStates);

    const viewsRef = useRef();
    viewsRef.current = views;

    const [
        closeDiagramView,
        showVoltageLevelDiagramView,
        showSubstationDiagramView,
        showNetworkAreaDiagramView,
        togglePinDiagramView,
        minimizeDiagramView,
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

    // OLD NAD

    const useName = useSelector((state) => state[PARAM_USE_NAME]);
    const [depth, setDepth] = useState(0);

    const voltageLevelsIds = useSelector(
        (state) => state.voltageLevelsIdsForNad
    );
    //console.error("CHARLY state.voltageLevelsIdsForNad", voltageLevelsIds);

    const fullScreenNadId = useSelector((state) => state.fullScreenNadId);

    const displayedVoltageLevelIdRef = useRef();
    displayedVoltageLevelIdRef.current = voltageLevelsIds[0];

    let displayedVoltageLevels = [];
    let nadTitle = '';
    let nadUrl = '';

    if (visible) {
        if (network) {
            if (voltageLevelsIds) {
                voltageLevelsIds.forEach((id) =>
                    displayedVoltageLevels.push(network.getVoltageLevel(id))
                );
            }
        }

        if (displayedVoltageLevels.length > 0) {
            displayedVoltageLevels.forEach((vl) => {
                const name = useName && vl?.name ? vl?.name : vl?.id;
                if (name !== undefined) {
                    nadTitle = nadTitle + (nadTitle !== '' ? ' + ' : '') + name;
                }
            });

            nadUrl = getNetworkAreaDiagramUrl(
                studyUuid,
                currentNode?.id,
                voltageLevelsIds,
                depth
            );
        }
    }

    // OLD SLD

    useEffect(() => {// TODO CHARLY revoir cette fonction avec diagramStates à la place de sldState
        if (visible) {
            const viewsFromDiagramStates = [];
            console.error("CHARLY + + + diagramStates", diagramStates);
            diagramStates.forEach((currentState) => {
                let currentView = createView(currentState);
                // if current view cannot be found, it return undefined
                // in this case, we remove it from diagram states
                if (currentView) viewsFromDiagramStates.push(currentView);
                else {
                    closeDiagramView({id:currentState.id, svgType:currentState.svgType});
                }
            });

            if(voltageLevelsIds.length > 0) {

                let nadView = createView({ id:voltageLevelsIds[0], state: ViewState.OPENED, svgType: SvgType.NETWORK_AREA_DIAGRAM });

                viewsFromDiagramStates.push(nadView);
            }

            console.error("CHARLY - - - setViews en cours", viewsFromDiagramStates);
            setViews(viewsFromDiagramStates);
        }
    }, [diagramStates, visible, disabled, closeDiagramView, createView, dispatch,
        voltageLevelsIds // TODO CHARLY est-ce nécessaire ?
    ]);

    const handleOpenView = useCallback(
        (id, type) => {
            console.error("handleOpenView", id, type);
            if (!network) return;
            if (type === SvgType.VOLTAGE_LEVEL) showVoltageLevelDiagramView(id);
            else if (type === SvgType.SUBSTATION) showSubstationDiagramView(id);
            else if (type === SvgType.NETWORK_AREA_DIAGRAM) showNetworkAreaDiagramView(id);
            else {
                console.error("diagram-pane:handleOpenView => Missing type !");
                console.error("CHARLY => type : ", type);
            }
        },
        [network, showSubstationDiagramView, showVoltageLevelDiagramView, showNetworkAreaDiagramView]
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
                        console.error("closeDiagramView from diagram-pane:useEffect");
                        closeDiagramView([...vlToClose, deletedId]); // TODO NOW ajouter type ici
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
    }, [studyUpdatedForce, dispatch, studyUuid, updateSld, closeDiagramView, network]);

    useEffect(() => {
        //console.error("CHARLY update displayedDiagram via views", views);
        setDisplayedDiagrams(
            views.filter((view) =>
                [ViewState.OPENED, ViewState.PINNED].includes(view.state)
            )
        );
    }, [views]);

    const displayedIds = new Set(displayedDiagrams.map(({ id }) => id));
    const minimized = views.filter(({ id }) => !displayedIds.has(id));
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
                        {displayedDiagrams.map((diagram) => (
                            <Diagram
                                computedHeight={computedHeight}
                                diagramTitle={getNameOrId(diagram)}
                                disabled={disabled}
                                isComputationRunning={isComputationRunning}
                                key={diagram.id}
                                loadFlowStatus={loadFlowStatus}
                                numberToDisplay={displayedDiagrams.length}
                                onBreakerClick={handleUpdateSwitchState}
                                //onClose={handleCloseDiagram}
                                onMinimize={minimizeDiagramView}
                                onNextVoltageLevelClick={handleOpenView}
                                onTogglePin={togglePinDiagramView}
                                pinned={diagram.state === ViewState.PINNED}
                                ref={diagram.ref}
                                setDisplayedDiagramHeights={
                                    setDisplayedSldHeights
                                }
                                showInSpreadsheet={showInSpreadsheet}
                                diagramId={diagram.id}
                                svgType={diagram.svgType}
                                svgUrl={diagram.svgUrl}
                                totalHeight={height}
                                totalWidth={width}
                                updateSwitchMsg={updateSwitchMsg}
                            />
                        ))}
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={1}
                            className={classes.minimizedSLD}
                            style={{
                                display: !fullScreenSldId ? '' : 'none',
                            }}
                        >
                            {minimized.map((view) => (
                                <Chip
                                    key={view.id}
                                    icon={<ArrowUpwardIcon />}
                                    label={getNameOrId(view)}
                                    onClick={() =>
                                        handleOpenView(view.id, view.svgType) // TODO CHARLY A voir : est-ce qu'on doit passer par le handler ou bien on peut simplifier comme pour le close juste en dessous ?
                                    }
                                    onDelete={() => closeDiagramView({id:view.id, svgType:view.svgType})}
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
    //onClose: PropTypes.func,
    onNextVoltageLevelClick: PropTypes.func,
    disabled: PropTypes.bool,
    visible: PropTypes.bool,
};
