/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createReducer, current } from '@reduxjs/toolkit';

import {
    USER,
    UNAUTHORIZED_USER_INFO,
    LOGOUT_ERROR,
    USER_VALIDATION_ERROR,
    RESET_AUTHENTICATION_ROUTER_ERROR,
    SHOW_AUTH_INFO_LOGIN,
} from '@gridsuite/commons-ui';

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
    NETWORK_CREATED,
    NETWORK_EQUIPMENT_LOADED,
    OPEN_STUDY,
    SELECT_THEME,
    USE_NAME,
    SELECT_LANGUAGE,
    SELECT_COMPUTED_LANGUAGE,
    STUDY_UPDATED,
    DISPLAY_OVERLOAD_TABLE,
    MAP_MANUAL_REFRESH,
    FILTERED_NOMINAL_VOLTAGES_UPDATED,
    SUBSTATION_LAYOUT,
    FULLSCREEN_SINGLE_LINE_DIAGRAM_ID, // TODO to remove after the SLD/NAD refactorization
    CHANGE_DISPLAYED_COLUMNS_NAMES,
    CHANGE_LOCKED_COLUMNS_NAMES,
    CHANGE_REORDERED_COLUMNS,
    ADD_LOADFLOW_NOTIF,
    RESET_LOADFLOW_NOTIF,
    ADD_SA_NOTIF,
    RESET_SA_NOTIF,
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
    FULLSCREEN_NETWORK_AREA_DIAGRAM_ID, // TODO to remove after the SLD/NAD refactorization
    CURRENT_TREE_NODE,
    SET_MODIFICATIONS_IN_PROGRESS,
    STUDY_DISPLAY_MODE,
    SET_STUDY_DISPLAY_MODE,
    OPEN_SLD, // TODO to remove after the SLD/NAD refactorization
    MINIMIZE_SLD, // TODO to remove after the SLD/NAD refactorization
    TOGGLE_PIN_SLD, // TODO to remove after the SLD/NAD refactorization
    CLOSE_SLD, // TODO to remove after the SLD/NAD refactorization
    OPEN_DIAGRAM,
    MINIMIZE_DIAGRAM,
    TOGGLE_PIN_DIAGRAM,
    CLOSE_DIAGRAM,
    ADD_SHORT_CIRCUIT_NOTIF,
    RESET_SHORT_CIRCUIT_NOTIF,
    RESET_MAP_RELOADED,
    ENABLE_DEVELOPER_MODE,
    SET_NETWORK_RELOAD_NEEDED,
    SET_FORCE_NETWORK_RELOAD,
    RESET_NETWORK_RELOAD,
    NETWORK_MODIFICATION_TREE_NODE_MOVED,
    SET_FULLSCREEN_DIAGRAM_ID,
} from './actions';
import {
    getLocalStorageTheme,
    saveLocalStorageTheme,
    getLocalStorageLanguage,
    saveLocalStorageLanguage,
    getLocalStorageComputedLanguage,
} from './local-storage';
import { TABLES_COLUMNS_NAMES_JSON } from '../components/network/config-tables';
import {
    PARAM_CENTER_LABEL,
    PARAM_DIAGONAL_LABEL,
    PARAM_DISPLAY_OVERLOAD_TABLE,
    PARAM_MAP_MANUAL_REFRESH,
    PARAM_LANGUAGE,
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
} from '../utils/config-params';
import NetworkModificationTreeModel from '../components/graph/network-modification-tree-model';
import { FluxConventions } from '../components/dialogs/parameters/network-parameters';
import {
    loadSldStateFromSessionStorage, // TODO to remove after the SLD/NAD refactorization
    loadDiagramStateFromSessionStorage,
} from './session-storage';
import { SvgType, ViewState } from '../components/diagrams/diagram-common';

