/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrl } from './study';
import { backendFetch, backendFetchJson } from './utils';
import { UUID } from 'crypto';

export const PREFIX_STUDY_QUERIES = import.meta.env.VITE_API_GATEWAY + '/study';

export function fetchRootNetworks(studyUuid: UUID) {
    console.info('Fetching root network for studyUuid : ', studyUuid);
    const rootNetworksGetUrl = `${PREFIX_STUDY_QUERIES}/v1/studies/${encodeURIComponent(studyUuid)}/root-networks`;

    console.debug(rootNetworksGetUrl);
    return backendFetchJson(rootNetworksGetUrl);
}

export const createRootNetwork = (
    caseUuid: UUID | undefined,
    caseFormat: string,
    rootNetworkName: string,
    studyUuid: UUID | null,
    importParameters: Record<string, any>
) => {
    if (!studyUuid || !caseUuid || !rootNetworkName) {
        throw new Error('rootNetworkName, studyUuid and caseUuid are required parameters.');
    }

    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('caseUuid', caseUuid);
    urlSearchParams.append('caseFormat', caseFormat);
    urlSearchParams.append('name', rootNetworkName);

    const createRootNetworkUrl =
        PREFIX_STUDY_QUERIES +
        `/v1/studies/${encodeURIComponent(studyUuid)}/root-networks?` +
        urlSearchParams.toString();

    console.debug(createRootNetworkUrl);
    return backendFetch(createRootNetworkUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: importParameters ? JSON.stringify(importParameters) : '',
    });
};

export function deleteRootNetworks(studyUuid: UUID, rootNetworkUuids: UUID[]) {
    const rootNetworkDeleteUrl = `${PREFIX_STUDY_QUERIES}/v1/studies/${encodeURIComponent(studyUuid)}/root-networks`;

    console.debug(rootNetworkDeleteUrl);
    return backendFetch(rootNetworkDeleteUrl, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(rootNetworkUuids),
    });
}

export function checkRootNetworkNameExistence(studyUuid: UUID, name: string): Promise<boolean> {
    const rootNetworkNameExistsUrl =
        getStudyUrl(studyUuid) +
        '/root-networks?' +
        new URLSearchParams({
            name: name,
        });
    console.debug(rootNetworkNameExistsUrl);
    return backendFetch(rootNetworkNameExistsUrl, { method: 'head' }).then((response) => {
        return response.status !== 204;
    });
}
