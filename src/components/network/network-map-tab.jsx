/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { NetworkMap, GeoData } from '@powsybl/diagram-viewer';
import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import withOperatingStatusMenu from '../menus/operating-status-menu';
import BaseEquipmentMenu from '../menus/base-equipment-menu';
import withEquipmentMenu from '../menus/equipment-menu';
import VoltageLevelChoice from '../voltage-level-choice';
import NominalVoltageFilter from './nominal-voltage-filter';
import { useDispatch, useSelector } from 'react-redux';
import { PARAM_MAP_BASEMAP, PARAM_MAP_MANUAL_REFRESH, PARAM_USE_NAME } from '../../utils/config-params';
import { useIntlRef, useSnackMessage } from '@gridsuite/commons-ui';
import { isNodeBuilt, isNodeRenamed, isSameNodeAndBuilt } from '../graph/util/model-functions';
import { resetMapReloaded, setMapDataLoading } from '../../redux/actions';
import GSMapEquipments from './gs-map-equipments';
import LinearProgress from '@mui/material/LinearProgress';
import { UPDATE_TYPE_HEADER } from '../study-container';
import SubstationModificationDialog from '../dialogs/network-modifications/substation/modification/substation-modification-dialog';
import VoltageLevelModificationDialog from '../dialogs/network-modifications/voltage-level/modification/voltage-level-modification-dialog';
import { EQUIPMENT_TYPES } from '../utils/equipment-types';
import LineModificationDialog from '../dialogs/network-modifications/line/modification/line-modification-dialog';
import { deleteEquipment } from '../../services/study/network-modifications';
import EquipmentDeletionDialog from '../dialogs/network-modifications/equipment-deletion/equipment-deletion-dialog';
import { fetchLinePositions, fetchSubstationPositions } from '../../services/study/geo-data';
import { Box } from '@mui/system';
import { useMapBoxToken } from './network-map/use-mapbox-token';
import EquipmentPopover from '../tooltips/equipment-popover';
import { useTheme } from '@emotion/react';
import RunningStatus from 'components/utils/running-status';
import ComputationType from 'components/computing-status/computation-type';
import { useGetStudyImpacts } from 'hooks/use-get-study-impacts';
import { ROOT_NODE_LABEL } from '../../constants/node.constant';
const INITIAL_POSITION = [0, 0];
const INITIAL_ZOOM = 9;
const LABELS_ZOOM_THRESHOLD = 9;
const ARROWS_ZOOM_THRESHOLD = 7;

const styles = {
    divNominalVoltageFilter: {
        position: 'absolute',
        right: '10px',
        bottom: '30px',
        zIndex: 0,
        '&:hover': {
            zIndex: 2,
        },
    },
    divTemporaryGeoDataLoading: {
        position: 'absolute',
        width: '100%',
        zIndex: 2,
    },
};

