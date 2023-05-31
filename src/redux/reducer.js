/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createReducer } from '@reduxjs/toolkit';

import {
    USER,
    UNAUTHORIZED_USER_INFO,
    LOGOUT_ERROR,
    USER_VALIDATION_ERROR,
    RESET_AUTHENTICATION_ROUTER_ERROR,
    SHOW_AUTH_INFO_LOGIN,
} from '@gridsuite/commons-ui';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import {
    CENTER_LABEL,
    CLOSE_STUDY,
    DIAGONAL_LABEL,
    LINE_FLOW_MODE,
    LINE_FLOW_COLOR_MODE,
    LINE_FLOW_ALERT_THRESHOLD,
    LINE_FULL_PATH,
    LINE_PARALLEL_PATH,
    LOAD_GEO_DATA_SUCCESS,
    OPEN_STUDY,
    SELECT_THEME,
    USE_NAME,
    SELECT_LANGUAGE,
    SELECT_COMPUTED_LANGUAGE,
    SET_PARAMS_LOADED,
    STUDY_UPDATED,
    MAP_MANUAL_REFRESH,
    SUBSTATION_LAYOUT,
    CHANGE_DISPLAYED_COLUMNS_NAMES,
    CHANGE_LOCKED_COLUMNS_NAMES,
    CHANGE_REORDERED_COLUMNS,
    ADD_LOADFLOW_NOTIF,
    RESET_LOADFLOW_NOTIF,
    ADD_SA_NOTIF,
    ADD_VOLTAGE_INIT_NOTIF,
    RESET_SA_NOTIF,
    RESET_VOLTAGE_INIT_NOTIF,
    ADD_SENSI_NOTIF,
    RESET_SENSI_NOTIF,
    COMPONENT_LIBRARY,
    FAVORITE_CONTINGENCY_LISTS,
    LOAD_NETWORK_MODIFICATION_TREE_SUCCESS,
    NETWORK_MODIFICATION_TREE_NODE_ADDED,
    NETWORK_MODIFICATION_TREE_NODES_REMOVED,
    NETWORK_MODIFICATION_TREE_NODES_UPDATED,
    SET_MODIFICATIONS_DRAWER_OPEN,
    FLUX_CONVENTION,
    CENTER_ON_SUBSTATION,
    ADD_NOTIFICATION,
    REMOVE_NOTIFICATION_BY_NODE,
    CURRENT_TREE_NODE,
    SET_MODIFICATIONS_IN_PROGRESS,
    STUDY_DISPLAY_MODE,
    SET_STUDY_DISPLAY_MODE,
    OPEN_DIAGRAM,
    MINIMIZE_DIAGRAM,
    TOGGLE_PIN_DIAGRAM,
    CLOSE_DIAGRAM,
    CLOSE_DIAGRAMS,
    ADD_SHORT_CIRCUIT_NOTIF,
    RESET_SHORT_CIRCUIT_NOTIF,
    ADD_DYNAMIC_SIMULATION_NOTIF,
    RESET_DYNAMIC_SIMULATION_NOTIF,
    RESET_MAP_RELOADED,
    ENABLE_DEVELOPER_MODE,
    MAP_EQUIPMENTS_CREATED,
    NETWORK_MODIFICATION_TREE_NODE_MOVED,
    SET_FULLSCREEN_DIAGRAM,
    SET_UPDATED_SUBSTATIONS_IDS,
    SET_DELETED_EQUIPMENTS,
    RESET_NETWORK_AREA_DIAGRAM_DEPTH,
    INCREMENT_NETWORK_AREA_DIAGRAM_DEPTH,
    DECREMENT_NETWORK_AREA_DIAGRAM_DEPTH,
    NETWORK_AREA_DIAGRAM_NB_VOLTAGE_LEVELS,
    STOP_DIAGRAM_BLINK,
    NETWORK_MODIFICATION_HANDLE_SUBTREE,
    SELECTION_FOR_COPY,
    LIMIT_REDUCTION,
    LOAD_EQUIPMENTS,
    UPDATE_EQUIPMENTS,
    DELETE_EQUIPMENT,
    RESET_EQUIPMENTS,
    RESET_EQUIPMENTS_POST_LOADFLOW,
} from './actions';
import {
    getLocalStorageTheme,
    saveLocalStorageTheme,
    getLocalStorageLanguage,
    saveLocalStorageLanguage,
    getLocalStorageComputedLanguage,
} from './local-storage';
import { TABLES_COLUMNS_NAMES_JSON } from '../components/spreadsheet/utils/config-tables';
import {
    PARAM_CENTER_LABEL,
    PARAM_DIAGONAL_LABEL,
    PARAM_MAP_MANUAL_REFRESH,
    PARAM_LANGUAGE,
    PARAM_LIMIT_REDUCTION,
    PARAM_LINE_FLOW_ALERT_THRESHOLD,
    PARAM_LINE_FLOW_COLOR_MODE,
    PARAM_LINE_FLOW_MODE,
    PARAM_LINE_FULL_PATH,
    PARAM_LINE_PARALLEL_PATH,
    PARAM_SUBSTATION_LAYOUT,
    PARAM_COMPONENT_LIBRARY,
    PARAM_THEME,
    PARAM_USE_NAME,
    PARAM_FAVORITE_CONTINGENCY_LISTS,
    PARAM_FLUX_CONVENTION,
    PARAM_DEVELOPER_MODE,
    PARAMS_LOADED,
} from '../utils/config-params';
import NetworkModificationTreeModel from '../components/graph/network-modification-tree-model';
import { FluxConventions } from '../components/dialogs/parameters/network-parameters';
import { loadDiagramStateFromSessionStorage } from './session-storage';
import { DiagramType, ViewState } from '../components/diagrams/diagram-common';
import { getAllChildren } from 'components/graph/util/model-functions';
import { CopyType } from 'components/network-modification-tree-pane';

