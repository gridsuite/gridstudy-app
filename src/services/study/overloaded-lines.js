/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrlWithNodeUuid, STUDY_PATHS } from './index';

import { backendFetchJson } from '../../utils/rest-api';

export function fetchOverloadedLines(
    studyUuid,
    currentNodeUuid,
    limitReduction
) {
    console.info(
        `Fetching overloaded lines (with limit reduction ${limitReduction}) ...`
    );
    const url = `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
        STUDY_PATHS.overloadedLines
    }?limitReduction=${limitReduction.toString()}`;
    return backendFetchJson(url);
}
