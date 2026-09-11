/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getRequestParamFromList } from './utils';
import { backendFetchJson, ElementAttributes } from '@gridsuite/commons-ui';
import type { UUID } from 'node:crypto';
import { PREFIX_STUDY_QUERIES } from './study';

const PREFIX_DIRECTORY_QUERIES = PREFIX_STUDY_QUERIES + '/v1/directory';

export function fetchContingencyAndFiltersLists(listIds: UUID[]): Promise<ElementAttributes[]> {
    console.info('Fetching contingency and filters lists');

    // Add params to Url
    const idsParams = getRequestParamFromList(
        listIds.filter((id) => id), // filter falsy elements
        'ids'
    );
    const urlSearchParams = new URLSearchParams(idsParams);

    urlSearchParams.append('strictMode', 'false');

    const url = `${PREFIX_DIRECTORY_QUERIES}/elements?${urlSearchParams}`;
    console.debug(url);
    return backendFetchJson(url);
}