const paramsInitialState = {
    [PARAM_THEME]: getLocalStorageTheme(),
    [PARAM_LANGUAGE]: getLocalStorageLanguage(),
    [PARAM_USE_NAME]: true,
    [PARAM_LINE_FULL_PATH]: true,
    [PARAM_LINE_PARALLEL_PATH]: true,
    [PARAM_LIMIT_REDUCTION]: 100,
    [PARAM_LINE_FLOW_ALERT_THRESHOLD]: 100,
    [PARAM_MAP_MANUAL_REFRESH]: false,
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

const initialSpreadsheetNetworkState = {
    substations: null,
    lines: null,
    twoWindingsTransformers: null,
    threeWindingsTransformers: null,
    generators: null,
    loads: null,
    batteries: null,
    danglingLines: null,
    hvdcLines: null,
    lccConverterStations: null,
    vscConverterStations: null,
    shuntCompensators: null,
    staticVarCompensators: null,
    voltageLevels: null,
};

const initialState = {
    studyUuid: null,
    currentTreeNode: null,
    selectionForCopy: {
        sourceStudyId: null,
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
    loadflowNotif: false,
    saNotif: false,
    voltageInitNotif: false,
    sensiNotif: false,
    shortCircuitNotif: false,
    dynamicSimulationNotif: false,
    fullScreenDiagram: null,
    allDisplayedColumnsNames: TABLES_COLUMNS_NAMES_JSON,
    allLockedColumnsNames: [],
    allReorderedTableDefinitionIndexes: [],
    isExplorerDrawerOpen: true,
    isModificationsDrawerOpen: false,
    centerOnSubstation: null,
    notificationIdList: [],
    isModificationsInProgress: false,
    studyDisplayMode: STUDY_DISPLAY_MODE.HYBRID,
    diagramStates: [],
    reloadMap: true,
    updatedSubstationsIds: [],
    deletedEquipments: [],
    networkAreaDiagramDepth: 0,
    networkAreaDiagramNbVoltageLevels: 0,
    spreadsheetNetwork: { ...initialSpreadsheetNetworkState },
    ...paramsInitialState,
    // Hack to avoid reload Geo Data when switching display mode to TREE then back to MAP or HYBRID
    // defaulted to true to init load geo data with HYBRID defaulted display Mode
    // TODO REMOVE LATER
};

export const reducer = createReducer(initialState, {
    [OPEN_STUDY]: (state, action) => {
        state.studyUuid = action.studyRef[0];

        if (action.studyRef[0] != null) {
            state.diagramStates = loadDiagramStateFromSessionStorage(
                action.studyRef[0]
            );
        }
    },

    [CLOSE_STUDY]: (state) => {
        state.studyUuid = null;
        state.geoData = null;
        state.networkModificationTreeModel = null;
    },

    [MAP_EQUIPMENTS_CREATED]: (state, action) => {
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
    },

    [LOAD_GEO_DATA_SUCCESS]: (state, action) => {
        state.geoData = action.geoData;
    },

    [LOAD_NETWORK_MODIFICATION_TREE_SUCCESS]: (state, action) => {
        state.networkModificationTreeModel =
            action.networkModificationTreeModel;
        state.networkModificationTreeModel.setBuildingStatus();
    },

    [NETWORK_MODIFICATION_TREE_NODE_ADDED]: (state, action) => {
        if (state.networkModificationTreeModel) {
            let newModel =
                state.networkModificationTreeModel.newSharedForUpdate();
            newModel.addChild(
                action.networkModificationTreeNode,
                action.parentNodeId,
                action.insertMode
            );
            newModel.updateLayout();
            state.networkModificationTreeModel = newModel;
            // check if added node is the new parent of the current Node
            if (
                action.networkModificationTreeNode?.childrenIds.includes(
                    state.currentTreeNode?.id
                )
            ) {
                // Then must overwrite currentTreeNode to set new parentNodeUuid
                synchCurrentTreeNode(state, state.currentTreeNode?.id);
            }
        }
    },

    [NETWORK_MODIFICATION_TREE_NODE_MOVED]: (state, action) => {
        if (state.networkModificationTreeModel) {
            let newModel =
                state.networkModificationTreeModel.newSharedForUpdate();
            newModel.removeNodes([action.networkModificationTreeNode.id]);
            newModel.addChild(
                action.networkModificationTreeNode,
                action.parentNodeId,
                action.insertMode
            );
            newModel.updateLayout();
            state.networkModificationTreeModel = newModel;
            // check if added node is the new parent of the current Node
            if (
                action.networkModificationTreeNode?.childrenIds.includes(
                    state.currentTreeNode?.id
                )
            ) {
                // Then must overwrite currentTreeNode to set new parentNodeUuid
                synchCurrentTreeNode(state, state.currentTreeNode?.id);
            }
        }
    },

    [NETWORK_MODIFICATION_HANDLE_SUBTREE]: (state, action) => {
        if (state.networkModificationTreeModel) {
            let newModel =
                state.networkModificationTreeModel.newSharedForUpdate();
            unravelSubTree(
                newModel,
                action.parentNodeId,
                action.networkModificationTreeNodes
            );

            newModel.updateLayout();
            state.networkModificationTreeModel = newModel;
        }
    },

    [NETWORK_MODIFICATION_TREE_NODES_REMOVED]: (state, action) => {
        if (state.networkModificationTreeModel) {
            let newModel =
                state.networkModificationTreeModel.newSharedForUpdate();

            //we assume all the deleted nodes are contiguous, so the new parent selected will be the nearest upstream node.
            //in the future, if the deleted nodes are no longer contiguous we will need another implementation
            const nextCurrentNodeUuid = newModel.treeNodes
                .filter((node) =>
                    action.networkModificationTreeNodes.includes(node.id)
                )
                .map((node) => node.data.parentNodeUuid)
                .find(
                    (parentNodeUuid) =>
                        !action.networkModificationTreeNodes.includes(
                            parentNodeUuid
                        )
                );

            newModel.removeNodes(action.networkModificationTreeNodes);
            newModel.updateLayout();
            state.networkModificationTreeModel = newModel;

            // check if current node is in the nodes deleted list
            if (
                action.networkModificationTreeNodes.includes(
                    state.currentTreeNode?.id
                )
            ) {
                synchCurrentTreeNode(state, nextCurrentNodeUuid);
            } // check if parent node of the current node is in the nodes deleted list
            else if (
                action.networkModificationTreeNodes.includes(
                    state.currentTreeNode?.data?.parentNodeUuid
                )
            ) {
                // Then must overwrite currentTreeNode to get new parentNodeUuid
                synchCurrentTreeNode(state, state.currentTreeNode?.id);
            }
        }
    },

    [NETWORK_MODIFICATION_TREE_NODES_UPDATED]: (state, action) => {
        if (state.networkModificationTreeModel) {
            let newModel =
                state.networkModificationTreeModel.newSharedForUpdate();
            newModel.updateNodes(action.networkModificationTreeNodes);
            state.networkModificationTreeModel = newModel;
            state.networkModificationTreeModel.setBuildingStatus();
            // check if current node is in the nodes updated list
            if (
                action.networkModificationTreeNodes.find(
                    (node) => node.id === state.currentTreeNode?.id
                )
            ) {
                synchCurrentTreeNode(state, state.currentTreeNode?.id);
                // current node has changed, then will need to reload Geo Data
                state.reloadMap = true;
            }
        }
    },

    [STUDY_UPDATED]: (state, action) => {
        state.studyUpdated = {
            force: 1 - state.studyUpdated.force,
            eventData: action.eventData,
        };
    },

    [SELECT_THEME]: (state, action) => {
        state[PARAM_THEME] = action[PARAM_THEME];
        saveLocalStorageTheme(state[PARAM_THEME]);
    },

    [SELECT_LANGUAGE]: (state, action) => {
        state[PARAM_LANGUAGE] = action[PARAM_LANGUAGE];
        saveLocalStorageLanguage(state[PARAM_LANGUAGE]);
    },

    [SELECT_COMPUTED_LANGUAGE]: (state, action) => {
        state.computedLanguage = action.computedLanguage;
    },

    [SET_PARAMS_LOADED]: (state, action) => {
        state[PARAMS_LOADED] = action[PARAMS_LOADED];
    },

    [USE_NAME]: (state, action) => {
        state[PARAM_USE_NAME] = action[PARAM_USE_NAME];
    },

    [USER]: (state, action) => {
        state.user = action.user;
    },

    [CENTER_LABEL]: (state, action) => {
        state[PARAM_CENTER_LABEL] = action[PARAM_CENTER_LABEL];
    },

    [DIAGONAL_LABEL]: (state, action) => {
        state[PARAM_DIAGONAL_LABEL] = action[PARAM_DIAGONAL_LABEL];
    },

    [LINE_FULL_PATH]: (state, action) => {
        state[PARAM_LINE_FULL_PATH] = action[PARAM_LINE_FULL_PATH];
    },

    [LINE_PARALLEL_PATH]: (state, action) => {
        state[PARAM_LINE_PARALLEL_PATH] = action[PARAM_LINE_PARALLEL_PATH];
    },

    [LINE_FLOW_MODE]: (state, action) => {
        state[PARAM_LINE_FLOW_MODE] = action[PARAM_LINE_FLOW_MODE];
    },

    [FLUX_CONVENTION]: (state, action) => {
        state[PARAM_FLUX_CONVENTION] = action[PARAM_FLUX_CONVENTION];
    },

    [ENABLE_DEVELOPER_MODE]: (state, action) => {
        state[PARAM_DEVELOPER_MODE] = action[PARAM_DEVELOPER_MODE];
    },

    [LINE_FLOW_COLOR_MODE]: (state, action) => {
        state[PARAM_LINE_FLOW_COLOR_MODE] = action[PARAM_LINE_FLOW_COLOR_MODE];
    },

    [LIMIT_REDUCTION]: (state, action) => {
        state[PARAM_LIMIT_REDUCTION] = action[PARAM_LIMIT_REDUCTION];
    },

    [LINE_FLOW_ALERT_THRESHOLD]: (state, action) => {
        state[PARAM_LINE_FLOW_ALERT_THRESHOLD] =
            action[PARAM_LINE_FLOW_ALERT_THRESHOLD];
    },

    [UNAUTHORIZED_USER_INFO]: (state, action) => {
        state.authenticationRouterError = action.authenticationRouterError;
    },

    [LOGOUT_ERROR]: (state, action) => {
        state.authenticationRouterError = action.authenticationRouterError;
    },

    [USER_VALIDATION_ERROR]: (state, action) => {
        state.authenticationRouterError = action.authenticationRouterError;
    },

    [RESET_AUTHENTICATION_ROUTER_ERROR]: (state, action) => {
        state.authenticationRouterError = null;
    },

    [SHOW_AUTH_INFO_LOGIN]: (state, action) => {
        state.showAuthenticationRouterLogin =
            action.showAuthenticationRouterLogin;
    },

    [MAP_MANUAL_REFRESH]: (state, action) => {
        state[PARAM_MAP_MANUAL_REFRESH] = action[PARAM_MAP_MANUAL_REFRESH];
    },

    [RESET_MAP_RELOADED]: (state) => {
        state.reloadMap = false;
    },

    [SET_UPDATED_SUBSTATIONS_IDS]: (state, action) => {
        state.updatedSubstationsIds = action.updatedSubstationsIds;
    },

    [SET_DELETED_EQUIPMENTS]: (state, action) => {
        state.deletedEquipments = action.deletedEquipments;
    },

    [ADD_LOADFLOW_NOTIF]: (state) => {
        state.loadflowNotif = true;
    },

    [RESET_LOADFLOW_NOTIF]: (state) => {
        state.loadflowNotif = false;
    },

    [ADD_SA_NOTIF]: (state) => {
        state.saNotif = true;
    },

    [RESET_SA_NOTIF]: (state) => {
        state.saNotif = false;
    },

    [ADD_VOLTAGE_INIT_NOTIF]: (state) => {
        state.voltageInitNotif = true;
    },

    [RESET_VOLTAGE_INIT_NOTIF]: (state) => {
        state.voltageInitNotif = false;
    },

    [ADD_SENSI_NOTIF]: (state) => {
        state.sensiNotif = true;
    },

    [RESET_SENSI_NOTIF]: (state) => {
        state.sensiNotif = false;
    },

    [ADD_SHORT_CIRCUIT_NOTIF]: (state) => {
        state.shortCircuitNotif = true;
    },

    [RESET_SHORT_CIRCUIT_NOTIF]: (state) => {
        state.shortCircuitNotif = false;
    },

    [ADD_DYNAMIC_SIMULATION_NOTIF]: (state) => {
        state.dynamicSimulationNotif = true;
    },

    [RESET_DYNAMIC_SIMULATION_NOTIF]: (state) => {
        state.dynamicSimulationNotif = false;
    },

    [SUBSTATION_LAYOUT]: (state, action) => {
        state[PARAM_SUBSTATION_LAYOUT] = action[PARAM_SUBSTATION_LAYOUT];
    },

    [COMPONENT_LIBRARY]: (state, action) => {
        state[PARAM_COMPONENT_LIBRARY] = action[PARAM_COMPONENT_LIBRARY];
    },

    [SET_FULLSCREEN_DIAGRAM]: (state, action) => {
        state.fullScreenDiagram = {
            id: action.diagramId,
            svgType: action.svgType,
        };
    },

    [CHANGE_DISPLAYED_COLUMNS_NAMES]: (state, action) => {
        const newDisplayedColumnsNames = [...state.allDisplayedColumnsNames];
        action.displayedColumnsNamesParams.forEach((param) => {
            if (param) {
                newDisplayedColumnsNames[param.index] = param.value;
            }
        });
        state.allDisplayedColumnsNames = newDisplayedColumnsNames;
    },
    [CHANGE_LOCKED_COLUMNS_NAMES]: (state, action) => {
        let newLockedColumnsNames = [...state.allLockedColumnsNames];
        action.lockedColumnsNamesParams.forEach((param) => {
            if (param) {
                newLockedColumnsNames[param.index] = param.value;
            }
        });
        state.allLockedColumnsNames = newLockedColumnsNames;
    },
    [CHANGE_REORDERED_COLUMNS]: (state, action) => {
        let newReorderedColumns = [...state.allReorderedTableDefinitionIndexes];
        action.reorderedColumnsParams.forEach((param) => {
            if (param) {
                newReorderedColumns[param.index] = param.value;
            }
        });
        state.allReorderedTableDefinitionIndexes = newReorderedColumns;
    },
    [FAVORITE_CONTINGENCY_LISTS]: (state, action) => {
        state[PARAM_FAVORITE_CONTINGENCY_LISTS] =
            action[PARAM_FAVORITE_CONTINGENCY_LISTS];
    },
    [CURRENT_TREE_NODE]: (state, action) => {
        state.currentTreeNode = action.currentTreeNode;
        // current node has changed, then will need to reload Geo Data
        state.updatedSubstationsIds = [];
        state.deletedEquipments = [];
        state.reloadMap = true;
    },
    [SELECTION_FOR_COPY]: (state, action) => {
        const selectionForCopy = action.selectionForCopy;
        if (
            selectionForCopy.nodeId &&
            (selectionForCopy.copyType === CopyType.SUBTREE_COPY ||
                selectionForCopy.copyType === CopyType.SUBTREE_CUT)
        ) {
            selectionForCopy.allChildrenIds = getAllChildren(
                state.networkModificationTreeModel,
                selectionForCopy.nodeId
            ).map((child) => child.id);
        }
        state.selectionForCopy = selectionForCopy;
    },
    [SET_MODIFICATIONS_DRAWER_OPEN]: (state, action) => {
        state.isModificationsDrawerOpen = action.isModificationsDrawerOpen;
    },
    [CENTER_ON_SUBSTATION]: (state, action) => {
        state.centerOnSubstation = action.centerOnSubstation;
    },
    [ADD_NOTIFICATION]: (state, action) => {
        state.notificationIdList = [
            ...state.notificationIdList,
            ...action.notificationIds,
        ];
    },
    [REMOVE_NOTIFICATION_BY_NODE]: (state, action) => {
        state.notificationIdList = [
            ...state.notificationIdList.filter(
                (nodeId) => !action.notificationIds.includes(nodeId)
            ),
        ];
    },
    [SET_MODIFICATIONS_IN_PROGRESS]: (state, action) => {
        state.isModificationsInProgress = action.isModificationsInProgress;
    },
    [SET_STUDY_DISPLAY_MODE]: (state, action) => {
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
    },
    /*
     * The following functions' goal are to update state.diagramStates with nodes of the following type :
     * { id: 'diagramID', svgType: 'SvgType of the diagram', state: 'ViewState of the diagram' }
     *
     * Depending on the diagram's svgType, the state.diagramStates is different.
     * For Network Area Diagrams (SvgType.NETWORK_AREA_DIAGRAM), all the states should be the same.
     * As an example, if one is PINNED, then all of them should be.
     * For Single Line Diagrams (SvgType.VOLTAGE_LEVEL or SvgType.SUBSTATION), each diagram has its own state.
     */
    [OPEN_DIAGRAM]: (state, action) => {
        const diagramStates = state.diagramStates;
        const diagramToOpenIndex = diagramStates.findIndex(
            (diagram) =>
                diagram.id === action.id && diagram.svgType === action.svgType
        );

        if (action.svgType === DiagramType.NETWORK_AREA_DIAGRAM) {
            // First, we check if there is already a Network Area Diagram in the diagramStates.
            const firstNadIndex = diagramStates.findIndex(
                (diagram) =>
                    diagram.svgType === DiagramType.NETWORK_AREA_DIAGRAM
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
                            ')'
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
    },
    [MINIMIZE_DIAGRAM]: (state, action) => {
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
                    diagram.svgType === action.svgType
            );
            if (diagramToMinimizeIndex >= 0) {
                diagramStates[diagramToMinimizeIndex].state =
                    ViewState.MINIMIZED;
            }
        }
        state.diagramStates = diagramStates;
    },
    [TOGGLE_PIN_DIAGRAM]: (state, action) => {
        const diagramStates = state.diagramStates;

        // search targeted diagram among the diagramStates
        const diagramToPinToggleIndex = diagramStates.findIndex(
            (diagram) =>
                diagram.id === action.id && diagram.svgType === action.svgType
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
                                diagram.svgType === DiagramType.VOLTAGE_LEVEL)
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
    },
    [CLOSE_DIAGRAM]: (state, action) => {
        let diagramStates = state.diagramStates;

        if (action.svgType === DiagramType.NETWORK_AREA_DIAGRAM) {
            // If we close a NAD, we close all of them.
            diagramStates = diagramStates.filter(
                (diagram) =>
                    diagram.svgType !== DiagramType.NETWORK_AREA_DIAGRAM
            );
        } else {
            // If we close a SLD, we only remove one.
            const diagramToCloseIndex = diagramStates.findIndex(
                (diagram) =>
                    diagram.id === action.id &&
                    diagram.svgType === action.svgType
            );
            if (diagramToCloseIndex >= 0) {
                diagramStates.splice(diagramToCloseIndex, 1);
            }
        }

        state.diagramStates = diagramStates;
    },
    [CLOSE_DIAGRAMS]: (state, action) => {
        const idsToClose = new Set(action.ids);
        state.diagramStates = state.diagramStates.filter(
            (diagram) => !idsToClose.has(diagram.id)
        );
    },
    [STOP_DIAGRAM_BLINK]: (state) => {
        state.diagramStates.forEach((diagram) => {
            if (diagram.needsToBlink) {
                diagram.needsToBlink = undefined;
            }
        });
    },
    [RESET_NETWORK_AREA_DIAGRAM_DEPTH]: (state) => {
        state.networkAreaDiagramDepth = 0;
    },
    [INCREMENT_NETWORK_AREA_DIAGRAM_DEPTH]: (state) => {
        state.networkAreaDiagramDepth = state.networkAreaDiagramDepth + 1;
    },
    [DECREMENT_NETWORK_AREA_DIAGRAM_DEPTH]: (state) => {
        if (state.networkAreaDiagramDepth > 0) {
            state.networkAreaDiagramDepth = state.networkAreaDiagramDepth - 1;
        }
    },
    [NETWORK_AREA_DIAGRAM_NB_VOLTAGE_LEVELS]: (state, action) => {
        state.networkAreaDiagramNbVoltageLevels = action.nbVoltageLevels;
    },
    [LOAD_EQUIPMENTS]: (state, action) => {
        state.spreadsheetNetwork[action.equipmentType] = action.equipments;
    },
    [UPDATE_EQUIPMENTS]: (state, action) => {
        // for now, this action receives an object containing all equipments from a substation
        // it will be modified when the notifications received after a network modification will be more precise
        const updatedEquipements = action.equipments;

        for (const [equipmentType, equipmentList] of Object.entries(
            updatedEquipements
        )) {
            const currentEquipment = state.spreadsheetNetwork[equipmentType];

            // if the <equipmentType> equipments are not loaded into the store yet, we don't have to update them
            if (currentEquipment != null) {
                //since substations data contains voltage level ones, they have to be treated separatly
                if (equipmentType === 'substations') {
                    const [updatedSubtations, updatedVoltageLevels] =
                        updateSubstationsAndVoltageLevels(
                            state.spreadsheetNetwork.substations,
                            state.spreadsheetNetwork.voltageLevels,
                            equipmentList
                        );

                    state.spreadsheetNetwork.substations = updatedSubtations;
                    state.spreadsheetNetwork.voltageLevels =
                        updatedVoltageLevels;
                } else {
                    state.spreadsheetNetwork[equipmentType] = updateEquipments(
                        currentEquipment,
                        equipmentList
                    );
                }
            }
        }
    },
    [DELETE_EQUIPMENT]: (state, action) => {
        const equipmentToDeleteId = action.equipmentId;
        const equipmentToDeleteType = fromEquipmentTypeToSpreadsheetNetworkType(
            action.equipmentType
        );

        const currentEquipments =
            state.spreadsheetNetwork[equipmentToDeleteType];
        if (currentEquipments != null) {
            // in case of voltage level deletion, we need to update the linked substation which contains a list of its voltage levels
            if (action.equipmentType === EQUIPMENT_TYPES.VOLTAGE_LEVEL.type) {
                const currentSubstations = state.spreadsheetNetwork.substations;
                if (currentSubstations != null) {
                    state.spreadsheetNetwork.substations =
                        updateSubstationAfterVLDeletion(
                            currentSubstations,
                            equipmentToDeleteId
                        );
                }
            }

            state.spreadsheetNetwork[equipmentToDeleteType] = deleteEquipment(
                currentEquipments,
                equipmentToDeleteId
            );
        }
    },
    [RESET_EQUIPMENTS]: (state) => {
        state.spreadsheetNetwork = { ...initialSpreadsheetNetworkState };
    },
    [RESET_EQUIPMENTS_POST_LOADFLOW]: (state) => {
        state.spreadsheetNetwork = {
            ...initialSpreadsheetNetworkState,
            substations: state.spreadsheetNetwork.substations,
            voltageLevels: state.spreadsheetNetwork.voltageLevels,
            hvdcLines: state.spreadsheetNetwork.hvdcLines,
        };
    },
});

function updateSubstationAfterVLDeletion(currentSubstations, VLToDeleteId) {
    const substationToUpdateIndex = currentSubstations.findIndex((sub) =>
        sub.voltageLevels.some((vl) => vl.id === VLToDeleteId)
    );
    if (substationToUpdateIndex >= 0) {
        currentSubstations[substationToUpdateIndex].voltageLevels =
            currentSubstations[substationToUpdateIndex].voltageLevels.filter(
                (vl) => vl.id !== VLToDeleteId
            );
    }

    return currentSubstations;
}

function fromEquipmentTypeToSpreadsheetNetworkType(equipmentType) {
    switch (equipmentType) {
        case EQUIPMENT_TYPES.LINE.type:
            return 'lines';
        case EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER.type:
            return 'twoWindingsTransformers';
        case EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER.type:
            return 'threeWindingsTransformers';
        case EQUIPMENT_TYPES.GENERATOR.type:
            return 'generators';
        case EQUIPMENT_TYPES.LOAD.type:
            return 'loads';
        case EQUIPMENT_TYPES.BATTERY.type:
            return 'batteries';
        case EQUIPMENT_TYPES.DANGLING_LINE.type:
            return 'danglingLines';
        case EQUIPMENT_TYPES.HVDC_LINE.type:
            return 'hvdcLines';
        case EQUIPMENT_TYPES.LCC_CONVERTER_STATION.type:
            return 'lccConverterStations';
        case EQUIPMENT_TYPES.VSC_CONVERTER_STATION.type:
            return 'vscConverterStations';
        case EQUIPMENT_TYPES.SHUNT_COMPENSATOR.type:
            return 'shuntCompensators';
        case EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR.type:
            return 'staticVarCompensators';
        case EQUIPMENT_TYPES.VOLTAGE_LEVEL.type:
            return 'voltageLevels';
        case EQUIPMENT_TYPES.SUBSTATION.type:
            return 'substations';
        default:
            return;
    }
}

function deleteEquipment(currentEquipments, equipmentToDeleteId) {
    const equipmentToDeleteIndex = currentEquipments.findIndex(
        (eq) => eq.id === equipmentToDeleteId
    );
    if (equipmentToDeleteIndex >= 0) {
        currentEquipments.splice(equipmentToDeleteIndex, 1);
    }
    return currentEquipments;
}

function updateSubstationsAndVoltageLevels(
    currentSubstations,
    currentVoltageLevels,
    newOrUpdatedSubstations
) {
    currentSubstations = updateEquipments(
        currentSubstations,
        newOrUpdatedSubstations
    );

    // if voltage levels are not loaded yet, we don't need to update them
    if (currentVoltageLevels != null) {
        const newOrUpdatedVoltageLevels = newOrUpdatedSubstations.reduce(
            (acc, currentSub) => {
                return acc.concat([...currentSub.voltageLevels]);
            },
            []
        );

        currentVoltageLevels = updateEquipments(
            currentVoltageLevels,
            newOrUpdatedVoltageLevels
        );
    }

    return [currentSubstations, currentVoltageLevels];
}

function updateEquipments(currentEquipments, newOrUpdatedEquipements) {
    newOrUpdatedEquipements.forEach((equipment) => {
        const existingEquipmentIndex = currentEquipments.findIndex(
            (equip) => equip.id === equipment.id
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
        (node) => node?.id === nextCurrentNodeUuid
    );
    //  we need to overwrite state.currentTreeNode to consider label change for example.
    state.currentTreeNode = { ...nextCurrentNode };
}

function unravelSubTree(treeModel, subtreeParentId, node) {
    if (node) {
        if (treeModel.treeNodes.find((el) => el.id === node.id)) {
            treeModel.removeNodes([node.id]);
        }
        treeModel.addChild(node, subtreeParentId, 'AFTER');

        if (node.children.length > 0) {
            node.children.forEach((child) => {
                unravelSubTree(treeModel, node.id, child);
            });
        }
    }
}
