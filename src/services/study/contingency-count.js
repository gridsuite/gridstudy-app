/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrlWithNodeUuid, STUDY_PATHS } from './index';
import {
    backendFetchJson,
    getRequestParamFromList,
} from '../../utils/rest-api';

export function fetchContingencyCount(
    studyUuid,
    currentNodeUuid,
    contingencyListNames
) {
    console.info(
        `Fetching contingency count for ${contingencyListNames} on '${studyUuid}' and node '${currentNodeUuid}'...`
    );

    // Add params to Url
    const contingencyListsQueryParams = getRequestParamFromList(
        contingencyListNames,
        'contingencyListName'
    );
    const urlSearchParams = new URLSearchParams(contingencyListsQueryParams);

    const studyUrlWithUuid = getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    );

    const url = `${studyUrlWithUuid}${STUDY_PATHS.contingencyCount}?${urlSearchParams}`;

    console.debug(url);
    return backendFetchJson(url);
}
