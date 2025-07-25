/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { Writable } from 'type-fest';
import {
    type Coordinate,
    DRAW_MODES,
    GeoData,
    type GeoDataEquipment,
    type GeoDataLine,
    type GeoDataSubstation,
    LineFlowMode,
    type MapHvdcLine,
    type MapLine,
    type MapSubstation,
    type MapTieLine,
    type MapVoltageLevel,
    NetworkMap,
    type NetworkMapProps,
    type NetworkMapRef,
} from '@powsybl/network-viewer';
import { type RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapEquipment as BaseEquipment } from '../menus/base-equipment-menu';
import VoltageLevelChoice from '../voltage-level-choice';
import NominalVoltageFilter, { type NominalVoltageFilterProps } from './nominal-voltage-filter';
import { useDispatch, useSelector } from 'react-redux';
import { PARAM_USE_NAME } from '../../utils/config-params';
import {
    EquipmentType,
    useNotificationsListener,
    useSnackMessage,
    EquipmentInfos,
    NotificationsUrlKeys,
    ComputingType,
} from '@gridsuite/commons-ui';
import { isNodeBuilt, isNodeRenamed, isSameNodeAndBuilt } from '../graph/util/model-functions';
import { openDiagram, resetMapEquipment, setMapDataLoading, setReloadMapNeeded } from '../../redux/actions';
import GSMapEquipments from './gs-map-equipments';
import { Box, Button, LinearProgress, Tooltip, useTheme } from '@mui/material';
import { EQUIPMENT_TYPES } from '../utils/equipment-types';
import { deleteEquipment } from '../../services/study/network-modifications';
import { fetchLinePositions, fetchSubstationPositions } from '../../services/study/geo-data';
import { useMapBoxToken } from './network-map/use-mapbox-token';
import EquipmentPopover from '../tooltips/equipment-popover';
import RunningStatus from 'components/utils/running-status';
import { useGetStudyImpacts } from 'hooks/use-get-study-impacts';
import { ROOT_NODE_LABEL } from '../../constants/node.constant';
import { UUID } from 'crypto';
import { AppState } from 'redux/reducer';
import { isReactFlowRootNodeData } from 'redux/utils';
import { isLoadflowResultNotification, isRootNetworksUpdatedNotification } from 'types/notification-types';
import { CurrentTreeNode } from 'components/graph/tree-node.type';
import { FormattedMessage } from 'react-intl';
import { Search } from '@mui/icons-material';
import { TopBarEquipmentSearchDialog } from 'components/top-bar-equipment-seach-dialog/top-bar-equipment-search-dialog';
import { DiagramType } from 'components/diagrams/diagram.type';
import { useEquipmentMenu } from '../../hooks/use-equipment-menu';
import useEquipmentDialogs from 'hooks/use-equipment-dialogs';

const INITIAL_POSITION = [0, 0] as const;
const INITIAL_ZOOM = 9;
const LABELS_ZOOM_THRESHOLD = 9;
const ARROWS_ZOOM_THRESHOLD = 7;
const EMPTY_ARRAY: any[] = [];

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
    divSearchIcon: {
        position: 'absolute',
        right: 0,
        top: '100px',
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

    searchButton: {
        minWidth: 'auto',
        padding: '3px 2px 2px 3px',
        marginRight: '10px',
        color: '#555',
        backgroundColor: 'white',
        '&:hover': {
            backgroundColor: '#f2f2f2',
        },
    },
};

const NODE_CHANGED_ERROR = 'Node has changed or is not built anymore. The Promise is rejected.';

type NetworkMapTabProps = {
    networkMapRef: RefObject<NetworkMapRef>;
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    visible: boolean;
    lineFullPath: boolean;
    lineParallelPath: boolean;
    lineFlowMode: LineFlowMode;
    openVoltageLevel: (idVoltageLevel: string) => void;
    showInSpreadsheet: (equipment: { equipmentType: EquipmentType; equipmentId: string }) => void;
    onDrawPolygonModeActive: (active: DRAW_MODES) => void;
    onPolygonChanged: (polygoneFeature: any) => void;
    onDrawEvent: (drawEvent: number) => void;
    isInDrawingMode: boolean;
    onNominalVoltagesChange: (nominalVoltages: number[]) => void;
};

