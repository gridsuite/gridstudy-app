/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrlWithNodeUuid, STUDY_PATHS } from './index';

import { getRequestParamFromList } from '../../utils/rest-api';

export function getNetworkAreaDiagramUrl(
    studyUuid,
    currentNodeUuid,
    voltageLevelsIds,
    depth
) {
    console.info(
        `Getting url of network area diagram of study '${studyUuid}' and node '${currentNodeUuid}'...`
    );

    // Add params to Url
    const voltageLevelsIdsParams = getRequestParamFromList(
        voltageLevelsIds,
        'voltageLevelsIds'
    );
    const urlSearchParams = new URLSearchParams(voltageLevelsIdsParams);

    urlSearchParams.append('depth', depth);

    return `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
        STUDY_PATHS.networkAreaDiagram
    }?${urlSearchParams}`;
}
