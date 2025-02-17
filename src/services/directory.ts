/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetchJson, getRequestParamFromList } from './utils';
import { UnknownArray } from 'type-fest';
import { ElementAttributes } from '@gridsuite/commons-ui';

const PREFIX_DIRECTORY_SERVER_QUERIES = import.meta.env.VITE_API_GATEWAY + '/directory';

export function fetchContingencyAndFiltersLists(listIds: UnknownArray): Promise<ElementAttributes[]> {
    console.info('Fetching contingency and filters lists');

    // Add params to Url
    const idsParams = getRequestParamFromList(
        listIds.filter((id) => id), // filter falsy elements
        'ids'
    );
    const urlSearchParams = new URLSearchParams(idsParams);

    urlSearchParams.append('strictMode', 'false');

    const url = `${PREFIX_DIRECTORY_SERVER_QUERIES}/v1/elements?${urlSearchParams}`;
    console.debug(url);
    return backendFetchJson(url);
}
