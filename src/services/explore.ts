/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetch } from './utils';
import { UUID } from 'crypto';

const PREFIX_EXPLORE_SERVER_QUERIES =
    import.meta.env.VITE_API_GATEWAY + '/explore';
const PREFIX_DIRECTORY_SERVER_QUERIES =
    import.meta.env.VITE_API_GATEWAY + '/directory';

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

export function elementExists(
    directoryUuid: UUID,
    elementName: string,
    type: string
) {
    const existsElementUrl = `${PREFIX_DIRECTORY_SERVER_QUERIES}/v1/directories/${directoryUuid}/elements/${elementName}/types/${type}`;

    console.debug(existsElementUrl);
    return backendFetch(existsElementUrl, { method: 'head' }).then(
        (response) => {
            return response.status !== 204; // HTTP 204 : No-content
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
