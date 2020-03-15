/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const LOAD_NETWORK_SUCCESS = 'LOAD_NETWORK_SUCCESS';

export function loadNetworkSuccess(network) {
    return { type: LOAD_NETWORK_SUCCESS, network: network };
}

export const LOAD_GEO_DATA_SUCCESS = 'LOAD_GEO_DATA_SUCCESS';

export function loadGeoDataSuccess(geoData) {
    return { type: LOAD_GEO_DATA_SUCCESS, geoData: geoData };
}

export const SELECT_DARK_THEME = 'SELECT_DARK_THEME';

export function selectDarkTheme(dark) {
    return { type: SELECT_DARK_THEME, darkTheme: dark };
}

export const ADD_VOLTAGE_LEVEL_SINGLE_LINE_DIAGRAM = 'ADD_VOLTAGE_LEVEL_SINGLE_LINE_DIAGRAM';

export function addVoltageLevelSingleLineDiagram(id) {
    return {
        type: ADD_VOLTAGE_LEVEL_SINGLE_LINE_DIAGRAM,
        id: id
    };
}

export const REMOVE_VOLTAGE_LEVEL_SINGLE_LINE_DIAGRAM = 'REMOVE_VOLTAGE_LEVEL_SINGLE_LINE_DIAGRAM';

export function removeVoltageLevelSingleLineDiagram() {
    return {
        type: REMOVE_VOLTAGE_LEVEL_SINGLE_LINE_DIAGRAM
    };
}

export const LOAD_STUDIES_SUCCESS = 'LOAD_STUDIES_SUCCESS';

export function loadStudiesSuccess(studies) {
    return { type: LOAD_STUDIES_SUCCESS, studies: studies };
}

export const LOAD_CASES_SUCCESS = 'LOAD_CASES_SUCCESS';

export function loadCasesSuccess(cases) {
    return { type: LOAD_CASES_SUCCESS, cases: cases };
}

export const OPEN_STUDY = 'OPEN_STUDY';

export function openStudy(studyName) {
    return { type: OPEN_STUDY, studyName: studyName };
}

export const CLOSE_STUDY = 'CLOSE_STUDY';

export function closeStudy() {
    return { type: CLOSE_STUDY };
}

export const SELECT_CASE = 'SELECT_CASE';

export function selectCase(selectedCase) {
    return { type: SELECT_CASE, selectedCase: selectedCase };
}

export const REMOVE_SELECTED_CASE = 'REMOVE_SELECTED_CASE';

export function removeSelectedCase() {
    return { type: REMOVE_SELECTED_CASE};
}

export const SELECT_FILE = 'SELECT_FILE';

export function selectFile(selectedFile) {
    return { type: SELECT_FILE, selectedFile: selectedFile };
}

export const REMOVE_SELECTED_FILE = 'REMOVE_SELECTED_FILE';

export function removeSelectedFile() {
    return { type: REMOVE_SELECTED_FILE};
}

export const USE_NAME = 'VOLTAGE_LEVELS_USE_NAME';

export function toggleUseNameState() {
    return { type: USE_NAME };
}