/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    NetworkMap,
    GeoData,
    NetworkMapRef,
    LineFlowMode,
    LineFlowColorMode,
    DRAW_MODES,
} from '@powsybl/diagram-viewer';
import { useCallback, useEffect, useState, useRef, useMemo, RefObject } from 'react';
import withOperatingStatusMenu, { MenuBranchProps } from '../menus/operating-status-menu';
import BaseEquipmentMenu from '../menus/base-equipment-menu';
import withEquipmentMenu from '../menus/equipment-menu';
import VoltageLevelChoice from '../voltage-level-choice';
import NominalVoltageFilter from './nominal-voltage-filter';
import { useDispatch, useSelector } from 'react-redux';
import { PARAM_MAP_BASEMAP, PARAM_MAP_MANUAL_REFRESH, PARAM_USE_NAME } from '../../utils/config-params';
import { Equipment, EquipmentType, useIntlRef, useSnackMessage } from '@gridsuite/commons-ui';
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
import RunningStatus from 'components/utils/running-status';
import ComputingType from 'components/computing-status/computing-type';
import { useGetStudyImpacts } from 'hooks/use-get-study-impacts';
import { ROOT_NODE_LABEL } from '../../constants/node.constant';
import { UUID } from 'crypto';
import { AppState, CurrentTreeNode } from 'redux/reducer';
import {
    Coordinate,
    Line,
    Substation,
} from '@powsybl/diagram-viewer/dist/components/network-map-viewer/network/geo-data';
import {
    Equipment as EquipmentMap,
    Substation as SubstationMap,
    Line as LineMap,
    VoltageLevel as VoltageLevelMap,
} from '@powsybl/diagram-viewer/dist/components/network-map-viewer/network/map-equipments';
import { useTheme } from '@mui/material';
import {
    fetchHvdcLinesMapInfos,
    fetchLinesMapInfos,
    fetchSubstationsMapInfos,
    fetchTieLinesMapInfos,
} from 'services/study/network';
const INITIAL_POSITION = [0, 0] as [number, number];
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