const NODE_CHANGED_ERROR = 'Node has changed or is not built anymore. The Promise is rejected.';
export const NetworkMapTab = ({
    networkMapRef,
    /* redux can be use as redux*/
    studyUuid,
    currentNode,
    /* visual*/
    visible,
    lineFullPath,
    lineParallelPath,
    lineFlowMode,
    lineFlowColorMode,
    lineFlowAlertThreshold,
    /* callbacks */
    openVoltageLevel,
    showInSpreadsheet,
    setErrorMessage,
    onDrawPolygonModeActive,
    onPolygonChanged,
    onDrawEvent,
    isInDrawingMode,
    onNominalVoltagesChange,
}) => {
    const mapEquipments = useSelector((state) => state.mapEquipments);
    const studyUpdatedForce = useSelector((state) => state.studyUpdated);
    const mapDataLoading = useSelector((state) => state.mapDataLoading);
    const studyDisplayMode = useSelector((state) => state.studyDisplayMode);
    const basemap = useSelector((state) => state[PARAM_MAP_BASEMAP]);
    const useName = useSelector((state) => state[PARAM_USE_NAME]);
    const loadFlowStatus = useSelector((state) => state.computingStatus[ComputationType.LOAD_FLOW]);
    const treeModel = useSelector((state) => state.networkModificationTreeModel);
    const centerOnSubstation = useSelector((state) => state.centerOnSubstation);

    const theme = useTheme();

    const rootNodeId = useMemo(() => {
        const rootNode = treeModel?.treeNodes.find((node) => node?.data?.label === ROOT_NODE_LABEL);
        return rootNode?.id;
    }, [treeModel]);

    const dispatch = useDispatch();

    const intlRef = useIntlRef();
    const [isRootNodeGeoDataLoaded, setIsRootNodeGeoDataLoaded] = useState(false);
    const [isInitialized, setInitialized] = useState(false);
    const mapBoxToken = useMapBoxToken();

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

    const disabled = !isNodeBuilt(currentNode);
    const isCurrentNodeBuiltRef = useRef(isNodeBuilt(currentNode));

    const mapManualRefresh = useSelector((state) => state[PARAM_MAP_MANUAL_REFRESH]);
    const refIsMapManualRefreshEnabled = useRef();
    refIsMapManualRefreshEnabled.current = mapManualRefresh;

    const reloadMapNeeded = useSelector((state) => state.reloadMap);

    const isMapEquipmentsInitialized = useSelector((state) => state.isMapEquipmentsInitialized);

    const [equipmentMenu, setEquipmentMenu] = useState({
        position: [-1, -1],
        equipment: null,
        equipmentType: null,
        display: null,
    });

    const [choiceVoltageLevelsSubstationId, setChoiceVoltageLevelsSubstationId] = useState(null);

    const [position, setPosition] = useState([-1, -1]);
    const currentNodeRef = useRef(null);
    const [updatedLines, setUpdatedLines] = useState([]);
    const [updatedTieLines, setUpdatedTieLines] = useState([]);
    const [updatedHvdcLines, setUpdatedHvdcLines] = useState([]);
    const [equipmentToModify, setEquipmentToModify] = useState();
    const [modificationDialogOpen, setModificationDialogOpen] = useState(false);
    const [deletionDialogOpen, setDeletionDialogOpen] = useState(false);

    const closeModificationDialog = () => {
        setEquipmentToModify();
        setModificationDialogOpen(false);
        setDeletionDialogOpen(false);
    };

    function renderModificationDialog() {
        switch (equipmentToModify.equipmentType) {
            case EQUIPMENT_TYPES.SUBSTATION:
                return (
                    <SubstationModificationDialog
                        open={true}
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        isUpdate={true}
                        defaultIdValue={equipmentToModify.equipmentId}
                        onClose={() => closeModificationDialog()}
                    />
                );
            case EQUIPMENT_TYPES.VOLTAGE_LEVEL:
                return (
                    <VoltageLevelModificationDialog
                        open={true}
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        isUpdate={true}
                        defaultIdValue={equipmentToModify.equipmentId}
                        onClose={() => closeModificationDialog()}
                    />
                );
            case EQUIPMENT_TYPES.LINE:
                return (
                    <LineModificationDialog
                        open={true}
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        defaultIdValue={equipmentToModify.equipmentId}
                        isUpdate={true}
                        onClose={() => closeModificationDialog()}
                    />
                );
            default:
                break;
        }
    }

    function renderDeletionDialog() {
        switch (equipmentToModify.equipmentType) {
            case EQUIPMENT_TYPES.HVDC_LINE:
                return (
                    <EquipmentDeletionDialog
                        open={true}
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        defaultIdValue={equipmentToModify.equipmentId}
                        isUpdate={true}
                        onClose={() => closeModificationDialog()}
                    />
                );
            default:
                break;
        }
    }

    const handleOpenModificationDialog = useCallback((equipmentId, equipmentType) => {
        setEquipmentToModify({ equipmentId, equipmentType });
        setModificationDialogOpen(true);
        closeEquipmentMenu();
    }, []);

    const handleOpenDeletionDialog = useCallback((equipmentId, equipmentType) => {
        setEquipmentToModify({ equipmentId, equipmentType });
        setDeletionDialogOpen(true);
        closeEquipmentMenu();
    }, []);

    function withEquipment(Menu, props) {
        return (
            <Menu
                equipment={equipmentMenu.equipment}
                position={equipmentMenu.position}
                handleClose={closeEquipmentMenu}
                handleViewInSpreadsheet={handleViewInSpreadsheet}
                handleDeleteEquipment={handleDeleteEquipment}
                handleOpenModificationDialog={handleOpenModificationDialog}
                {...props}
            />
        );
    }

    const MenuBranch = withOperatingStatusMenu(BaseEquipmentMenu);

    const MenuSubstation = withEquipmentMenu(BaseEquipmentMenu, 'substation-menus', EQUIPMENT_TYPES.SUBSTATION);

    const MenuVoltageLevel = withEquipmentMenu(BaseEquipmentMenu, 'voltage-level-menus', EQUIPMENT_TYPES.VOLTAGE_LEVEL);

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
            if (
                equipmentType === EQUIPMENT_TYPES.HVDC_LINE &&
                mapEquipments?.hvdcLinesById?.get(equipmentId)?.hvdcType === 'LCC'
            ) {
                // only hvdc line with LCC requires a Dialog (to select MCS)
                handleOpenDeletionDialog(equipmentId, EQUIPMENT_TYPES.HVDC_LINE);
            } else {
                deleteEquipment(studyUuid, currentNode?.id, equipmentType, equipmentId, undefined).catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'UnableToDeleteEquipment',
                    });
                });
                closeEquipmentMenu();
            }
        },
        [studyUuid, currentNode?.id, snackError, handleOpenDeletionDialog, mapEquipments?.hvdcLinesById]
    );

    function closeChoiceVoltageLevelMenu() {
        setChoiceVoltageLevelsSubstationId(null);
    }

    function choiceVoltageLevel(voltageLevelId) {
        openVoltageLevel(voltageLevelId);
        closeChoiceVoltageLevelMenu();
    }

    const voltageLevelMenuClick = (equipment, x, y) => {
        // don't display the voltage level menu in drawing mode.
        if (!isInDrawingMode) {
            showEquipmentMenu(equipment, x, y, EQUIPMENT_TYPES.VOLTAGE_LEVEL);
        }
    };

    const chooseVoltageLevelForSubstation = useCallback(
        (idSubstation, x, y) => {
            if (!isInDrawingMode) {
                setChoiceVoltageLevelsSubstationId(idSubstation);
                setPosition([x, y]);
            }
        },
        [isInDrawingMode]
    );

    const getEquipmentsNotFoundIds = useCallback((foundEquipmentPositions, allEquipments) => {
        return allEquipments
            .filter((s) => !foundEquipmentPositions.has(s.id) || temporaryGeoDataIdsRef.current.has(s.id))
            .map((s) => s.id);
    }, []);

    const latLonEqual = (coordinate1, coordinate2) => {
        return coordinate1?.lat === coordinate2?.lat && coordinate1?.lon === coordinate2?.lon;
    };

    const substationPositionsAreEqual = useCallback((substationPos1, substationPos2) => {
        return (
            latLonEqual(substationPos1?.coordinate, substationPos2?.coordinate) &&
            substationPos1?.country === substationPos2?.country
        );
    }, []);

    const linePositionsAreEqual = useCallback((linePos1, linePos2) => {
        return (
            latLonEqual(linePos1?.coordinates?.[0], linePos2?.coordinates?.[0]) &&
            latLonEqual(linePos1?.coordinates?.[1], linePos2?.coordinates?.[1]) &&
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

            return fetchEquipmentCB(studyUuid, currentNodeRef.current?.id, notFoundEquipmentsIds);
        },
        [studyUuid]
    );

    const updateSubstationsTemporaryGeoData = useCallback(
        (requestedPositions, fetchedPositions) => {
            let someDataHasChanged = false;
            fetchedPositions.forEach((pos) => {
                // If the geo data is the same in the geoData and in the server response, it's not updated
                const substationPosition = geoDataRef.current.substationPositionsById.get(pos.id);
                if (!(substationPosition && substationPositionsAreEqual(substationPosition, pos))) {
                    temporaryGeoDataIdsRef.current.add(pos.id);
                    someDataHasChanged = true;
                }
            });

            // If a substation position is requested but not present in the fetched results, its position will be deleted in updateSubstationPositions() and we have to flag here that a position has changed
            requestedPositions
                .filter((id) => !fetchedPositions.map((pos) => pos.id).includes(id))
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
                const linePosition = geoDataRef.current.linePositionsById.get(pos.id);
                if (!(linePosition && linePositionsAreEqual(linePosition, pos))) {
                    temporaryGeoDataIdsRef.current.add(pos.id);
                    someDataHasChanged = true;
                }
            });

            // If a line position is requested but not present in the fetched results, its position will be deleted in updateLinePositions() and we have to flag here that a position has changed
            requestedPositions
                .filter((id) => !fetchedPositions.map((pos) => pos.id).includes(id))
                .forEach((id) => {
                    if (geoDataRef.current.linePositionsById.get(id)) {
                        someDataHasChanged = true;
                    }
                });
            return someDataHasChanged;
        },
        [linePositionsAreEqual]
    );

    const checkNodeConsistency = (node) => {
        if (!isSameNodeAndBuilt(currentNodeRef.current, node)) {
            console.debug(NODE_CHANGED_ERROR);
            return false;
        }
        return true;
    };

    const loadMissingGeoData = useCallback(() => {
        const notFoundSubstationIds = getEquipmentsNotFoundIds(
            geoDataRef.current.substationPositionsById,
            mapEquipments.substations
        );

        const notFoundLineIds = lineFullPath
            ? getEquipmentsNotFoundIds(geoDataRef.current.linePositionsById, mapEquipments.lines)
            : [];

        if (notFoundSubstationIds.length > 0 || notFoundLineIds.length > 0) {
            console.info(
                `Loading geo data of study '${studyUuid}' of missing substations '${notFoundSubstationIds}' and missing lines '${notFoundLineIds}'...`
            );
            dispatch(setMapDataLoading(true));
            const missingSubstationPositions = getMissingEquipmentsPositions(
                notFoundSubstationIds,
                fetchSubstationPositions
            );

            const missingLinesPositions = getMissingEquipmentsPositions(notFoundLineIds, fetchLinePositions);

            const nodeBeforeFetch = currentNodeRef.current;
            Promise.all([missingSubstationPositions, missingLinesPositions])
                .then((positions) => {
                    // If the node changed or if it is not built anymore, we ignore the results returned by the fetch
                    if (!checkNodeConsistency(nodeBeforeFetch)) {
                        return Promise(true); // break
                    }
                    const [fetchedSubstationPositions, fetchedLinePositions] = positions;
                    const substationsDataChanged = updateSubstationsTemporaryGeoData(
                        notFoundSubstationIds,
                        fetchedSubstationPositions
                    );
                    const linesDataChanged = updateLinesTemporaryGeoData(notFoundLineIds, fetchedLinePositions);

                    // If no geo data has changed, we avoid to trigger a new render.
                    if (substationsDataChanged || linesDataChanged) {
                        // If there is new substation positions and that their values are different from the ones that are stored, we instantiate a new Map so that the substations layer rendering is triggered.
                        // Same for line positions.
                        const newGeoData = new GeoData(
                            substationsDataChanged
                                ? new Map(geoDataRef.current.substationPositionsById)
                                : geoDataRef.current.substationPositionsById,
                            // If lineFullPath is off, we need to render the lines layer when there are some substation positions changed
                            linesDataChanged || (!lineFullPath && substationsDataChanged)
                                ? new Map(geoDataRef.current.linePositionsById)
                                : geoDataRef.current.linePositionsById
                        );
                        newGeoData.updateSubstationPositions(notFoundSubstationIds, fetchedSubstationPositions);
                        newGeoData.updateLinePositions(notFoundLineIds, fetchedLinePositions);
                        setGeoData(newGeoData);
                        geoDataRef.current = newGeoData;
                    }
                })
                .catch(function (error) {
                    console.error(error.message);

                    // we display the error to the user only if the node is built
                    if (!checkNodeConsistency(nodeBeforeFetch)) {
                        return;
                    }
                    snackError({
                        messageTxt: error.message,
                        headerId: 'geoDataLoadingFail',
                    });
                })
                .finally(() => {
                    dispatch(setMapDataLoading(false));
                });
        }
    }, [
        dispatch,
        lineFullPath,
        snackError,
        studyUuid,
        getEquipmentsNotFoundIds,
        getMissingEquipmentsPositions,
        mapEquipments?.substations,
        mapEquipments?.lines,
        updateSubstationsTemporaryGeoData,
        updateLinesTemporaryGeoData,
    ]);

    // loads all root node geo-data then saves them in redux
    // it will be considered as the source of truth to check whether we need to fetch geo-data for a specific equipment or not
    const loadRootNodeGeoData = useCallback(() => {
        console.info(`Loading geo data of study '${studyUuid}'...`);
        dispatch(setMapDataLoading(true));

        const substationPositionsDone = fetchSubstationPositions(studyUuid, rootNodeId).then((data) => {
            console.info(`Received substations of study '${studyUuid}'...`);
            const newGeoData = new GeoData(new Map(), geoDataRef.current?.linePositionsById || new Map());
            newGeoData.setSubstationPositions(data);
            setGeoData(newGeoData);
            geoDataRef.current = newGeoData;
        });

        const linePositionsDone = !lineFullPath
            ? Promise.resolve()
            : fetchLinePositions(studyUuid, rootNodeId).then((data) => {
                  console.info(`Received lines of study '${studyUuid}'...`);
                  const newGeoData = new GeoData(geoDataRef.current?.substationPositionsById || new Map(), new Map());
                  newGeoData.setLinePositions(data);
                  setGeoData(newGeoData);
                  geoDataRef.current = newGeoData;
              });

        Promise.all([substationPositionsDone, linePositionsDone])
            .then(() => {
                temporaryGeoDataIdsRef.current = new Set();
                setIsRootNodeGeoDataLoaded(true);
            })
            .catch(function (error) {
                console.error(error.message);
                snackError({
                    messageTxt: error.message,
                    headerId: 'geoDataLoadingFail',
                });
            })
            .finally(() => {
                dispatch(setMapDataLoading(false));
            });
    }, [rootNodeId, lineFullPath, studyUuid, dispatch, snackError]);

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
                // trigger root node geodata fetching
                loadRootNodeGeoData();
                // set initialized to false to trigger "missing geo-data fetching"
                setInitialized(false);
                // set isRootNodeGeoDataLoaded to false so "missing geo-data fetching" waits for root node geo-data to be fully fetched before triggering
                setIsRootNodeGeoDataLoaded(false);
            }
        }
    }, [studyUuid, loadRootNodeGeoData, loadMissingGeoData, lineFullPath]);

    const {
        impactedSubstationsIds,
        deletedEquipments,
        impactedElementTypes,
        resetImpactedSubstationsIds,
        resetDeletedEquipments,
        resetImpactedElementTypes,
    } = useGetStudyImpacts();

    const loadMapEquipments = useCallback(() => {
        if (!isNodeBuilt(currentNode) || !studyUuid) {
            return;
        }
        new GSMapEquipments(studyUuid, currentNode?.id, snackError, dispatch, intlRef);
        dispatch(resetMapReloaded());
    }, [currentNode, dispatch, intlRef, snackError, studyUuid]);

    const reloadMapEquipments = useCallback(
        (currentNodeAtReloadCalling, substationsIds) => {
            if (!isNodeBuilt(currentNode) || !studyUuid || !mapEquipments) {
                return Promise.reject();
            }

            const [updatedSubstations, updatedLines, updatedTieLines, updatedHvdcLines] =
                mapEquipments.reloadImpactedSubstationsEquipments(studyUuid, currentNode, substationsIds);

            const isFullReload = !substationsIds;

            updatedSubstations.then((values) => {
                if (currentNodeAtReloadCalling?.id === currentNodeRef.current?.id) {
                    mapEquipments.updateSubstations(mapEquipments.checkAndGetValues(values), isFullReload);
                }
            });
            updatedLines.then((values) => {
                if (checkNodeConsistency(currentNodeAtReloadCalling)) {
                    mapEquipments.updateLines(mapEquipments.checkAndGetValues(values), isFullReload);
                    setUpdatedLines(values);
                }
            });
            updatedTieLines.then((values) => {
                if (checkNodeConsistency(currentNodeAtReloadCalling)) {
                    mapEquipments.updateTieLines(mapEquipments.checkAndGetValues(values), isFullReload);
                    setUpdatedTieLines(values);
                }
            });
            updatedHvdcLines.then((values) => {
                if (checkNodeConsistency(currentNodeAtReloadCalling)) {
                    mapEquipments.updateHvdcLines(mapEquipments.checkAndGetValues(values), isFullReload);
                    setUpdatedHvdcLines(values);
                }
            });
            return Promise.all([updatedSubstations, updatedLines, updatedTieLines, updatedHvdcLines]).finally(() => {
                dispatch(setMapDataLoading(false));
            });
        },
        [currentNode, dispatch, mapEquipments, studyUuid]
    );

    const updateMapEquipments = useCallback(
        (currentNodeAtReloadCalling) => {
            if (!isNodeBuilt(currentNode) || !studyUuid || !mapEquipments) {
                dispatch(resetMapReloaded());
                return Promise.reject();
            }

            const mapEquipmentsTypes = [
                EQUIPMENT_TYPES.SUBSTATION,
                EQUIPMENT_TYPES.LINE,
                EQUIPMENT_TYPES.TIE_LINE,
                EQUIPMENT_TYPES.HVDC_LINE,
            ];
            const impactedMapEquipmentTypes = impactedElementTypes?.filter((type) => mapEquipmentsTypes.includes(type));
            const isMapCollectionImpact = impactedMapEquipmentTypes?.length > 0;
            const hasSubstationsImpacted = impactedSubstationsIds?.length > 0;

            // @TODO restore this optimization after refactoring
            // to avoid map reload when the impacts on network don't concern
            // map elements (lines, substations...)
            // if (!isMapCollectionImpact && !hasSubstationsImpacted) {
            //     dispatch(resetMapReloaded());
            //     return Promise.reject();
            // }
            console.info('Update map equipments');
            dispatch(setMapDataLoading(true));

            const updatedSubstationsToSend =
                !isMapCollectionImpact && hasSubstationsImpacted ? impactedSubstationsIds : undefined;

            dispatch(resetMapReloaded());
            resetImpactedElementTypes();
            resetImpactedSubstationsIds();
            return reloadMapEquipments(currentNodeAtReloadCalling, updatedSubstationsToSend);
        },
        [
            currentNode,
            dispatch,
            mapEquipments,
            studyUuid,
            impactedElementTypes,
            impactedSubstationsIds,
            resetImpactedElementTypes,
            resetImpactedSubstationsIds,
            reloadMapEquipments,
        ]
    );

    const updateMapEquipmentsAndGeoData = useCallback(() => {
        const currentNodeAtReloadCalling = currentNodeRef.current;
        updateMapEquipments(currentNodeAtReloadCalling).then(() => {
            if (checkNodeConsistency(currentNodeAtReloadCalling)) {
                loadGeoData();
            }
        });
    }, [updateMapEquipments, loadGeoData]);

    useEffect(() => {
        if (isInitialized && studyUpdatedForce.eventData.headers) {
            if (studyUpdatedForce.eventData.headers[UPDATE_TYPE_HEADER] === 'loadflowResult') {
                reloadMapEquipments(currentNodeRef.current);
            }
        }
    }, [isInitialized, studyUpdatedForce, reloadMapEquipments]);

    useEffect(() => {
        if (!mapEquipments || refIsMapManualRefreshEnabled.current) {
            return;
        }
        if (deletedEquipments?.length > 0 && mapEquipments) {
            deletedEquipments.forEach((deletedEquipment) => {
                mapEquipments.removeEquipment(deletedEquipment?.equipmentType, deletedEquipment?.equipmentId);
            });
            resetDeletedEquipments();
        }
    }, [deletedEquipments, mapEquipments, resetDeletedEquipments]);

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
        // as long as rootNodeId is not set, we don't fetch any geodata
        if (!rootNodeId) {
            return;
        }
        // Hack to avoid reload Geo Data when switching display mode to TREE then back to MAP or HYBRID
        // TODO REMOVE LATER
        if (!reloadMapNeeded) {
            return;
        }
        if (!isMapEquipmentsInitialized) {
            // load default node map equipments
            loadMapEquipments();
        }
        if (!isRootNodeGeoDataLoaded) {
            // load root node geodata
            loadRootNodeGeoData();
        }
        if (isRootNodeGeoDataLoaded && isMapEquipmentsInitialized) {
            updateMapEquipmentsAndGeoData();
        }
        // Note: studyUuid and dispatch don't change
    }, [
        rootNodeId,
        disabled,
        studyUuid,
        currentNode,
        loadMapEquipments,
        updateMapEquipmentsAndGeoData,
        loadRootNodeGeoData,
        isRootNodeGeoDataLoaded,
        isMapEquipmentsInitialized,
        isInitialized,
        reloadMapNeeded,
    ]);

    useEffect(() => {
        // when root node geodata are loaded, we fetch current node missing geo-data
        // we check if equipments are done initializing because they are checked to fetch accurate missing geo data
        if (isRootNodeGeoDataLoaded && isMapEquipmentsInitialized && !isInitialized) {
            loadMissingGeoData();
            setInitialized(true);
        }
    }, [isRootNodeGeoDataLoaded, isMapEquipmentsInitialized, isInitialized, loadMissingGeoData]);

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
        if (refIsMapManualRefreshEnabled.current && !previousNodeStatus && isCurrentNodeBuiltRef.current) {
            updateMapEquipmentsAndGeoData();
        }
    }, [currentNode, updateMapEquipmentsAndGeoData]);

    let choiceVoltageLevelsSubstation = null;
    if (choiceVoltageLevelsSubstationId) {
        choiceVoltageLevelsSubstation = mapEquipments?.getSubstation(choiceVoltageLevelsSubstationId);
    }

    const displayEquipmentMenu = (equipment, x, y, equipmentType, isInDrawingMode) => {
        // don't display the equipment menu in drawing mode.
        if (!isInDrawingMode) {
            showEquipmentMenu(equipment, x, y, equipmentType);
        }
    };
    const renderEquipmentMenu = () => {
        if (disabled || equipmentMenu.equipment === null || !equipmentMenu.display) {
            return <></>;
        }
        return (
            <>
                {(equipmentMenu.equipmentType === EQUIPMENT_TYPES.LINE ||
                    equipmentMenu.equipmentType === EQUIPMENT_TYPES.HVDC_LINE) &&
                    withEquipment(MenuBranch, {
                        currentNode,
                        studyUuid,
                        equipmentType: equipmentMenu.equipmentType,
                    })}
                {equipmentMenu.equipmentType === EQUIPMENT_TYPES.SUBSTATION && withEquipment(MenuSubstation)}
                {equipmentMenu.equipmentType === EQUIPMENT_TYPES.VOLTAGE_LEVEL && withEquipment(MenuVoltageLevel)}
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

    const renderLinePopover = (elementId, ref) => (
        <EquipmentPopover
            studyUuid={studyUuid}
            anchorEl={ref}
            equipmentId={elementId}
            equipmentType={EQUIPMENT_TYPES.LINE}
            loadFlowStatus={loadFlowStatus}
        />
    );

    const renderMap = () => (
        <NetworkMap
            ref={networkMapRef}
            mapEquipments={mapEquipments}
            geoData={geoData}
            updatedLines={[...(updatedLines ?? []), ...(updatedTieLines ?? []), ...(updatedHvdcLines ?? [])]}
            displayOverlayLoader={!basicDataReady && mapDataLoading}
            filteredNominalVoltages={filteredNominalVoltages}
            labelsZoomThreshold={LABELS_ZOOM_THRESHOLD}
            arrowsZoomThreshold={ARROWS_ZOOM_THRESHOLD}
            initialPosition={INITIAL_POSITION}
            initialZoom={INITIAL_ZOOM}
            lineFullPath={lineFullPath}
            lineParallelPath={lineParallelPath}
            lineFlowMode={lineFlowMode}
            lineFlowColorMode={lineFlowColorMode}
            lineFlowAlertThreshold={lineFlowAlertThreshold}
            useName={useName}
            visible={visible}
            disabled={disabled}
            onSubstationClick={openVoltageLevel}
            onSubstationClickChooseVoltageLevel={chooseVoltageLevelForSubstation}
            onSubstationMenuClick={(equipment, x, y) =>
                displayEquipmentMenu(equipment, x, y, EQUIPMENT_TYPES.SUBSTATION, isInDrawingMode)
            }
            onLineMenuClick={(equipment, x, y) =>
                displayEquipmentMenu(equipment, x, y, EQUIPMENT_TYPES.LINE, isInDrawingMode)
            }
            onHvdcLineMenuClick={(equipment, x, y) =>
                displayEquipmentMenu(equipment, x, y, EQUIPMENT_TYPES.HVDC_LINE, isInDrawingMode)
            }
            onVoltageLevelMenuClick={voltageLevelMenuClick}
            mapBoxToken={mapBoxToken}
            centerOnSubstation={centerOnSubstation}
            isManualRefreshBackdropDisplayed={mapManualRefresh && reloadMapNeeded && isNodeBuilt(currentNode)}
            // only 2 things need this to ensure the map keeps the correct size:
            // - changing study display mode because it changes the map container size
            //   programmatically
            // - changing visible when the map provider is changed in the settings because
            //   it causes a render with the map container having display:none
            onManualRefreshClick={updateMapEquipmentsAndGeoData}
            triggerMapResizeOnChange={[studyDisplayMode, visible]}
            renderPopover={renderLinePopover}
            mapLibrary={basemap}
            mapTheme={theme?.palette.mode}
            areFlowsValid={loadFlowStatus === RunningStatus.SUCCEED}
            onDrawPolygonModeActive={(active) => {
                onDrawPolygonModeActive(active);
            }}
            onPolygonChanged={(features) => {
                onPolygonChanged(features);
            }}
            onDrawEvent={(event) => {
                onDrawEvent(event);
            }}
            shouldDisableToolTip={isInDrawingMode}
        />
    );

    function handleChange(newValues) {
        setFilteredNominalVoltages(newValues);
        onNominalVoltagesChange(newValues);
    }

    function renderNominalVoltageFilter() {
        return (
            <Box sx={styles.divNominalVoltageFilter}>
                <NominalVoltageFilter
                    nominalVoltages={mapEquipments.getNominalVoltages()}
                    filteredNominalVoltages={filteredNominalVoltages}
                    onChange={handleChange}
                />
            </Box>
        );
    }

    return (
        <>
            <Box sx={styles.divTemporaryGeoDataLoading}>{basicDataReady && mapDataLoading && <LinearProgress />}</Box>
            {renderMap()}
            {!isInDrawingMode && (
                <>
                    {renderEquipmentMenu()}
                    {modificationDialogOpen && renderModificationDialog()}
                    {deletionDialogOpen && renderDeletionDialog()}
                    {choiceVoltageLevelsSubstationId && renderVoltageLevelChoice()}
                </>
            )}
            {mapEquipments?.substations?.length > 0 && renderNominalVoltageFilter()}
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
    view: PropTypes.any,
    onSubstationClickChooseVoltageLevel: PropTypes.func,
    onSubstationMenuClick: PropTypes.func,
    mapRef: PropTypes.any,
    onDrawPolygonModeActive: PropTypes.func,
    onPolygonChanged: PropTypes.func,
    onDrawEvent: PropTypes.func,
    isInDrawingMode: PropTypes.bool,
    onNominalVoltagesChange: PropTypes.func,
};

export default NetworkMapTab;
