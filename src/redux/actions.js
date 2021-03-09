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

export const LOAD_TEMPORARY_STUDIES = 'LOAD_TEMPORARY_STUDIES';

export function loadStudyCreationRequestsSuccess(temporaryStudies) {
    return { type: LOAD_TEMPORARY_STUDIES, temporaryStudies: temporaryStudies };
}

export const LOAD_CASES_SUCCESS = 'LOAD_CASES_SUCCESS';

export function loadCasesSuccess(cases) {
    return { type: LOAD_CASES_SUCCESS, cases: cases };
}

export const OPEN_STUDY = 'OPEN_STUDY';

export function openStudy(studyName, userId) {
    return { type: OPEN_STUDY, studyRef: [studyName, userId] };
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
    return { type: REMOVE_SELECTED_CASE };
}

export const SELECT_FILE = 'SELECT_FILE';

export function selectFile(selectedFile) {
    return { type: SELECT_FILE, selectedFile: selectedFile };
}

export const REMOVE_SELECTED_FILE = 'REMOVE_SELECTED_FILE';

export function removeSelectedFile() {
    return { type: REMOVE_SELECTED_FILE };
}

export const USE_NAME = 'USE_NAME';

export function selectUseName(useName) {
    return { type: USE_NAME, useName: useName };
}

export const USER = 'USER';

export function setLoggedUser(user) {
    return { type: USER, user: user };
}

export const CENTER_LABEL = 'CENTER_LABEL';

export function selectCenterLabelState(centerLabel) {
    return { type: CENTER_LABEL, centerLabel: centerLabel };
}

export const DIAGONAL_LABEL = 'DIAGONAL_LABEL';

export function selectDiagonalLabelState(diagonalLabel) {
    return { type: DIAGONAL_LABEL, diagonalLabel: diagonalLabel };
}

export const LINE_FULL_PATH = 'LINE_FULL_PATH';

export function selectLineFullPathState(lineFullPath) {
    return { type: LINE_FULL_PATH, lineFullPath: lineFullPath };
}

export const LINE_PARALLEL_PATH = 'LINE_PARALLEL_PATH';

export function selectLineParallelPathState(lineParallelPath) {
    return { type: LINE_PARALLEL_PATH, lineParallelPath: lineParallelPath };
}

export const LINE_FLOW_MODE = 'LINE_FLOW_MODE';

export function selectLineFlowMode(lineFlowMode) {
    return { type: LINE_FLOW_MODE, lineFlowMode: lineFlowMode };
}

export const LINE_FLOW_COLOR_MODE = 'LINE_FLOW_COLOR_MODE';

export function selectLineFlowColorMode(lineFlowColorMode) {
    return { type: LINE_FLOW_COLOR_MODE, lineFlowColorMode: lineFlowColorMode };
}

export const LINE_FLOW_ALERT_THRESHOLD = 'LINE_FLOW_ALERT_THRESHOLD';

export function selectLineFlowAlertThreshold(lineFlowAlertThreshold) {
    return {
        type: LINE_FLOW_ALERT_THRESHOLD,
        lineFlowAlertThreshold: lineFlowAlertThreshold,
    };
}

export const SIGNIN_CALLBACK_ERROR = 'SIGNIN_CALLBACK_ERROR';

export function setSignInCallbackError(signInCallbackError) {
    return {
        type: SIGNIN_CALLBACK_ERROR,
        signInCallbackError: signInCallbackError,
    };
}

export const STUDY_UPDATED = 'STUDY_UPDATED';

export function studyUpdated(eventData) {
    return { type: STUDY_UPDATED, eventData };
}

export const DISPLAY_OVERLOAD_TABLE = 'DISPLAY_OVERLOAD_TABLE';

export function selectDisplayOverloadTableState(displayOverloadTable) {
    return {
        type: DISPLAY_OVERLOAD_TABLE,
        displayOverloadTable: displayOverloadTable,
    };
}

export const INCREASE_RESULT_COUNT = 'INCREASE_RESULT_COUNT';

export function increaseResultCount() {
    return { type: INCREASE_RESULT_COUNT };
}

export const RESET_RESULT_COUNT = 'RESET_RESULT_COUNT';

export function resetResultCount() {
    return { type: RESET_RESULT_COUNT };
}

export const FILTERED_NOMINAL_VOLTAGES_UPDATED =
    'FILTERED_NOMINAL_VOLTAGES_UPDATED';

export function filteredNominalVoltagesUpdated(filteredNV) {
    return {
        type: FILTERED_NOMINAL_VOLTAGES_UPDATED,
        filteredNominalVoltages: filteredNV,
    };
}

export const SUBSTATION_LAYOUT = 'SUBSTATION_LAYOUT';

export function selectSubstationLayout(substationLayout) {
    return { type: SUBSTATION_LAYOUT, substationLayout: substationLayout };
}

export const SELECTED_ITEM_NETWORK = 'SELECTED_ITEM_NETWORK';

export function selectItemNetwork(selectItemNetwork) {
    return {
        type: SELECTED_ITEM_NETWORK,
        selectItemNetwork: selectItemNetwork,
    };
}

export const FULLSCREEN_SINGLE_LINE_DIAGRAM = 'FULLSCREEN_SINGLE_LINE_DIAGRAM';

export function fullScreenSingleLineDiagram(fullScreen) {
    return { type: FULLSCREEN_SINGLE_LINE_DIAGRAM, fullScreen: fullScreen };
}
