/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import NetworkMap from './network/network-map';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {
    deleteEquipment,
    fetchLinePositions,
    fetchSubstationPositions,
} from '../utils/rest-api';
import GeoData from './network/geo-data';
import { equipments } from './network/network-equipments';
import withBranchMenu from './menus/branch-menu';
import BaseEquipmentMenu from './menus/base-equipment-menu';
import withEquipmentMenu from './menus/equipment-menu';
import VoltageLevelChoice from './voltage-level-choice';
import NominalVoltageFilter from './network/nominal-voltage-filter';
import makeStyles from '@mui/styles/makeStyles';
import OverloadedLinesView from './network/overloaded-lines-view';
import { RunButtonContainer } from './run-button-container';
import { useDispatch, useSelector } from 'react-redux';
import {
    PARAM_DISPLAY_OVERLOAD_TABLE,
    PARAM_MAP_MANUAL_REFRESH,
} from '../utils/config-params';
import { getLineLoadingZone, LineLoadingZone } from './network/line-layer';
import { useIntlRef, useSnackMessage } from '@gridsuite/commons-ui';
import {
    isNodeBuilt,
    isNodeReadOnly,
    isNodeRenamed,
} from './graph/util/model-functions';
import { RunningStatus } from './utils/running-status';
import { resetMapReloaded } from '../redux/actions';
import MapEquipments from './network/map-equipments';
import LinearProgress from '@mui/material/LinearProgress';
import { UPDATE_TYPE_HEADER } from './study-container';

const INITIAL_POSITION = [0, 0];

const useStyles = makeStyles((theme) => ({
    divNominalVoltageFilter: {
        position: 'absolute',
        right: 10,
        bottom: 30,
        zIndex: 0,
        '&:hover': {
            zIndex: 1,
        },
    },
    divRunButton: {
        position: 'absolute',
        right: 100,
        bottom: 30,
        marginLeft: 8,
        marginRight: 8,
        marginTop: 8,
    },
    divTemporaryGeoDataLoading: {
        position: 'absolute',
        width: '100%',
        zIndex: 1,
    },
    divOverloadedLineView: {
        right: 45,
        top: 10,
        minWidth: '600px',
        position: 'absolute',
        height: '70%',
        opacity: '1',
        flex: 1,
        pointerEvents: 'none',
    },
}));

