/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { APP_NAME } from '../utils/config-params';

export const SESSION_STORAGE_SLD_STATE_KEY_PREFIX = (
    APP_NAME + '_SLD_STATE_'
).toUpperCase();

const getSldStateKeyPrefixFromStudyUuid = (studyUuid) => {
    return SESSION_STORAGE_SLD_STATE_KEY_PREFIX + studyUuid;
};

export const syncSldStateWithSessionStorage = (sldState, studyUuid) => {
    if (studyUuid == null) {
        return;
    }

    sessionStorage.setItem(
        getSldStateKeyPrefixFromStudyUuid(studyUuid),
        JSON.stringify(sldState)
    );
};

export const loadSldStateFromSessionStorage = (studyUuid) => {
    const sldState = JSON.parse(
        sessionStorage.getItem(getSldStateKeyPrefixFromStudyUuid(studyUuid))
    );

    if (sldState === null) {
        return [];
    }

    return sldState;
};
