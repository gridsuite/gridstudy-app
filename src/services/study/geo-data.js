/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetchJson, getQueryParamsList } from '../utils';
import { getStudyUrlWithNodeUuid } from './index';

export function fetchSubstationPositions(
    studyUuid,
    currentNodeUuid,
    substationsIds,
) {
    console.info(
        `Fetching substation positions of study '${studyUuid}' and node '${currentNodeUuid}' with ids '${substationsIds}'...`,
    );

    const paramsList =
        substationsIds && substationsIds.length > 0
            ? '?' + getQueryParamsList(substationsIds, 'substationId')
            : '';

    const fetchSubstationPositionsUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/geo-data/substations' +
        paramsList;
    console.debug(fetchSubstationPositionsUrl);
    return backendFetchJson(fetchSubstationPositionsUrl);
}

export function fetchLinePositions(studyUuid, currentNodeUuid, linesIds) {
    console.info(
        `Fetching line positions of study '${studyUuid}' and node '${currentNodeUuid}' with ids '${linesIds}'...`,
    );

    const paramsList =
        linesIds && linesIds.length > 0
            ? '?' + getQueryParamsList(linesIds, 'lineId')
            : '';

    const fetchLinePositionsUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/geo-data/lines' +
        paramsList;

    console.debug(fetchLinePositionsUrl);
    return backendFetchJson(fetchLinePositionsUrl);
}
