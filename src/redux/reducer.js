/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createReducer } from '@reduxjs/toolkit';

import {
    getLocalStorageCenterLabel,
    getLocalStorageDiagonalLabel,
    getLocalStorageLineFlowMode,
    getLocalStorageLineFlowColorMode,
    getLocalStorageLineFlowAlertThreshold,
    getLocalStorageLineFullPath,
    getLocalStorageLineParallelPath,
    getLocalStorageTheme,
    getLocalStorageUseName,
    getLocalStorageViewOverloadsTable,
    saveLocalStorageCenterLabel,
    saveLocalStorageDiagonalLabel,
    saveLocalStorageLineFlowMode,
    saveLocalStorageLineFlowColorMode,
    saveLocalStorageLineFlowAlertThreshold,
    saveLocalStorageLineFullPath,
    saveLocalStorageLineParallelPath,
    saveLocalStorageTheme,
    saveLocalStorageUseName,
    saveLocalStorageViewOverloadsTable,
} from './local-storage';

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
    VIEW_OVERLOADS_TABLE,
    INCREASE_RESULT_COUNT,
    RESET_RESULT_COUNT,
    FILTERED_NOMINAL_VOLTAGES_UPDATED,
} from './actions';

const initialState = {
    studies: [],
    temporaryStudies: [],
    studyName: null,
    userId: null,
    network: null,
    geoData: null,
    theme: getLocalStorageTheme(),
    cases: [],
    selectedCase: null,
    selectedFile: null,
    useName: getLocalStorageUseName(),
    user: null,
    centerLabel: getLocalStorageCenterLabel(),
    diagonalLabel: getLocalStorageDiagonalLabel(),
    lineFullPath: getLocalStorageLineFullPath(),
    lineParallelPath: getLocalStorageLineParallelPath(),
    lineFlowMode: getLocalStorageLineFlowMode(),
    lineFlowColorMode: getLocalStorageLineFlowColorMode(),
    lineFlowAlertThreshold: getLocalStorageLineFlowAlertThreshold(),
    signInCallbackError: null,
    studyUpdated: { force: 0, eventData: {} },
    viewOverloadsTable: getLocalStorageViewOverloadsTable(),
    resultCount: 0,
    filteredNominalVoltages: null,
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
        state.studyName = action.studyRef[0];
        state.userId = action.studyRef[1];
    },

    [CLOSE_STUDY]: (state) => {
        state.studyName = null;
        state.userId = null;
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
        state.theme = action.theme;
        saveLocalStorageTheme(state.theme);
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

    [USE_NAME]: (state) => {
        state.useName = !state.useName;
        saveLocalStorageUseName(state.useName);
    },

    [USER]: (state, action) => {
        state.user = action.user;
    },

    [CENTER_LABEL]: (state) => {
        state.centerLabel = !state.centerLabel;
        saveLocalStorageCenterLabel(state.centerLabel);
    },

    [DIAGONAL_LABEL]: (state) => {
        state.diagonalLabel = !state.diagonalLabel;
        saveLocalStorageDiagonalLabel(state.diagonalLabel);
    },

    [LINE_FULL_PATH]: (state) => {
        state.lineFullPath = !state.lineFullPath;
        saveLocalStorageLineFullPath(state.lineFullPath);
    },

    [LINE_PARALLEL_PATH]: (state) => {
        state.lineParallelPath = !state.lineParallelPath;
        saveLocalStorageLineParallelPath(state.lineParallelPath);
    },

    [LINE_FLOW_MODE]: (state, action) => {
        state.lineFlowMode = action.lineFlowMode;
        saveLocalStorageLineFlowMode(state.lineFlowMode);
    },

    [LINE_FLOW_COLOR_MODE]: (state, action) => {
        state.lineFlowColorMode = action.lineFlowColorMode;
        saveLocalStorageLineFlowColorMode(state.lineFlowColorMode);
    },

    [LINE_FLOW_ALERT_THRESHOLD]: (state, action) => {
        state.lineFlowAlertThreshold = action.lineFlowAlertThreshold;
        saveLocalStorageLineFlowAlertThreshold(state.lineFlowAlertThreshold);
    },

    [SIGNIN_CALLBACK_ERROR]: (state, action) => {
        state.signInCallbackError = action.signInCallbackError;
    },

    [VIEW_OVERLOADS_TABLE]: (state) => {
        state.viewOverloadsTable = !state.viewOverloadsTable;
        saveLocalStorageViewOverloadsTable(state.viewOverloadsTable);
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
});
