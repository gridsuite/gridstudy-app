/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    PARAM_CENTER_LABEL,
    PARAM_COMPONENT_LIBRARY,
    PARAM_DIAGONAL_LABEL,
    PARAM_LANGUAGE,
    PARAM_SUBSTATION_LAYOUT,
    PARAM_USE_NAME,
} from '../../utils/config-params';
import {
    fetchSvg,
    getSubstationSingleLineDiagram,
    getVoltageLevelSingleLineDiagram,
    getNetworkAreaDiagramUrl,
} from '../../utils/rest-api';
import PropTypes from 'prop-types';
import { Chip, Stack } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import TimelineIcon from '@mui/icons-material/Timeline';
import makeStyles from '@mui/styles/makeStyles';
import {
    useDiagram,
    ViewState,
    DiagramType,
    DEFAULT_WIDTH_SUBSTATION,
    DEFAULT_WIDTH_VOLTAGE_LEVEL,
    DEFAULT_HEIGHT_SUBSTATION,
    DEFAULT_HEIGHT_VOLTAGE_LEVEL,
    DEFAULT_WIDTH_NETWORK_AREA_DIAGRAM,
    DEFAULT_HEIGHT_NETWORK_AREA_DIAGRAM,
    MAP_BOTTOM_OFFSET,
    DIAGRAM_MAP_RATIO_MIN_PERCENTAGE,
    NoSvg,
} from './diagram-common';
import {
    isNodeBuilt,
    isNodeInNotificationList,
} from '../graph/util/model-functions';
import { AutoSizer } from 'react-virtualized';
import Diagram from './diagram';
import { SLD_DISPLAY_MODE } from '../network/constants';
import clsx from 'clsx';
import { useNameOrId } from '../utils/equipmentInfosHandler';
import { syncDiagramStateWithSessionStorage } from '../../redux/session-storage';
import { sortByAlign } from '../utils/sort-functions';
import SingleLineDiagramContent from './singleLineDiagram/single-line-diagram-content';
import NetworkAreaDiagramContent from './networkAreaDiagram/network-area-diagram-content';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { setNetworkAreaDiagramNbVoltageLevels } from '../../redux/actions';
import { useIntl } from 'react-intl';

