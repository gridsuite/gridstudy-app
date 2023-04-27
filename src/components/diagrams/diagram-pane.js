/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    PARAM_CENTER_LABEL,
    PARAM_COMPONENT_LIBRARY,
    PARAM_DIAGONAL_LABEL,
    PARAM_LANGUAGE,
    PARAM_SUBSTATION_LAYOUT,
    PARAM_USE_NAME,
} from '../../utils/config-params';
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
                if (!substation) {
                    return;
                }
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
                    svgType: DiagramType.SUBSTATION,
                };
            }

            function createVoltageLevelDiagramView(id, state) {
                const voltageLevel = network.getVoltageLevel(id);
                if (!voltageLevel) {
                    return;
                }
                let label = getNameOrId(voltageLevel);
                const substation = network.getSubstation(
                    voltageLevel.substationId
                );
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
                    svgType: DiagramType.VOLTAGE_LEVEL,
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

                if (displayedVoltageLevels.length === 0) {
                    return;
                }
                displayedVoltageLevels.forEach((voltageLevel) => {
                    const name = getNameOrId(voltageLevel);
                    if (name !== null) {
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
                    svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                };
            }

            if (!network) {
                return;
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
    const [views, setViews] = useState([]);
    const fullScreenDiagram = useSelector((state) => state.fullScreenDiagram);
    const createView = useDisplayView(network, studyUuid, currentNode);
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
    const classes = useStyles();
    const [warnings, setWarnings] = useState(new Map());

    /**
     * BUILDS THE DIAGRAMS LIST
     */

    // Here, the goal is to build a list of view, each view corresponding to a diagram.
    // We get the diagram data from the redux store.
    // In the case of SLD, each SLD corresponds to one view, but in the case of NAD, each open NAD is merged
    // into one view.
    useEffect(() => {
        if (
            !visible ||
            isNodeInNotificationList(currentNode, notificationIdList)
        ) {
            return;
        }
        const diagramViews = [];
        const networkAreaIds = [];
        let networkAreaViewState = ViewState.OPENED;

        diagramStates.forEach((diagramState) => {
            if (diagramState.svgType === DiagramType.NETWORK_AREA_DIAGRAM) {
                networkAreaIds.push(diagramState.id);
                networkAreaViewState = diagramState.state; // They should all be the same value
            } else {
                let singleLineDiagramView = createView(diagramState);
                // if current view cannot be found, it returns undefined
                // in this case, we keep it in the diagram states and show a warning message inside the SLD
                if (singleLineDiagramView) {
                    diagramViews.push({
                        ...singleLineDiagramView,
                        align: 'left',
                    });
                } else {
                    // because current view cannot be found, the id will be assigned to the name.
                    const emptyDiagramView = {
                        ...diagramState,
                        name: diagramState?.id,
                        // this variable is used to show a warning message inside the SLD
                        warningMessage:
                            DiagramType.VOLTAGE_LEVEL === diagramState.svgType
                                ? 'VoltageLevelNotFound'
                                : 'SubstationNotFound',
                    };

                    diagramViews.push({
                        ...emptyDiagramView,
                        align: 'left',
                    });
                }
            }
        });

        if (networkAreaIds.length > 0) {
            let networkAreaDiagramView = createView({
                ids: networkAreaIds,
                state: networkAreaViewState,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                depth: networkAreaDiagramDepth,
            });

            // if current view cannot be found, it returns undefined
            // in this case, we remove all the NAD from diagram states
            if (networkAreaDiagramView) {
                diagramViews.push({
                    ...networkAreaDiagramView,
                    align: 'right',
                });
            } else {
                closeDiagramView(null, DiagramType.NETWORK_AREA_DIAGRAM); // In this case, the ID is irrelevant
            }
        }
        setViews(diagramViews);
        setWarnings(new Map());
    }, [
        diagramStates,
        visible,
        closeDiagramView,
        createView,
        networkAreaDiagramDepth,
        currentNode,
        notificationIdList,
    ]);

    const viewsRef = useRef();
    viewsRef.current = views;

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

    // Updates a particular SLD diagram or every diagram for the current node
    const updateDiagram = useCallback((id) => {
        if (id) {
            viewsRef.current
                .find(
                    (diagramView) =>
                        diagramView.id === id &&
                        diagramView.svgType !== DiagramType.NETWORK_AREA_DIAGRAM
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
        studyUuid,
        updateDiagram,
        closeDiagramViews,
        network,
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

    const handleWarning = (id, message) => {
        // Add the id of the diagramView and the warning to display.
        setWarnings(
            (prev) => new Map(prev.set(id, disabled ? 'InvalidNode' : message))
        );
    };

    const handleWarningToDisplay = (diagramView) => {
        // First, check if the node is built(the highest priority) then do the warning checks..
        if (disabled) {
            return 'InvalidNode';
        }
        if (diagramView?.warningMessage) {
            return diagramView?.warningMessage;
        }
        return warnings.has(diagramView.id)
            ? warnings.get(diagramView.id)
            : undefined;
    };

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
                                        ref={diagramView.ref}
                                        loadFlowStatus={loadFlowStatus}
                                        svgUrl={diagramView.svgUrl}
                                        isComputationRunning={
                                            isComputationRunning
                                        }
                                        setWarning={handleWarning}
                                        showInSpreadsheet={showInSpreadsheet}
                                        studyUuid={studyUuid}
                                        diagramId={diagramView.id}
                                        svgType={diagramView.svgType}
                                        diagramSizeSetter={setDiagramSize}
                                    />
                                )}
                                {diagramView.svgType ===
                                    DiagramType.NETWORK_AREA_DIAGRAM && (
                                    <NetworkAreaDiagramContent
                                        ref={diagramView.ref}
                                        loadFlowStatus={loadFlowStatus}
                                        svgUrl={diagramView.svgUrl}
                                        diagramId={diagramView.id}
                                        svgType={diagramView.svgType}
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
    disabled: PropTypes.bool,
    visible: PropTypes.bool,
};
