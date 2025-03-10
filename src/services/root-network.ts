/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { PREFIX_STUDY_QUERIES, getStudyUrl } from './study';
import { backendFetch, backendFetchJson } from './utils';
import { UUID } from 'crypto';

export function fetchRootNetworks(studyUuid: UUID) {
    console.info('Fetching root networks for studyUuid : ', studyUuid);
    const rootNetworksGetUrl = `${PREFIX_STUDY_QUERIES}/v1/studies/${encodeURIComponent(studyUuid)}/root-networks`;

    console.debug(rootNetworksGetUrl);
    return backendFetchJson(rootNetworksGetUrl);
}

export const createRootNetwork = (
    caseUuid: UUID,
    caseFormat: string,
    rootNetworkName: string,
    rootNetworkTag: string,
    studyUuid: UUID,
    importParameters: Record<string, any>
) => {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('caseUuid', caseUuid);
    urlSearchParams.append('caseFormat', caseFormat);
    urlSearchParams.append('name', rootNetworkName);
    urlSearchParams.append('tag', rootNetworkTag);

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

export const updateRootNetwork = (
    rootNetworkUuid: UUID,
    name: string,
    tag: string,
    caseUuid: UUID | null,
    caseFormat: string | null,
    studyUuid: UUID,
    importParameters: Record<string, any> | null
) => {
    // Create an object of parameters to be appended to the URL
    const params = { caseUuid, caseFormat, name, tag };

    // Initialize URLSearchParams with only the truthy values from params
    const urlSearchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            urlSearchParams.append(key, value.toString());
        }
    });
    const updateRootNetworkUrl =
        PREFIX_STUDY_QUERIES +
        `/v1/studies/${encodeURIComponent(studyUuid)}/root-networks/${encodeURIComponent(rootNetworkUuid)}?` +
        urlSearchParams.toString();

    console.debug(updateRootNetworkUrl);
    return backendFetch(updateRootNetworkUrl, {
        method: 'PUT',
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
    const checkRootNetworkNameExistenceUrl =
        getStudyUrl(studyUuid) +
        '/root-networks?' +
        new URLSearchParams({
            name: name,
        });
    console.debug(checkRootNetworkNameExistenceUrl);
    return backendFetch(checkRootNetworkNameExistenceUrl, { method: 'head' }).then((response) => {
        return response.status !== 204;
    });
}

export function checkRootNetworkTagExistence(studyUuid: UUID, tag: string): Promise<boolean> {
    const checkRootNetworkTagExistenceUrl =
        getStudyUrl(studyUuid) +
        '/root-networks?' +
        new URLSearchParams({
            tag: tag,
        });
    console.debug(checkRootNetworkTagExistenceUrl);
    return backendFetch(checkRootNetworkTagExistenceUrl, { method: 'head' }).then((response) => {
        return response.status !== 204;
    });
}
