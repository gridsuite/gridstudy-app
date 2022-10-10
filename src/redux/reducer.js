/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createReducer } from '@reduxjs/toolkit';

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
    USER,
    SIGNIN_CALLBACK_ERROR,
    STUDY_UPDATED,
    DISPLAY_OVERLOAD_TABLE,
    FILTERED_NOMINAL_VOLTAGES_UPDATED,
    SUBSTATION_LAYOUT,
    FULLSCREEN_SINGLE_LINE_DIAGRAM_ID,
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
    OPEN_NETWORK_AREA_DIAGRAM,
    FULLSCREEN_NETWORK_AREA_DIAGRAM_ID,
    CURRENT_TREE_NODE,
    SET_MODIFICATIONS_IN_PROGRESS,
    STUDY_DISPLAY_MODE,
    SET_STUDY_DISPLAY_MODE,
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
} from '../utils/config-params';
import NetworkModificationTreeModel from '../components/graph/network-modification-tree-model';
import { FluxConventions } from '../components/dialogs/parameters/network-parameters';

const paramsInitialState = {
    [PARAM_THEME]: getLocalStorageTheme(),
    [PARAM_LANGUAGE]: getLocalStorageLanguage(),
    [PARAM_USE_NAME]: true,
    [PARAM_LINE_FULL_PATH]: true,
    [PARAM_LINE_PARALLEL_PATH]: true,
    [PARAM_LINE_FLOW_ALERT_THRESHOLD]: 100,
    [PARAM_DISPLAY_OVERLOAD_TABLE]: false,
    [PARAM_LINE_FLOW_MODE]: 'feeders',
    [PARAM_LINE_FLOW_COLOR_MODE]: 'nominalVoltage',
    [PARAM_CENTER_LABEL]: false,
    [PARAM_DIAGONAL_LABEL]: false,
    [PARAM_SUBSTATION_LAYOUT]: 'horizontal',
    [PARAM_COMPONENT_LIBRARY]: null,
    [PARAM_FAVORITE_CONTINGENCY_LISTS]: [],
    [PARAM_FLUX_CONVENTION]: FluxConventions.IIDM,
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
    studyUpdated: { force: 0, eventData: {} },
    loadflowNotif: false,
    saNotif: false,
    sensiNotif: false,
    filteredNominalVoltages: null,
    fullScreenSldId: null,
    fullScreenNadId: null,
    allDisplayedColumnsNames: TABLES_COLUMNS_NAMES_JSON,
    allLockedColumnsNames: [],
    allReorderedTableDefinitionIndexes: [],
    isExplorerDrawerOpen: true,
    isModificationsDrawerOpen: false,
    voltageLevelsIdsForNad: [],
    centerOnSubstation: null,
    notificationIdList: [],
    isModificationsInProgress: false,
    studyDisplayMode: STUDY_DISPLAY_MODE.HYBRID,
    ...paramsInitialState,
    // Hack to avoid reload Geo Data when switching display mode to TREE then back to MAP or HYBRID
    // defaulted to true to init load geo data with HYBRID defaulted display Mode
    // TODO REMOVE LATER
    reloadGeoData: true,
};

export const reducer = createReducer(initialState, {
    [OPEN_STUDY]: (state, action) => {
        state.studyUuid = action.studyRef[0];
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
                state.reloadGeoData = true;
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

    [LINE_FLOW_COLOR_MODE]: (state, action) => {
        state[PARAM_LINE_FLOW_COLOR_MODE] = action[PARAM_LINE_FLOW_COLOR_MODE];
    },

    [LINE_FLOW_ALERT_THRESHOLD]: (state, action) => {
        state[PARAM_LINE_FLOW_ALERT_THRESHOLD] =
            action[PARAM_LINE_FLOW_ALERT_THRESHOLD];
    },

    [SIGNIN_CALLBACK_ERROR]: (state, action) => {
        state.signInCallbackError = action.signInCallbackError;
    },

    [DISPLAY_OVERLOAD_TABLE]: (state, action) => {
        state[PARAM_DISPLAY_OVERLOAD_TABLE] =
            action[PARAM_DISPLAY_OVERLOAD_TABLE];
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
        state.fullScreenSldId = action.fullScreenSldId;
    },

    [FULLSCREEN_NETWORK_AREA_DIAGRAM_ID]: (state, action) => {
        state.fullScreenNadId = action.fullScreenNadId;
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
        state.reloadGeoData = true;
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
    [OPEN_NETWORK_AREA_DIAGRAM]: (state, action) => {
        state.voltageLevelsIdsForNad = action.voltageLevelsIdsForNad;
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
                state.reloadGeoData = false;

            state.studyDisplayMode = action.studyDisplayMode;
        }
    },
});

function synchCurrentTreeNode(state, nextCurrentNodeUuid) {
    const nextCurrentNode = state.networkModificationTreeModel?.treeNodes.find(
        (node) => node?.id === nextCurrentNodeUuid
    );
    //  we need to overwrite state.currentTreeNode to consider label change for example.
    state.currentTreeNode = { ...nextCurrentNode };
}
