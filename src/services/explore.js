/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetchJson, getRequestParamFromList } from '../utils/rest-api';

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
