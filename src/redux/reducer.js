import {createReducer} from "@reduxjs/toolkit";
import {
    LOAD_NETWORK_SUCCESS,
    LOAD_STUDIES_SUCCESS,
    LOAD_VOLTAGE_LEVEL_DIAGRAM_SUCCESS,
    OPEN_STUDY, REMOVE_VOLTAGE_LEVEL_DIAGRAM,
    SELECT_DARK_THEME
} from "./actions";

const initialState = {
    network: null,
    studies: [],
    darkTheme: true
};

export const reducer = createReducer(initialState, {

    [LOAD_STUDIES_SUCCESS]: (state, action) => {
        state.studies = action.studies;
    },

    [OPEN_STUDY]: (state, action) => {
        state.openedStudyName = action.studyName;
    },

    [LOAD_NETWORK_SUCCESS]: (state, action) => {
        state.network = action.network;
    },

    [SELECT_DARK_THEME]: (state, action) => {
        state.darkTheme = action.darkTheme;
    },

    [LOAD_VOLTAGE_LEVEL_DIAGRAM_SUCCESS]: (state, action) => {
        state.diagram = action.diagram;
    },

    [REMOVE_VOLTAGE_LEVEL_DIAGRAM]: (state, action) => {
        state.diagram = null;
    }
});