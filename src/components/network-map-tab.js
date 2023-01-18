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
    fetchLinePositions,
    fetchSubstationPositions,
} from '../utils/rest-api';
import GeoData from './network/geo-data';
import { equipments } from './network/network-equipments';
import withLineMenu from './menus/line-menu';
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
import { useIntlRef } from '@gridsuite/commons-ui';
import {
    isNodeBuilt,
    isNodeReadOnly,
    isNodeRenamed,
} from './graph/util/model-functions';
import { RunningStatus } from './util/running-status';
import { resetMapReloaded } from '../redux/actions';
import MapEquipments from './network/map-equipments';
import LinearProgress from '@mui/material/LinearProgress';

const INITIAL_POSITION = [0, 0];

const useStyles = makeStyles((theme) => ({
    divNominalVoltageFilter: {
        position: 'absolute',
        right: 10,
        bottom: 30,
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
        minWidth: '500px',
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
    filteredNominalVoltages,
    showInSpreadsheet,
    setErrorMessage,
}) => {
    const mapEquipments = useSelector((state) => state.mapEquipments);
    const dispatch = useDispatch();

    const intlRef = useIntlRef();
    const [isInitialized, setInitialized] = useState(false);
    const [waitingLoadGeoData, setWaitingLoadGeoData] = useState(true);
    const [waitingFullLoadGeoData, setWaitingFullLoadGeoData] = useState(true);
    const [waitingLoadTemporaryGeoData, setWaitingLoadTemporaryGeoData] =
        useState(false);

    const [geoData, setGeoData] = useState();
    const geoDataRef = useRef();
    geoDataRef.current = geoData;

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

    const mapManualRefresh = useSelector(
        (state) => state[PARAM_MAP_MANUAL_REFRESH]
    );
    const refIsMapManualRefreshEnabled = useRef();
    refIsMapManualRefreshEnabled.current = mapManualRefresh;

    //TODO remove from state ?
    const reloadMapNeeded = useSelector((state) => state.reloadMap);

    const deletedEquipment = useSelector((state) => state.deletedEquipment);
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

    function withEquipment(Menu, props) {
        return (
            <Menu
                id={equipmentMenu.equipment.id}
                position={equipmentMenu.position}
                handleClose={closeEquipmentMenu}
                handleViewInSpreadsheet={handleViewInSpreadsheet}
                {...props}
            />
        );
    }

    const MenuLine = withLineMenu(BaseEquipmentMenu);

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
            setWaitingLoadTemporaryGeoData(true);

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
                    }
                    setWaitingLoadTemporaryGeoData(false);
                })
                .catch(function (error) {
                    console.error(error.message);
                    setWaitingLoadTemporaryGeoData(false);
                    setErrorMessage(
                        intlRef.current.formatMessage(
                            { id: 'geoDataLoadingFail' },
                            { studyUuid: studyUuid }
                        )
                    );
                });
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
        setWaitingLoadGeoData(true);
        setWaitingFullLoadGeoData(true);

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
            setWaitingLoadGeoData(false);
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
                  }
              );

        Promise.all([substationPositionsDone, linePositionsDone])
            .then(() => {
                setWaitingFullLoadGeoData(false);
                temporaryGeoDataIdsRef.current = new Set();
            })
            .catch(function (error) {
                console.error(error.message);
                setWaitingLoadGeoData(false);
                setWaitingFullLoadGeoData(false);
                setErrorMessage(
                    intlRef.current.formatMessage(
                        { id: 'geoDataLoadingFail' },
                        { studyUuid: studyUuid }
                    )
                );
            });
    }, [intlRef, lineFullPath, setErrorMessage, studyUuid]);

    const loadGeoData = useCallback(() => {
        if (studyUuid && currentNodeRef.current) {
            if (
                // To manage a lineFullPath param change, if lineFullPath=true and linePositions is empty, we load all the geo data.
                // This can be improved by loading only the lines geo data and not lines geo data + substations geo data when lineFullPath is changed to true.
                // isInitialized &&
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

    const updateMapEquipmentsAndGeoData = useCallback(() => {
        if (!isNodeBuilt(currentNode) || !studyUuid || !isInitialized) {
            return;
        }
        //TODO not reload map equip when switching on true lineFullPath
        if (mapEquipments) {
            console.info('Reload map equipments');
            setWaitingFullLoadGeoData(true);
            const updatedSubstationsToSend =
                !refIsMapManualRefreshEnabled.current &&
                !isUpdatedSubstationsApplied &&
                updatedSubstationsIds?.length > 0
                    ? updatedSubstationsIds
                    : undefined;

            mapEquipments
                .reloadImpactedSubstationsEquipments(
                    studyUuid,
                    currentNode,
                    updatedSubstationsToSend,
                    setUpdatedLines
                )
                .then(loadGeoData)
                .finally(() => setWaitingFullLoadGeoData(false));
            if (updatedSubstationsToSend) {
                setIsUpdatedSubstationsApplied(true);
            }
        }
        dispatch(resetMapReloaded());
    }, [
        currentNode,
        dispatch,
        intlRef,
        isInitialized,
        isUpdatedSubstationsApplied,
        mapEquipments,
        studyUuid,
        updatedSubstationsIds,
    ]);

    useEffect(() => {
        setIsUpdatedSubstationsApplied(false);
    }, [updatedSubstationsIds]);

    useEffect(() => {
        if (!mapEquipments || refIsMapManualRefreshEnabled.current) {
            return;
        }
        if (deletedEquipment) {
            mapEquipments?.removeEquipment(
                deletedEquipment?.type,
                deletedEquipment?.id
            );
        }
    }, [deletedEquipment, mapEquipments]);

    useEffect(() => {
        let previousCurrentNode = currentNodeRef.current;
        currentNodeRef.current = currentNode;
        // if only renaming, do not reload geo data
        if (isNodeRenamed(previousCurrentNode, currentNode)) return;
        if (disabled) return;
        if (refIsMapManualRefreshEnabled.current && isInitialized) return;
        // Hack to avoid reload Geo Data when switching display mode to TREE then back to MAP or HYBRID
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
        loadAllGeoData, isInitialized,
        reloadMapNeeded,
        updatedSubstationsIds,
    ]);

    /* TODO : this useEffect reloads the mapEquipments when, in manual refresh mode, the current node is built.
     */
    useEffect(() => {
        // when we build node we want the map to be up to date
        if (refIsMapManualRefreshEnabled.current && isInitialized && isNodeBuilt(currentNode)) {
            updateMapEquipmentsAndGeoData();
        }
    }, [currentNode, isInitialized, updateMapEquipmentsAndGeoData]);

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
        )
            return <></>;
        return (
            <>
                {equipmentMenu.equipmentType === equipments.lines &&
                    withEquipment(MenuLine, {
                        currentNode,
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
            updatedLines={updatedLines}
            geoData={geoData}
            waitingLoadGeoData={waitingLoadGeoData}
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
            visible={visible}
            onSubstationClickChooseVoltageLevel={
                chooseVoltageLevelForSubstation
            }
            onSubstationMenuClick={(equipment, x, y) =>
                showEquipmentMenu(equipment, x, y, equipments.substations)
            }
            onVoltageLevelMenuClick={voltageLevelMenuClick}
            disabled={disabled}
            onReloadMapClick={loadMapEquipments}
        />
    );

    function renderNominalVoltageFilter() {
        return (
            <div className={classes.divNominalVoltageFilter}>
                <NominalVoltageFilter />
            </div>
        );
    }

    return (
        <>
            <div className={classes.divTemporaryGeoDataLoading}>
                {(waitingLoadTemporaryGeoData ||
                    (!waitingLoadGeoData && waitingFullLoadGeoData)) && (
                    <LinearProgress />
                )}
            </div>
            {renderMap()}
            {renderEquipmentMenu()}
            {choiceVoltageLevelsSubstationId && renderVoltageLevelChoice()}
            {mapEquipments?.substations?.length > 0 &&
                renderNominalVoltageFilter()}

            {displayOverloadTable && isLoadFlowValid() && linesNearOverload() && (
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
    filteredNominalVoltages: PropTypes.any,
    lineFullPath: PropTypes.any,
    lineParallelPath: PropTypes.any,
    lineFlowMode: PropTypes.any,
    lineFlowColorMode: PropTypes.any,
    lineFlowAlertThreshold: PropTypes.number,
    loadFlowStatus: PropTypes.string,
    view: PropTypes.any,
    onSubstationClickChooseVoltageLevel: PropTypes.func,
    onSubstationMenuClick: PropTypes.func,
    mapRef: PropTypes.any,
};

export default NetworkMapTab;