type NetworkMapTabProps = {
    networkMapRef: React.RefObject<NetworkMapRef>;
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    visible: boolean;
    lineFullPath: boolean;
    lineParallelPath: boolean;
    lineFlowMode: LineFlowMode;
    lineFlowColorMode: LineFlowColorMode;
    lineFlowAlertThreshold: number;
    openVoltageLevel: (idVoltageLevel: string) => void;
    showInSpreadsheet: (equipment: { equipmentType: EquipmentType; equipmentId: string }) => void;
    setErrorMessage: (message: string) => void;
    onDrawPolygonModeActive: (active: DRAW_MODES) => void;
    onPolygonChanged: (polygoneFeature: any) => void;
    onDrawEvent: (drawEvent: number) => void;
    isInDrawingMode: boolean;
    onNominalVoltagesChange: (nominalVoltages: unknown[]) => void;
};

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
}: NetworkMapTabProps) => {
    const mapEquipments = useSelector((state: AppState) => state.mapEquipments);
    const studyUpdatedForce = useSelector((state: AppState) => state.studyUpdated);
    const mapDataLoading = useSelector((state: AppState) => state.mapDataLoading);
    const studyDisplayMode = useSelector((state: AppState) => state.studyDisplayMode);
    const basemap = useSelector((state: AppState) => state[PARAM_MAP_BASEMAP]);
    const useName = useSelector((state: AppState) => state[PARAM_USE_NAME]);
    const loadFlowStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.LOAD_FLOW]);
    const treeModel = useSelector((state: AppState) => state.networkModificationTreeModel);
    const centerOnSubstation = useSelector((state: AppState) => state.centerOnSubstation);

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

    const [filteredNominalVoltages, setFilteredNominalVoltages] = useState<unknown[]>();
    const [geoData, setGeoData] = useState<GeoData>();
    const geoDataRef = useRef<any>();

    const basicDataReady = mapEquipments && geoData;

    const lineFullPathRef = useRef<boolean>();

    /*
    This Set stores the geo data that are collected from the server AFTER the initialization.
    The bunch of geo data requested at the initialization of the map are stored as permanent data. It will not be requested again.
    The delta of geo data that is needed after the initialization is tagged as temporary. Each time some new geo data is requested, the full delta is downloaded.

    This workaround is required in the case of line/substation creation. By example, the position of a substation can change after being connected to one or two lines
    and this position would need to be requested again.
    It will be possible to have a better mechanism after we improved the notification system.
    */
    const temporaryGeoDataIdsRef = useRef<Set<string>>();

    const disabled = !isNodeBuilt(currentNode);
    const isCurrentNodeBuiltRef = useRef(isNodeBuilt(currentNode));

    const mapManualRefresh = useSelector((state: AppState) => state[PARAM_MAP_MANUAL_REFRESH]);
    const refIsMapManualRefreshEnabled = useRef<boolean>();
    refIsMapManualRefreshEnabled.current = mapManualRefresh;

    const reloadMapNeeded = useSelector((state: AppState) => state.reloadMap);

    const isMapEquipmentsInitialized = useSelector((state: AppState) => state.isMapEquipmentsInitialized);

    type EquipmentMenuProps = {
        position?: [number, number] | null;
        equipment?: Equipment;
        equipmentType?: EquipmentType;
        display: boolean;
    };

    const [equipmentMenu, setEquipmentMenu] = useState<EquipmentMenuProps>();

    const [choiceVoltageLevelsSubstationId, setChoiceVoltageLevelsSubstationId] = useState<string | null>(null);

    const [position, setPosition] = useState([-1, -1]);
    const currentNodeRef = useRef<CurrentTreeNode | null>(null);
    const [updatedLines, setUpdatedLines] = useState<Line[]>([]);
    const [updatedTieLines, setUpdatedTieLines] = useState<Line[]>([]);
    const [updatedHvdcLines, setUpdatedHvdcLines] = useState<Line[]>([]);
    const [equipmentToModify, setEquipmentToModify] = useState<Equipment | null>();
    const [modificationDialogOpen, setModificationDialogOpen] = useState(false);
    const [deletionDialogOpen, setDeletionDialogOpen] = useState(false);

    const closeModificationDialog = () => {
        setEquipmentToModify(null);
        setModificationDialogOpen(false);
        setDeletionDialogOpen(false);
    };

    function renderModificationDialog() {
        switch (equipmentToModify?.type) {
            case EquipmentType.SUBSTATION:
                return (
                    <SubstationModificationDialog
                        open={true}
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        isUpdate={true}
                        defaultIdValue={equipmentToModify?.id}
                        onClose={() => closeModificationDialog()}
                        editData={null}
                        editDataFetchStatus={null}
                    />
                );
            case EquipmentType.VOLTAGE_LEVEL:
                return (
                    <VoltageLevelModificationDialog
                        open={true}
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        isUpdate={true}
                        defaultIdValue={equipmentToModify?.id}
                        onClose={() => closeModificationDialog()}
                        editData={null}
                        editDataFetchStatus={null}
                    />
                );
            case EquipmentType.LINE:
                return (
                    <LineModificationDialog
                        open={true}
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        defaultIdValue={equipmentToModify?.id}
                        isUpdate={true}
                        onClose={() => closeModificationDialog()}
                        editData={null}
                        editDataFetchStatus={null}
                    />
                );
            default:
                break;
        }
    }

    function renderDeletionDialog() {
        switch (equipmentToModify?.type) {
            case EquipmentType.HVDC_LINE:
                return (
                    <EquipmentDeletionDialog
                        open={true}
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        defaultIdValue={equipmentToModify?.id}
                        isUpdate={true}
                        onClose={() => closeModificationDialog()}
                        editData={null}
                        editDataFetchStatus={null}
                    />
                );
            default:
                break;
        }
    }

    const handleOpenModificationDialog = useCallback((id: string, type: EquipmentType | null) => {
        if (type) {
            setEquipmentToModify({ id, type });
            setModificationDialogOpen(true);
            closeEquipmentMenu();
        }
    }, []);

    const handleOpenDeletionDialog = useCallback((id: string, type: EquipmentType) => {
        setEquipmentToModify({ id, type });
        setDeletionDialogOpen(true);
        closeEquipmentMenu();
    }, []);

    type MenuProps = {
        currentNode: CurrentTreeNode;
        studyUuid: UUID;
        equipmentType: EquipmentType;
    };
    function withEquipment(Menu: React.FC<MenuBranchProps>, props: MenuProps | null) {
        return (
            equipmentMenu?.equipment &&
            equipmentMenu.position &&
            equipmentMenu?.equipmentType && (
                <Menu
                    equipment={equipmentMenu?.equipment}
                    equipmentType={equipmentMenu?.equipmentType}
                    position={equipmentMenu.position}
                    handleClose={closeEquipmentMenu}
                    handleViewInSpreadsheet={handleViewInSpreadsheet}
                    handleDeleteEquipment={handleDeleteEquipment}
                    handleOpenModificationDialog={handleOpenModificationDialog}
                    {...props}
                />
            )
        );
    }

    const MenuBranch = withOperatingStatusMenu(BaseEquipmentMenu);

    const MenuSubstation = withEquipmentMenu(BaseEquipmentMenu, EquipmentType.SUBSTATION, 'substation-menus');

    const MenuVoltageLevel = withEquipmentMenu(BaseEquipmentMenu, EquipmentType.VOLTAGE_LEVEL, 'voltage-level-menus');

    function showEquipmentMenu(equipment: Equipment, x: number, y: number, type: EquipmentType) {
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

    function handleViewInSpreadsheet(equipmentType: EquipmentType, equipmentId: string) {
        showInSpreadsheet({
            equipmentType: equipmentType,
            equipmentId: equipmentId,
        });
        closeEquipmentMenu();
    }

    const handleDeleteEquipment = useCallback(
        (equipmentType: EquipmentType | null, equipmentId: string) => {
            const equipment = mapEquipments?.hvdcLinesById?.get(equipmentId) as Equipment;
            if (
                equipmentType === EquipmentType.HVDC_LINE &&
                equipment &&
                'hvdcType' in equipment &&
                equipment.hvdcType === 'LCC'
            ) {
                // only hvdc line with LCC requires a Dialog (to select MCS)
                handleOpenDeletionDialog(equipmentId, EquipmentType.HVDC_LINE);
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

    function choiceVoltageLevel(voltageLevelId: string) {
        openVoltageLevel(voltageLevelId);
        closeChoiceVoltageLevelMenu();
    }

    const voltageLevelMenuClick = (equipment: VoltageLevelMap, x: number, y: number) => {
        // don't display the voltage level menu in drawing mode.
        if (!isInDrawingMode) {
            showEquipmentMenu(equipment as Equipment, x, y, EquipmentType.VOLTAGE_LEVEL);
        }
    };

    const chooseVoltageLevelForSubstation = useCallback(
        (idSubstation: string, x: number, y: number) => {
            if (!isInDrawingMode) {
                setChoiceVoltageLevelsSubstationId(idSubstation);
                setPosition([x, y]);
            }
        },
        [isInDrawingMode]
    );

    const getEquipmentsNotFoundIds = useCallback(
        (foundEquipmentPositions: Map<string, number>, allEquipments: Substation[] | Line[]) => {
            return allEquipments
                .filter((s) => !foundEquipmentPositions.has(s.id) || temporaryGeoDataIdsRef?.current?.has(s.id))
                .map((s) => s.id);
        },
        []
    );

    const latLonEqual = (coordinate1: Coordinate, coordinate2: Coordinate) => {
        return coordinate1?.lat === coordinate2?.lat && coordinate1?.lon === coordinate2?.lon;
    };

    const substationPositionsAreEqual = useCallback((substationPos1: Substation, substationPos2: Substation) => {
        return (
            latLonEqual(substationPos1?.coordinate, substationPos2?.coordinate) &&
            substationPos1?.country === substationPos2?.country
        );
    }, []);

    const linePositionsAreEqual = useCallback((linePos1: Line, linePos2: Line) => {
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
        (
            notFoundEquipmentsIds: string[],
            fetchEquipmentCB: (studyUuid: UUID, nodeId: UUID, equipmentIds: string[]) => Promise<any[]>
        ) => {
            if (notFoundEquipmentsIds.length === 0) {
                return Promise.resolve([]);
            }

            return fetchEquipmentCB(studyUuid, currentNodeRef?.current!.id, notFoundEquipmentsIds);
        },
        [studyUuid]
    );

    const updateSubstationsTemporaryGeoData = useCallback(
        (requestedPositions: string[], fetchedPositions: Substation[]) => {
            let someDataHasChanged = false;
            fetchedPositions.forEach((pos) => {
                // If the geo data is the same in the geoData and in the server response, it's not updated
                const substationPosition = geoDataRef?.current?.substationPositionsById.get(pos.id);
                if (!(substationPosition && substationPositionsAreEqual(substationPosition, pos))) {
                    temporaryGeoDataIdsRef?.current?.add(pos.id);
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
        (requestedPositions: string[], fetchedPositions: Line[]) => {
            let someDataHasChanged = false;
            fetchedPositions.forEach((pos) => {
                // If the geo data is the same in the geoData and in the server response, it's not updated
                const linePosition = geoDataRef.current.linePositionsById.get(pos.id);
                if (!(linePosition && linePositionsAreEqual(linePosition, pos))) {
                    temporaryGeoDataIdsRef?.current?.add(pos.id);
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

    const checkNodeConsistency = (node: CurrentTreeNode | null) => {
        if (!isSameNodeAndBuilt(currentNodeRef.current, node)) {
            console.debug(NODE_CHANGED_ERROR);
            return false;
        }
        return true;
    };

    const loadMissingGeoData = useCallback(() => {
        const notFoundSubstationIds = getEquipmentsNotFoundIds(
            geoDataRef.current.substationPositionsById,
            mapEquipments?.substations as Substation[]
        );

        const notFoundLineIds = lineFullPath
            ? getEquipmentsNotFoundIds(geoDataRef.current.linePositionsById, mapEquipments?.lines as Line[])
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
                        return Promise.resolve(true);
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
        (currentNodeAtReloadCalling: CurrentTreeNode | null, substationsIds: UUID[] | undefined) => {
            if (!isNodeBuilt(currentNode) || !studyUuid || !mapEquipments) {
                return Promise.reject();
            }

            //const [updatedSubstations, updatedLines, updatedTieLines, updatedHvdcLines] =
            // mapEquipments.reloadImpactedSubstationsEquipments(studyUuid, currentNode, substationsIds);
            const updatedSubstations = fetchSubstationsMapInfos(studyUuid, currentNode?.id, substationsIds, true);
            const updatedLines = fetchLinesMapInfos(studyUuid, currentNode?.id, substationsIds, true);
            const updatedTieLines = fetchTieLinesMapInfos(studyUuid, currentNode?.id, substationsIds, true);
            const updatedHvdcLines = fetchHvdcLinesMapInfos(studyUuid, currentNode?.id, substationsIds, true);
            const isFullReload = !substationsIds;

            updatedSubstations.then((values: Substation[] | null) => {
                if (currentNodeAtReloadCalling?.id === currentNodeRef.current?.id) {
                    mapEquipments.updateSubstations(mapEquipments.checkAndGetValues(values), isFullReload);
                }
            });
            updatedLines.then((values: Line[]) => {
                if (checkNodeConsistency(currentNodeAtReloadCalling)) {
                    mapEquipments.updateLines(mapEquipments.checkAndGetValues(values), isFullReload);
                    setUpdatedLines(values);
                }
            });
            updatedTieLines.then((values: Line[]) => {
                if (checkNodeConsistency(currentNodeAtReloadCalling)) {
                    mapEquipments.updateTieLines(mapEquipments.checkAndGetValues(values), isFullReload);
                    setUpdatedTieLines(values);
                }
            });
            updatedHvdcLines.then((values: Line[]) => {
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
        (currentNodeAtReloadCalling: CurrentTreeNode | null) => {
            if (!isNodeBuilt(currentNode) || !studyUuid || !mapEquipments) {
                dispatch(resetMapReloaded());
                return Promise.reject();
            }

            const mapEquipmentsTypes = [
                EquipmentType.SUBSTATION,
                EquipmentType.LINE,
                EquipmentType.TIE_LINE,
                EquipmentType.HVDC_LINE,
            ];
            const impactedMapEquipmentTypes = impactedElementTypes?.filter((type: string) => {
                return mapEquipmentsTypes.includes(type as EquipmentType);
            });
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
            studyUuid,
            mapEquipments,
            impactedElementTypes,
            impactedSubstationsIds,
            dispatch,
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
    }, [loadGeoData, updateMapEquipments]);

    useEffect(() => {
        if (isInitialized && studyUpdatedForce.eventData.headers) {
            if (studyUpdatedForce.eventData.headers[UPDATE_TYPE_HEADER] === 'loadflowResult') {
                reloadMapEquipments(currentNodeRef.current, undefined);
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

    let choiceVoltageLevelsSubstation: EquipmentMap | null = null;
    if (choiceVoltageLevelsSubstationId) {
        choiceVoltageLevelsSubstation = mapEquipments?.getSubstation(choiceVoltageLevelsSubstationId);
    }

    const displayEquipmentMenu = (
        equipment: Equipment,
        x: number,
        y: number,
        equipmentType: EquipmentType,
        isInDrawingMode: boolean
    ) => {
        // don't display the equipment menu in drawing mode.
        if (!isInDrawingMode) {
            showEquipmentMenu(equipment, x, y, equipmentType);
        }
    };
    const renderEquipmentMenu = () => {
        if (disabled || equipmentMenu?.equipment === null || !equipmentMenu?.display) {
            return <></>;
        }
        return (
            <>
                {(equipmentMenu.equipmentType === EquipmentType.LINE ||
                    equipmentMenu.equipmentType === EquipmentType.HVDC_LINE) &&
                    withEquipment(MenuBranch, {
                        currentNode,
                        studyUuid,
                        equipmentType: equipmentMenu.equipmentType,
                    })}
                {equipmentMenu.equipmentType === EquipmentType.SUBSTATION && withEquipment(MenuSubstation, null)}
                {equipmentMenu.equipmentType === EquipmentType.VOLTAGE_LEVEL && withEquipment(MenuVoltageLevel, null)}
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

    const renderLinePopover = (elementId: string, ref: RefObject<HTMLDivElement>) => (
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
            onSubstationMenuClick={(equipment: SubstationMap, x: number, y: number) =>
                displayEquipmentMenu(equipment as Equipment, x, y, EquipmentType.SUBSTATION, isInDrawingMode)
            }
            onLineMenuClick={(equipment: LineMap, x: number, y: number) =>
                displayEquipmentMenu(equipment as Equipment, x, y, EquipmentType.LINE, isInDrawingMode)
            }
            onHvdcLineMenuClick={(equipment: EquipmentMap, x: number, y: number) =>
                displayEquipmentMenu(equipment as Equipment, x, y, EquipmentType.HVDC_LINE, isInDrawingMode)
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
            onDrawPolygonModeActive={(active: DRAW_MODES) => {
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

    function handleChange(newValues: unknown[]) {
        setFilteredNominalVoltages(newValues);
        onNominalVoltagesChange(newValues);
    }

    function renderNominalVoltageFilter() {
        return (
            <Box sx={styles.divNominalVoltageFilter}>
                <NominalVoltageFilter
                    nominalVoltages={mapEquipments?.getNominalVoltages()}
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
            {mapEquipments && mapEquipments?.substations?.length > 0 && renderNominalVoltageFilter()}
        </>
    );
};

export default NetworkMapTab;
