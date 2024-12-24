/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UUID } from 'crypto';
import { PREFIX_STUDY_QUERIES } from '.';
import { backendFetch } from '../utils';

interface BasicStudyInfos {
    uniqueId: string;
    id: UUID;
    userId: string;
}

export const recreateStudyNetworkFromExistingCase = (
    caseUuid: UUID,
    studyUuid: UUID,
    currentRootNetworkUuid: UUID,
    importParameters: Record<string, any>
): Promise<BasicStudyInfos> => {
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

export const recreateStudyNetwork = (studyUuid: UUID, currentRootNetworkUuid: UUID): Promise<BasicStudyInfos> => {
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

export const reindexAllStudy = (studyUuid: UUID, currentRootNetworkUuid: UUID): Promise<void> => {
    const reindexAllStudyUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/studies/' +
        encodeURIComponent(studyUuid) +
        '/root-networks/' +
        encodeURIComponent(currentRootNetworkUuid) +
        '/reindex-all';

    console.debug(reindexAllStudyUrl);

    return backendFetch(reindexAllStudyUrl, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
    });
};
