/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {createReducer} from "@reduxjs/toolkit";

import {
    ADD_VOLTAGE_LEVEL_SINGLE_LINE_DIAGRAM,
    CLOSE_STUDY,
    LOAD_CASES_SUCCESS,
    LOAD_GEO_DATA_SUCCESS,
    LOAD_NETWORK_SUCCESS,
    LOAD_STUDIES_SUCCESS,
    OPEN_STUDY,
    REMOVE_SELECTED_CASE,
    REMOVE_SELECTED_FILE,
    REMOVE_VOLTAGE_LEVEL_SINGLE_LINE_DIAGRAM,
    SELECT_CASE,
    SELECT_DARK_THEME,
    SELECT_FILE,
    USE_NAME
} from "./actions";

const initialState = {
    studies: [],
    study: null,
    darkTheme: true,
    cases : [],
    selectedCase : null,
    selectedFile : null,
    useName : true
};

export const reducer = createReducer(initialState, {

    [LOAD_STUDIES_SUCCESS]: (state, action) => {
        state.studies = action.studies;
    },

    [LOAD_CASES_SUCCESS]: (state, action) => {
        state.cases = action.cases;
    },

    [OPEN_STUDY]: (state, action) => {
        state.study = {
            name: action.studyName,
            singleLineDiagram: {
                voltageLevelId: null,
            }
        };
    },

    [CLOSE_STUDY]: (state) => {
        state.study = null;
    },

    [LOAD_NETWORK_SUCCESS]: (state, action) => {
        state.study.network = action.network;
    },

    [LOAD_GEO_DATA_SUCCESS]: (state, action) => {
        state.study.geoData = action.geoData;
    },

    [ADD_VOLTAGE_LEVEL_SINGLE_LINE_DIAGRAM]: (state, action) => {
        state.study.singleLineDiagram.voltageLevelId = action.id;
    },

    [REMOVE_VOLTAGE_LEVEL_SINGLE_LINE_DIAGRAM]: (state) => {
        state.study.singleLineDiagram.voltageLevelId = null;
    },

    [SELECT_DARK_THEME]: (state, action) => {
        state.darkTheme = action.darkTheme;
    },

    [SELECT_CASE]: (state, action) => {
        state.selectedCase = action.selectedCase;
    },

    [REMOVE_SELECTED_CASE]: (state, action) => {
        state.selectedCase = null;
    },

    [SELECT_FILE]: (state, action) => {
        state.selectedFile = action.selectedFile;
    },

    [REMOVE_SELECTED_FILE]: (state, action) => {
        state.selectedFile = null;
    },

    [USE_NAME]: (state, action) => {
        state.useName = !state.useName;
    },
});
