/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetchJson } from './utils';

const PREFIX_FILTERS_QUERIES = `${process.env.REACT_APP_API_GATEWAY}/filter/v1/filters`;
export function getFilterById(id) {
    const url = PREFIX_FILTERS_QUERIES + '/' + id;
    return backendFetchJson(url);
}