const paramsInitialState = {
    [PARAM_THEME]: getLocalStorageTheme(),
    [PARAM_LANGUAGE]: getLocalStorageLanguage(),
    [PARAM_USE_NAME]: true,
    [PARAM_LINE_FULL_PATH]: true,
    [PARAM_LINE_PARALLEL_PATH]: true,
    [PARAM_LINE_FLOW_ALERT_THRESHOLD]: 100,
    [PARAM_DISPLAY_OVERLOAD_TABLE]: false,
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
};

const initialState = {
    studyUuid: null,
    currentTreeNode: null,
    network: null,
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
    sensiNotif: false,
    shortCircuitNotif: false,
    filteredNominalVoltages: null,
    fullScreenSldId: null, // TODO to remove after the SLD/NAD refactorization
    fullScreenNadId: null, // TODO to remove after the SLD/NAD refactorization
    fullScreenDiagramId: null,
    allDisplayedColumnsNames: TABLES_COLUMNS_NAMES_JSON,
    allLockedColumnsNames: [],
    allReorderedTableDefinitionIndexes: [],
    isExplorerDrawerOpen: true,
    isModificationsDrawerOpen: false,
    voltageLevelsIdsForNad: [], // TODO CHARLY incorporer les IDs multiples dans le diagram NAD
    centerOnSubstation: null,
    notificationIdList: [],
    isModificationsInProgress: false,
    studyDisplayMode: STUDY_DISPLAY_MODE.HYBRID,
    sldState: [], // TODO to remove after the SLD/NAD refactorization
    diagramStates: [],
    reloadMap: true,
    networkReloadNeeded: false,
    forceReloadNetwork: true,
    ...paramsInitialState,
    // Hack to avoid reload Geo Data when switching display mode to TREE then back to MAP or HYBRID
    // defaulted to true to init load geo data with HYBRID defaulted display Mode
    // TODO REMOVE LATER
};

