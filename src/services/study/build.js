/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrlWithNodeUuid, STUDY_PATHS } from './index';
import { backendFetchText } from '../../utils/rest-api';

export function buildNode(studyUuid, currentNodeUuid) {
    console.info(`Build node ${currentNodeUuid} of study ${studyUuid} ...`);

    const studyUrlWithUuid = getStudyUrlWithNodeUuid(
        studyUuid,
        currentNodeUuid
    );

    const url = `${studyUrlWithUuid}${STUDY_PATHS.build}`;

    console.debug(url);
    return backendFetchText(url, { method: 'post' });
}
