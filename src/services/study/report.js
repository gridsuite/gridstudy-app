/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrlWithNodeUuid, STUDY_PATHS } from './index';

import { backendFetchJson } from '../../utils/rest-api';

export function fetchReport(studyUuid, currentNodeUuid, nodeOnlyReport) {
    console.info(
        `get report for node : ${currentNodeUuid} with nodeOnlyReport = ${nodeOnlyReport} in study ${studyUuid}`
    );

    // Add params to Url
    const urlSearchParams = new URLSearchParams();

    urlSearchParams.append('nodeOnlyReport', nodeOnlyReport ? 'true' : 'false');

    return backendFetchJson(
        `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
            STUDY_PATHS.report
        }?${urlSearchParams}`
    );
}
