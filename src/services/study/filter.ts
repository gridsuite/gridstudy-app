/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetchJson } from '../utils';
import { UUID } from 'crypto';
import { getStudyUrlWithNodeUuid } from './index';

export function evaluateFilter(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    filter: Object
) {
    console.info(
        `Get matched elements of study '${studyUuid}' and node '${currentNodeUuid}' ...`
    );

    const evaluateFilterUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) +
        '/filters/evaluate';
    console.debug(evaluateFilterUrl);
    return backendFetchJson(evaluateFilterUrl, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filter),
    });
}
