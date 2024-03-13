/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createReducer } from '@reduxjs/toolkit';

import {
    LOGOUT_ERROR,
    RESET_AUTHENTICATION_ROUTER_ERROR,
    SHOW_AUTH_INFO_LOGIN,
    UNAUTHORIZED_USER_INFO,
    USER,
    USER_VALIDATION_ERROR,
} from '@gridsuite/commons-ui';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import {
    ADD_NOTIFICATION,
    CENTER_LABEL,
    CENTER_ON_SUBSTATION,
    CHANGE_DISPLAYED_COLUMNS_NAMES,
    CHANGE_LOCKED_COLUMNS_NAMES,
    CHANGE_REORDERED_COLUMNS,
    CLOSE_DIAGRAM,
    CLOSE_DIAGRAMS,
    CLOSE_STUDY,
    COMPONENT_LIBRARY,
    CURRENT_TREE_NODE,
    DECREMENT_NETWORK_AREA_DIAGRAM_DEPTH,
    DELETE_EQUIPMENT,
    DIAGONAL_LABEL,
    ENABLE_DEVELOPER_MODE,
    FAVORITE_CONTINGENCY_LISTS,
    FLUX_CONVENTION,
    INCREMENT_NETWORK_AREA_DIAGRAM_DEPTH,
    LIMIT_REDUCTION,
    LIMIT_REDUCTION_MODIFIED,
    LINE_FLOW_ALERT_THRESHOLD,
    LINE_FLOW_COLOR_MODE,
    LINE_FLOW_MODE,
    LINE_FULL_PATH,
    LINE_PARALLEL_PATH,
    LOAD_EQUIPMENTS,
    LOAD_NETWORK_MODIFICATION_TREE_SUCCESS,
    MAP_BASEMAP,
    MAP_DATA_LOADING,
    MAP_EQUIPMENTS_CREATED,
    MAP_EQUIPMENTS_INITIALIZED,
    MAP_MANUAL_REFRESH,
    MINIMIZE_DIAGRAM,
    NETWORK_AREA_DIAGRAM_NB_VOLTAGE_LEVELS,
    NETWORK_MODIFICATION_HANDLE_SUBTREE,
    NETWORK_MODIFICATION_TREE_NODE_ADDED,
    NETWORK_MODIFICATION_TREE_NODE_MOVED,
    NETWORK_MODIFICATION_TREE_NODES_REMOVED,
    NETWORK_MODIFICATION_TREE_NODES_UPDATED,
    OPEN_DIAGRAM,
    OPEN_STUDY,
    REMOVE_NOTIFICATION_BY_NODE,
    RESET_EQUIPMENTS,
    RESET_EQUIPMENTS_POST_LOADFLOW,
    RESET_MAP_RELOADED,
    RESET_NETWORK_AREA_DIAGRAM_DEPTH,
    SELECT_COMPUTED_LANGUAGE,
    SELECT_LANGUAGE,
    SELECT_THEME,
    SELECTION_FOR_COPY,
    SET_COMPUTATION_STARTING,
    SET_COMPUTING_STATUS,
    SET_DELETED_EQUIPMENTS,
    SET_EVENT_SCENARIO_DRAWER_OPEN,
    SET_FULLSCREEN_DIAGRAM,
    SET_LAST_COMPLETED_COMPUTATION,
    SET_MODIFICATIONS_DRAWER_OPEN,
    SET_MODIFICATIONS_IN_PROGRESS,
    SET_ONE_BUS_SHORTCIRCUIT_ANALYSIS_DIAGRAM,
    SET_OPTIONAL_SERVICES,
    SET_PARAMS_LOADED,
    SET_STUDY_DISPLAY_MODE,
    SET_STUDY_INDEXATION_STATUS,
    SET_UPDATED_SUBSTATIONS_IDS,
    STOP_DIAGRAM_BLINK,
    STUDY_DISPLAY_MODE,
    STUDY_INDEXATION_STATUS,
    STUDY_UPDATED,
    SUBSTATION_LAYOUT,
    TOGGLE_PIN_DIAGRAM,
    UPDATE_EQUIPMENTS,
    USE_NAME,
} from './actions';
import {
    getLocalStorageComputedLanguage,
    getLocalStorageLanguage,
    getLocalStorageTheme,
    saveLocalStorageLanguage,
    saveLocalStorageTheme,
} from './local-storage';
import { TABLES_COLUMNS_NAMES_JSON } from '../components/spreadsheet/utils/config-tables';
import {
    MAP_BASEMAP_MAPBOX,
    PARAM_CENTER_LABEL,
    PARAM_COMPONENT_LIBRARY,
    PARAM_DEVELOPER_MODE,
    PARAM_DIAGONAL_LABEL,
    PARAM_FAVORITE_CONTINGENCY_LISTS,
    PARAM_FLUX_CONVENTION,
    PARAM_LANGUAGE,
    PARAM_LIMIT_REDUCTION,
    PARAM_LINE_FLOW_ALERT_THRESHOLD,
    PARAM_LINE_FLOW_COLOR_MODE,
    PARAM_LINE_FLOW_MODE,
    PARAM_LINE_FULL_PATH,
    PARAM_LINE_PARALLEL_PATH,
    PARAM_MAP_BASEMAP,
    PARAM_MAP_MANUAL_REFRESH,
    PARAM_SUBSTATION_LAYOUT,
    PARAM_THEME,
    PARAM_USE_NAME,
    PARAMS_LOADED,
} from '../utils/config-params';
import NetworkModificationTreeModel from '../components/graph/network-modification-tree-model';
import { FluxConventions } from '../components/dialogs/parameters/network-parameters';
import { loadDiagramStateFromSessionStorage } from './session-storage';
import { DiagramType, ViewState } from '../components/diagrams/diagram-common';
import { getAllChildren } from 'components/graph/util/model-functions';
import { CopyType } from 'components/network-modification-tree-pane';
import { ComputingType } from 'components/computing-status/computing-type';
import { RunningStatus } from 'components/utils/running-status';
import { NodeInsertModes } from '../components/utils/node-insert-modes';
import {
    OptionalServicesNames,
    OptionalServicesStatus,
} from '../components/utils/optional-services';
import { formatFetchedEquipments } from 'components/spreadsheet/utils/equipment-table-utils';

