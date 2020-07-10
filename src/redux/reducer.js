/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {createReducer} from "@reduxjs/toolkit";

import {
    getLocalStorageCenterLabel,
    getLocalStorageDiagonalLabel,
    getLocalStorageLineFlowMode,
    getLocalStorageLineFullPath,
    getLocalStorageTheme,
    getLocalStorageUseName,
    saveLocalStorageCenterLabel,
    saveLocalStorageDiagonalLabel,
    saveLocalStorageLineFlowMode,
    saveLocalStorageLineFullPath,
    saveLocalStorageTheme,
    saveLocalStorageUseName
} from "./local-storage";

import {
    CENTER_LABEL,
    CLOSE_STUDY,
    DIAGONAL_LABEL,
    LINE_FLOW_MODE,
    LINE_FULL_PATH,
    LOAD_CASES_SUCCESS,
    LOAD_GEO_DATA_SUCCESS,
    LOAD_NETWORK_SUCCESS,
    LOAD_STUDIES_SUCCESS,
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
} from "./actions";

const initialState = {
    studies: [],
    studyName: null,
    network: null,
    geoData: null,
    theme: getLocalStorageTheme(),
    cases : [],
    selectedCase : null,
    selectedFile : null,
    useName : getLocalStorageUseName(),
    user : null,
    centerLabel : getLocalStorageCenterLabel(),
    diagonalLabel : getLocalStorageDiagonalLabel(),
    lineFullPath: getLocalStorageLineFullPath(),
    lineFlowMode: getLocalStorageLineFlowMode(),
    signInCallbackError : null,
    studyUpdated : {force: 0, eventData: {}}
};

export const reducer = createReducer(initialState, {

    [LOAD_STUDIES_SUCCESS]: (state, action) => {
        state.studies = action.studies;
    },

    [LOAD_CASES_SUCCESS]: (state, action) => {
        state.cases = action.cases;
    },

    [OPEN_STUDY]: (state, action) => {
        state.studyName = action.studyName;
    },

    [CLOSE_STUDY]: (state) => {
        state.studyName = null;
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
        state.studyUpdated = {force: 1 - state.studyUpdated.force, eventData: action.eventData};
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

    [LINE_FLOW_MODE]: (state, action) => {
        state.lineFlowMode = action.lineFlowMode;
        saveLocalStorageLineFlowMode(state.lineFlowMode);
    },

    [SIGNIN_CALLBACK_ERROR]: (state, action) => {
        state.signInCallbackError = action.signInCallbackError;
    },
});
