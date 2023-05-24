/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetchJson } from '../../utils/rest-api';
import { getStudyUrl, STUDY_PATHS } from './index';

export function fetchNetworkModificationSubtree(studyUuid, parentNodeUuid) {
    console.info('Fetching network modification tree node : ', parentNodeUuid);
    const url = `${getStudyUrl(studyUuid)}${
        STUDY_PATHS.subtree
    }?parentNodeUuid=${encodeURIComponent(parentNodeUuid)}`;
    console.debug(url);
    return backendFetchJson(url);
}