const paramsInitialState = {
    [PARAM_THEME]: getLocalStorageTheme(),
    [PARAM_LANGUAGE]: getLocalStorageLanguage(),
    [PARAM_USE_NAME]: true,
    [PARAM_LINE_FULL_PATH]: true,
    [PARAM_LINE_PARALLEL_PATH]: true,
    [PARAM_LIMIT_REDUCTION]: 100,
    [PARAM_LINE_FLOW_ALERT_THRESHOLD]: 100,
    [PARAM_MAP_MANUAL_REFRESH]: false,
    [PARAM_MAP_BASEMAP]: MAP_BASEMAP_MAPBOX,
    [PARAM_LINE_FLOW_MODE]: 'feeders',
    [PARAM_LINE_FLOW_COLOR_MODE]: 'nominalVoltage',
    [PARAM_CENTER_LABEL]: false,
    [PARAM_DIAGONAL_LABEL]: false,
    [PARAM_SUBSTATION_LAYOUT]: 'horizontal',
    [PARAM_COMPONENT_LIBRARY]: null,
    [PARAM_FAVORITE_CONTINGENCY_LISTS]: [],
    [PARAM_FLUX_CONVENTION]: FluxConventions.IIDM,
    [PARAM_DEVELOPER_MODE]: false,
    [PARAMS_LOADED]: false,
};

const initialComputingStatus = {
    [ComputingType.LOADFLOW]: RunningStatus.IDLE,
    [ComputingType.SECURITY_ANALYSIS]: RunningStatus.IDLE,
    [ComputingType.SENSITIVITY_ANALYSIS]: RunningStatus.IDLE,
    [ComputingType.NON_EVACUATED_ENERGY_ANALYSIS]: RunningStatus.IDLE,
    [ComputingType.ALL_BUSES_SHORTCIRCUIT_ANALYSIS]: RunningStatus.IDLE,
    [ComputingType.ONE_BUS_SHORTCIRCUIT_ANALYSIS]: RunningStatus.IDLE,
    [ComputingType.DYNAMIC_SIMULATION]: RunningStatus.IDLE,
    [ComputingType.VOLTAGE_INIT]: RunningStatus.IDLE,
};

const initialSpreadsheetNetworkState = {
    [EQUIPMENT_TYPES.SUBSTATION]: null,
    [EQUIPMENT_TYPES.VOLTAGE_LEVEL]: null,
    [EQUIPMENT_TYPES.LINE]: null,
    [EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER]: null,
    [EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER]: null,
    [EQUIPMENT_TYPES.GENERATOR]: null,
    [EQUIPMENT_TYPES.LOAD]: null,
    [EQUIPMENT_TYPES.BATTERY]: null,
    [EQUIPMENT_TYPES.DANGLING_LINE]: null,
    [EQUIPMENT_TYPES.HVDC_LINE]: null,
    [EQUIPMENT_TYPES.LCC_CONVERTER_STATION]: null,
    [EQUIPMENT_TYPES.VSC_CONVERTER_STATION]: null,
    [EQUIPMENT_TYPES.SHUNT_COMPENSATOR]: null,
    [EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR]: null,
};

export const defaultOptionalServicesState = Object.keys(
    OptionalServicesNames,
).map((key) => ({
    name: key,
    status: OptionalServicesStatus.Pending,
}));

const initialState = {
    studyUuid: null,
    currentTreeNode: null,
    selectionForCopy: {
        sourceStudyUuid: null,
        nodeId: null,
        copyType: null,
        allChildrenIds: null,
    },
    mapEquipments: null,
    geoData: null,
    networkModificationTreeModel: new NetworkModificationTreeModel(),
    computedLanguage: getLocalStorageComputedLanguage(),
    user: null,
    signInCallbackError: null,
    authenticationRouterError: null,
    showAuthenticationRouterLogin: false,
    studyUpdated: { force: 0, eventData: {} },
    mapDataLoading: false,
    fullScreenDiagram: null,
    allDisplayedColumnsNames: TABLES_COLUMNS_NAMES_JSON,
    allLockedColumnsNames: [],
    allReorderedTableDefinitionIndexes: [],
    isExplorerDrawerOpen: true,
    isModificationsDrawerOpen: false,
    isEventScenarioDrawerOpen: false,
    centerOnSubstation: null,
    notificationIdList: [],
    isModificationsInProgress: false,
    studyDisplayMode: STUDY_DISPLAY_MODE.HYBRID,
    diagramStates: [],
    reloadMap: true,
    isMapEquipmentsInitialized: false,
    updatedSubstationsIds: [],
    deletedEquipments: [],
    networkAreaDiagramDepth: 0,
    networkAreaDiagramNbVoltageLevels: 0,
    spreadsheetNetwork: { ...initialSpreadsheetNetworkState },
    computingStatus: { ...initialComputingStatus },
    computationStarting: false,
    optionalServices: defaultOptionalServicesState,
    oneBusShortCircuitAnalysisDiagram: null,
    studyIndexationStatus: STUDY_INDEXATION_STATUS.NOT_INDEXED,
    ...paramsInitialState,
    limitReductionModified: false,
    lastCompletedComputation: null,
    // Hack to avoid reload Geo Data when switching display mode to TREE then back to MAP or HYBRID
    // defaulted to true to init load geo data with HYBRID defaulted display Mode
    // TODO REMOVE LATER
};

