/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { APP_NAME } from '../utils/config-params';

const SESSION_STORAGE_SLD_STATE_KEY = (APP_NAME + '_SLD_STATE').toUpperCase();

export const syncSldStateWithSessionStorage = (sldState, studyUuid) => {
    if (studyUuid == null) {
        return;
    }

    sessionStorage.setItem(
        SESSION_STORAGE_SLD_STATE_KEY,
        JSON.stringify({
            studyUuid: studyUuid,
            sldtate: sldState,
        })
    );
};

export const loadSldStateFromSessionStorage = (studyUuid) => {
    const sldState = JSON.parse(
        sessionStorage.getItem(SESSION_STORAGE_SLD_STATE_KEY)
    );

    if (sldState?.studyUuid === studyUuid) {
        return sldState.sldtate;
    }

    // if state from session storage was for another study, it is reseted
    return [];
};
