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
    LOAD_NETWORK_SUCCESS,
    LOAD_STUDIES_SUCCESS,
    LOAD_TEMPORARY_STUDIES,
    OPEN_STUDY,
    REMOVE_SELECTED_CASE,
    REMOVE_SELECTED_FILE,
    SELECT_CASE,
    SELECT_FILE,
    SELECT_THEME,
    USE_NAME,
    USER,
    SIGNIN_CALLBACK_ERROR,
    STUDY_UPDATED,
    DISPLAY_OVERLOAD_TABLE,
    INCREASE_RESULT_COUNT,
    RESET_RESULT_COUNT,
    FILTERED_NOMINAL_VOLTAGES_UPDATED,
    SUBSTATION_LAYOUT,
    SELECTED_ITEM_NETWORK,
    FULLSCREEN_SINGLE_LINE_DIAGRAM,
    CHANGE_DISPLAYED_COLUMNS_NAMES,
} from './actions';
import { getLocalStorageTheme, saveLocalStorageTheme } from './local-storage';
import { TABLES_COLUMNS_NAMES_JSON } from '../components/network/config-tables';
import {
    PARAM_LINE_FULL_PATH,
    PARAM_THEME,
    PARAM_USE_NAME,
} from '../utils/config-params';

const paramsInitialState = {
    [PARAM_THEME]: getLocalStorageTheme(),
    [PARAM_USE_NAME]: true,
    [PARAM_LINE_FULL_PATH]: true,
};

const initialState = {
    studies: [],
    temporaryStudies: [],
    studyUuid: null,
    network: null,
    geoData: null,
    cases: [],
    selectedCase: null,
    selectedFile: null,
    user: null,
    centerLabel: false,
    diagonalLabel: false,
    lineParallelPath: true,
    lineFlowMode: 'feeders',
    lineFlowColorMode: 'nominalVoltage',
    lineFlowAlertThreshold: 100,
    signInCallbackError: null,
    studyUpdated: { force: 0, eventData: {} },
    displayOverloadTable: false,
    resultCount: 0,
    filteredNominalVoltages: null,
    substationLayout: 'horizontal',
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
    },

    [LOAD_NETWORK_SUCCESS]: (state, action) => {
        state.network = action.network;
    },

    [LOAD_GEO_DATA_SUCCESS]: (state, action) => {
        state.geoData = action.geoData;
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
        state.centerLabel = action.centerLabel;
    },

    [DIAGONAL_LABEL]: (state, action) => {
        state.diagonalLabel = action.diagonalLabel;
    },

    [LINE_FULL_PATH]: (state, action) => {
        state[PARAM_LINE_FULL_PATH] = action[PARAM_LINE_FULL_PATH];
    },

    [LINE_PARALLEL_PATH]: (state, action) => {
        state.lineParallelPath = action.lineParallelPath;
    },

    [LINE_FLOW_MODE]: (state, action) => {
        state.lineFlowMode = action.lineFlowMode;
    },

    [LINE_FLOW_COLOR_MODE]: (state, action) => {
        state.lineFlowColorMode = action.lineFlowColorMode;
    },

    [LINE_FLOW_ALERT_THRESHOLD]: (state, action) => {
        state.lineFlowAlertThreshold = action.lineFlowAlertThreshold;
    },

    [SIGNIN_CALLBACK_ERROR]: (state, action) => {
        state.signInCallbackError = action.signInCallbackError;
    },

    [DISPLAY_OVERLOAD_TABLE]: (state, action) => {
        state.displayOverloadTable = action.displayOverloadTable;
    },

    [INCREASE_RESULT_COUNT]: (state) => {
        state.resultCount++;
    },

    [RESET_RESULT_COUNT]: (state) => {
        state.resultCount = 0;
    },

    [FILTERED_NOMINAL_VOLTAGES_UPDATED]: (state, action) => {
        state.filteredNominalVoltages = action.filteredNominalVoltages;
    },

    [SUBSTATION_LAYOUT]: (state, action) => {
        state.substationLayout = action.substationLayout;
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
});