export const reducer = createReducer(initialState, (builder) => {
    builder.addCase(OPEN_STUDY, (state, action) => {
        state.studyUuid = action.studyRef[0];

        if (action.studyRef[0] != null) {
            state.diagramStates = loadDiagramStateFromSessionStorage(
                action.studyRef[0],
            );
        }
    });

    builder.addCase(CLOSE_STUDY, (state) => {
        state.studyUuid = null;
        state.geoData = null;
        state.networkModificationTreeModel = null;
    });

    builder.addCase(MAP_EQUIPMENTS_CREATED, (state, action) => {
        let newMapEquipments;
        //if it's not initialised yet we take the empty one given in action
        if (!state.mapEquipments) {
            newMapEquipments = action.mapEquipments.newMapEquipmentForUpdate();
        } else {
            newMapEquipments = state.mapEquipments.newMapEquipmentForUpdate();
        }
        if (action.newLines) {
            newMapEquipments.lines = action.newLines;
            newMapEquipments.completeLinesInfos();
        }
        if (action.newSubstations) {
            newMapEquipments.substations = action.newSubstations;
            newMapEquipments.completeSubstationsInfos();
        }
        if (action.newHvdcLines) {
            newMapEquipments.hvdcLines = action.newHvdcLines;
            newMapEquipments.completeHvdcLinesInfos();
        }
        state.mapEquipments = newMapEquipments;
    });

    builder.addCase(LOAD_NETWORK_MODIFICATION_TREE_SUCCESS, (state, action) => {
        state.networkModificationTreeModel =
            action.networkModificationTreeModel;
        state.networkModificationTreeModel.setBuildingStatus();
    });

    builder.addCase(NETWORK_MODIFICATION_TREE_NODE_ADDED, (state, action) => {
        if (state.networkModificationTreeModel) {
            let newModel =
                state.networkModificationTreeModel.newSharedForUpdate();
            newModel.addChild(
                action.networkModificationTreeNode,
                action.parentNodeId,
                action.insertMode,
                action.referenceNodeId,
            );
            newModel.updateLayout();
            state.networkModificationTreeModel = newModel;
            // check if added node is the new parent of the current Node
            if (
                action.networkModificationTreeNode?.childrenIds.includes(
                    state.currentTreeNode?.id,
                )
            ) {
                // Then must overwrite currentTreeNode to set new parentNodeUuid
                synchCurrentTreeNode(state, state.currentTreeNode?.id);
            }
        }
    });

    builder.addCase(NETWORK_MODIFICATION_TREE_NODE_MOVED, (state, action) => {
        if (state.networkModificationTreeModel) {
            let newModel =
                state.networkModificationTreeModel.newSharedForUpdate();
            newModel.removeNodes([action.networkModificationTreeNode.id]);
            newModel.addChild(
                action.networkModificationTreeNode,
                action.parentNodeId,
                action.insertMode,
                action.referenceNodeId,
            );
            newModel.updateLayout();
            state.networkModificationTreeModel = newModel;
            // check if added node is the new parent of the current Node
            if (
                action.networkModificationTreeNode?.childrenIds.includes(
                    state.currentTreeNode?.id,
                )
            ) {
                // Then must overwrite currentTreeNode to set new parentNodeUuid
                synchCurrentTreeNode(state, state.currentTreeNode?.id);
            }
        }
    });

    builder.addCase(NETWORK_MODIFICATION_HANDLE_SUBTREE, (state, action) => {
        if (state.networkModificationTreeModel) {
            let newModel =
                state.networkModificationTreeModel.newSharedForUpdate();
            unravelSubTree(
                newModel,
                action.parentNodeId,
                action.networkModificationTreeNodes,
            );

            newModel.updateLayout();
            state.networkModificationTreeModel = newModel;
        }
    });

    builder.addCase(
        NETWORK_MODIFICATION_TREE_NODES_REMOVED,
        (state, action) => {
            if (state.networkModificationTreeModel) {
                let newModel =
                    state.networkModificationTreeModel.newSharedForUpdate();

                //we assume all the deleted nodes are contiguous, so the new parent selected will be the nearest upstream node.
                //in the future, if the deleted nodes are no longer contiguous we will need another implementation
                const nextCurrentNodeUuid = newModel.treeNodes
                    .filter((node) =>
                        action.networkModificationTreeNodes.includes(node.id),
                    )
                    .map((node) => node.data.parentNodeUuid)
                    .find(
                        (parentNodeUuid) =>
                            !action.networkModificationTreeNodes.includes(
                                parentNodeUuid,
                            ),
                    );

                newModel.removeNodes(action.networkModificationTreeNodes);
                newModel.updateLayout();
                state.networkModificationTreeModel = newModel;

                // check if current node is in the nodes deleted list
                if (
                    action.networkModificationTreeNodes.includes(
                        state.currentTreeNode?.id,
                    )
                ) {
                    synchCurrentTreeNode(state, nextCurrentNodeUuid);
                } // check if parent node of the current node is in the nodes deleted list
                else if (
                    action.networkModificationTreeNodes.includes(
                        state.currentTreeNode?.data?.parentNodeUuid,
                    )
                ) {
                    // Then must overwrite currentTreeNode to get new parentNodeUuid
                    synchCurrentTreeNode(state, state.currentTreeNode?.id);
                }
            }
        },
    );

    builder.addCase(
        NETWORK_MODIFICATION_TREE_NODES_UPDATED,
        (state, action) => {
            if (state.networkModificationTreeModel) {
                let newModel =
                    state.networkModificationTreeModel.newSharedForUpdate();
                newModel.updateNodes(action.networkModificationTreeNodes);
                state.networkModificationTreeModel = newModel;
                state.networkModificationTreeModel.setBuildingStatus();
                // check if current node is in the nodes updated list
                if (
                    action.networkModificationTreeNodes.find(
                        (node) => node.id === state.currentTreeNode?.id,
                    )
                ) {
                    synchCurrentTreeNode(state, state.currentTreeNode?.id);
                    // current node has changed, then will need to reload Geo Data
                    state.reloadMap = true;
                }
            }
        },
    );

    builder.addCase(STUDY_UPDATED, (state, action) => {
        state.studyUpdated = {
            force: 1 - state.studyUpdated.force,
            type: action.eventData.headers.updateType,
            eventData: action.eventData,
        };
    });

    builder.addCase(MAP_DATA_LOADING, (state, action) => {
        state.mapDataLoading = action.mapDataLoading;
    });

    builder.addCase(SELECT_THEME, (state, action) => {
        state[PARAM_THEME] = action[PARAM_THEME];
        saveLocalStorageTheme(state[PARAM_THEME]);
    });

    builder.addCase(SELECT_LANGUAGE, (state, action) => {
        state[PARAM_LANGUAGE] = action[PARAM_LANGUAGE];
        saveLocalStorageLanguage(state[PARAM_LANGUAGE]);
    });

    builder.addCase(SELECT_COMPUTED_LANGUAGE, (state, action) => {
        state.computedLanguage = action.computedLanguage;
    });

    builder.addCase(SET_PARAMS_LOADED, (state, action) => {
        state[PARAMS_LOADED] = action[PARAMS_LOADED];
    });

    builder.addCase(USE_NAME, (state, action) => {
        state[PARAM_USE_NAME] = action[PARAM_USE_NAME];
    });

    builder.addCase(USER, (state, action) => {
        state.user = action.user;
    });

    builder.addCase(CENTER_LABEL, (state, action) => {
        state[PARAM_CENTER_LABEL] = action[PARAM_CENTER_LABEL];
    });

    builder.addCase(DIAGONAL_LABEL, (state, action) => {
        state[PARAM_DIAGONAL_LABEL] = action[PARAM_DIAGONAL_LABEL];
    });

    builder.addCase(LINE_FULL_PATH, (state, action) => {
        state[PARAM_LINE_FULL_PATH] = action[PARAM_LINE_FULL_PATH];
    });

    builder.addCase(LINE_PARALLEL_PATH, (state, action) => {
        state[PARAM_LINE_PARALLEL_PATH] = action[PARAM_LINE_PARALLEL_PATH];
    });

    builder.addCase(LINE_FLOW_MODE, (state, action) => {
        state[PARAM_LINE_FLOW_MODE] = action[PARAM_LINE_FLOW_MODE];
    });

    builder.addCase(FLUX_CONVENTION, (state, action) => {
        state[PARAM_FLUX_CONVENTION] = action[PARAM_FLUX_CONVENTION];
    });

    builder.addCase(ENABLE_DEVELOPER_MODE, (state, action) => {
        state[PARAM_DEVELOPER_MODE] = action[PARAM_DEVELOPER_MODE];
    });

    builder.addCase(LINE_FLOW_COLOR_MODE, (state, action) => {
        state[PARAM_LINE_FLOW_COLOR_MODE] = action[PARAM_LINE_FLOW_COLOR_MODE];
    });

    builder.addCase(LIMIT_REDUCTION, (state, action) => {
        state[PARAM_LIMIT_REDUCTION] = action[PARAM_LIMIT_REDUCTION];
    });

    builder.addCase(LIMIT_REDUCTION_MODIFIED, (state, action) => {
        state.limitReductionModified = action.limitReductionModified;
    });

    builder.addCase(LINE_FLOW_ALERT_THRESHOLD, (state, action) => {
        state[PARAM_LINE_FLOW_ALERT_THRESHOLD] =
            action[PARAM_LINE_FLOW_ALERT_THRESHOLD];
    });

    builder.addCase(UNAUTHORIZED_USER_INFO, (state, action) => {
        state.authenticationRouterError = action.authenticationRouterError;
    });

    builder.addCase(LOGOUT_ERROR, (state, action) => {
        state.authenticationRouterError = action.authenticationRouterError;
    });

    builder.addCase(USER_VALIDATION_ERROR, (state, action) => {
        state.authenticationRouterError = action.authenticationRouterError;
    });

    builder.addCase(RESET_AUTHENTICATION_ROUTER_ERROR, (state, action) => {
        state.authenticationRouterError = null;
    });

    builder.addCase(SHOW_AUTH_INFO_LOGIN, (state, action) => {
        state.showAuthenticationRouterLogin =
            action.showAuthenticationRouterLogin;
    });

    builder.addCase(MAP_MANUAL_REFRESH, (state, action) => {
        state[PARAM_MAP_MANUAL_REFRESH] = action[PARAM_MAP_MANUAL_REFRESH];
    });

    builder.addCase(MAP_BASEMAP, (state, action) => {
        state[PARAM_MAP_BASEMAP] = action[PARAM_MAP_BASEMAP];
    });

    builder.addCase(RESET_MAP_RELOADED, (state) => {
        state.reloadMap = false;
    });

    builder.addCase(MAP_EQUIPMENTS_INITIALIZED, (state, action) => {
        state.isMapEquipmentsInitialized = action.newValue;
    });

    builder.addCase(SET_UPDATED_SUBSTATIONS_IDS, (state, action) => {
        state.updatedSubstationsIds = action.updatedSubstationsIds;
    });

    builder.addCase(SET_DELETED_EQUIPMENTS, (state, action) => {
        state.deletedEquipments = action.deletedEquipments;
    });

    builder.addCase(SUBSTATION_LAYOUT, (state, action) => {
        state[PARAM_SUBSTATION_LAYOUT] = action[PARAM_SUBSTATION_LAYOUT];
    });

    builder.addCase(COMPONENT_LIBRARY, (state, action) => {
        state[PARAM_COMPONENT_LIBRARY] = action[PARAM_COMPONENT_LIBRARY];
    });

    builder.addCase(SET_FULLSCREEN_DIAGRAM, (state, action) => {
        state.fullScreenDiagram = {
            id: action.diagramId,
            svgType: action.svgType,
        };
    });

    builder.addCase(CHANGE_DISPLAYED_COLUMNS_NAMES, (state, action) => {
        const newDisplayedColumnsNames = [...state.allDisplayedColumnsNames];
        action.displayedColumnsNamesParams.forEach((param) => {
            if (param) {
                newDisplayedColumnsNames[param.index] = param.value;
            }
        });
        state.allDisplayedColumnsNames = newDisplayedColumnsNames;
    });

    builder.addCase(CHANGE_LOCKED_COLUMNS_NAMES, (state, action) => {
        let newLockedColumnsNames = [...state.allLockedColumnsNames];
        action.lockedColumnsNamesParams.forEach((param) => {
            if (param) {
                newLockedColumnsNames[param.index] = param.value;
            }
        });
        state.allLockedColumnsNames = newLockedColumnsNames;
    });

    builder.addCase(CHANGE_REORDERED_COLUMNS, (state, action) => {
        let newReorderedColumns = [...state.allReorderedTableDefinitionIndexes];
        action.reorderedColumnsParams.forEach((param) => {
            if (param) {
                newReorderedColumns[param.index] = param.value;
            }
        });
        state.allReorderedTableDefinitionIndexes = newReorderedColumns;
    });

    builder.addCase(FAVORITE_CONTINGENCY_LISTS, (state, action) => {
        state[PARAM_FAVORITE_CONTINGENCY_LISTS] =
            action[PARAM_FAVORITE_CONTINGENCY_LISTS];
    });

    builder.addCase(CURRENT_TREE_NODE, (state, action) => {
        state.currentTreeNode = action.currentTreeNode;
        // current node has changed, then will need to reload Geo Data
        state.updatedSubstationsIds = [];
        state.deletedEquipments = [];
        state.reloadMap = true;
    });

    builder.addCase(SELECTION_FOR_COPY, (state, action) => {
        const selectionForCopy = action.selectionForCopy;
        if (
            selectionForCopy.sourceStudyUuid === state.studyUuid &&
            selectionForCopy.nodeId &&
            (selectionForCopy.copyType === CopyType.SUBTREE_COPY ||
                selectionForCopy.copyType === CopyType.SUBTREE_CUT)
        ) {
            selectionForCopy.allChildrenIds = getAllChildren(
                state.networkModificationTreeModel,
                selectionForCopy.nodeId,
            ).map((child) => child.id);
        }
        state.selectionForCopy = selectionForCopy;
    });

    builder.addCase(SET_MODIFICATIONS_DRAWER_OPEN, (state, action) => {
        state.isModificationsDrawerOpen = action.isModificationsDrawerOpen;

        // exclusively open between two components
        if (
            action.isModificationsDrawerOpen &&
            state.isEventScenarioDrawerOpen
        ) {
            state.isEventScenarioDrawerOpen = !state.isEventScenarioDrawerOpen;
        }
    });

    builder.addCase(SET_EVENT_SCENARIO_DRAWER_OPEN, (state, action) => {
        state.isEventScenarioDrawerOpen = action.isEventScenarioDrawerOpen;

        // exclusively open between two components
        if (
            action.isEventScenarioDrawerOpen &&
            state.isModificationsDrawerOpen
        ) {
            state.isModificationsDrawerOpen = !state.isModificationsDrawerOpen;
        }
    });

    builder.addCase(CENTER_ON_SUBSTATION, (state, action) => {
        state.centerOnSubstation = action.centerOnSubstation;
    });

    builder.addCase(ADD_NOTIFICATION, (state, action) => {
        state.notificationIdList = [
            ...state.notificationIdList,
            ...action.notificationIds,
        ];
    });

    builder.addCase(REMOVE_NOTIFICATION_BY_NODE, (state, action) => {
        state.notificationIdList = [
            ...state.notificationIdList.filter(
                (nodeId) => !action.notificationIds.includes(nodeId),
            ),
        ];
    });

    builder.addCase(SET_MODIFICATIONS_IN_PROGRESS, (state, action) => {
        state.isModificationsInProgress = action.isModificationsInProgress;
    });

    builder.addCase(SET_STUDY_DISPLAY_MODE, (state, action) => {
        if (
            Object.values(STUDY_DISPLAY_MODE).includes(action.studyDisplayMode)
        ) {
            // Hack to avoid reload Geo Data when switching display mode to TREE then back to MAP or HYBRID
            // Some actions in the TREE display mode could change this value after that
            // ex: change current Node, current Node updated ...
            if (action.studyDisplayMode === STUDY_DISPLAY_MODE.TREE) {
                state.reloadMap = false;
            }

            state.studyDisplayMode = action.studyDisplayMode;
        }
    });

    builder.addCase(OPEN_DIAGRAM, (state, action) => {
        const diagramStates = state.diagramStates;
        const diagramToOpenIndex = diagramStates.findIndex(
            (diagram) =>
                diagram.id === action.id && diagram.svgType === action.svgType,
        );

        if (action.svgType === DiagramType.NETWORK_AREA_DIAGRAM) {
            // First, we check if there is already a Network Area Diagram in the diagramStates.
            const firstNadIndex = diagramStates.findIndex(
                (diagram) =>
                    diagram.svgType === DiagramType.NETWORK_AREA_DIAGRAM,
            );
            if (firstNadIndex < 0) {
                // If there is no NAD, then we add the new one.
                diagramStates.push({
                    id: action.id,
                    svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                    state: ViewState.OPENED,
                });

                // If there is already a diagram in fullscreen mode, the new opened NAD will take its place.
                if (state.fullScreenDiagram?.id) {
                    state.fullScreenDiagram = {
                        id: action.id,
                        svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                    };
                }
            } else {
                // If there is already at least one NAD, and if it is minimized, then we change all of them to opened.
                if (
                    diagramStates[firstNadIndex].state === ViewState.MINIMIZED
                ) {
                    diagramStates.forEach((diagram) => {
                        if (
                            diagram.svgType === DiagramType.NETWORK_AREA_DIAGRAM
                        ) {
                            diagram.state = ViewState.OPENED;
                        }
                    });
                }
                // If the NAD to open is not already in the diagramStates, we add it.
                if (diagramToOpenIndex < 0) {
                    diagramStates.push({
                        id: action.id,
                        svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                        state: diagramStates[firstNadIndex].state,
                    });
                }

                // If there is a SLD in fullscreen, we have to display in fullscreen the new NAD.
                // Because it is the first NAD displayed that counts for the fullscreen status, we put the fist nad's id there.
                if (
                    state.fullScreenDiagram?.svgType &&
                    state.fullScreenDiagram?.svgType !==
                        DiagramType.NETWORK_AREA_DIAGRAM
                ) {
                    state.fullScreenDiagram = {
                        id: diagramStates[firstNadIndex].id,
                        svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                    };
                }
            }
        } else {
            // We check if the SLD to open is already in the diagramStates.
            if (diagramToOpenIndex >= 0) {
                // If the SLD to open is already in the diagramStates and it is minimized, then we change it to opened.
                if (
                    diagramStates[diagramToOpenIndex].state ===
                    ViewState.MINIMIZED
                ) {
                    // We minimize all the other OPENED SLD.
                    diagramStates.forEach((diagram) => {
                        if (
                            diagram.svgType !==
                                DiagramType.NETWORK_AREA_DIAGRAM &&
                            diagram.state === ViewState.OPENED
                        ) {
                            diagram.state = ViewState.MINIMIZED;
                        }
                    });
                    const diagramToOpen = diagramStates[diagramToOpenIndex];

                    // We open and push the SLD to the last position in the array, so it is displayed at the right of the others
                    diagramToOpen.state = ViewState.OPENED;
                    diagramStates.splice(diagramToOpenIndex, 1);
                    diagramStates.push(diagramToOpen);
                } else {
                    console.info(
                        'Diagram already opened : ' +
                            diagramStates[diagramToOpenIndex].id +
                            ' (' +
                            diagramStates[diagramToOpenIndex].svgType +
                            ')',
                    );
                    diagramStates[diagramToOpenIndex].needsToBlink = true;
                }
            } else {
                // We minimize all the other OPENED SLD.
                diagramStates.forEach((diagram) => {
                    if (
                        diagram.svgType !== DiagramType.NETWORK_AREA_DIAGRAM &&
                        diagram.state === ViewState.OPENED
                    ) {
                        diagram.state = ViewState.MINIMIZED;
                    }
                });
                // And we add the new one.
                diagramStates.push({
                    id: action.id,
                    svgType: action.svgType,
                    state: ViewState.OPENED,
                });
            }

            // If there is already a diagram in fullscreen mode, the new opened SLD will take its place.
            if (state.fullScreenDiagram?.id) {
                state.fullScreenDiagram = {
                    id: action.id,
                    svgType: action.svgType,
                };
            }
        }
        state.diagramStates = diagramStates;
    });

    builder.addCase(MINIMIZE_DIAGRAM, (state, action) => {
        const diagramStates = state.diagramStates;

        if (action.svgType === DiagramType.NETWORK_AREA_DIAGRAM) {
            // For network area diagrams, the ID is irrelevant, we will minimize all the NAD in the state.diagramStates.
            diagramStates.forEach((diagram) => {
                if (diagram.svgType === DiagramType.NETWORK_AREA_DIAGRAM) {
                    diagram.state = ViewState.MINIMIZED;
                }
            });
        } else {
            // For single line diagram, we will update the corresponding diagram.
            const diagramToMinimizeIndex = diagramStates.findIndex(
                (diagram) =>
                    diagram.id === action.id &&
                    diagram.svgType === action.svgType,
            );
            if (diagramToMinimizeIndex >= 0) {
                diagramStates[diagramToMinimizeIndex].state =
                    ViewState.MINIMIZED;
            }
        }
        state.diagramStates = diagramStates;
    });

    builder.addCase(TOGGLE_PIN_DIAGRAM, (state, action) => {
        const diagramStates = state.diagramStates;

        // search targeted diagram among the diagramStates
        const diagramToPinToggleIndex = diagramStates.findIndex(
            (diagram) =>
                diagram.id === action.id && diagram.svgType === action.svgType,
        );
        if (diagramToPinToggleIndex >= 0) {
            if (action.svgType === DiagramType.NETWORK_AREA_DIAGRAM) {
                // If the current NAD is PINNED, we set all NAD to OPENED. Otherwise, we set them to PINNED.
                const newStateForNads =
                    diagramStates[diagramToPinToggleIndex].state ===
                    ViewState.PINNED
                        ? ViewState.OPENED
                        : ViewState.PINNED;
                diagramStates.forEach((diagram) => {
                    if (diagram.svgType === DiagramType.NETWORK_AREA_DIAGRAM) {
                        diagram.state = newStateForNads;
                    }
                });
            } else {
                if (
                    diagramStates[diagramToPinToggleIndex].state !==
                    ViewState.PINNED
                ) {
                    // If the current SLD is minimized or opened, we pin it.
                    diagramStates[diagramToPinToggleIndex].state =
                        ViewState.PINNED;
                } else {
                    // If the current SLD is pinned, we check if there is already another SLD opened (there can only be one
                    // SLD opened -not pinned- at a time). If there is, then we minimize the current SLD. If none, we open it.
                    const currentlyOpenedDiagramIndex = diagramStates.findIndex(
                        (diagram) =>
                            diagram.state === ViewState.OPENED &&
                            (diagram.svgType === DiagramType.SUBSTATION ||
                                diagram.svgType === DiagramType.VOLTAGE_LEVEL),
                    );
                    if (currentlyOpenedDiagramIndex >= 0) {
                        diagramStates[diagramToPinToggleIndex].state =
                            ViewState.MINIMIZED;
                    } else {
                        diagramStates[diagramToPinToggleIndex].state =
                            ViewState.OPENED;
                    }
                }
            }
        }

        state.diagramStates = diagramStates;
    });

    builder.addCase(CLOSE_DIAGRAM, (state, action) => {
        let diagramStates = state.diagramStates;

        if (action.svgType === DiagramType.NETWORK_AREA_DIAGRAM) {
            // If we close a NAD, we close all of them.
            diagramStates = diagramStates.filter(
                (diagram) =>
                    diagram.svgType !== DiagramType.NETWORK_AREA_DIAGRAM,
            );
        } else {
            // If we close a SLD, we only remove one.
            const diagramToCloseIndex = diagramStates.findIndex(
                (diagram) =>
                    diagram.id === action.id &&
                    diagram.svgType === action.svgType,
            );
            if (diagramToCloseIndex >= 0) {
                diagramStates.splice(diagramToCloseIndex, 1);
            }
        }

        state.diagramStates = diagramStates;
    });

    builder.addCase(CLOSE_DIAGRAMS, (state, action) => {
        const idsToClose = new Set(action.ids);
        state.diagramStates = state.diagramStates.filter(
            (diagram) => !idsToClose.has(diagram.id),
        );
    });

    builder.addCase(STOP_DIAGRAM_BLINK, (state) => {
        state.diagramStates.forEach((diagram) => {
            if (diagram.needsToBlink) {
                diagram.needsToBlink = undefined;
            }
        });
    });

    builder.addCase(RESET_NETWORK_AREA_DIAGRAM_DEPTH, (state) => {
        state.networkAreaDiagramDepth = 0;
    });

    builder.addCase(INCREMENT_NETWORK_AREA_DIAGRAM_DEPTH, (state) => {
        state.networkAreaDiagramDepth = state.networkAreaDiagramDepth + 1;
    });

    builder.addCase(DECREMENT_NETWORK_AREA_DIAGRAM_DEPTH, (state) => {
        if (state.networkAreaDiagramDepth > 0) {
            state.networkAreaDiagramDepth = state.networkAreaDiagramDepth - 1;
        }
    });

    builder.addCase(NETWORK_AREA_DIAGRAM_NB_VOLTAGE_LEVELS, (state, action) => {
        state.networkAreaDiagramNbVoltageLevels = action.nbVoltageLevels;
    });

    builder.addCase(LOAD_EQUIPMENTS, (state, action) => {
        state.spreadsheetNetwork[action.equipmentType] = action.equipments;
    });

    builder.addCase(UPDATE_EQUIPMENTS, (state, action) => {
        // for now, this action receives an object containing all equipments from a substation
        // it will be modified when the notifications received after a network modification will be more precise
        const updatedEquipments = action.equipments;

        // equipmentType : type of equipment updated
        // equipments : list of updated equipments of type <equipmentType>
        for (const [updateType, equipments] of Object.entries(
            updatedEquipments,
        )) {
            const equipmentType = getEquipmentTypeFromUpdateType(updateType);
            const currentEquipment = state.spreadsheetNetwork[equipmentType];

            // Format the updated equipments to match the table format
            const formattedEquipments = formatFetchedEquipments(
                equipmentType,
                equipments,
            );

            // if the <equipmentType> equipments are not loaded into the store yet, we don't have to update them
            if (currentEquipment != null) {
                //since substations data contains voltage level ones, they have to be treated separatly
                if (equipmentType === EQUIPMENT_TYPES.SUBSTATION) {
                    const [updatedSubtations, updatedVoltageLevels] =
                        updateSubstationsAndVoltageLevels(
                            state.spreadsheetNetwork[
                                EQUIPMENT_TYPES.SUBSTATION
                            ],
                            state.spreadsheetNetwork[
                                EQUIPMENT_TYPES.VOLTAGE_LEVEL
                            ],
                            formattedEquipments,
                        );

                    state.spreadsheetNetwork[EQUIPMENT_TYPES.SUBSTATION] =
                        updatedSubtations;
                    state.spreadsheetNetwork[EQUIPMENT_TYPES.VOLTAGE_LEVEL] =
                        updatedVoltageLevels;
                } else {
                    state.spreadsheetNetwork[equipmentType] = updateEquipments(
                        currentEquipment,
                        formattedEquipments,
                    );
                }
            }
        }
    });

    builder.addCase(DELETE_EQUIPMENT, (state, action) => {
        const equipmentToDeleteId = action.equipmentId;
        const equipmentToDeleteType = action.equipmentType;

        const currentEquipments =
            state.spreadsheetNetwork[equipmentToDeleteType];
        if (currentEquipments != null) {
            // in case of voltage level deletion, we need to update the linked substation which contains a list of its voltage levels
            if (equipmentToDeleteType === EQUIPMENT_TYPES.VOLTAGE_LEVEL) {
                const currentSubstations =
                    state.spreadsheetNetwork[EQUIPMENT_TYPES.SUBSTATION];
                if (currentSubstations != null) {
                    state.spreadsheetNetwork[EQUIPMENT_TYPES.SUBSTATION] =
                        updateSubstationAfterVLDeletion(
                            currentSubstations,
                            equipmentToDeleteId,
                        );
                }
            }

            state.spreadsheetNetwork[equipmentToDeleteType] = deleteEquipment(
                currentEquipments,
                equipmentToDeleteId,
            );
        }
    });

    builder.addCase(RESET_EQUIPMENTS, (state) => {
        state.spreadsheetNetwork = { ...initialSpreadsheetNetworkState };
    });

    builder.addCase(RESET_EQUIPMENTS_POST_LOADFLOW, (state) => {
        state.spreadsheetNetwork = {
            ...initialSpreadsheetNetworkState,
            [EQUIPMENT_TYPES.SUBSTATION]:
                state.spreadsheetNetwork[EQUIPMENT_TYPES.SUBSTATION],
            [EQUIPMENT_TYPES.VOLTAGE_LEVEL]:
                state.spreadsheetNetwork[EQUIPMENT_TYPES.VOLTAGE_LEVEL],
            [EQUIPMENT_TYPES.HVDC_LINE]:
                state.spreadsheetNetwork[EQUIPMENT_TYPES.HVDC_LINE],
        };
    });

    builder.addCase(SET_COMPUTING_STATUS, (state, action) => {
        state.computingStatus[action.computingType] = action.runningStatus;
    });

    builder.addCase(SET_COMPUTATION_STARTING, (state, action) => {
        state.computationStarting = action.computationStarting;
    });

    builder.addCase(SET_OPTIONAL_SERVICES, (state, action) => {
        state.optionalServices = action.optionalServices;
    });

    builder.addCase(
        SET_ONE_BUS_SHORTCIRCUIT_ANALYSIS_DIAGRAM,
        (state, action) => {
            state.oneBusShortCircuitAnalysisDiagram = {
                diagramId: action.diagramId,
                nodeId: action.nodeId,
            };
        },
    );

    builder.addCase(SET_STUDY_INDEXATION_STATUS, (state, action) => {
        state.studyIndexationStatus = action.studyIndexationStatus;
    });

    builder.addCase(SET_LAST_COMPLETED_COMPUTATION, (state, action) => {
        state.lastCompletedComputation = action.lastCompletedComputation;
    });
});