export const NetworkMapTab = ({
    networkMapRef,
    /* redux can be use as redux*/
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    /* visual*/
    visible,
    lineFullPath,
    lineParallelPath,
    lineFlowMode,
    /* callbacks */
    openVoltageLevel,
    showInSpreadsheet,
    onDrawPolygonModeActive,
    onPolygonChanged,
    onDrawEvent,
    isInDrawingMode,
    onNominalVoltagesChange,
}: NetworkMapTabProps) => {
    const mapEquipments = useSelector((state: AppState) => state.mapEquipments);
    const mapDataLoading = useSelector((state: AppState) => state.mapDataLoading);
    const studyDisplayMode = useSelector((state: AppState) => state.studyDisplayMode);
    const useName = useSelector((state: AppState) => state[PARAM_USE_NAME]);
    const loadFlowStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.LOAD_FLOW]);
    const treeModel = useSelector((state: AppState) => state.networkModificationTreeModel);
    const centerOnSubstation = useSelector((state: AppState) => state.centerOnSubstation);
    const networkVisuParams = useSelector((state: AppState) => state.networkVisualizationsParameters);
    const isNetworkModificationTreeUpToDate = useSelector(
        (state: AppState) => state.isNetworkModificationTreeModelUpToDate
    );

    const theme = useTheme();

    const rootNodeId = useMemo(() => {
        const rootNode = treeModel?.treeNodes.find((node) => node?.data?.label === ROOT_NODE_LABEL);
        return rootNode?.id;
    }, [treeModel]);

    const dispatch = useDispatch();

    const [isRootNodeGeoDataLoaded, setIsRootNodeGeoDataLoaded] = useState(false);
    const [isInitialized, setInitialized] = useState(false);
    const mapBoxToken = useMapBoxToken();

    const { snackError } = useSnackMessage();

    const [filteredNominalVoltages, setFilteredNominalVoltages] = useState<number[]>();
    const [geoData, setGeoData] = useState<GeoData>();
    const geoDataRef = useRef<any>();

    const basicDataReady = mapEquipments && geoData;

    const lineFullPathRef = useRef<boolean>();
    const [isDialogSearchOpen, setIsDialogSearchOpen] = useState(false);

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
    const reloadMapNeeded = useSelector((state: AppState) => state.reloadMapNeeded);
    const freezeMapUpdates = useSelector((state: AppState) => state.freezeMapUpdates);
    const isMapEquipmentsInitialized = useSelector((state: AppState) => state.isMapEquipmentsInitialized);
    const refIsMapManualRefreshEnabled = useRef<boolean>();
    refIsMapManualRefreshEnabled.current = networkVisuParams.mapParameters.mapManualRefresh;

    const [choiceVoltageLevelsSubstationId, setChoiceVoltageLevelsSubstationId] = useState<string | null>(null);

    const [position, setPosition] = useState([-1, -1]);
    const currentNodeRef = useRef<CurrentTreeNode | null>(null);
    const currentRootNetworkUuidRef = useRef<UUID | null>(null);

    const [updatedLines, setUpdatedLines] = useState<MapLine[]>([]);
    const [updatedTieLines, setUpdatedTieLines] = useState<MapTieLine[]>([]);
    const [updatedHvdcLines, setUpdatedHvdcLines] = useState<MapHvdcLine[]>([]);

    const {
        handleOpenModificationDialog,
        handleOpenDeletionDialog,
        handleOpenDynamicSimulationEventDialog,
        renderDeletionDialog,
        renderModificationDialog,
        renderDynamicSimulationEventDialog,
    } = useEquipmentDialogs({
        studyUuid: studyUuid,
        currentNode: currentNode,
        currentRootNetworkUuid: currentRootNetworkUuid,
    });

    const handleDeleteEquipment = useCallback(
        (equipmentType: EquipmentType | null, equipmentId: string) => {
            if (
                equipmentType === EquipmentType.HVDC_LINE &&
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

    const { openEquipmentMenu, renderEquipmentMenu } = useEquipmentMenu({
        currentNode,
        currentRootNetworkUuid,
        studyUuid,
        disabled,
        onViewInSpreadsheet: (equipmentType: EquipmentType, equipmentId: string) => {
            showInSpreadsheet({
                equipmentType: equipmentType,
                equipmentId: equipmentId,
            });
        },
        onDeleteEquipment: handleDeleteEquipment,
        onOpenModificationDialog: handleOpenModificationDialog,
        onOpenDynamicSimulationEventDialog: handleOpenDynamicSimulationEventDialog,
    });

    const voltageLevelMenuClick = (equipment: MapVoltageLevel, x: number, y: number) => {
        // don't display the voltage level menu in drawing mode.
        if (!isInDrawingMode) {
            openEquipmentMenu(equipment as unknown as BaseEquipment, x, y, EquipmentType.VOLTAGE_LEVEL);
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
        (foundEquipmentPositions: Map<string, number>, allEquipments: GeoDataEquipment[]) => {
            return allEquipments
                .filter((s) => !foundEquipmentPositions.has(s.id) || temporaryGeoDataIdsRef?.current?.has(s.id))
                .map((s) => s.id);
        },
        []
    );

    const latLonEqual = (coordinate1: Coordinate, coordinate2: Coordinate) => {
        return coordinate1?.lat === coordinate2?.lat && coordinate1?.lon === coordinate2?.lon;
    };

    const substationPositionsAreEqual = useCallback(
        (substationPos1: GeoDataSubstation, substationPos2: GeoDataSubstation) => {
            return (
                latLonEqual(substationPos1?.coordinate, substationPos2?.coordinate) &&
                substationPos1?.country === substationPos2?.country
            );
        },
        []
    );

    const linePositionsAreEqual = useCallback((linePos1: GeoDataLine, linePos2: GeoDataLine) => {
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
            fetchEquipmentCB: (
                studyUuid: UUID,
                nodeId: UUID,
                currentRootNetworkUuid: UUID,
                equipmentIds: string[]
            ) => Promise<any[]>
        ) => {
            if (notFoundEquipmentsIds.length === 0 || !currentNodeRef.current || !currentRootNetworkUuidRef.current) {
                return Promise.resolve([]);
            }

            return fetchEquipmentCB(
                studyUuid,
                currentNodeRef.current!.id,
                currentRootNetworkUuidRef.current,
                notFoundEquipmentsIds
            );
        },
        [studyUuid]
    );

    const updateSubstationsTemporaryGeoData = useCallback(
        (requestedPositions: string[], fetchedPositions: GeoDataSubstation[]) => {
            let someDataHasChanged = false;
            fetchedPositions.forEach((pos) => {
                // If the geo data is the same in the geoData and in the server response, it's not updated
                const substationPosition = geoDataRef?.current?.substationPositionsById.get(pos.id);
                if (!(substationPosition && substationPositionsAreEqual(substationPosition, pos))) {
                    temporaryGeoDataIdsRef.current?.add(pos.id);
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
        (requestedPositions: string[], fetchedPositions: GeoDataLine[]) => {
            let someDataHasChanged = false;
            fetchedPositions.forEach((pos) => {
                // If the geo data is the same in the geoData and in the server response, it's not updated
                const linePosition = geoDataRef.current.linePositionsById.get(pos.id);
                if (!(linePosition && linePositionsAreEqual(linePosition, pos))) {
                    temporaryGeoDataIdsRef.current?.add(pos.id);
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
            //@ts-expect-error TODO: manage undefined case
            mapEquipments?.substations
        );

        const notFoundLineIds = lineFullPath
            ? getEquipmentsNotFoundIds(geoDataRef.current.linePositionsById, mapEquipments?.lines as GeoDataEquipment[])
            : [];
        // The loader should be reset if there's no geo-data to fetch or once fetching is finished.
        if (notFoundSubstationIds.length > 0 || notFoundLineIds.length > 0) {
            console.info(
                `Loading geo data of study '${studyUuid}' of missing substations '${notFoundSubstationIds}' and missing lines '${notFoundLineIds}'...`
            );
            const missingSubstationPositions = getMissingEquipmentsPositions(
                notFoundSubstationIds,
                fetchSubstationPositions
            );

            const missingLinesPositions = getMissingEquipmentsPositions(notFoundLineIds, fetchLinePositions);

            const nodeBeforeFetch = currentNodeRef.current;
            return Promise.all([missingSubstationPositions, missingLinesPositions])
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
                });
        } else {
            return Promise.resolve(true);
        }
    }, [
        lineFullPath,
        snackError,
        studyUuid,
        getEquipmentsNotFoundIds,
        getMissingEquipmentsPositions,
        mapEquipments,
        updateSubstationsTemporaryGeoData,
        updateLinesTemporaryGeoData,
    ]);
    const handleFilteredNominalVoltagesChange = useCallback<NominalVoltageFilterProps['onChange']>(
        (newValues) => {
            setFilteredNominalVoltages(newValues);
            onNominalVoltagesChange(newValues);
        },
        [onNominalVoltagesChange]
    );
    // loads all root node geo-data then saves them in redux
    // it will be considered as the source of truth to check whether we need to fetch geo-data for a specific equipment or not
    const loadRootNodeGeoData = useCallback(() => {
        console.info(`Loading geo data of study '${studyUuid}'...`);
        dispatch(setMapDataLoading(true));

        setGeoData(undefined);
        geoDataRef.current = null;

        // @ts-expect-error TODO: manage rootNodeId undefined case
        const substationPositionsDone = fetchSubstationPositions(studyUuid, rootNodeId, currentRootNetworkUuid).then(
            (data) => {
                console.info(`Received substations of study '${studyUuid}'...`);
                const newGeoData = new GeoData(new Map(), geoDataRef.current?.linePositionsById || new Map());
                newGeoData.setSubstationPositions(data);
                setGeoData(newGeoData);
                geoDataRef.current = newGeoData;
            }
        );

        const linePositionsDone = !lineFullPath
            ? Promise.resolve()
            : // @ts-expect-error TODO: manage rootNodeId undefined case
              fetchLinePositions(studyUuid, rootNodeId, currentRootNetworkUuid).then((data) => {
                  console.info(`Received lines of study '${studyUuid}'...`);
                  const newGeoData = new GeoData(geoDataRef.current?.substationPositionsById || new Map(), new Map());
                  newGeoData.setLinePositions(data);
                  setGeoData(newGeoData);
                  geoDataRef.current = newGeoData;
              });

        Promise.all([substationPositionsDone, linePositionsDone])
            .then(() => {
                temporaryGeoDataIdsRef.current = new Set();
                networkMapRef.current?.resetZoomAndPosition();
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
                if (currentNodeRef.current?.id === rootNodeId) {
                    dispatch(setMapDataLoading(false));
                } // otherwise loadMissingGeoData will stop the loading
            });
    }, [rootNodeId, currentRootNetworkUuid, lineFullPath, studyUuid, dispatch, snackError, networkMapRef]);

    const loadGeoData = useCallback(() => {
        if (studyUuid && currentNodeRef.current) {
            if (
                // To manage a lineFullPath param change, if lineFullPath=true and linePositions is empty, we load all the geo data.
                // This can be improved by loading only the lines geo data and not lines geo data + substations geo data when lineFullPath is changed to true.
                geoDataRef.current?.substationPositionsById.size > 0 &&
                (!lineFullPath || geoDataRef.current.linePositionsById.size > 0)
            ) {
                dispatch(setMapDataLoading(true));
                loadMissingGeoData().finally(() => {
                    dispatch(setMapDataLoading(false));
                });
            } else {
                // trigger root node geodata fetching
                loadRootNodeGeoData();
                // set initialized to false to trigger "missing geo-data fetching"
                setInitialized(false);
                // set isRootNodeGeoDataLoaded to false so "missing geo-data fetching" waits for root node geo-data to be fully fetched before triggering
                setIsRootNodeGeoDataLoaded(false);
            }
        }
    }, [studyUuid, lineFullPath, dispatch, loadMissingGeoData, loadRootNodeGeoData]);

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
        const gSMapEquipments = new GSMapEquipments(
            studyUuid,
            currentNode?.id,
            currentRootNetworkUuid,
            snackError,
            dispatch
        );
        if (gSMapEquipments) {
            dispatch(setReloadMapNeeded(false));
        }
    }, [currentNode, currentRootNetworkUuid, dispatch, snackError, studyUuid]);

    const reloadMapEquipments = useCallback(
        (currentNodeAtReloadCalling: CurrentTreeNode | null, substationsIds: UUID[] | undefined) => {
            if (!isNodeBuilt(currentNode) || !studyUuid || !mapEquipments) {
                return Promise.reject(
                    new Error(
                        'reloadMapEquipments error: currentNode not build or studyUuid undefined or mapEquipments not initialized'
                    )
                );
            }

            const { updatedSubstations, updatedLines, updatedTieLines, updatedHvdcLines } = mapEquipments
                ? mapEquipments.reloadImpactedSubstationsEquipments(
                      studyUuid,
                      currentNode,
                      currentRootNetworkUuid,
                      substationsIds
                  )
                : {
                      updatedSubstations: Promise.resolve([]),
                      updatedLines: Promise.resolve([]),
                      updatedTieLines: Promise.resolve([]),
                      updatedHvdcLines: Promise.resolve([]),
                  };

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
                if (isFullReload) {
                    handleFilteredNominalVoltagesChange(mapEquipments.getNominalVoltages());
                }
            });
        },
        [currentNode, handleFilteredNominalVoltagesChange, currentRootNetworkUuid, mapEquipments, studyUuid]
    );

    const updateMapEquipments = useCallback(
        (currentNodeAtReloadCalling: CurrentTreeNode | null) => {
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
            //     dispatch(setReloadMapNeeded(false));
            //     return Promise.reject();
            // }
            console.info('Update map equipments');

            const updatedSubstationsToSend =
                !isMapCollectionImpact && hasSubstationsImpacted ? impactedSubstationsIds : undefined;

            dispatch(setReloadMapNeeded(false));
            resetImpactedElementTypes();
            resetImpactedSubstationsIds();
            return reloadMapEquipments(currentNodeAtReloadCalling, updatedSubstationsToSend).catch((e) =>
                snackError({
                    messageTxt: e.message,
                })
            );
        },
        [
            impactedElementTypes,
            impactedSubstationsIds,
            dispatch,
            resetImpactedElementTypes,
            resetImpactedSubstationsIds,
            reloadMapEquipments,
            snackError,
        ]
    );

    const updateMapEquipmentsAndGeoData = useCallback(() => {
        const currentNodeAtReloadCalling = currentNodeRef.current;
        if (!isNodeBuilt(currentNode) || !studyUuid || !mapEquipments) {
            dispatch(setReloadMapNeeded(false));
            return;
        }
        dispatch(setMapDataLoading(true));
        updateMapEquipments(currentNodeAtReloadCalling).then(() => {
            if (checkNodeConsistency(currentNodeAtReloadCalling)) {
                loadGeoData();
            } else {
                // Do not set MapDataLoading redux state to false in the finnaly clause here
                // loadGeoData will do it later in the process avoiding flickering
                dispatch(setMapDataLoading(false));
            }
        });
    }, [currentNode, dispatch, loadGeoData, mapEquipments, studyUuid, updateMapEquipments]);

    const loadflowResultNotification = useCallback(
        (event: MessageEvent<string>) => {
            if (!isInitialized) {
                return;
            }
            const eventData: unknown = JSON.parse(event.data);
            if (isLoadflowResultNotification(eventData)) {
                const rootNetworkUuidFromNotification = eventData.headers.rootNetworkUuid;
                if (rootNetworkUuidFromNotification === currentRootNetworkUuid) {
                    dispatch(setMapDataLoading(true));
                    reloadMapEquipments(currentNodeRef.current, undefined)
                        .catch((e) =>
                            snackError({
                                messageTxt: e.message,
                            })
                        )
                        .finally(() => {
                            dispatch(setMapDataLoading(false));
                        });
                }
            }
        },
        [currentRootNetworkUuid, dispatch, isInitialized, reloadMapEquipments, snackError]
    );

    const rootNetworkModifiedNotification = useCallback(
        (event: MessageEvent<string>) => {
            if (!isInitialized) {
                return;
            }
            const eventData: unknown = JSON.parse(event.data);
            if (isRootNetworksUpdatedNotification(eventData)) {
                const rootNetworkUuidsFromNotification = eventData.headers.rootNetworkUuids;
                if (rootNetworkUuidsFromNotification.includes(currentRootNetworkUuid)) {
                    setInitialized(false);
                    setIsRootNodeGeoDataLoaded(false);
                    dispatch(resetMapEquipment());
                }
            }
        },
        [currentRootNetworkUuid, dispatch, isInitialized]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: loadflowResultNotification,
    });
    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: rootNetworkModifiedNotification,
    });

    useEffect(() => {
        if (!mapEquipments || refIsMapManualRefreshEnabled.current) {
            return;
        }
        if (deletedEquipments?.length > 0 && mapEquipments) {
            deletedEquipments.forEach((deletedEquipment) =>
                mapEquipments.removeEquipment(deletedEquipment?.equipmentType, deletedEquipment?.equipmentId)
            );
            resetDeletedEquipments();
        }
    }, [deletedEquipments, mapEquipments, resetDeletedEquipments]);

    useEffect(() => {
        let previousCurrentNode = currentNodeRef.current;
        currentNodeRef.current = currentNode;
        let previousCurrentRootNetworkUuid = currentRootNetworkUuidRef.current;
        currentRootNetworkUuidRef.current = currentRootNetworkUuid;
        // as long as rootNodeId is not set, we don't fetch any geodata
        if (!rootNodeId) {
            return;
        }
        // when root network has just been changed, we reset map equipment and geo data, they will be loaded as if we were opening a new study
        // DO NOT BREAK AT FIRST LOADING (previousCurrentRootNetworkUuid=null)
        if (previousCurrentRootNetworkUuid && previousCurrentRootNetworkUuid !== currentRootNetworkUuid) {
            setInitialized(false);
            setIsRootNodeGeoDataLoaded(false);
            dispatch(resetMapEquipment());
            return;
        }
        if (disabled) {
            return;
        }
        // if only renaming, do not reload geo data
        if (isNodeRenamed(previousCurrentNode, currentNode)) {
            return;
        }
        // when switching of root network, networkModificationTree takes some time to load
        // we need to wait for the request to respond to load data, in order to have up to date nodes build status
        if (!isNetworkModificationTreeUpToDate) {
            return;
        }
        // Hack to avoid reload Geo Data when switching display mode to TREE then back to MAP or HYBRID
        if (freezeMapUpdates) {
            return;
        }
        // Check if map update is needed globally
        if (!reloadMapNeeded) {
            return;
        }
        if (refIsMapManualRefreshEnabled.current) {
            return; // everything will be done when clicking on the refresh button
        }
        if (!isMapEquipmentsInitialized) {
            // load default node map equipments
            loadMapEquipments();
        }
        if (!isRootNodeGeoDataLoaded) {
            // load root node geodata
            loadRootNodeGeoData();
        }
        // auto reload
        // We need to call it even if isReactFlowRootNodeData(currentNode) === true because it removes
        // map equipments presents in other nodes.
        updateMapEquipmentsAndGeoData();
        // Note: studyUuid and dispatch don't change
    }, [
        rootNodeId,
        disabled,
        studyUuid,
        currentNode,
        currentRootNetworkUuid,
        loadMapEquipments,
        dispatch,
        updateMapEquipmentsAndGeoData,
        loadRootNodeGeoData,
        isNetworkModificationTreeUpToDate,
        isRootNodeGeoDataLoaded,
        isMapEquipmentsInitialized,
        isInitialized,
        reloadMapNeeded,
        freezeMapUpdates,
    ]);

    useEffect(() => {
        // when root node geodata are loaded, we fetch current node missing geo-data
        // we check if equipments are done initializing because they are checked to fetch accurate missing geo data
        if (isRootNodeGeoDataLoaded && isMapEquipmentsInitialized && !isInitialized) {
            // when root networks are changed, mapEquipments are recreated. when they are done recreating, the map is zoomed around the new network
            if (mapEquipments) {
                handleFilteredNominalVoltagesChange(mapEquipments.getNominalVoltages());
            }
            if (currentNodeRef.current && !isReactFlowRootNodeData(currentNodeRef.current)) {
                dispatch(setMapDataLoading(true));
                loadMissingGeoData().finally(() => {
                    dispatch(setMapDataLoading(false));
                });
            }
            setInitialized(true);
        }
    }, [
        handleFilteredNominalVoltagesChange,
        mapEquipments,
        isRootNodeGeoDataLoaded,
        isMapEquipmentsInitialized,
        isInitialized,
        loadMissingGeoData,
        dispatch,
    ]);

    // Reload geo data (if necessary) when we switch on full path
    useEffect(() => {
        const prevLineFullPath = lineFullPathRef.current;
        lineFullPathRef.current = lineFullPath;
        if (isInitialized && lineFullPath && !prevLineFullPath) {
            loadGeoData();
        }
    }, [isInitialized, lineFullPath, loadGeoData, currentRootNetworkUuid]);

    const choiceVoltageLevelsSubstation = choiceVoltageLevelsSubstationId
        ? mapEquipments?.getSubstation(choiceVoltageLevelsSubstationId)
        : null;

    const showEquipmentMenu = (
        equipment: BaseEquipment,
        x: number,
        y: number,
        equipmentType: EquipmentType,
        isInDrawingMode: boolean
    ) => {
        // don't display the equipment menu in drawing mode.
        if (!isInDrawingMode) {
            openEquipmentMenu(equipment, x, y, equipmentType);
        }
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

    const renderLinePopover = useCallback<NonNullable<NetworkMapProps['renderPopover']>>(
        (elementId, ref) => (
            <EquipmentPopover
                studyUuid={studyUuid}
                anchorEl={ref.current}
                equipmentId={elementId}
                equipmentType={EQUIPMENT_TYPES.LINE}
                loadFlowStatus={loadFlowStatus}
            />
        ),
        [loadFlowStatus, studyUuid]
    );

    const loadMapManually = useCallback(() => {
        if (!isMapEquipmentsInitialized) {
            // load default node map equipments
            loadMapEquipments();
        }
        if (!isRootNodeGeoDataLoaded) {
            // load root node geodata
            loadRootNodeGeoData();
        }
        if (isInitialized) {
            // We need to call it even if isReactFlowRootNodeData(currentNode) === true because it removes
            // map equipments presents in other nodes.
            updateMapEquipmentsAndGeoData();
        }
    }, [
        isInitialized,
        isMapEquipmentsInitialized,
        isRootNodeGeoDataLoaded,
        loadMapEquipments,
        loadRootNodeGeoData,
        updateMapEquipmentsAndGeoData,
    ]);

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
            initialPosition={INITIAL_POSITION as Writable<typeof INITIAL_POSITION>}
            initialZoom={INITIAL_ZOOM}
            lineFullPath={lineFullPath}
            lineParallelPath={lineParallelPath}
            lineFlowMode={lineFlowMode}
            useName={useName}
            visible={visible}
            disabled={disabled}
            onSubstationClick={openVoltageLevel}
            onSubstationClickChooseVoltageLevel={chooseVoltageLevelForSubstation}
            onSubstationMenuClick={(equipment: MapSubstation, x: number, y: number) =>
                showEquipmentMenu(
                    equipment as unknown as BaseEquipment,
                    x,
                    y,
                    EquipmentType.SUBSTATION,
                    isInDrawingMode
                )
            }
            onLineMenuClick={(equipment: MapLine, x: number, y: number) =>
                showEquipmentMenu(equipment as unknown as BaseEquipment, x, y, EquipmentType.LINE, isInDrawingMode)
            }
            onHvdcLineMenuClick={(equipment: MapHvdcLine, x: number, y: number) =>
                showEquipmentMenu(equipment as unknown as BaseEquipment, x, y, EquipmentType.HVDC_LINE, isInDrawingMode)
            }
            onVoltageLevelMenuClick={voltageLevelMenuClick}
            mapBoxToken={mapBoxToken}
            centerOnSubstation={centerOnSubstation}
            isManualRefreshBackdropDisplayed={
                networkVisuParams.mapParameters.mapManualRefresh && reloadMapNeeded && isNodeBuilt(currentNode)
            }
            // only 2 things need this to ensure the map keeps the correct size:
            // - changing study display mode because it changes the map container size
            //   programmatically
            // - changing visible when the map provider is changed in the settings because
            //   it causes a render with the map container having display:none
            onManualRefreshClick={loadMapManually}
            triggerMapResizeOnChange={[studyDisplayMode, visible]}
            renderPopover={renderLinePopover}
            mapLibrary={networkVisuParams.mapParameters.mapBaseMap}
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
            shouldDisableToolTip={!visible || isInDrawingMode}
        />
    );

    // Set up filteredNominalVoltages once at map initialization
    // TODO: how do we must manage case where voltages change (like when changing node), as filters are already initialized?
    const nominalVoltages = mapEquipments?.getNominalVoltages();
    useEffect(() => {
        if (nominalVoltages !== undefined && nominalVoltages.length > 0 && filteredNominalVoltages === undefined) {
            handleFilteredNominalVoltagesChange(nominalVoltages);
        }
    }, [filteredNominalVoltages, handleFilteredNominalVoltagesChange, nominalVoltages]);

    function renderNominalVoltageFilter() {
        return (
            <Box sx={styles.divNominalVoltageFilter}>
                <NominalVoltageFilter
                    nominalVoltages={nominalVoltages ?? EMPTY_ARRAY}
                    filteredNominalVoltages={filteredNominalVoltages ?? EMPTY_ARRAY}
                    onChange={handleFilteredNominalVoltagesChange}
                />
            </Box>
        );
    }
    function renderSearchEquipment() {
        return (
            <Box sx={styles.divSearchIcon}>
                <Tooltip title={<FormattedMessage id="equipment_search/label" />}>
                    <Button
                        color="inherit"
                        sx={styles.searchButton}
                        size="small"
                        onClick={() => setIsDialogSearchOpen(true)}
                        variant="contained"
                    >
                        <Search />
                    </Button>
                </Tooltip>
            </Box>
        );
    }

    const showVoltageLevelDiagram = useCallback(
        // TODO code factorization for displaying a VL via a hook
        (optionInfos: EquipmentInfos) => {
            if (optionInfos.type === EquipmentType.SUBSTATION) {
                dispatch(openDiagram(optionInfos.id, DiagramType.SUBSTATION));
            } else if (optionInfos.voltageLevelId) {
                dispatch(openDiagram(optionInfos.voltageLevelId, DiagramType.VOLTAGE_LEVEL));
            }
        },
        [dispatch]
    );

    return (
        <>
            <Box sx={styles.divTemporaryGeoDataLoading}>{basicDataReady && mapDataLoading && <LinearProgress />}</Box>
            {renderMap()}
            {!isInDrawingMode && (
                <>
                    {renderEquipmentMenu()}
                    {renderModificationDialog()}
                    {renderDeletionDialog()}
                    {renderDynamicSimulationEventDialog()}
                    {choiceVoltageLevelsSubstationId && renderVoltageLevelChoice()}
                </>
            )}
            {renderSearchEquipment()}
            {mapEquipments && mapEquipments?.substations?.length > 0 && renderNominalVoltageFilter()}
            {studyUuid && (
                <TopBarEquipmentSearchDialog
                    showVoltageLevelDiagram={showVoltageLevelDiagram}
                    isDialogSearchOpen={isDialogSearchOpen}
                    setIsDialogSearchOpen={setIsDialogSearchOpen}
                />
            )}
        </>
    );
};

export default NetworkMapTab;
