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

export const SELECT_THEME = 'SELECT_THEME';
export const DARK_THEME = 'Dark';
export const LIGHT_THEME = 'Light';

export function selectTheme(theme) {
    return { type: SELECT_THEME, theme: theme };
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

export const USE_NAME = 'USE_NAME';

export function toggleUseNameState() {
    return { type: USE_NAME };
}

export const USER = 'USER';

export function setLoggedUser(user) {
    return { type: USER, user : user};
}

export const CENTER_LABEL = 'CENTER_LABEL';

export function toggleCenterLabelState() {
    return { type: CENTER_LABEL };
}

export const DIAGONAL_LABEL = 'DIAGONAL_LABEL';

export function toggleDiagonalLabelState() {
    return { type: DIAGONAL_LABEL };
}

export const TOPOLOGICAL_COLORING = 'TOPOLOGICAL_COLORING';

export function toggleTopologicalColoringState() {
    return { type: TOPOLOGICAL_COLORING };
}

export const LINE_FULL_PATH = 'LINE_FULL_PATH';

export function toggleLineFullPathState() {
    return { type: LINE_FULL_PATH };
}

export const LINE_FLOW_MODE = 'LINE_FLOW_MODE';

export function selectLineFlowMode(lineFlowMode) {
    return { type: LINE_FLOW_MODE, lineFlowMode: lineFlowMode };
}

export const SIGNIN_CALLBACK_ERROR = 'SIGNIN_CALLBACK_ERROR';

export function setSignInCallbackError(signInCallbackError) {
    return { type: SIGNIN_CALLBACK_ERROR, signInCallbackError : signInCallbackError};
}

export const STUDY_UPDATED = 'STUDY_UPDATED';

export function studyUpdated(eventData) {
    return { type: STUDY_UPDATED, eventData };
}