function updateSubstationAfterVLDeletion(currentSubstations, VLToDeleteId) {
    const substationToUpdateIndex = currentSubstations.findIndex((sub) =>
        sub.voltageLevels.some((vl) => vl.id === VLToDeleteId),
    );
    if (substationToUpdateIndex >= 0) {
        currentSubstations[substationToUpdateIndex].voltageLevels =
            currentSubstations[substationToUpdateIndex].voltageLevels.filter(
                (vl) => vl.id !== VLToDeleteId,
            );
    }

    return currentSubstations;
}

function getEquipmentTypeFromUpdateType(updateType) {
    switch (updateType) {
        case 'lines':
            return EQUIPMENT_TYPES.LINE;
        case 'twoWindingsTransformers':
            return EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER;
        case 'threeWindingsTransformers':
            return EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER;
        case 'generators':
            return EQUIPMENT_TYPES.GENERATOR;
        case 'loads':
            return EQUIPMENT_TYPES.LOAD;
        case 'batteries':
            return EQUIPMENT_TYPES.BATTERY;
        case 'danglingLines':
            return EQUIPMENT_TYPES.DANGLING_LINE;
        case 'hvdcLines':
            return EQUIPMENT_TYPES.HVDC_LINE;
        case 'lccConverterStations':
            return EQUIPMENT_TYPES.LCC_CONVERTER_STATION;
        case 'vscConverterStations':
            return EQUIPMENT_TYPES.VSC_CONVERTER_STATION;
        case 'shuntCompensators':
            return EQUIPMENT_TYPES.SHUNT_COMPENSATOR;
        case 'staticVarCompensators':
            return EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR;
        case 'voltageLevels':
            return EQUIPMENT_TYPES.VOLTAGE_LEVEL;
        case 'substations':
            return EQUIPMENT_TYPES.SUBSTATION;
        default:
            return;
    }
}

