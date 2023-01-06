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
import { mapEquipmentsCreated, resetMapReloaded } from '../redux/actions';
import MapEquipments from './network/map-equipments';
import TemporaryGeoData from './network/temporary-geo-data';
import Box from '@mui/material/Box';
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
    useName,
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
    const [waitingTemporaryLoadGeoData, setWaitingTemporaryLoadGeoData] =
        useState(false);

    const [geoData, setGeoData] = useState();
    const [temporaryGeoData] = useState(new TemporaryGeoData());

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
            const foundEquipmentsIds = Array.from(
                foundEquipmentPositions.keys()
            );

            const notFoundEquipmentsIds = allEquipments
                .filter(
                    (s) =>
                        !foundEquipmentsIds.includes(s.id) ||
                        temporaryGeoData.temporaryGeoDataIds.has(s.id)
                )
                .map((s) => s.id);

            return notFoundEquipmentsIds;
        },
        [temporaryGeoData.temporaryGeoDataIds]
    );

    const getMissingEquipmentsPositions = useCallback(
        (notFoundEquipmentsIds, fetchEquipmentCB) => {
            if (notFoundEquipmentsIds.length === 0) {
                return Promise.resolve([]);
            }

            return fetchEquipmentCB(
                studyUuid,
                currentNode?.id,
                notFoundEquipmentsIds
            );
        },
        [studyUuid, currentNode?.id]
    );

    const loadMissingGeoData = useCallback(() => {
        const notFoundSubstationIds = getEquipmentsNotFoundIds(
            geoData.substationPositionsById,
            mapEquipments.getSubstations()
        );
        temporaryGeoData.addGeoDataIds(notFoundSubstationIds);

        const notFoundLinesIds = lineFullPath
            ? getEquipmentsNotFoundIds(
                  geoData.linePositionsById,
                  mapEquipments.getLines()
              )
            : [];
        temporaryGeoData.addGeoDataIds(notFoundLinesIds);

        if (notFoundSubstationIds.length > 0 || notFoundLinesIds.length > 0) {
            console.info(
                `Loading geo data of study '${studyUuid}' of missing substations '${notFoundSubstationIds}' and missing lines '${notFoundLinesIds}'...`
            );

            setWaitingTemporaryLoadGeoData(true);

            const missingSubstationPositions = getMissingEquipmentsPositions(
                notFoundSubstationIds,
                fetchSubstationPositions
            );

            const missingLinesPositions = getMissingEquipmentsPositions(
                notFoundLinesIds,
                fetchLinePositions
            );

            Promise.all([missingSubstationPositions, missingLinesPositions])
                .then((positions) => {
                    if (positions[0].length > 0 || positions[1].length > 0) {
                        geoData.addSubstationPositions(positions[0]);
                        geoData.addLinePositions(positions[1]);
                        // If there is new substation positions, we instantiate a new Map so that the substations layer rendering is triggered.
                        // Same for line positions.
                        const newGeoData = new GeoData(
                            positions[0].length > 0
                                ? new Map(geoData.substationPositionsById)
                                : geoData.substationPositionsById,
                            // If lineFullPath is off, we need to render the lines layer when there are some new subsation positions
                            positions[1].length > 0 ||
                            (!lineFullPath && positions[0].length > 0)
                                ? new Map(geoData.linePositionsById)
                                : geoData.linePositionsById
                        );
                        setGeoData(newGeoData);
                    }
                    setWaitingTemporaryLoadGeoData(false);
                })
                .catch(function (error) {
                    console.error(error.message);
                    setWaitingTemporaryLoadGeoData(false);
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
        geoData,
        getEquipmentsNotFoundIds,
        getMissingEquipmentsPositions,
        mapEquipments,
        temporaryGeoData,
    ]);

    const loadAllGeoData = useCallback(() => {
        console.info(`Loading geo data of study '${studyUuid}'...`);
        setWaitingLoadGeoData(true);
        const substationPositions = fetchSubstationPositions(
            studyUuid,
            currentNode?.id
        );

        const linePositions = lineFullPath
            ? fetchLinePositions(studyUuid, currentNode?.id)
            : Promise.resolve([]);

        Promise.all([substationPositions, linePositions])
            .then((values) => {
                const newGeoData = new GeoData();
                newGeoData.setSubstationPositions(values[0]);
                newGeoData.setLinePositions(values[1]);
                setGeoData(newGeoData);
                setWaitingLoadGeoData(false);
            })
            .catch(function (error) {
                console.error(error.message);
                setWaitingLoadGeoData(false);
                setErrorMessage(
                    intlRef.current.formatMessage(
                        { id: 'geoDataLoadingFail' },
                        { studyUuid: studyUuid }
                    )
                );
            });
    }, [currentNode?.id, intlRef, lineFullPath, setErrorMessage, studyUuid]);

    const loadMapGeoData = useCallback(() => {
        if (studyUuid && currentNode) {
            if (
                geoData &&
                (geoData.substationPositionsById.size > 0 ||
                    geoData.linePositionsById.size > 0)
            ) {
                loadMissingGeoData();
            } else {
                loadAllGeoData();
            }
            dispatch(resetMapReloaded());
        }
    }, [
        currentNode,
        dispatch,
        studyUuid,
        geoData,
        loadAllGeoData,
        loadMissingGeoData,
    ]);

    const loadMapEquipments = useCallback(() => {
        if (!isNodeBuilt(currentNode) || !studyUuid) {
            return;
        }
        if (!isInitialized) {
            const initialMapEquipments = new MapEquipments(
                studyUuid,
                currentNode?.id,
                setErrorMessage,
                dispatch,
                intlRef
            );
            dispatch(mapEquipmentsCreated(initialMapEquipments));
        } else {
            console.info('Reload map equipments');
            const updatedSubstationsToSend =
                !refIsMapManualRefreshEnabled.current &&
                !isUpdatedSubstationsApplied &&
                updatedSubstationsIds?.length > 0
                    ? updatedSubstationsIds
                    : undefined;

            mapEquipments.reloadImpactedSubstationsEquipments(
                studyUuid,
                currentNode,
                updatedSubstationsToSend,
                setUpdatedLines
            );

            if (updatedSubstationsToSend) {
                setIsUpdatedSubstationsApplied(true);
            }
        }
    }, [
        currentNode,
        dispatch,
        intlRef,
        isInitialized,
        isUpdatedSubstationsApplied,
        mapEquipments,
        setErrorMessage,
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

    const loadMapEquipmentsRef = useRef();
    loadMapEquipmentsRef.current = loadMapEquipments;

    useEffect(() => {
        let previousCurrentNode = currentNodeRef.current;
        currentNodeRef.current = currentNode;
        // if only renaming, do not reload geo data
        if (isNodeRenamed(previousCurrentNode, currentNode)) return;
        if (disabled) return;
        if (refIsMapManualRefreshEnabled.current && isInitialized) return;
        // Hack to avoid reload Geo Data when switching display mode to TREE then back to MAP or HYBRID
        // TODO REMOVE LATER
        if (!reloadMapNeeded) return;
        loadMapEquipmentsRef.current();
        setInitialized(true);
        // Note: studyUuid and dispatch don't change
    }, [
        disabled,
        studyUuid,
        currentNode,
        isInitialized,
        reloadMapNeeded,
        updatedSubstationsIds,
    ]);

    const loadMapGeoDataRef = useRef();
    loadMapGeoDataRef.current = loadMapGeoData;

    useEffect(() => {
        if (!mapEquipments) return;
        loadMapGeoDataRef.current();
    }, [mapEquipments, mapEquipments?.substations, mapEquipments?.lines]);

    useEffect(() => {
        let previousNodeStatus = isCurrentNodeBuiltRef.current;
        isCurrentNodeBuiltRef.current = isNodeBuilt(currentNode);

        //when we build node we want the map to be up to date
        if (!previousNodeStatus && isCurrentNodeBuiltRef.current) {
            loadMapEquipments();
        }
    }, [currentNode, loadMapEquipments]);

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
            useName={useName}
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
            onReloadMapClick={() => {
                loadMapEquipments();
                loadMapGeoData();
            }}
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
                {
                    <Box height={6}>
                        {waitingTemporaryLoadGeoData && <LinearProgress />}
                    </Box>
                }
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
    useName: PropTypes.any,
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
