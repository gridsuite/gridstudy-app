/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { APP_NAME } from '../utils/config-params';

export const SESSION_STORAGE_SLD_STATE_KEY_PREFIX = ( // TODO to remove after the SLD/NAD refactorization
    APP_NAME + '_SLD_STATE_'
).toUpperCase();

const getSldStateKeyPrefixFromStudyUuid = (studyUuid) => { // TODO to remove after the SLD/NAD refactorization
    return SESSION_STORAGE_SLD_STATE_KEY_PREFIX + studyUuid;
};

export const syncSldStateWithSessionStorage = (sldState, studyUuid) => { // TODO to remove after the SLD/NAD refactorization
    if (studyUuid == null) {
        return;
    }

    sessionStorage.setItem(
        getSldStateKeyPrefixFromStudyUuid(studyUuid),
        JSON.stringify(sldState)
    );
};

export const loadSldStateFromSessionStorage = (studyUuid) => { // TODO to remove after the SLD/NAD refactorization
    const sldState = JSON.parse(
        sessionStorage.getItem(getSldStateKeyPrefixFromStudyUuid(studyUuid))
    );

    if (sldState === null) {
        return [];
    }

    return sldState;
};

export const SESSION_STORAGE_DIAGRAM_STATE_KEY_PREFIX = (
    APP_NAME + '_DIAGRAM_STATE_'
).toUpperCase();

const getDiagramStateKeyPrefixFromStudyUuid = (studyUuid) => {
    return SESSION_STORAGE_DIAGRAM_STATE_KEY_PREFIX + studyUuid;
};

export const syncDiagramStateWithSessionStorage = (diagramState, studyUuid) => {
    if (studyUuid == null) {
        return;
    }

    sessionStorage.setItem(
        getDiagramStateKeyPrefixFromStudyUuid(studyUuid),
        JSON.stringify(diagramState)
    );
};

export const loadDiagramStateFromSessionStorage = (studyUuid) => {
    const diagramState = JSON.parse(
        sessionStorage.getItem(getDiagramStateKeyPrefixFromStudyUuid(studyUuid))
    );

    if (diagramState === null) {
        return [];
    }

    return diagramState;
};
