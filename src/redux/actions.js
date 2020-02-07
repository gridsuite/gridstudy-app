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

export const SELECT_DARK_THEME = 'SELECT_DARK_THEME';

export function selectDarkTheme(dark) {
    return { type: SELECT_DARK_THEME, darkTheme: dark };
}

export const LOAD_VOLTAGE_LEVEL_DIAGRAM_SUCCESS = 'LOAD_VOLTAGE_LEVEL_DIAGRAM_SUCCESS';

export function loadVoltageLevelDiagramSuccess(id, svg) {
    return {
        type: LOAD_VOLTAGE_LEVEL_DIAGRAM_SUCCESS,
        diagram: {
            id: id,
            svg: svg
        }
    };
}

export const REMOVE_VOLTAGE_LEVEL_DIAGRAM = 'REMOVE_VOLTAGE_LEVEL_DIAGRAM';

export function removeVoltageLevelDiagram() {
    return {
        type: REMOVE_VOLTAGE_LEVEL_DIAGRAM
    };
}

export const LOAD_STUDIES_SUCCESS = 'LOAD_STUDIES_SUCCESS';

export function loadStudiesSuccess(studies) {
    return { type: LOAD_STUDIES_SUCCESS, studies: studies };
}

export const OPEN_STUDY = 'OPEN_STUDY';

export function openStudy(studyName) {
    return { type: OPEN_STUDY, studyName: studyName };
}
