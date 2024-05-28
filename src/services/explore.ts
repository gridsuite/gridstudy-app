/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetch } from '@gridsuite/commons-ui';
import { UUID } from 'crypto';

const PREFIX_EXPLORE_SERVER_QUERIES =
    import.meta.env.VITE_API_GATEWAY + '/explore';

export function createParameter(
    newParameter: any,
    name: string,
    parameterType: string,
    parentDirectoryUuid: UUID
) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('name', name);
    urlSearchParams.append('type', parameterType);
    urlSearchParams.append('parentDirectoryUuid', parentDirectoryUuid);
    return backendFetch(
        PREFIX_EXPLORE_SERVER_QUERIES +
            '/v1/explore/parameters?' +
            urlSearchParams.toString(),
        {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newParameter),
        }
    );
}

export interface ModificationElementCreationProps {
    elementUuid: UUID;
    description: string;
    elementName: string;
}

export function createModifications(
    parentDirectoryUuid: UUID,
    modificationList: ModificationElementCreationProps[]
) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('parentDirectoryUuid', parentDirectoryUuid);
    return backendFetch(
        PREFIX_EXPLORE_SERVER_QUERIES +
            '/v1/explore/modifications?' +
            urlSearchParams.toString(),
        {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(modificationList),
        }
    );
}

/**
 * Create Filter
 * @returns {Promise<Response>}
 */
export function createFilter(
    newFilter: any,
    name: string,
    description: string,
    parentDirectoryUuid: string
) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('name', name);
    urlSearchParams.append('description', description);
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
