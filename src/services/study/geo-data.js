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

function getGeoDataPath(studyUuid, currentNodeUuid) {
    return `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
        STUDY_PATHS.geoData
    }`;
}

export function fetchSubstationPositions(
    studyUuid,
    currentNodeUuid,
    substationsIds
) {
    console.info(
        `Fetching substation positions of study '${studyUuid}' and node '${currentNodeUuid}' with ids '${substationsIds}'...`
    );

    // Add params to Url
    const substationParams = getRequestParamFromList(
        substationsIds,
        'substationId'
    );
    const urlSearchParams = new URLSearchParams(substationParams);

    const fetchSubstationPositionsUrl = `${getGeoDataPath(
        studyUuid,
        currentNodeUuid
    )}/substations?${urlSearchParams}`;

    console.debug(fetchSubstationPositionsUrl);
    return backendFetchJson(fetchSubstationPositionsUrl);
}

export function fetchLinePositions(studyUuid, currentNodeUuid, linesIds) {
    console.info(
        `Fetching line positions of study '${studyUuid}' and node '${currentNodeUuid}' with ids '${linesIds}'...`
    );

    // Add params to Url
    const linesIdsParams = getRequestParamFromList(linesIds, 'lineId');
    const urlSearchParams = new URLSearchParams(linesIdsParams);

    const fetchLinePositionsUrl = `${getGeoDataPath(
        studyUuid,
        currentNodeUuid
    )}/lines?${urlSearchParams}`;

    console.debug(fetchLinePositionsUrl);
    return backendFetchJson(fetchLinePositionsUrl);
}
