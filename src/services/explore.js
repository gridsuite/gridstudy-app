/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetch, backendFetchJson, getRequestParamFromList } from './utils';

const PREFIX_EXPLORE_SERVER_QUERIES = `${process.env.REACT_APP_API_GATEWAY}/explore`;

export function fetchElementsMetadata(ids, elementTypes, equipmentTypes) {
    console.info('Fetching elements metadata');

    // Add params to Url
    const idsParams = getRequestParamFromList(
        ids.filter((id) => id), // filter falsy elements
        'ids'
    );

    const equipmentTypesParams = getRequestParamFromList(
        equipmentTypes,
        'equipmentTypes'
    );

    const elementTypesParams = getRequestParamFromList(
        elementTypes,
        'elementTypes'
    );

    const params = [
        ...idsParams,
        ...equipmentTypesParams,
        ...elementTypesParams,
    ];

    const urlSearchParams = new URLSearchParams(params);

    const url = `${PREFIX_EXPLORE_SERVER_QUERIES}/v1/explore/elements/metadata?${urlSearchParams}`;
    console.debug(url);
    return backendFetchJson(url);
}

export function createFilter(newFilter, name, parentDirectoryUuid) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('name', name);
    urlSearchParams.append('description', '');
    urlSearchParams.append('parentDirectoryUuid', parentDirectoryUuid);
    return backendFetch(
        PREFIX_EXPLORE_SERVER_QUERIES +
            '/v1/explore/filters?' +
            urlSearchParams.toString(),
        {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newFilter),
        }
    );
}

export function saveFilter(filter, name) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('name', name);
    const body = JSON.stringify(filter);

    return backendFetch(
        PREFIX_EXPLORE_SERVER_QUERIES +
            '/v1/explore/filters/' +
            filter.id +
            '?' +
            urlSearchParams.toString(),
        {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body,
        }
    );
}