// Returns a callback that returns a promise
const useDisplayView = (studyUuid, currentNode) => {
    const { snackError } = useSnackMessage();
    const dispatch = useDispatch();
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

    // this callback returns a promise
    const fetchSvgData = useCallback(
        (svgUrl, svgType) => {
            if (svgUrl) {
                return fetchSvg(svgUrl)
                    .then((data) => {
                        if (data !== null) {
                            return {
                                svg: data.svg,
                                metadata: data.metadata,
                                additionalMetadata: data.additionalMetadata,
                                error: null,
                            };
                        } else {
                            return NoSvg;
                        }
                    })
                    .catch((error) => {
                        console.error(
                            'Error while fetching SVG',
                            error.message
                        );
                        let errorMessage;
                        if (error.status === 404) {
                            if (svgType === DiagramType.SUBSTATION) {
                                errorMessage = 'SubstationNotFound';
                            }
                            // if VL (SLD or NAD)
                            else {
                                errorMessage = 'VoltageLevelNotFound';
                            }
                        } else {
                            snackError({
                                headerId: 'svgLoadingFail',
                            });
                        }
                        return {
                            svg: null,
                            metadata: null,
                            additionalMetadata: null,
                            error: errorMessage,
                        };
                    });
            } else {
                return Promise.resolve(NoSvg);
            }
        },
        [snackError]
    );

    // this callback returns a promise
    return useCallback(
        (diagramState) => {
            if (!studyUuid || !currentNode) {
                return Promise.reject();
            }

            function createSubstationDiagramView(id, state) {
                const svgUrl = checkAndGetSubstationSingleLineDiagramUrl(id);
                return fetchSvgData(svgUrl, DiagramType.SUBSTATION).then(
                    (svg) => {
                        let label = getNameOrId(svg.additionalMetadata) ?? id;
                        const countryName = svg.additionalMetadata?.countryName;
                        if (countryName) {
                            label += ' - ' + countryName;
                        }
                        return {
                            id: id,
                            nodeId: currentNode.id,
                            state: state,
                            name: label,
                            fetchSvg: () =>
                                fetchSvgData(svgUrl, DiagramType.SUBSTATION),
                            svgType: DiagramType.SUBSTATION,
                            ...svg,
                        };
                    }
                );
            }

            function createVoltageLevelDiagramView(id, state) {
                const svgUrl = checkAndGetVoltageLevelSingleLineDiagramUrl(id);
                return fetchSvgData(svgUrl, DiagramType.VOLTAGE_LEVEL).then(
                    (svg) => {
                        let label = getNameOrId(svg.additionalMetadata) ?? id;
                        let substationId = svg.additionalMetadata?.substationId;
                        const countryName = svg.additionalMetadata?.countryName;
                        if (countryName) {
                            label += ' - ' + countryName;
                        }
                        return {
                            id: id,
                            nodeId: currentNode.id,
                            state: state,
                            name: label,
                            fetchSvg: () =>
                                fetchSvgData(svgUrl, DiagramType.VOLTAGE_LEVEL),
                            svgType: DiagramType.VOLTAGE_LEVEL,
                            substationId: substationId,
                            ...svg,
                        };
                    }
                );
            }

            function createNetworkAreaDiagramView(ids, state, depth = 0) {
                if (ids?.length) {
                    const svgUrl = checkAndGetNetworkAreaDiagramUrl(ids, depth);
                    return fetchSvgData(
                        svgUrl,
                        DiagramType.NETWORK_AREA_DIAGRAM
                    ).then((svg) => {
                        let nadTitle = '';
                        let substationsIds = [];
                        svg.additionalMetadata?.voltageLevels.forEach(
                            (voltageLevel) => {
                                const name = getNameOrId(voltageLevel);
                                if (name !== null) {
                                    nadTitle +=
                                        (nadTitle !== '' ? ' + ' : '') + name;
                                }
                                substationsIds.push(voltageLevel.substationId);
                            }
                        );
                        if (nadTitle === '') {
                            nadTitle = ids.toString();
                        }
                        dispatch(
                            setNetworkAreaDiagramNbVoltageLevels(
                                svg.metadata?.nbVoltageLevels
                            )
                        );
                        return {
                            id: ids[0],
                            ids: ids,
                            nodeId: currentNode.id,
                            state: state,
                            name: nadTitle,
                            fetchSvg: () =>
                                fetchSvgData(
                                    svgUrl,
                                    DiagramType.NETWORK_AREA_DIAGRAM
                                ),
                            svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                            depth: depth,
                            substationIds: substationsIds,
                            ...svg,
                        };
                    });
                }
            }

            if (diagramState.svgType === DiagramType.VOLTAGE_LEVEL) {
                return createVoltageLevelDiagramView(
                    diagramState.id,
                    diagramState.state
                );
            } else if (diagramState.svgType === DiagramType.SUBSTATION) {
                return createSubstationDiagramView(
                    diagramState.id,
                    diagramState.state
                );
            } else if (
                diagramState.svgType === DiagramType.NETWORK_AREA_DIAGRAM
            ) {
                return createNetworkAreaDiagramView(
                    diagramState.ids,
                    diagramState.state,
                    diagramState.depth
                );
            }
        },
        [
            checkAndGetSubstationSingleLineDiagramUrl,
            checkAndGetVoltageLevelSingleLineDiagramUrl,
            checkAndGetNetworkAreaDiagramUrl,
            getNameOrId,
            studyUuid,
            currentNode,
            fetchSvgData,
            dispatch,
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
    visible,
}) {
    const intl = useIntl();
    const studyUpdatedForce = useSelector((state) => state.studyUpdated);
    const [views, setViews] = useState([]);
    const fullScreenDiagram = useSelector((state) => state.fullScreenDiagram);
    const createView = useDisplayView(studyUuid, currentNode);
    const diagramStates = useSelector((state) => state.diagramStates);
    const networkAreaDiagramDepth = useSelector(
        (state) => state.networkAreaDiagramDepth
    );
    const notificationIdList = useSelector((state) => state.notificationIdList);
    const [diagramContentSizes, setDiagramContentSizes] = useState(new Map()); // When a diagram content gets its size from the backend, it will update this map of sizes.

    useEffect(() => {
        syncDiagramStateWithSessionStorage(diagramStates, studyUuid);
    }, [diagramStates, studyUuid]);

    const { openDiagramView, closeDiagramView, closeDiagramViews } =
        useDiagram();
    const currentNodeRef = useRef();
    currentNodeRef.current = currentNode;
    const viewsRef = useRef([]);
    viewsRef.current = views;
    const classes = useStyles();

    /**
     * BUILDS THE DIAGRAMS LIST
     *
     * Here, the goal is to build a list of views, each view corresponding to a diagram.
     * We get the diagrams from the redux store.
     * In the case of SLD, each SLD corresponds to one view, but in the case of NAD,
     * each opened NAD is merged into one view.
     */

    // Check if we need to add new SLDs in the 'views' and add them if necessary
    const addMissingSLDs = useCallback(
        (diagramStates) => {
            // We check if we need to add new diagrams
            const diagramsToAdd = [];
            diagramStates.forEach((diagramState) => {
                if (diagramState.svgType !== DiagramType.NETWORK_AREA_DIAGRAM) {
                    const diagramAlreadyPresentInViews = viewsRef.current.find(
                        (diagramView) =>
                            diagramView.svgType !==
                                DiagramType.NETWORK_AREA_DIAGRAM &&
                            diagramView.id === diagramState.id
                    );
                    if (!diagramAlreadyPresentInViews) {
                        diagramsToAdd.push({
                            ...diagramState,
                            name: intl.formatMessage(
                                { id: 'LoadingOf' },
                                { value: diagramState.id }
                            ),
                            align: 'left',
                            loadingState: true,
                        });
                    }
                }
            });

            // If we found diagrams to add, we add them
            if (diagramsToAdd?.length) {
                // First we add the empty diagrams in the views
                setViews((views) => {
                    const updatedViews = views
                        .concat(diagramsToAdd)
                        .sort(sortByAlign);
                    return updatedViews;
                });

                // Then we add the data when the fetch is finished
                diagramsToAdd.forEach((diagramState) => {
                    createView(diagramState).then((singleLineDiagramView) => {
                        setViews((views) => {
                            const diagramViewId = views.findIndex(
                                (view) =>
                                    view.svgType !==
                                        DiagramType.NETWORK_AREA_DIAGRAM &&
                                    view.id === diagramState.id
                            );
                            const updatedViews = views.slice();
                            // we update the SLD with the fetched data
                            updatedViews[diagramViewId] = {
                                ...updatedViews[diagramViewId],
                                ...singleLineDiagramView,
                                loadingState: false,
                            };
                            return updatedViews;
                        });
                    });
                });
            }
        },
        [createView, intl]
    );

    // Check if we need to remove old SLDs from the 'views' and remove them if necessary
    const removeObsoleteSLDs = useCallback((diagramStates) => {
        // We check if we need to remove old diagrams
        const diagramIdsToRemove = [];
        viewsRef.current.forEach((diagramView) => {
            if (diagramView.svgType !== DiagramType.NETWORK_AREA_DIAGRAM) {
                const diagramStillPresentInRedux = diagramStates.find(
                    (diagramState) =>
                        diagramState.svgType !==
                            DiagramType.NETWORK_AREA_DIAGRAM &&
                        diagramState.id === diagramView.id
                );
                if (!diagramStillPresentInRedux) {
                    diagramIdsToRemove.push(diagramView.id);
                }
            }
        });

        // If we found diagrams to remove, we remove them
        if (diagramIdsToRemove?.length) {
            setViews((views) => {
                const updatedViews = views.filter(
                    (view) =>
                        view.svgType === DiagramType.NETWORK_AREA_DIAGRAM ||
                        !diagramIdsToRemove.includes(view.id)
                );
                return updatedViews;
            });
        }
    }, []);

    // Check if we need to remove or add SLDs
    const updateSLDs = useCallback(
        (diagramStates) => {
            removeObsoleteSLDs(diagramStates);
            addMissingSLDs(diagramStates);
        },
        [removeObsoleteSLDs, addMissingSLDs]
    );

    // Add a new NAD in the 'views' (if a NAD is already present, we replace it)
    const addOrReplaceNAD = useCallback(
        (networkAreaIds, networkAreaViewState, networkAreaDiagramDepth) => {
            // First we add the empty diagram in the views
            setViews((views) => {
                const newDiagram = {
                    name: intl.formatMessage(
                        { id: 'LoadingOf' },
                        { value: networkAreaIds.toString() }
                    ),
                    state: networkAreaViewState,
                    svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                    align: 'right',
                    loadingState: true,
                };
                const updatedViews = views.slice();
                // if we already have a NAD, we replace it but keep the same object to avoid resizing
                if (
                    views.find(
                        (view) =>
                            view.svgType === DiagramType.NETWORK_AREA_DIAGRAM
                    )
                ) {
                    updatedViews[views.length - 1] = {
                        ...updatedViews[views.length - 1], // trick to avoid resizing
                        ...newDiagram,
                    };
                }
                // otherwise we just add a new one
                else {
                    updatedViews.push(newDiagram);
                }
                return updatedViews;
            });

            // Then we add the data when the fetch is finished
            createView({
                ids: networkAreaIds,
                state: networkAreaViewState,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                depth: networkAreaDiagramDepth,
            }).then((networkAreaDiagramView) => {
                setViews((views) => {
                    const updatedViews = views.slice();
                    // the NAD is always in last position
                    updatedViews[updatedViews.length - 1] = {
                        ...updatedViews[updatedViews.length - 1],
                        ...networkAreaDiagramView,
                        loadingState: false,
                    };
                    return updatedViews;
                });
            });
        },
        [createView, intl]
    );

    const removeNAD = useCallback(() => {
        setViews((views) => {
            const updatedViews = views.filter(
                (view) => view.svgType !== DiagramType.NETWORK_AREA_DIAGRAM
            );
            return updatedViews;
        });
    }, []);

    const updateNAD = useCallback(
        (diagramStates) => {
            const networkAreaIds = [];
            let networkAreaViewState = ViewState.OPENED;
            diagramStates.forEach((diagramState) => {
                if (diagramState.svgType === DiagramType.NETWORK_AREA_DIAGRAM) {
                    networkAreaIds.push(diagramState.id);
                    networkAreaViewState = diagramState.state; // They should all be the same value
                }
            });
            if (networkAreaIds.length > 0) {
                const isSameNadAlreadyPresentInViews = viewsRef.current.find(
                    (diagramView) =>
                        diagramView.svgType ===
                            DiagramType.NETWORK_AREA_DIAGRAM &&
                        diagramView.ids?.toString() ===
                            networkAreaIds.toString() &&
                        diagramView.depth === networkAreaDiagramDepth
                );
                if (!isSameNadAlreadyPresentInViews) {
                    addOrReplaceNAD(
                        networkAreaIds,
                        networkAreaViewState,
                        networkAreaDiagramDepth
                    );
                }
            } else if (
                viewsRef.current.find(
                    (diagramView) =>
                        diagramView.svgType === DiagramType.NETWORK_AREA_DIAGRAM
                )
            ) {
                // no more NAD, remove it from the views
                removeNAD();
            }
        },
        [addOrReplaceNAD, removeNAD, networkAreaDiagramDepth]
    );

    // Update the state of the diagrams (opened, minimized, etc) in the 'views'
    const updateDiagramStates = useCallback((diagramStates) => {
        // We check if we need to update some diagrams
        let diagramsToUpdate = [];
        diagramStates.forEach((diagramState) => {
            // if SLD
            if (diagramState.svgType !== DiagramType.NETWORK_AREA_DIAGRAM) {
                const diagramIndex = viewsRef.current.findIndex(
                    (diagramView) =>
                        diagramView.svgType !==
                            DiagramType.NETWORK_AREA_DIAGRAM &&
                        diagramView.id === diagramState.id &&
                        diagramView.state !== diagramState.state
                );
                // if we found a diagram with a new state (ex : minimized)
                if (diagramIndex > -1) {
                    diagramsToUpdate.push({
                        index: diagramIndex,
                        state: diagramState.state,
                    });
                }
            }
            // if NAD
            else {
                // no need to check the ID because we have only one NAD in the views
                // diagramIndex can only be -1 (if no match) or viewsRef.current.length - 1 (if match)
                const diagramIndex = viewsRef.current.findIndex(
                    (diagramView) =>
                        diagramView.svgType ===
                            DiagramType.NETWORK_AREA_DIAGRAM &&
                        diagramView.state !== diagramState.state
                );
                // if the NAD has a new state (all NAD are supposed to have the same state)
                if (
                    diagramIndex > -1 &&
                    // we don't want to add it twice
                    !diagramsToUpdate.find(
                        (diagram) => diagram.index === diagramIndex
                    )
                ) {
                    diagramsToUpdate.push({
                        index: diagramIndex,
                        state: diagramState.state,
                    });
                }
            }
        });

        // If we found diagrams to update, we update them
        if (diagramsToUpdate?.length) {
            setViews((views) => {
                let updatedViews = views.slice();
                diagramsToUpdate.forEach((diagramInfo) => {
                    updatedViews[diagramInfo.index] = {
                        ...updatedViews[diagramInfo.index],
                        state: diagramInfo.state,
                    };
                });
                return updatedViews;
            });
        }
    }, []);

    // UPDATE DIAGRAM VIEWS
    useEffect(() => {
        if (
            !visible ||
            !currentNode ||
            isNodeInNotificationList(currentNode, notificationIdList)
        ) {
            return;
        }
        // UPDATING DIAGRAM STATES (before removing or adding new diagrams, for both SLDs and NAD)
        updateDiagramStates(diagramStates);
        // SLD MANAGEMENT (adding or removing SLDs)
        updateSLDs(diagramStates);
        // NAD MANAGEMENT (adding, removing or updating the NAD)
        updateNAD(diagramStates);
    }, [
        diagramStates,
        visible,
        currentNode,
        notificationIdList,
        updateDiagramStates,
        updateSLDs,
        updateNAD,
    ]);

    const displayedDiagrams = views
        .filter((view) =>
            [ViewState.OPENED, ViewState.PINNED].includes(view.state)
        )
        .sort(sortByAlign);
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

    // Updates particular diagrams from their IDs
    const updateDiagramsByIds = useCallback(
        (ids, fromScratch) => {
            if (ids?.length) {
                // Before we get the results, we set loadingState = true
                setViews((views) => {
                    const updatedViews = views.slice();
                    for (let i = 0; i < views.length; i++) {
                        const currentView = views[i];
                        if (ids.includes(currentView.id)) {
                            updatedViews[i] = {
                                ...updatedViews[i],
                                loadingState: true,
                            };
                        }
                    }
                    return updatedViews;
                });
                // Then we add the data once we have it
                for (let i = 0; i < viewsRef.current.length; i++) {
                    const currentView = viewsRef.current[i];
                    if (ids.includes(currentView.id)) {
                        let updatedDiagramPromise;
                        if (fromScratch) {
                            updatedDiagramPromise = createView(currentView);
                        } else {
                            updatedDiagramPromise = currentView.fetchSvg();
                        }
                        updatedDiagramPromise.then((svg) => {
                            setViews((views) => {
                                const updatedViews = views.slice();
                                updatedViews[i] = {
                                    ...updatedViews[i],
                                    ...svg,
                                    loadingState: false,
                                };
                                return updatedViews;
                            });
                        });
                    }
                }
            }
        },
        [createView]
    );

    // Updates particular diagrams from the current node
    const updateDiagramsByCurrentNode = useCallback(() => {
        // We search the diagrams based on the current node's ID to determine if the diagram should be updated
        let idsToUpdate = viewsRef.current
            .filter(
                (diagramView) =>
                    diagramView.nodeId === currentNodeRef.current?.id
            )
            .map((diagramView) => diagramView.id);
        if (idsToUpdate?.length) {
            // we remove duplicates (because of NAD)
            idsToUpdate = idsToUpdate.filter(
                (id, index) => idsToUpdate.indexOf(id) === index
            );
            updateDiagramsByIds(idsToUpdate, false);
        }
    }, [updateDiagramsByIds]);

    // When the current node change, we reset all the diagrams
    useEffect(() => {
        let allDiagramIds = viewsRef.current.map((view) => view.id);
        // we remove duplicates (because of NAD)
        allDiagramIds = allDiagramIds.filter(
            (id, index) => allDiagramIds.indexOf(id) === index
        );
        updateDiagramsByIds(allDiagramIds, true);
    }, [currentNode, updateDiagramsByIds]);

    // This effect will trigger the diagrams' forced update
    useEffect(() => {
        if (studyUpdatedForce.eventData.headers) {
            if (
                studyUpdatedForce.eventData.headers['updateType'] === 'loadflow'
            ) {
                //TODO reload data more intelligently
                updateDiagramsByCurrentNode();
            } else if (
                studyUpdatedForce.eventData.headers['updateType'] === 'study'
            ) {
                // FM if we want to reload data more precisely we need more information from notifications
                updateDiagramsByCurrentNode();
            } else if (
                studyUpdatedForce.eventData.headers['updateType'] ===
                'buildCompleted'
            ) {
                if (
                    studyUpdatedForce.eventData.headers['node'] ===
                    currentNodeRef.current?.id
                ) {
                    updateDiagramsByCurrentNode();
                }
            }
        }
    }, [
        studyUpdatedForce,
        studyUuid,
        updateDiagramsByCurrentNode,
        updateDiagramsByIds,
        closeDiagramViews,
    ]);

    /**
     * DIAGRAM SIZE CALCULATION
     */

    // This function is called by the diagram's contents, when they get their sizes from the backend.
    const setDiagramSize = (diagramId, diagramType, width, height) => {
        // Let's update the stored values if they are new
        const storedValues = diagramContentSizes?.get(diagramType + diagramId);
        if (
            !storedValues ||
            storedValues.width !== width ||
            storedValues.height !== height
        ) {
            let newDiagramContentSizes = new Map(diagramContentSizes);
            newDiagramContentSizes.set(diagramType + diagramId, {
                width: width,
                height: height,
            });
            setDiagramContentSizes(newDiagramContentSizes);
        }
    };

    const getDefaultHeightByDiagramType = (diagramType) => {
        switch (diagramType) {
            case DiagramType.SUBSTATION:
                return DEFAULT_HEIGHT_SUBSTATION;
            case DiagramType.VOLTAGE_LEVEL:
                return DEFAULT_HEIGHT_VOLTAGE_LEVEL;
            case DiagramType.NETWORK_AREA_DIAGRAM:
                return DEFAULT_HEIGHT_NETWORK_AREA_DIAGRAM;
            default:
                console.warn('Unknown diagram type !');
                return 1;
        }
    };

    const getDefaultWidthByDiagramType = (diagramType) => {
        switch (diagramType) {
            case DiagramType.SUBSTATION:
                return DEFAULT_WIDTH_SUBSTATION;
            case DiagramType.VOLTAGE_LEVEL:
                return DEFAULT_WIDTH_VOLTAGE_LEVEL;
            case DiagramType.NETWORK_AREA_DIAGRAM:
                return DEFAULT_WIDTH_NETWORK_AREA_DIAGRAM;
            default:
                console.warn('Unknown diagram type !');
                return 1;
        }
    };

    const getDiagramOrDefaultHeight = useCallback(
        (diagramId, diagramType) => {
            return (
                diagramContentSizes.get(diagramType + diagramId)?.height ??
                getDefaultHeightByDiagramType(diagramType)
            );
        },
        [diagramContentSizes]
    );

    const getDiagramOrDefaultWidth = useCallback(
        (diagramId, diagramType) => {
            return (
                diagramContentSizes.get(diagramType + diagramId)?.width ??
                getDefaultWidthByDiagramType(diagramType)
            );
        },
        [diagramContentSizes]
    );

    const getRatioWidthByHeight = (width, height) => {
        if (Number(height) > 0) {
            return Number(width) / Number(height);
        }
        return 1.0;
    };

    /*
     * Finds the maximum height among the displayed diagrams for a specific svgType.
     * Voltage levels and substations will share their heights, whereas a network area
     * diagram will have its own height.
     */
    const getMaxHeightFromDisplayedDiagrams = useCallback(
        (svgType) => {
            // First, we check which diagrams are displayed in the pane with a compatible svgType
            // and for which we stored a height in diagramContentSizes.
            const matchingDiagrams = displayedDiagrams
                .filter(
                    (diagram) =>
                        svgType === diagram.svgType ||
                        (svgType !== DiagramType.NETWORK_AREA_DIAGRAM &&
                            diagram.svgType !==
                                DiagramType.NETWORK_AREA_DIAGRAM)
                )
                .filter((diagram) =>
                    diagramContentSizes.has(diagram.svgType + diagram.id)
                );

            // Then, we find the maximum height from these diagrams
            if (matchingDiagrams.length > 0) {
                return matchingDiagrams.reduce(
                    (maxFoundHeight, currentDiagram) =>
                        (maxFoundHeight || 1) >
                        diagramContentSizes.get(
                            currentDiagram.svgType + currentDiagram.id
                        ).height
                            ? maxFoundHeight
                            : diagramContentSizes.get(
                                  currentDiagram.svgType + currentDiagram.id
                              ).height,
                    1
                );
            }
            // If we found no matching diagram, we return the default value for this svgType.
            return getDefaultHeightByDiagramType(svgType);
        },
        [displayedDiagrams, diagramContentSizes]
    );

    /*
     * Calculate a diagram's ideal width, based on its original width/height ratio and the shared
     * heights of other diagrams with corresponding svgType (voltage levels and substations will
     * share their heights, whereas a network area diagram will have its own height).
     */
    const getWidthForPaneDisplay = useCallback(
        (diagramId, diagramType) => {
            const diagramWidth = getDiagramOrDefaultWidth(
                diagramId,
                diagramType
            );

            const diagramHeight = getDiagramOrDefaultHeight(
                diagramId,
                diagramType
            );

            return (
                getRatioWidthByHeight(diagramWidth, diagramHeight) *
                getMaxHeightFromDisplayedDiagrams(diagramType)
            );
        },
        [
            getMaxHeightFromDisplayedDiagrams,
            getDiagramOrDefaultWidth,
            getDiagramOrDefaultHeight,
        ]
    );

    /*
     * Calculate a diagram's ideal height, based on its natural height, the available space in
     * the pane, and the other diagrams' sizes.
     */
    const getHeightForPaneDisplay = useCallback(
        (diagramType, availableWidth, availableHeight) => {
            let result;

            const maxHeightFromDisplayedDiagrams =
                getMaxHeightFromDisplayedDiagrams(diagramType);

            // let's check if the total width of the displayed diagrams is greater than the
            // available space in the pane.
            // If it is, it means the diagram's content are compressed and their heights
            // should be shortened to keep their ratio correct.
            const totalWidthOfDiagrams = displayedDiagrams.reduce(
                (sum, currentDiagram) =>
                    sum +
                    (diagramContentSizes.get(
                        currentDiagram.svgType + currentDiagram.id
                    )?.width ?? getDefaultWidthByDiagramType(diagramType)),
                1
            );
            if (totalWidthOfDiagrams > availableWidth) {
                result =
                    maxHeightFromDisplayedDiagrams *
                    (availableWidth / totalWidthOfDiagrams);
            } else {
                result = maxHeightFromDisplayedDiagrams;
            }

            // Edge cases :

            // When opening a lot of diagrams, the total width of the displayed diagrams grows
            // with each new opened diagram and therefor their heights are shortened more and
            // more.
            // To prevent the diagrams from becoming too small, we stop shortening their height
            // under a threshold : a percentage of the pane's total height.
            if (result < availableHeight * DIAGRAM_MAP_RATIO_MIN_PERCENTAGE) {
                return availableHeight * DIAGRAM_MAP_RATIO_MIN_PERCENTAGE;
            }

            // If a diagram is too big, it could overlap the minimized diagrams on the bottom
            // of the pane and the map's other controls.
            // To prevent this, we restrict the diagrams' height to the total height of the pane
            // minus a fixed amount of pixels which are reserved for these controls and elements.
            if (result > availableHeight - MAP_BOTTOM_OFFSET) {
                return availableHeight - MAP_BOTTOM_OFFSET;
            }
            return result;
        },
        [
            displayedDiagrams,
            diagramContentSizes,
            getMaxHeightFromDisplayedDiagrams,
        ]
    );

    /**
     * RENDER
     */

    const handleWarningToDisplay = useCallback(
        (diagramView) => {
            if (!isNodeBuilt(currentNode)) {
                return 'InvalidNode';
            }
            if (diagramView?.error) {
                return diagramView.error;
            }
            return undefined;
        },
        [currentNode]
    );

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
                    {displayedDiagrams.map((diagramView, index, array) => (
                        <React.Fragment
                            key={diagramView.svgType + diagramView.id}
                        >
                            {
                                /*
                                We put a space (a separator) before the first right aligned diagram.
                                This space takes all the remaining space on screen and "pushes" the right aligned
                                diagrams to the right of the screen.
                                */
                                array[index]?.align === 'right' &&
                                    (index === 0 ||
                                        array[index - 1]?.align === 'left') && (
                                        <div
                                            className={classes.separator}
                                        ></div>
                                    )
                            }
                            <Diagram
                                align={diagramView.align}
                                diagramId={diagramView.id}
                                diagramTitle={diagramView.name}
                                warningToDisplay={handleWarningToDisplay(
                                    diagramView
                                )}
                                pinned={diagramView.state === ViewState.PINNED}
                                svgType={diagramView.svgType}
                                width={getWidthForPaneDisplay(
                                    diagramView.id,
                                    diagramView.svgType
                                )}
                                height={getHeightForPaneDisplay(
                                    diagramView.svgType,
                                    width,
                                    height
                                )}
                                fullscreenWidth={width}
                                fullscreenHeight={height}
                            >
                                {(diagramView.svgType ===
                                    DiagramType.VOLTAGE_LEVEL ||
                                    diagramView.svgType ===
                                        DiagramType.SUBSTATION) && (
                                    <SingleLineDiagramContent
                                        loadFlowStatus={loadFlowStatus}
                                        isComputationRunning={
                                            isComputationRunning
                                        }
                                        showInSpreadsheet={showInSpreadsheet}
                                        studyUuid={studyUuid}
                                        diagramId={diagramView.id}
                                        svg={diagramView.svg}
                                        svgType={diagramView.svgType}
                                        svgMetadata={diagramView.metadata}
                                        loadingState={diagramView.loadingState}
                                        diagramSizeSetter={setDiagramSize}
                                    />
                                )}
                                {diagramView.svgType ===
                                    DiagramType.NETWORK_AREA_DIAGRAM && (
                                    <NetworkAreaDiagramContent
                                        loadFlowStatus={loadFlowStatus}
                                        diagramId={diagramView.id}
                                        svg={diagramView.svg}
                                        svgType={diagramView.svgType}
                                        loadingState={diagramView.loadingState}
                                        diagramSizeSetter={setDiagramSize}
                                    />
                                )}
                            </Diagram>
                        </React.Fragment>
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
                                    DiagramType.NETWORK_AREA_DIAGRAM ? (
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
    visible: PropTypes.bool,
};
