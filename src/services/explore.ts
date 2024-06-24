/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ContingencyList } from './study/contingency-list';
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
    modificationType: string;
}

export function createCompositeModifications(
    name: string,
    description: string,
    parentDirectoryUuid: UUID,
    selectedModificationsUuid: UUID[]
) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('name', name);
    urlSearchParams.append('description', description);
    urlSearchParams.append('parentDirectoryUuid', parentDirectoryUuid);
    return backendFetch(
        PREFIX_EXPLORE_SERVER_QUERIES +
            '/v1/explore/composite-modifications?' +
            urlSearchParams.toString(),
        {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(selectedModificationsUuid),
        }
    );
}

/**
 * Create Contingency List
 * @returns {Promise<Response>}
 */
export function createContingencyList(
    newContingencyList: ContingencyList[],
    contingencyListName: string,
    description: string,
    parentDirectoryUuid: string
) {
    console.info('Creating a new contingency list...');
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('description', description);
    urlSearchParams.append('parentDirectoryUuid', parentDirectoryUuid);

    const createContingencyListUrl =
        PREFIX_EXPLORE_SERVER_QUERIES +
        '/v1/explore/identifier-contingency-lists/' +
        encodeURIComponent(contingencyListName) +
        '?' +
        urlSearchParams.toString();
    return backendFetch(createContingencyListUrl, {
        method: 'post',
        body: JSON.stringify(newContingencyList),
    });
}