export const reducer = createReducer(initialState, {
    [OPEN_STUDY]: (state, action) => {
        state.studyUuid = action.studyRef[0];

        if (action.studyRef[0] != null) {
            state.sldState = loadSldStateFromSessionStorage(action.studyRef[0]); // TODO to remove after the SLD/NAD refactorization
            state.diagramStates = loadDiagramStateFromSessionStorage(
                action.studyRef[0]
            );
        }
    },

    [CLOSE_STUDY]: (state) => {
        state.studyUuid = null;
        state.network = null;
        state.geoData = null;
        state.networkModificationTreeModel = null;
    },

    [NETWORK_CREATED]: (state, action) => {
        state.network = action.network;
    },

    [NETWORK_EQUIPMENT_LOADED]: (state, action) => {
        state.network = state.network.newSharedForUpdate(
            action.equipmentsName,
            action.values
        );
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

    [NETWORK_MODIFICATION_TREE_NODES_REMOVED]: (state, action) => {
        if (state.networkModificationTreeModel) {
            let newModel =
                state.networkModificationTreeModel.newSharedForUpdate();

            newModel.removeNodes(action.networkModificationTreeNodes);
            newModel.updateLayout();
            state.networkModificationTreeModel = newModel;

            // check if current node is in the nodes deleted list
            if (
                action.networkModificationTreeNodes.includes(
                    state.currentTreeNode?.id
                )
            ) {
                //TODO Today we manage action.networkModificationTreeNodes which size is always 1 and then to delete one node at a time.
                // If tomorrow we need to delete multiple nodes, we need to check that the parentNode here isn't in the action.networkModificationTreeNodes list
                synchCurrentTreeNode(
                    state,
                    state.currentTreeNode?.data?.parentNodeUuid
                );
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

    [DISPLAY_OVERLOAD_TABLE]: (state, action) => {
        state[PARAM_DISPLAY_OVERLOAD_TABLE] =
            action[PARAM_DISPLAY_OVERLOAD_TABLE];
    },

    [MAP_MANUAL_REFRESH]: (state, action) => {
        state[PARAM_MAP_MANUAL_REFRESH] = action[PARAM_MAP_MANUAL_REFRESH];
    },

    [SET_FORCE_NETWORK_RELOAD]: (state) => {
        state.forceReloadNetwork = true;
    },

    [SET_NETWORK_RELOAD_NEEDED]: (state) => {
        state.networkReloadNeeded = true;
    },

    [RESET_NETWORK_RELOAD]: (state) => {
        state.networkReloadNeeded = false;
        state.forceReloadNetwork = false;
    },

    [RESET_MAP_RELOADED]: (state) => {
        state.reloadMap = false;
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

    [FILTERED_NOMINAL_VOLTAGES_UPDATED]: (state, action) => {
        state.filteredNominalVoltages = action.filteredNominalVoltages;
    },

    [SUBSTATION_LAYOUT]: (state, action) => {
        state[PARAM_SUBSTATION_LAYOUT] = action[PARAM_SUBSTATION_LAYOUT];
    },

    [COMPONENT_LIBRARY]: (state, action) => {
        state[PARAM_COMPONENT_LIBRARY] = action[PARAM_COMPONENT_LIBRARY];
    },

    [FULLSCREEN_SINGLE_LINE_DIAGRAM_ID]: (state, action) => {
        // TODO to remove after the SLD/NAD refactorization
        state.fullScreenSldId = action.fullScreenSldId;
    },

    [FULLSCREEN_NETWORK_AREA_DIAGRAM_ID]: (state, action) => {
        // TODO to remove after the SLD/NAD refactorization
        state.fullScreenNadId = action.fullScreenNadId;
    },

    [SET_FULLSCREEN_DIAGRAM_ID]: (state, action) => {
        state.fullScreenDiagramId = action.fullScreenDiagramId;
    },

    [CHANGE_DISPLAYED_COLUMNS_NAMES]: (state, action) => {
        let newDisplayedColumnsNames = [...state.allDisplayedColumnsNames];
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
        state.reloadMap = true;
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
            action.notificationId,
        ];
    },
    [REMOVE_NOTIFICATION_BY_NODE]: (state, action) => {
        state.notificationIdList = [
            ...state.notificationIdList.filter(
                (nodeId) => nodeId !== action.notificationId
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
            if (action.studyDisplayMode === STUDY_DISPLAY_MODE.TREE)
                state.reloadMap = false;

            state.studyDisplayMode = action.studyDisplayMode;
        }
    },
    [OPEN_SLD]: (state, action) => {
        // TODO to remove after the SLD/NAD refactorization
        const sldState = state.sldState;
        const sldToOpenIndex = sldState.findIndex(
            (sld) => sld.id === action.id
        );

        // if sld was in state already, and was PINNED or OPENED, nothing happens
        if (
            sldToOpenIndex >= 0 &&
            [ViewState.OPENED, ViewState.PINNED].includes(
                sldState[sldToOpenIndex].state
            )
        ) {
            return;
        }

        // in the other cases, we will open the targeted sld
        // previously opened sld is now MINIMIZED
        const previouslyOpenedSldIndex = sldState.findIndex(
            (sld) => sld.state === ViewState.OPENED
        );
        if (previouslyOpenedSldIndex >= 0) {
            sldState[previouslyOpenedSldIndex].state = ViewState.MINIMIZED;
        }
        // if the target sld was already in the state, hence in MINIMIZED state, we change its state to OPENED
        if (sldToOpenIndex >= 0) {
            sldState[sldToOpenIndex].state = ViewState.OPENED;
        } else {
            sldState.push({
                id: action.id,
                type: action.svgType,
                state: ViewState.OPENED,
            });
        }

        state.sldState = sldState;
    },
    [MINIMIZE_SLD]: (state, action) => {
        // TODO to remove after the SLD/NAD refactorization
        const sldState = state.sldState;
        const sldToMinizeIndex = sldState.findIndex(
            (sld) => sld.id === action.id
        );
        if (sldToMinizeIndex >= 0) {
            sldState[sldToMinizeIndex].state = ViewState.MINIMIZED;
        }

        state.sldState = sldState;
    },
    [TOGGLE_PIN_SLD]: (state, action) => {
        // TODO to remove after the SLD/NAD refactorization
        const sldState = state.sldState;
        // search targeted sld among the sldState
        const sldToPinToggleIndex = sldState.findIndex(
            (sld) => sld.id === action.id
        );
        if (sldToPinToggleIndex >= 0) {
            // when found, if was opened, it's now PINNED
            const sldToPinState = sldState[sldToPinToggleIndex].state;
            if (sldToPinState === ViewState.OPENED) {
                sldState[sldToPinToggleIndex].state = ViewState.PINNED;
            } else if (sldToPinState === ViewState.PINNED) {
                // if sld is unpinned, the sld that had the state OPENED is now MINIMIZED
                const currentlyOpenedSldIndex = sldState.findIndex(
                    (sld) => sld.state === ViewState.OPENED
                );
                if (currentlyOpenedSldIndex >= 0) {
                    sldState[currentlyOpenedSldIndex].state =
                        ViewState.MINIMIZED;
                }
                sldState[sldToPinToggleIndex].state = ViewState.OPENED;
            }
        }

        state.sldState = sldState;
    },
    [CLOSE_SLD]: (state, action) => {
        // TODO to remove after the SLD/NAD refactorization
        state.sldState = state.sldState.filter(
            (sld) => !action.ids.includes(sld.id)
        );
    },
    /*
     * The following functions' goal are to update state.diagramStates with nodes of the following type :
     * { id: 'diagramID', svgType: 'SvgType of the diagram', state: 'ViewState of the diagram' }
     *
     * Depending on the diagram's svgType, the state.diagramStates is different.
     * For Network Area Diagrams (SvgType.NETWORK_AREA_DIAGRAM), all the states should be the same.
     * If one is PINNED, then all of them are.
     * For Single Line Diagrams (SvgType.VOLTAGE_LEVEL or SvgType.SUBSTATION), each diagram has its own state.
     */
    [OPEN_DIAGRAM]: (state, action) => {
        console.error('CHARLY OPEN_DIAGRAM');
        console.error('state.diagramStates = ', current(state.diagramStates));
        console.error('action = ', action);
        const diagramStates = state.diagramStates;
        const diagramToOpenIndex = diagramStates.findIndex(
            (diagram) =>
                diagram.id === action.id && diagram.svgType === action.svgType
        );

        if (action.svgType === SvgType.NETWORK_AREA_DIAGRAM) {
            // First, we check if there is already a Network Area Diagram in the diagramStates.
            const firstNadIndex = diagramStates.findIndex(
                (diagram) => diagram.svgType === SvgType.NETWORK_AREA_DIAGRAM
            );
            if (firstNadIndex < 0) {
                // If there is no NAD, then we add the new one.
                diagramStates.push({
                    id: action.id,
                    svgType: SvgType.NETWORK_AREA_DIAGRAM,
                    state: ViewState.OPENED,
                });
            } else {
                // If there is already at least one NAD, and if it is minimized, then we change all of them to opened.
                if (
                    diagramStates[firstNadIndex].state === ViewState.MINIMIZED
                ) {
                    diagramStates.forEach((diagram) => {
                        if (diagram.svgType === SvgType.NETWORK_AREA_DIAGRAM) {
                            diagram.state = ViewState.OPENED;
                        }
                    });
                }
                // If the NAD to open is not already in the diagramStates, we add it.
                if (diagramToOpenIndex < 0) {
                    diagramStates.push({
                        id: action.id,
                        svgType: SvgType.NETWORK_AREA_DIAGRAM,
                        state: diagramStates[firstNadIndex].state,
                    });
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
                    diagramStates[diagramToOpenIndex].state = ViewState.OPENED;
                }
            } else {
                diagramStates.push({
                    id: action.id,
                    svgType: action.svgType,
                    state: ViewState.OPENED,
                });
            }
        }
        state.diagramStates = diagramStates;
        console.error(
            'END OPEN_DIAGRAM => state.diagramStates = ',
            current(state.diagramStates)
        );
    },
    [MINIMIZE_DIAGRAM]: (state, action) => {
        console.error('CHARLY MINIMIZE_DIAGRAM');
        console.error('state.diagramStates = ', current(state.diagramStates));
        console.error('action = ', action);
        const diagramStates = state.diagramStates;

        if (action.svgType === SvgType.NETWORK_AREA_DIAGRAM) {
            // For network area diagrams, the ID is irrelevant, we will minimize all the NAD in the state.diagramStates.
            diagramStates.forEach((diagram) => {
                if (diagram.svgType === SvgType.NETWORK_AREA_DIAGRAM) {
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
        console.error(
            'END MINIMIZE_DIAGRAM => state.diagramStates = ',
            current(state.diagramStates)
        );
    },
    [TOGGLE_PIN_DIAGRAM]: (state, action) => {
        // TODO CHARLY NOW ASAP
        console.error('CHARLY TOGGLE_PIN_DIAGRAM');
        console.error('state.diagramStates = ', current(state.diagramStates));
        console.error('action = ', action);
        const diagramStates = state.diagramStates;
        // search targeted diagram among the diagramStates
        const diagramToPinToggleIndex = diagramStates.findIndex(
            (diagram) =>
                diagram.id === action.id && diagram.svgType === action.svgType
        );
        if (diagramToPinToggleIndex >= 0) {
            // when found, if was opened, it's now PINNED
            const diagramToPinState =
                diagramStates[diagramToPinToggleIndex].state;
            if (diagramToPinState === ViewState.OPENED) {
                diagramStates[diagramToPinToggleIndex].state = ViewState.PINNED;
            } else if (diagramToPinState === ViewState.PINNED) {
                // if diagram is unpinned, the diagram that had the state OPENED is now MINIMIZED
                const currentlyOpenedDiagramIndex = diagramStates.findIndex(
                    (diagram) => diagram.state === ViewState.OPENED
                );
                if (currentlyOpenedDiagramIndex >= 0) {
                    diagramStates[currentlyOpenedDiagramIndex].state =
                        ViewState.MINIMIZED;
                }
                diagramStates[diagramToPinToggleIndex].state = ViewState.OPENED;
            }
        }
        state.diagramStates = diagramStates;
        console.error(
            'END TOGGLE_PIN_DIAGRAM => state.diagramStates = ',
            current(state.diagramStates)
        );
    },
    [CLOSE_DIAGRAM]: (state, action) => {
        // TODO CHARLY NOW ASAP ici on doit faire la maintenance et nettoyage
        console.error('CHARLY CLOSE_DIAGRAM');
        console.error('state.diagramStates = ', current(state.diagramStates));
        console.error('action = ', action);

        let filteredDiagramStates = state.diagramStates;

        action.elementsToClose.forEach((elementToClose) => {
            console.error('CHARLY --> toClose : ', elementToClose);
            filteredDiagramStates = filteredDiagramStates.filter(
                (diagram) =>
                    !(
                        diagram.id === elementToClose.id &&
                        diagram.svgType === elementToClose.svgType
                    )
            );
        });

        state.diagramStates = filteredDiagramStates;
        console.error(
            'END CLOSE_DIAGRAM => state.diagramStates = ',
            current(state.diagramStates)
        );
    },
});

function synchCurrentTreeNode(state, nextCurrentNodeUuid) {
    const nextCurrentNode = state.networkModificationTreeModel?.treeNodes.find(
        (node) => node?.id === nextCurrentNodeUuid
    );
    //  we need to overwrite state.currentTreeNode to consider label change for example.
    state.currentTreeNode = { ...nextCurrentNode };
}
