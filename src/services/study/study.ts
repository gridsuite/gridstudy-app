/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { PREFIX_STUDY_QUERIES, getStudyUrl } from '.';
import { backendFetch, backendFetchJson } from '@gridsuite/commons-ui';

interface BasicStudyInfos {
    uniqueId: string;
    id: UUID;
    userId: string;
    monoRoot: boolean;
}

export const fetchStudyExists = (studyUuid: UUID) => {
    console.info(`Fetching study '${studyUuid}' existence ...`);
    const fetchStudiesUrl = getStudyUrl(studyUuid);
    console.debug(fetchStudiesUrl);
    return backendFetch(fetchStudiesUrl, { method: 'head' });
};

export const fetchStudy = (studyUuid: UUID): Promise<BasicStudyInfos> => {
    console.info(`Fetching study '${studyUuid}' ...`);
    const fetchStudyUrl = getStudyUrl(studyUuid);
    console.debug(fetchStudyUrl);
    return backendFetchJson(fetchStudyUrl);
};

export const recreateStudyNetworkFromExistingCase = (
    caseUuid: UUID,
    studyUuid: UUID,
    currentRootNetworkUuid: UUID,
    importParameters: Record<string, any>
): Promise<Response> => {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('caseUuid', caseUuid);

    const recreateStudyNetworkUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/studies/' +
        encodeURIComponent(studyUuid) +
        '/root-networks/' +
        encodeURIComponent(currentRootNetworkUuid) +
        '/network?' +
        urlSearchParams.toString();

    console.debug(recreateStudyNetworkUrl);

    return backendFetch(recreateStudyNetworkUrl, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(importParameters),
    });
};

export const recreateStudyNetwork = (studyUuid: UUID, currentRootNetworkUuid: UUID): Promise<Response> => {
    const recreateStudyNetworkUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/studies/' +
        encodeURIComponent(studyUuid) +
        '/root-networks/' +
        encodeURIComponent(currentRootNetworkUuid) +
        '/network';

    console.debug(recreateStudyNetworkUrl);

    return backendFetch(recreateStudyNetworkUrl, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
    });
};

export const reindexAllRootNetwork = (studyUuid: UUID, currentRootNetworkUuid: UUID): Promise<Response> => {
    const reindexAllRootNetworkUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/studies/' +
        encodeURIComponent(studyUuid) +
        '/root-networks/' +
        encodeURIComponent(currentRootNetworkUuid) +
        '/reindex-all';

    console.debug(reindexAllRootNetworkUrl);

    return backendFetch(reindexAllRootNetworkUrl, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
    });
};
