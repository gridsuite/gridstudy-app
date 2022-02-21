import NetworkMap from './network/network-map';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import LoaderWithOverlay from './util/loader-with-overlay';
import NominalVoltageFilter from './network/nominal-voltage-filter';
import { makeStyles } from '@material-ui/core/styles';
import OverloadedLinesView from './network/overloaded-lines-view';
import { RunButtonContainer } from './run-button-container';
import { useSelector } from 'react-redux';
import {
    PARAM_DISPLAY_OVERLOAD_TABLE,
    PARAM_MAP_TREE_DISPLAY,
} from '../utils/config-params';
import { getLineLoadingZone, LineLoadingZone } from './network/line-layer';
import { StudyDisplayMode } from './study-pane';
import {
    DRAWER_EXPLORER_WIDTH,
    DRAWER_NODE_EDITOR_WIDTH,
} from './map-lateral-drawers';

const INITIAL_POSITION = [0, 0];

const VL_CHOICE_MENU_SHIFT = 100;

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
    selectedNodeUuid,
    /* results*/
    securityAnalysisStatus,
    runnable,
    loadFlowStatus,
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
    centerOnSubstation,
    showInSpreadsheet,
    setErrorMessage,
}) => {
    const [waitingLoadGeoData, setWaitingLoadGeoData] = useState(true);

    const displayOverloadTable = useSelector(
        (state) => state[PARAM_DISPLAY_OVERLOAD_TABLE]
    );

    const [geoData, setGeoData] = useState();

    const mapRef = useRef();

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
                position={[
                    equipmentMenu.position[0],
                    equipmentMenu.position[1],
                ]}
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

    useEffect(() => {
        if (centerOnSubstation)
            mapRef.current.centerSubstation(centerOnSubstation);
    }, [mapRef, centerOnSubstation]);

    useEffect(() => {
        console.info(`Loading geo data of study '${studyUuid}'...`);

        const substationPositions = fetchSubstationPositions(studyUuid);
        const linePositions = fetchLinePositions(studyUuid);
        setWaitingLoadGeoData(true);

        Promise.all([substationPositions, linePositions])
            .then((values) => {
                const geoData = new GeoData();
                geoData.setSubstationPositions(values[0]);
                geoData.setLinePositions(values[1]);
                setGeoData(geoData);
                setWaitingLoadGeoData(false);
            })
            .catch(function (error) {
                console.error(error.message);
                setWaitingLoadGeoData(false);
                setErrorMessage('geoDataLoadingFail');
            });
        // Note: studyUuid and dispatch don't change
    }, [studyUuid, setWaitingLoadGeoData, setErrorMessage, setGeoData]);

    let choiceVoltageLevelsSubstation = null;
    if (choiceVoltageLevelsSubstationId) {
        choiceVoltageLevelsSubstation = network?.getSubstation(
            choiceVoltageLevelsSubstationId
        );
    }

    const renderEquipmentMenu = () => {
        if (equipmentMenu.equipment === null || !equipmentMenu.display)
            return <></>;
        return (
            <>
                {equipmentMenu.equipmentType === equipments.lines &&
                    withEquipment(MenuLine, {
                        selectedNodeUuid: selectedNodeUuid,
                    })}
                {equipmentMenu.equipmentType === equipments.substations &&
                    withEquipment(MenuSubstation)}
                {equipmentMenu.equipmentType === equipments.voltageLevels &&
                    withEquipment(MenuVoltageLevel)}
            </>
        );
    };

    const displayMode = useSelector((state) => state[PARAM_MAP_TREE_DISPLAY]);
    const isExplorerDrawerOpen = useSelector(
        (state) => state.isExplorerDrawerOpen
    );
    const isModificationsDrawerOpen = useSelector(
        (state) => state.isModificationsDrawerOpen
    );

    function renderVoltageLevelChoice() {
        let leftPosition =
            displayMode === StudyDisplayMode.HYBRID
                ? position[0] + window.screen.width / 2
                : position[0];
        leftPosition =
            displayMode === StudyDisplayMode.MAP && isModificationsDrawerOpen
                ? leftPosition + DRAWER_NODE_EDITOR_WIDTH
                : leftPosition;
        leftPosition = isExplorerDrawerOpen
            ? leftPosition + DRAWER_EXPLORER_WIDTH
            : leftPosition;
        return (
            <VoltageLevelChoice
                handleClose={closeChoiceVoltageLevelMenu}
                onClickHandler={choiceVoltageLevel}
                substation={choiceVoltageLevelsSubstation}
                position={[leftPosition + VL_CHOICE_MENU_SHIFT, position[1]]}
            />
        );
    }

    const renderOverlay = () => (
        <LoaderWithOverlay
            color="inherit"
            loaderSize={70}
            isFixed={true}
            loadingMessageText={'loadingGeoData'}
        />
    );

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

    const renderMap = () => (
        <NetworkMap
            network={network}
            substations={network ? network.substations : []}
            lines={network ? network.lines : []}
            updatedLines={updatedLines}
            geoData={geoData}
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
            ref={mapRef}
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
            {waitingLoadGeoData && renderOverlay()}
            {renderMap()}
            {renderEquipmentMenu()}
            {choiceVoltageLevelsSubstationId && renderVoltageLevelChoice()}
            {network?.substations?.length > 0 && renderNominalVoltageFilter()}

            {displayOverloadTable && linesNearOverload() && (
                <div className={classes.divOverloadedLineView}>
                    <OverloadedLinesView
                        lines={network.lines}
                        lineFlowAlertThreshold={lineFlowAlertThreshold}
                        network={network}
                    />
                </div>
            )}
            <div className={classes.divRunButton}>
                <RunButtonContainer
                    studyUuid={studyUuid}
                    selectedNodeUuid={selectedNodeUuid}
                    loadFlowStatus={loadFlowStatus}
                    securityAnalysisStatus={securityAnalysisStatus}
                    setIsComputationRunning={setIsComputationRunning}
                    runnable={runnable}
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
};

export default NetworkMapTab;
