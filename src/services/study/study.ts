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

export const recreateStudyNetwork = (studyUuid: UUID): Promise<BasicStudyInfos> => {
    const recreateStudyNetworkUrl = PREFIX_STUDY_QUERIES + '/v1/studies/' + encodeURIComponent(studyUuid) + '/network';

    console.debug(recreateStudyNetworkUrl);

    return backendFetch(recreateStudyNetworkUrl, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
    });
};

export const reindexAllStudy = (studyUuid: UUID): Promise<void> => {
    const reindexAllStudyUrl = PREFIX_STUDY_QUERIES + '/v1/studies/' + encodeURIComponent(studyUuid) + '/reindex-all';

    console.debug(reindexAllStudyUrl);

    return backendFetch(reindexAllStudyUrl, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
    });
};
