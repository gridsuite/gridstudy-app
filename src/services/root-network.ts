/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetch } from './utils';
import { UUID } from 'crypto';
import { ElementType } from '@gridsuite/commons-ui';

export const PREFIX_STUDY_QUERIES = import.meta.env.VITE_API_GATEWAY + '/study';

export function createRootNetworka(
    newParameter: any,
    name: string,
    parameterType: ElementType,
    description: string,
    studyUuid: UUID
) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('name', name);
    urlSearchParams.append('type', parameterType);
    urlSearchParams.append('description', description);
    urlSearchParams.append('studyUuid', studyUuid);

    urlSearchParams.toString();
    const createRootNetworkUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/studies/' +
        encodeURIComponent(studyUuid) +
        '/root-networks?' +
        urlSearchParams.toString();

    console.debug(createRootNetworkUrl);

    return backendFetch(createRootNetworkUrl, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newParameter),
    });
}

export const createRootNetwork = (
    caseUuid: UUID,
    caseFormat: string,
    studyUuid: UUID,
    importParameters: Record<string, any>
) => {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('caseUuid', caseUuid);
    urlSearchParams.append('caseFormat', caseFormat);

    const recreateStudyNetworkUrl =
        PREFIX_STUDY_QUERIES +
        '/v1/studies/' +
        encodeURIComponent(studyUuid) +
        '/network?' +
        urlSearchParams.toString();

    console.debug(recreateStudyNetworkUrl);

    return backendFetch(recreateStudyNetworkUrl, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(importParameters),
    });
};
