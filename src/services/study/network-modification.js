/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetch } from '../../utils/rest-api';
import { getStudyUrlWithNodeUuid, STUDY_PATHS } from './index';

export function changeNetworkModificationOrder(
    studyUuid,
    currentNodeUuid,
    itemUuid,
    beforeUuid
) {
    console.info(`reorder node ${currentNodeUuid} of study ${studyUuid} ...`);

    const urlSearchParams = new URLSearchParams({
        beforeUuid: beforeUuid || '',
    });

    const url = `${getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid)}${
        STUDY_PATHS.networkModification
    }/${itemUuid}?${urlSearchParams.toString()}`;

    console.debug(url);
    return backendFetch(url, { method: 'put' });
}