function deleteEquipment(currentEquipments, equipmentToDeleteId) {
    const equipmentToDeleteIndex = currentEquipments.findIndex(
        (eq) => eq.id === equipmentToDeleteId,
    );
    if (equipmentToDeleteIndex >= 0) {
        currentEquipments.splice(equipmentToDeleteIndex, 1);
    }
    return currentEquipments;
}

function updateSubstationsAndVoltageLevels(
    currentSubstations,
    currentVoltageLevels,
    newOrUpdatedSubstations,
) {
    const updatedSubstations = updateEquipments(
        currentSubstations,
        newOrUpdatedSubstations,
    );

    let updatedVoltageLevels = null;

    // if voltage levels are not loaded yet, we don't need to update them
    if (currentVoltageLevels != null) {
        const newOrUpdatedVoltageLevels = newOrUpdatedSubstations.reduce(
            (acc, currentSub) => {
                return acc.concat([...currentSub.voltageLevels]);
            },
            [],
        );

        updatedVoltageLevels = updateEquipments(
            currentVoltageLevels,
            newOrUpdatedVoltageLevels,
        );
    }

    return [updatedSubstations, updatedVoltageLevels];
}

function updateEquipments(currentEquipments, newOrUpdatedEquipments) {
    newOrUpdatedEquipments.forEach((equipment) => {
        const existingEquipmentIndex = currentEquipments.findIndex(
            (equip) => equip.id === equipment.id,
        );

        if (existingEquipmentIndex >= 0) {
            currentEquipments[existingEquipmentIndex] = equipment;
        } else {
            currentEquipments.push(equipment);
        }
    });

    return currentEquipments;
}

function synchCurrentTreeNode(state, nextCurrentNodeUuid) {
    const nextCurrentNode = state.networkModificationTreeModel?.treeNodes.find(
        (node) => node?.id === nextCurrentNodeUuid,
    );
    //  we need to overwrite state.currentTreeNode to consider label change for example.
    state.currentTreeNode = { ...nextCurrentNode };
}

function unravelSubTree(treeModel, subtreeParentId, node) {
    if (node) {
        if (treeModel.treeNodes.find((el) => el.id === node.id)) {
            treeModel.removeNodes([node.id]);
        }
        treeModel.addChild(node, subtreeParentId, NodeInsertModes.After);

        if (node.children.length > 0) {
            node.children.forEach((child) => {
                unravelSubTree(treeModel, node.id, child);
            });
        }
    }
}
