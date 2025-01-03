/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetch, backendFetchJson } from './utils';
import { UUID } from 'crypto';

export const PREFIX_STUDY_QUERIES = import.meta.env.VITE_API_GATEWAY + '/study';

export function fetchRootNetworks(studyUuid: UUID) {
    console.info('Fetching root network for studyUuid : ', studyUuid);
    const urlSearchParams = new URLSearchParams();
    const rootNetworkssGetUrl =
        `${PREFIX_STUDY_QUERIES}/v1/studies/${encodeURIComponent(studyUuid)}/root-networks` +
        urlSearchParams.toString();

    console.debug(rootNetworkssGetUrl);
    return backendFetchJson(rootNetworkssGetUrl);
}

export const createRootNetwork = (
    caseUuid: UUID | undefined,
    caseFormat: string,
    studyUuid: UUID | null,
    importParameters: Record<string, any>
) => {
    if (!studyUuid || !caseUuid) {
        throw new Error('studyUuid and caseUuid are required parameters.');
    }

    const createRootNetworkUrl =
        PREFIX_STUDY_QUERIES +
        `/v1/studies/${encodeURIComponent(studyUuid)}/root-networks?` +
        `caseUuid=${encodeURIComponent(caseUuid)}&` +
        `caseFormat=${encodeURIComponent(caseFormat)}`;

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
        const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('rootNetworkUuids', String(rootNetworkUuids));
    const rootNetworkDeleteUrl = `${PREFIX_STUDY_QUERIES}/v1/studies/${encodeURIComponent(
        studyUuid
    )}/root-networks`;

    const modificationDeleteUrl = rootNetworkDeleteUrl + '?' + urlSearchParams.toString();

    console.debug(modificationDeleteUrl);
    return backendFetch(modificationDeleteUrl, {
        method: 'DELETE',
    });
}
