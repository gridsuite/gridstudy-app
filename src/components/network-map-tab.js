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
import { PARAM_DISPLAY_OVERLOAD_TABLE } from '../utils/config-params';
import { getLineLoadingZone, LineLoadingZone } from './network/line-layer';
import { useIntlRef } from '@gridsuite/commons-ui';
import { isNodeBuilt, isNodeReadOnly } from './graph/util/model-functions';
import { RunningStatus } from './util/running-status';
import { resetMapReloaded, setForceNetworkReload } from '../redux/actions';

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
    network,
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
    updatedLines,
    /* callbacks */
    openVoltageLevel,
    setIsComputationRunning,
    filteredNominalVoltages,
    showInSpreadsheet,
    setErrorMessage,
}) => {
    const dispatch = useDispatch();

    const intlRef = useIntlRef();
    const [waitingLoadGeoData, setWaitingLoadGeoData] = useState(true);
    const displayOverloadTable = useSelector(
        (state) => state[PARAM_DISPLAY_OVERLOAD_TABLE]
    );
    const disabled = !visible || !isNodeBuilt(currentNode);
    const [geoData, setGeoData] = useState();

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
            let notFoundEquipmentsIds = [];
            const foundEquipmentsIds = Array.from(
                foundEquipmentPositions.keys()
            );
            allEquipments.forEach((s) => {
                if (!foundEquipmentsIds.includes(s.id)) {
                    notFoundEquipmentsIds.push(s.id);
                }
            });
            return notFoundEquipmentsIds;
        },
        []
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

    const reloadMapGeoData = useCallback(() => {
        if (studyUuid && currentNode) {
            if (
                geoData &&
                (geoData.substationPositionsById.size > 0 ||
                    geoData.linePositionsById.size > 0)
            ) {
                const notFoundSubstationIds = getEquipmentsNotFoundIds(
                    geoData.substationPositionsById,
                    network.getSubstations()
                );

                const notFoundLinesIds = getEquipmentsNotFoundIds(
                    geoData.linePositionsById,
                    network.getLines()
                );

                if (
                    notFoundSubstationIds.length > 0 ||
                    notFoundLinesIds.length > 0
                ) {
                    console.info(
                        `Loading geo data of study '${studyUuid}' of missing substations '${notFoundSubstationIds}' and missing lines '${notFoundLinesIds}'...`
                    );
                    setWaitingLoadGeoData(true);

                    const missingSubstationPositions =
                        notFoundSubstationIds.length > 0
                            ? getMissingEquipmentsPositions(
                                  notFoundSubstationIds,
                                  fetchSubstationPositions
                              )
                            : Promise.resolve([]);

                    const missingLinesPositions =
                        lineFullPath && notFoundLinesIds.length > 0
                            ? getMissingEquipmentsPositions(
                                  notFoundLinesIds,
                                  fetchLinePositions
                              )
                            : Promise.resolve([]);

                    Promise.all([
                        missingSubstationPositions,
                        missingLinesPositions,
                    ])
                        .then((positions) => {
                            if (
                                positions[0].length > 0 ||
                                positions[1].length > 0
                            ) {
                                geoData.addSubstationPositions(positions[0]);
                                geoData.addLinePositions(positions[1]);
                                // If there is new substation positions, we instantiate a new Map so that the substations layer rendering is triggered.
                                // Same for line positions.
                                const newGeoData = new GeoData(
                                    positions[0].length > 0
                                        ? new Map(
                                              geoData.substationPositionsById
                                          )
                                        : geoData.substationPositionsById,
                                    // If lineFullPath is off, we need to render the lines layer when there are some new subsation positions
                                    positions[1].length > 0 || (lineFullPath && notFoundLinesIds.length > 0)
                                        ? new Map(geoData.linePositionsById)
                                        : geoData.linePositionsById
                                );
                                setGeoData(newGeoData);
                            }
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
                }
            } else {
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
            }
            dispatch(resetMapReloaded());
        }
    }, [
        currentNode,
        dispatch,
        intlRef,
        lineFullPath,
        setErrorMessage,
        studyUuid,
        getMissingEquipmentsPositions,
        network,
        geoData,
        getEquipmentsNotFoundIds,
    ]);

    const reloadMapGeoDataRef = useRef();
    reloadMapGeoDataRef.current = reloadMapGeoData;

    useEffect(() => {
        reloadMapGeoDataRef.current();
    }, [network]);

    const handleReloadMap = useCallback(() => {
        reloadMapGeoData();
        dispatch(setForceNetworkReload());
    }, [dispatch, reloadMapGeoData]);

    let choiceVoltageLevelsSubstation = null;
    if (choiceVoltageLevelsSubstationId) {
        choiceVoltageLevelsSubstation = network?.getSubstation(
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
        if (network) {
            return network.lines.some((l) => {
                const zone = getLineLoadingZone(l, lineFlowAlertThreshold);
                return (
                    zone === LineLoadingZone.WARNING ||
                    zone === LineLoadingZone.OVERLOAD
                );
            });
        }
        return false;
    }, [network, lineFlowAlertThreshold]);

    const isLoadFlowValid = () => {
        return loadFlowStatus === RunningStatus.SUCCEED;
    };

    const renderMap = () => (
        <NetworkMap
            network={network}
            substations={network ? network.substations : []}
            lines={network ? network.lines : []}
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
            onReloadMapClick={handleReloadMap}
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
            {renderMap()}
            {renderEquipmentMenu()}
            {choiceVoltageLevelsSubstationId && renderVoltageLevelChoice()}
            {network?.substations?.length > 0 && renderNominalVoltageFilter()}

            {displayOverloadTable && isLoadFlowValid() && linesNearOverload() && (
                <div className={classes.divOverloadedLineView}>
                    <OverloadedLinesView
                        lines={network.lines}
                        lineFlowAlertThreshold={lineFlowAlertThreshold}
                        network={network}
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
