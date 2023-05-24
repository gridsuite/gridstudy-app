/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrl, STUDY_PATHS } from './index';

import { backendFetchJson } from '../../utils/rest-api';

export function getAvailableExportFormats() {
    console.info('get export formats');
    const getExportFormatsUrl = `${getStudyUrl()}${
        STUDY_PATHS.exportNetworkFormats
    }`;
    console.debug(getExportFormatsUrl);
    return backendFetchJson(getExportFormatsUrl);
}
