import NetworkMap from './network/network-map';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
    fetchLinePositions,
    fetchSubstationPositions,
} from '../utils/rest-api';
import GeoData from './network/geo-data';
import { equipments } from './network/network-equipments';
import withLineMenu from './line-menu';
import BaseEquipmentMenu from './base-equipment-menu';
import withEquipmentMenu from './equipment-menu';
import VoltageLevelChoice from './voltage-level-choice';
import LoaderWithOverlay from './loader-with-overlay';
import NominalVoltageFilter from './network/nominal-voltage-filter';
import { makeStyles } from '@material-ui/core/styles';

const INITIAL_POSITION = [0, 0];

const useStyles = makeStyles((theme) => ({
    divNominalVoltageFilter: {
        position: 'absolute',
        right: 10,
        bottom: 30,
    },
}));

export const NetworkMapContainer = ({
    /* redux can be use as redux*/
    studyUuid,
    network,
    selectedNodeUuid,
    /* visual*/
    visible,
    useName,
    lineFullPath,
    lineParallelPath,
    lineFlowMode,
    lineFlowColorMode,
    lineFlowAlertThreshold,
    loadFlowStatus,
    updatedLines,
    /* callbacks */
    openVoltageLevel,
    filteredNominalVoltages,
    centerOnSubstation,
    showInSpreadsheet,
}) => {
    const [geoDataLoadingFail, setGeoDataLoadingFail] = useState(false);

    const [waitingLoadGeoData, setWaitingLoadGeoData] = useState(true);

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

    useEffect(() => {
        if (centerOnSubstation)
            mapRef.current.centerSubstation(centerOnSubstation);
    }, [mapRef, centerOnSubstation]);

    const classes = useStyles();

    console.info('jbo', waitingLoadGeoData, geoDataLoadingFail);

    function withEquipment(Menu, ...props) {
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
        'substation-menu',
        equipments.substations
    );

    const MenuVoltageLevel = withEquipmentMenu(
        BaseEquipmentMenu,
        'voltage-level-menu',
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
                setGeoDataLoadingFail(true);
            });
        // Note: studyUuid and dispatch don't change
    }, [studyUuid, setWaitingLoadGeoData, setGeoDataLoadingFail, setGeoData]);

    const chooseVoltageLevelForSubstation = useCallback(
        (idSubstation, x, y) => {
            setChoiceVoltageLevelsSubstationId(idSubstation);
            setPosition([x, y]);
        },
        []
    );

    /*
* else if (geoDataLoadingFail) {
                setErrorMsgId('geoDataLoadingFail');
            }
* */
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
                    withEquipment(
                        <MenuLine selectedNodeUuid={selectedNodeUuid} />
                    )}
                {equipmentMenu.equipmentType === equipments.substations &&
                    withEquipment(<MenuSubstation />)}
                {equipmentMenu.equipmentType === equipments.voltageLevels &&
                    withEquipment(<MenuVoltageLevel />)}
            </>
        );
    };

    function renderVoltageLevelChoice() {
        return (
            <VoltageLevelChoice
                handleClose={closeChoiceVoltageLevelMenu}
                onClickHandler={choiceVoltageLevel}
                substation={choiceVoltageLevelsSubstation}
                position={[position[0] + 200, position[1]]}
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
        </>
    );
};

NetworkMapContainer.propTypes = {
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

export default NetworkMapContainer;