export const NetworkMapTab = ({
    /* redux can be use as redux*/
    studyUuid,
    currentNode,
    /* results*/
    securityAnalysisStatus,
    runnable,
    loadFlowStatus,
    sensiStatus,
    shortCircuitStatus,
    dynamicSimulationStatus,
    /* visual*/
    visible,
    lineFullPath,
    lineParallelPath,
    lineFlowMode,
    lineFlowColorMode,
    lineFlowAlertThreshold,
    /* callbacks */
    openVoltageLevel,
    setIsComputationRunning,
    showInSpreadsheet,
    setErrorMessage,
}) => {
    const mapEquipments = useSelector((state) => state.mapEquipments);
    const studyUpdatedForce = useSelector((state) => state.studyUpdated);
    const dispatch = useDispatch();

    const intlRef = useIntlRef();
    const [isInitialized, setInitialized] = useState(false);
    const [waitingLoadData, setWaitingLoadData] = useState(true);

    const { snackError } = useSnackMessage();

    const [filteredNominalVoltages, setFilteredNominalVoltages] = useState();
    const [geoData, setGeoData] = useState();
    const geoDataRef = useRef();

    const basicDataReady = mapEquipments && geoData;

    const lineFullPathRef = useRef();

    /*
    This Set stores the geo data that are collected from the server AFTER the initialization.
    The bunch of geo data requested at the initialization of the map are stored as permanent data. It will not be requested again.
    The delta of geo data that is needed after the initialization is tagged as temporary. Each time some new geo data is requested, the full delta is downloaded.

    This workaround is required in the case of line/substation creation. By example, the position of a substation can change after being connected to one or two lines
    and this position would need to be requested again.
    It will be possible to have a better mechanism after we improved the notification system.
    */
    const temporaryGeoDataIdsRef = useRef();

    const displayOverloadTable = useSelector(
        (state) => state[PARAM_DISPLAY_OVERLOAD_TABLE]
    );
    const disabled = !visible || !isNodeBuilt(currentNode);
    const isCurrentNodeBuiltRef = useRef(isNodeBuilt(currentNode));

    const mapManualRefresh = useSelector(
        (state) => state[PARAM_MAP_MANUAL_REFRESH]
    );
    const refIsMapManualRefreshEnabled = useRef();
    refIsMapManualRefreshEnabled.current = mapManualRefresh;

    const reloadMapNeeded = useSelector((state) => state.reloadMap);

    const deletedEquipments = useSelector((state) => state.deletedEquipments);

    const updatedSubstationsIds = useSelector(
        (state) => state.updatedSubstationsIds
    );
    const [isUpdatedSubstationsApplied, setIsUpdatedSubstationsApplied] =
        useState(false);

    const [equipmentMenu, setEquipmentMenu] = useState({
        position: [-1, -1],
        equipment: null,
        equipmentType: null,
        display: null,
    });

    const [
        choiceVoltageLevelsSubstationId,
        setChoiceVoltageLevelsSubstationId,
    ] = useState(null);

    const [position, setPosition] = useState([-1, -1]);

    const classes = useStyles();
    const currentNodeRef = useRef(null);

    const [updatedLines, setUpdatedLines] = useState([]);
    const [updatedHvdcLines, setUpdatedHvdcLines] = useState([]);

    function withEquipment(Menu, props) {
        return (
            <Menu
                id={equipmentMenu.equipment.id}
                position={equipmentMenu.position}
                handleClose={closeEquipmentMenu}
                handleViewInSpreadsheet={handleViewInSpreadsheet}
                handleDeleteEquipment={handleDeleteEquipment}
                {...props}
            />
        );
    }

    const MenuBranch = withBranchMenu(BaseEquipmentMenu);

    const MenuSubstation = withEquipmentMenu(
        BaseEquipmentMenu,
        'substation-menus',
        equipments.substations
    );

    const MenuVoltageLevel = withEquipmentMenu(
        BaseEquipmentMenu,
        'voltage-level-menus',
        equipments.voltageLevels
    );

    function showEquipmentMenu(equipment, x, y, type) {
        setEquipmentMenu({
            position: [x, y],
            equipment: equipment,
            equipmentType: type,
            display: true,
        });
    }

    function closeEquipmentMenu() {
        setEquipmentMenu({
            display: false,
        });
    }

    function handleViewInSpreadsheet(equipmentType, equipmentId) {
        showInSpreadsheet({
            equipmentType: equipmentType,
            equipmentId: equipmentId,
        });
        closeEquipmentMenu();
    }

    const handleDeleteEquipment = useCallback(
        (equipmentType, equipmentId) => {
            deleteEquipment(
                studyUuid,
                currentNode?.id,
                equipmentType,
                equipmentId,
                undefined
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'UnableToDeleteEquipment',
                });
            });
            closeEquipmentMenu();
        },
        [studyUuid, currentNode?.id, snackError]
    );

    function closeChoiceVoltageLevelMenu() {
        setChoiceVoltageLevelsSubstationId(null);
    }

    function choiceVoltageLevel(voltageLevelId) {
        openVoltageLevel(voltageLevelId);
        closeChoiceVoltageLevelMenu();
    }

    const voltageLevelMenuClick = (equipment, x, y) => {
        showEquipmentMenu(equipment, x, y, equipments.voltageLevels);
    };

    const chooseVoltageLevelForSubstation = useCallback(
        (idSubstation, x, y) => {
            setChoiceVoltageLevelsSubstationId(idSubstation);
            setPosition([x, y]);
        },
        []
    );

    const getEquipmentsNotFoundIds = useCallback(
        (foundEquipmentPositions, allEquipments) => {
            const notFoundEquipmentsIds = allEquipments
                .filter(
                    (s) =>
                        !foundEquipmentPositions.has(s.id) ||
                        temporaryGeoDataIdsRef.current.has(s.id)
                )
                .map((s) => s.id);

            return notFoundEquipmentsIds;
        },
        []
    );

    const latLonEqual = (coordinate1, coordinate2) => {
        return (
            coordinate1?.lat === coordinate2?.lat &&
            coordinate1?.lon === coordinate2?.lon
        );
    };

    const substationPositionsAreEqual = useCallback(
        (substationPos1, substationPos2) => {
            return (
                latLonEqual(
                    substationPos1?.coordinate,
                    substationPos2?.coordinate
                ) && substationPos1?.country === substationPos2?.country
            );
        },
        []
    );

    const linePositionsAreEqual = useCallback((linePos1, linePos2) => {
        return (
            latLonEqual(
                linePos1?.coordinates?.[0],
                linePos2?.coordinates?.[0]
            ) &&
            latLonEqual(
                linePos1?.coordinates?.[1],
                linePos2?.coordinates?.[1]
            ) &&
            linePos1?.country1 === linePos2?.country1 &&
            linePos1?.country2 === linePos2?.country2 &&
            linePos1?.substationStart === linePos2?.substationStart &&
            linePos1?.substationEnd === linePos2?.substationEnd
        );
    }, []);

    const getMissingEquipmentsPositions = useCallback(
        (notFoundEquipmentsIds, fetchEquipmentCB) => {
            if (notFoundEquipmentsIds.length === 0) {
                return Promise.resolve([]);
            }

            return fetchEquipmentCB(
                studyUuid,
                currentNodeRef.current?.id,
                notFoundEquipmentsIds
            );
        },
        [studyUuid]
    );

    const updateSubstationsTemporaryGeoData = useCallback(
        (requestedPositions, fetchedPositions) => {
            let someDataHasChanged = false;
            fetchedPositions.forEach((pos) => {
                // If the geo data is the same in the geoData and in the server response, it's not updated
                const substationPosition =
                    geoDataRef.current.substationPositionsById.get(pos.id);
                if (
                    !(
                        substationPosition &&
                        substationPositionsAreEqual(substationPosition, pos)
                    )
                ) {
                    temporaryGeoDataIdsRef.current.add(pos.id);
                    someDataHasChanged = true;
                }
            });

            // If a substation position is requested but not present in the fetched results, its position will be deleted in updateSubstationPositions() and we have to flag here that a position has changed
            requestedPositions
                .filter(
                    (id) => !fetchedPositions.map((pos) => pos.id).includes(id)
                )
                .forEach((id) => {
                    if (geoDataRef.current.substationPositionsById.get(id)) {
                        someDataHasChanged = true;
                    }
                });

            return someDataHasChanged;
        },
        [substationPositionsAreEqual]
    );

    const updateLinesTemporaryGeoData = useCallback(
        (requestedPositions, fetchedPositions) => {
            let someDataHasChanged = false;
            fetchedPositions.forEach((pos) => {
                // If the geo data is the same in the geoData and in the server response, it's not updated
                const linePosition = geoDataRef.current.linePositionsById.get(
                    pos.id
                );
                if (
                    !(linePosition && linePositionsAreEqual(linePosition, pos))
                ) {
                    temporaryGeoDataIdsRef.current.add(pos.id);
                    someDataHasChanged = true;
                }
            });

            // If a line position is requested but not present in the fetched results, its position will be deleted in updateLinePositions() and we have to flag here that a position has changed
            requestedPositions
                .filter(
                    (id) => !fetchedPositions.map((pos) => pos.id).includes(id)
                )
                .forEach((id) => {
                    if (geoDataRef.current.linePositionsById.get(id)) {
                        someDataHasChanged = true;
                    }
                });
            return someDataHasChanged;
        },
        [linePositionsAreEqual]
    );

    const loadMissingGeoData = useCallback(() => {
        const notFoundSubstationIds = getEquipmentsNotFoundIds(
            geoDataRef.current.substationPositionsById,
            mapEquipments.substations
        );

        const notFoundLineIds = lineFullPath
            ? getEquipmentsNotFoundIds(
                  geoDataRef.current.linePositionsById,
                  mapEquipments.lines
              )
            : [];

        if (notFoundSubstationIds.length > 0 || notFoundLineIds.length > 0) {
            console.info(
                `Loading geo data of study '${studyUuid}' of missing substations '${notFoundSubstationIds}' and missing lines '${notFoundLineIds}'...`
            );
            setWaitingLoadData(true);

            const missingSubstationPositions = getMissingEquipmentsPositions(
                notFoundSubstationIds,
                fetchSubstationPositions
            );

            const missingLinesPositions = getMissingEquipmentsPositions(
                notFoundLineIds,
                fetchLinePositions
            );

            Promise.all([missingSubstationPositions, missingLinesPositions])
                .then((positions) => {
                    const [fetchedSubstationPositions, fetchedLinePositions] =
                        positions;
                    const substationsDataChanged =
                        updateSubstationsTemporaryGeoData(
                            notFoundSubstationIds,
                            fetchedSubstationPositions
                        );
                    const linesDataChanged = updateLinesTemporaryGeoData(
                        notFoundLineIds,
                        fetchedLinePositions
                    );

                    // If no geo data has changed, we avoid to trigger a new render.
                    if (substationsDataChanged || linesDataChanged) {
                        // If there is new substation positions and that their values are different from the ones that are stored, we instantiate a new Map so that the substations layer rendering is triggered.
                        // Same for line positions.
                        const newGeoData = new GeoData(
                            substationsDataChanged
                                ? new Map(
                                      geoDataRef.current.substationPositionsById
                                  )
                                : geoDataRef.current.substationPositionsById,
                            // If lineFullPath is off, we need to render the lines layer when there are some substation positions changed
                            linesDataChanged ||
                            (!lineFullPath && substationsDataChanged)
                                ? new Map(geoDataRef.current.linePositionsById)
                                : geoDataRef.current.linePositionsById
                        );
                        newGeoData.updateSubstationPositions(
                            notFoundSubstationIds,
                            fetchedSubstationPositions
                        );
                        newGeoData.updateLinePositions(
                            notFoundLineIds,
                            fetchedLinePositions
                        );
                        setGeoData(newGeoData);
                        geoDataRef.current = newGeoData;
                    }
                })
                .catch(function (error) {
                    console.error(error.message);
                    setErrorMessage(
                        intlRef.current.formatMessage(
                            { id: 'geoDataLoadingFail' },
                            { studyUuid: studyUuid }
                        )
                    );
                })
                .finally(() => setWaitingLoadData(false));
        }
    }, [
        intlRef,
        lineFullPath,
        setErrorMessage,
        studyUuid,
        getEquipmentsNotFoundIds,
        getMissingEquipmentsPositions,
        mapEquipments?.substations,
        mapEquipments?.lines,
        updateSubstationsTemporaryGeoData,
        updateLinesTemporaryGeoData,
    ]);

    const loadAllGeoData = useCallback(() => {
        console.info(`Loading geo data of study '${studyUuid}'...`);
        setWaitingLoadData(true);

        const substationPositionsDone = fetchSubstationPositions(
            studyUuid,
            currentNodeRef.current?.id
        ).then((data) => {
            console.info(`Received substations of study '${studyUuid}'...`);
            const newGeoData = new GeoData(
                new Map(),
                geoDataRef.current?.linePositionsById || new Map()
            );
            newGeoData.setSubstationPositions(data);
            setGeoData(newGeoData);
            geoDataRef.current = newGeoData;
        });

        const linePositionsDone = !lineFullPath
            ? Promise.resolve()
            : fetchLinePositions(studyUuid, currentNodeRef.current?.id).then(
                  (data) => {
                      console.info(`Received lines of study '${studyUuid}'...`);
                      const newGeoData = new GeoData(
                          geoDataRef.current?.substationPositionsById ||
                              new Map(),
                          new Map()
                      );
                      newGeoData.setLinePositions(data);
                      setGeoData(newGeoData);
                      geoDataRef.current = newGeoData;
                  }
              );

        Promise.all([substationPositionsDone, linePositionsDone])
            .then(() => {
                temporaryGeoDataIdsRef.current = new Set();
            })
            .catch(function (error) {
                console.error(error.message);
                setErrorMessage(
                    intlRef.current.formatMessage(
                        { id: 'geoDataLoadingFail' },
                        { studyUuid: studyUuid }
                    )
                );
            })
            .finally(() => setWaitingLoadData(false));
    }, [intlRef, lineFullPath, setErrorMessage, studyUuid]);

    const loadGeoData = useCallback(() => {
        if (studyUuid && currentNodeRef.current) {
            if (
                // To manage a lineFullPath param change, if lineFullPath=true and linePositions is empty, we load all the geo data.
                // This can be improved by loading only the lines geo data and not lines geo data + substations geo data when lineFullPath is changed to true.
                geoDataRef.current?.substationPositionsById.size > 0 &&
                (!lineFullPath || geoDataRef.current.linePositionsById.size > 0)
            ) {
                loadMissingGeoData();
            } else {
                loadAllGeoData();
            }
        }
    }, [studyUuid, loadAllGeoData, loadMissingGeoData, lineFullPath]);

    const loadMapEquipments = useCallback(() => {
        if (!isNodeBuilt(currentNode) || !studyUuid) {
            return;
        }
        new MapEquipments(
            studyUuid,
            currentNode?.id,
            setErrorMessage,
            dispatch,
            intlRef
        );
        dispatch(resetMapReloaded());
    }, [currentNode, dispatch, intlRef, setErrorMessage, studyUuid]);

    const updateMapEquipments = useCallback(
        (currentNodeAtReloadCalling) => {
            if (!isNodeBuilt(currentNode) || !studyUuid || !mapEquipments) {
                return Promise.reject();
            }
            console.info('Update map equipments');
            setWaitingLoadData(true);
            const updatedSubstationsToSend =
                !refIsMapManualRefreshEnabled.current &&
                !isUpdatedSubstationsApplied &&
                updatedSubstationsIds?.length > 0
                    ? updatedSubstationsIds
                    : undefined;

            if (updatedSubstationsToSend) {
                setIsUpdatedSubstationsApplied(true);
            }

            dispatch(resetMapReloaded());
            const isFullReload = updatedSubstationsToSend ? false : true;
            const [updatedSubstations, updatedLines, updatedHvdcLines] =
                mapEquipments.reloadImpactedSubstationsEquipments(
                    studyUuid,
                    currentNode,
                    updatedSubstationsToSend,
                    setUpdatedLines,
                    currentNodeAtReloadCalling
                );

            updatedSubstations.then((values) => {
                if (
                    currentNodeAtReloadCalling?.id ===
                    currentNodeRef.current?.id
                ) {
                    mapEquipments.updateSubstations(
                        mapEquipments.checkAndGetValues(values),
                        isFullReload
                    );
                }
            });
            updatedLines.then((values) => {
                if (
                    currentNodeAtReloadCalling?.id ===
                    currentNodeRef.current?.id
                ) {
                    mapEquipments.updateLines(
                        mapEquipments.checkAndGetValues(values),
                        isFullReload
                    );
                    setUpdatedLines(values);
                }
            });
            updatedHvdcLines.then((values) => {
                if (
                    currentNodeAtReloadCalling?.id ===
                    currentNodeRef.current?.id
                ) {
                    mapEquipments.updateHvdcLines(
                        mapEquipments.checkAndGetValues(values),
                        isFullReload
                    );
                    setUpdatedHvdcLines(values);
                }
            });
            return Promise.all([
                updatedSubstations,
                updatedLines,
                updatedHvdcLines,
            ]).finally(() => {
                setWaitingLoadData(false);
            });
        },
        [
            currentNode,
            dispatch,
            isUpdatedSubstationsApplied,
            mapEquipments,
            studyUuid,
            updatedSubstationsIds,
        ]
    );

    const updateMapEquipmentsAndGeoData = useCallback(() => {
        const currentNodeAtReloadCalling = currentNodeRef.current;
        updateMapEquipments(currentNodeAtReloadCalling).then(() => {
            if (currentNodeAtReloadCalling === currentNodeRef.current) {
                loadGeoData();
            }
        });
    }, [updateMapEquipments, loadGeoData]);

    useEffect(() => {
        if (isInitialized && studyUpdatedForce.eventData.headers) {
            if (
                studyUpdatedForce.eventData.headers[UPDATE_TYPE_HEADER] ===
                'loadflow'
            ) {
                updateMapEquipments(currentNodeRef.current);
            }
        }
    }, [isInitialized, studyUpdatedForce, updateMapEquipments]);

    useEffect(() => {
        setIsUpdatedSubstationsApplied(false);
    }, [updatedSubstationsIds]);

    useEffect(() => {
        if (!mapEquipments || refIsMapManualRefreshEnabled.current) {
            return;
        }
        if (deletedEquipments?.length > 0 && mapEquipments) {
            deletedEquipments.forEach((deletedEquipment) => {
                mapEquipments.removeEquipment(
                    deletedEquipment?.equipmentType,
                    deletedEquipment?.equipmentId
                );
            });
        }
    }, [deletedEquipments, mapEquipments]);

    useEffect(() => {
        let previousCurrentNode = currentNodeRef.current;
        currentNodeRef.current = currentNode;
        // if only renaming, do not reload geo data
        if (isNodeRenamed(previousCurrentNode, currentNode)) {
            return;
        }
        if (disabled) {
            return;
        }
        if (refIsMapManualRefreshEnabled.current && isInitialized) {
            return;
        }
        // Hack to avoid reload Geo Data when switching display mode to TREE then back to MAP or HYBRID
        // TODO REMOVE LATER
        if (!reloadMapNeeded) {
            return;
        }
        if (!isInitialized) {
            loadMapEquipments();
            loadAllGeoData();
        } else {
            updateMapEquipmentsAndGeoData();
        }
        setInitialized(true);
        // Note: studyUuid and dispatch don't change
    }, [
        disabled,
        studyUuid,
        currentNode,
        loadMapEquipments,
        updateMapEquipmentsAndGeoData,
        loadAllGeoData,
        isInitialized,
        reloadMapNeeded,
        updatedSubstationsIds,
    ]);

    // Reload geo data (if necessary) when we switch on full path
    useEffect(() => {
        const prevLineFullPath = lineFullPathRef.current;
        lineFullPathRef.current = lineFullPath;
        if (isInitialized && lineFullPath && !prevLineFullPath) {
            loadGeoData();
        }
    }, [isInitialized, lineFullPath, loadGeoData]);

    /* TODO : this useEffect reloads the mapEquipments when, in manual refresh mode, the current node is built.
     */
    useEffect(() => {
        let previousNodeStatus = isCurrentNodeBuiltRef.current;
        isCurrentNodeBuiltRef.current = isNodeBuilt(currentNode);

        // when we build node we want the map to be up to date
        if (
            refIsMapManualRefreshEnabled.current &&
            !previousNodeStatus &&
            isCurrentNodeBuiltRef.current
        ) {
            updateMapEquipmentsAndGeoData();
        }
    }, [currentNode, updateMapEquipmentsAndGeoData]);

    let choiceVoltageLevelsSubstation = null;
    if (choiceVoltageLevelsSubstationId) {
        choiceVoltageLevelsSubstation = mapEquipments?.getSubstation(
            choiceVoltageLevelsSubstationId
        );
    }

    const renderEquipmentMenu = () => {
        if (
            disabled ||
            equipmentMenu.equipment === null ||
            !equipmentMenu.display
        ) {
            return <></>;
        }
        return (
            <>
                {(equipmentMenu.equipmentType === equipments.lines ||
                    equipmentMenu.equipmentType === equipments.hvdcLines) &&
                    withEquipment(MenuBranch, {
                        currentNode,
                        studyUuid,
                        equipmentType: equipmentMenu.equipmentType,
                    })}

                {equipmentMenu.equipmentType === equipments.substations &&
                    withEquipment(MenuSubstation)}
                {equipmentMenu.equipmentType === equipments.voltageLevels &&
                    withEquipment(MenuVoltageLevel)}
            </>
        );
    };

    function renderVoltageLevelChoice() {
        return (
            <VoltageLevelChoice
                handleClose={closeChoiceVoltageLevelMenu}
                onClickHandler={choiceVoltageLevel}
                substation={choiceVoltageLevelsSubstation}
                position={[position[0], position[1]]}
            />
        );
    }

    const linesNearOverload = useCallback(() => {
        if (mapEquipments) {
            return mapEquipments.lines.some((l) => {
                const zone = getLineLoadingZone(l, lineFlowAlertThreshold);
                return (
                    zone === LineLoadingZone.WARNING ||
                    zone === LineLoadingZone.OVERLOAD
                );
            });
        }
        return false;
    }, [mapEquipments, lineFlowAlertThreshold]);

    const isLoadFlowValid = () => {
        return loadFlowStatus === RunningStatus.SUCCEED;
    };

    const renderMap = () => (
        <NetworkMap
            mapEquipments={mapEquipments}
            updatedLines={[
                ...(updatedLines ?? []),
                ...(updatedHvdcLines ?? []),
            ]}
            geoData={geoData}
            displayOverlayLoader={!basicDataReady && waitingLoadData}
            filteredNominalVoltages={filteredNominalVoltages}
            labelsZoomThreshold={9}
            arrowsZoomThreshold={7}
            initialPosition={INITIAL_POSITION}
            initialZoom={1}
            lineFullPath={lineFullPath}
            lineParallelPath={lineParallelPath}
            lineFlowMode={lineFlowMode}
            lineFlowColorMode={lineFlowColorMode}
            lineFlowAlertThreshold={lineFlowAlertThreshold}
            loadFlowStatus={loadFlowStatus}
            onSubstationClick={openVoltageLevel}
            onLineMenuClick={(equipment, x, y) =>
                showEquipmentMenu(equipment, x, y, equipments.lines)
            }
            onHvdcLineMenuClick={(equipment, x, y) =>
                showEquipmentMenu(equipment, x, y, equipments.hvdcLines)
            }
            visible={visible}
            onSubstationClickChooseVoltageLevel={
                chooseVoltageLevelForSubstation
            }
            onSubstationMenuClick={(equipment, x, y) =>
                showEquipmentMenu(equipment, x, y, equipments.substations)
            }
            onVoltageLevelMenuClick={voltageLevelMenuClick}
            disabled={disabled}
            onReloadMapClick={updateMapEquipmentsAndGeoData}
        />
    );

    function renderNominalVoltageFilter() {
        return (
            <div className={classes.divNominalVoltageFilter}>
                <NominalVoltageFilter
                    nominalVoltages={mapEquipments.getNominalVoltages()}
                    filteredNominalVoltages={filteredNominalVoltages}
                    onChange={setFilteredNominalVoltages}
                />
            </div>
        );
    }

    return (
        <>
            <div className={classes.divTemporaryGeoDataLoading}>
                {basicDataReady && waitingLoadData && <LinearProgress />}
            </div>
            {renderMap()}
            {renderEquipmentMenu()}
            {choiceVoltageLevelsSubstationId && renderVoltageLevelChoice()}
            {mapEquipments?.substations?.length > 0 &&
                renderNominalVoltageFilter()}

            {displayOverloadTable &&
                isLoadFlowValid() &&
                linesNearOverload() && (
                    <div className={classes.divOverloadedLineView}>
                        <OverloadedLinesView
                            lineFlowAlertThreshold={lineFlowAlertThreshold}
                            mapEquipments={mapEquipments}
                            disabled={disabled}
                        />
                    </div>
                )}
            <div className={classes.divRunButton}>
                <RunButtonContainer
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    loadFlowStatus={loadFlowStatus}
                    securityAnalysisStatus={securityAnalysisStatus}
                    sensiStatus={sensiStatus}
                    shortCircuitStatus={shortCircuitStatus}
                    dynamicSimulationStatus={dynamicSimulationStatus}
                    setIsComputationRunning={setIsComputationRunning}
                    runnable={runnable}
                    disabled={disabled || isNodeReadOnly(currentNode)}
                />
            </div>
        </>
    );
};

NetworkMapTab.propTypes = {
    updatedLines: PropTypes.arrayOf(PropTypes.any),
    lineFullPath: PropTypes.any,
    lineParallelPath: PropTypes.any,
    lineFlowMode: PropTypes.any,
    lineFlowColorMode: PropTypes.any,
    lineFlowAlertThreshold: PropTypes.number,
    loadFlowStatus: PropTypes.string,
    dynamicSimulationStatus: PropTypes.string,
    view: PropTypes.any,
    onSubstationClickChooseVoltageLevel: PropTypes.func,
    onSubstationMenuClick: PropTypes.func,
    mapRef: PropTypes.any,
};

export default NetworkMapTab;
