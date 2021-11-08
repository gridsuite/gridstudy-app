/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
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
    LOAD_CASES_SUCCESS,
    LOAD_GEO_DATA_SUCCESS,
    NETWORK_CREATED,
    NETWORK_EQUIPMENT_LOADED,
    LOAD_STUDIES_SUCCESS,
    LOAD_TEMPORARY_STUDIES,
    OPEN_STUDY,
    REMOVE_SELECTED_CASE,
    REMOVE_SELECTED_FILE,
    SELECT_CASE,
    SELECT_FILE,
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
    SELECTED_ITEM_NETWORK,
    FULLSCREEN_SINGLE_LINE_DIAGRAM,
    CHANGE_DISPLAYED_COLUMNS_NAMES,
    ADD_LOADFLOW_NOTIF,
    RESET_LOADFLOW_NOTIF,
    ADD_SA_NOTIF,
    RESET_SA_NOTIF,
    COMPONENT_LIBRARY,
    FAVORITE_CONTINGENCY_LISTS,
    LOAD_NETWORK_MODIFICATION_TREE_SUCCESS,
    NETWORK_MODIFICATION_TREE_NODE_ADDED,
    NETWORK_MODIFICATION_TREE_NODES_REMOVED,
    NETWORK_MODIFICATION_TREE_NODES_UPDATED,
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
} from '../utils/config-params';
import NetworkModificationTreeModel from '../components/graph/network-modification-tree-model';

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
};

const initialState = {
    studies: [],
    temporaryStudies: [],
    studyUuid: null,
    network: null,
    geoData: null,
    networkModificationTreeModel: new NetworkModificationTreeModel(),
    cases: [],
    selectedCase: null,
    selectedFile: null,
    computedLanguage: getLocalStorageComputedLanguage(),
    user: null,
    signInCallbackError: null,
    studyUpdated: { force: 0, eventData: {} },
    loadflowNotif: false,
    saNotif: false,
    filteredNominalVoltages: null,
    selectItemNetwork: null,
    fullScreen: false,
    allDisplayedColumnsNames: TABLES_COLUMNS_NAMES_JSON,
    ...paramsInitialState,
};

export const reducer = createReducer(initialState, {
    [LOAD_STUDIES_SUCCESS]: (state, action) => {
        state.studies = action.studies;
    },

    [LOAD_TEMPORARY_STUDIES]: (state, action) => {
        state.temporaryStudies = action.temporaryStudies;
    },

    [LOAD_CASES_SUCCESS]: (state, action) => {
        state.cases = action.cases;
    },

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
    },

    [NETWORK_MODIFICATION_TREE_NODE_ADDED]: (state, action) => {
        if (state.networkModificationTreeModel) {
            let newModel =
                state.networkModificationTreeModel.newSharedForUpdate();
            newModel.addChild(
                action.networkModificationTreeNode,
                action.parentNodeId
            );
            newModel.updateLayout();
            state.networkModificationTreeModel = newModel;
        }
    },

    [NETWORK_MODIFICATION_TREE_NODES_REMOVED]: (state, action) => {
        if (state.networkModificationTreeModel) {
            let newModel =
                state.networkModificationTreeModel.newSharedForUpdate();
            newModel.removeNodes(action.networkModificationTreeNodes);
            newModel.updateLayout();
            state.networkModificationTreeModel = newModel;
        }
    },

    [NETWORK_MODIFICATION_TREE_NODES_UPDATED]: (state, action) => {
        if (state.networkModificationTreeModel) {
            let newModel =
                state.networkModificationTreeModel.newSharedForUpdate();
            newModel.updateNodes(action.networkModificationTreeNodes);
            state.networkModificationTreeModel = newModel;
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
    [SELECT_CASE]: (state, action) => {
        state.selectedCase = action.selectedCase;
    },

    [REMOVE_SELECTED_CASE]: (state) => {
        state.selectedCase = null;
    },

    [SELECT_FILE]: (state, action) => {
        state.selectedFile = action.selectedFile;
    },

    [REMOVE_SELECTED_FILE]: (state) => {
        state.selectedFile = null;
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
        console.log('LOADFLOW TRUE');
    },

    [RESET_LOADFLOW_NOTIF]: (state) => {
        state.loadflowNotif = false;
        console.log('LOADFLOW RESET');
    },

    [ADD_SA_NOTIF]: (state) => {
        state.saNotif = true;
        console.log('SA TRUE');
    },

    [RESET_SA_NOTIF]: (state) => {
        state.saNotif = false;
        console.log('SA RESET');
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

    [SELECTED_ITEM_NETWORK]: (state, action) => {
        state.selectItemNetwork = action.selectItemNetwork;
    },

    [FULLSCREEN_SINGLE_LINE_DIAGRAM]: (state, action) => {
        state.fullScreen = action.fullScreen;
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
    [FAVORITE_CONTINGENCY_LISTS]: (state, action) => {
        state[PARAM_FAVORITE_CONTINGENCY_LISTS] =
            action[PARAM_FAVORITE_CONTINGENCY_LISTS];
    },
});
