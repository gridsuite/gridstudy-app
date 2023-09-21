/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const MAX_TITLE_LENGTH = 106;

export const computeFullPath = (parents) => {
    let path = '';

    for (let i = 0; i < parents.length; i++) {
        path = '/' + parents[i] + path;
    }

    return path;
};

const limitChar = (str, limit) => {
    return str.length > limit ? str.substring(0, limit) + '...' : str;
};

export const computePageTitle = (appName, studyName) => {
    if (!studyName) {
        return appName;
    }
    return limitChar(studyName, MAX_TITLE_LENGTH);
};
