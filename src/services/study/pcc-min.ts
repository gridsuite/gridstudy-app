/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getStudyUrlWithNodeUuidAndRootNetworkUuid } from './index';
import { backendFetch, backendFetchJson, backendFetchText } from '@gridsuite/commons-ui';
import { PccMinPagedResults } from 'components/results/pccmin/pcc-min-result.type';
import { UUID } from 'crypto';

export function startPccMin(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID): Promise<Response> {
    console.info(
        `Running pcc min on ${studyUuid}  on root network '${currentRootNetworkUuid}' and node ${currentNodeUuid} ...`
    );
    const url =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) + '/pcc-min/run';

    console.debug(url);
    return backendFetch(url, { method: 'post' });
}

export function stopPccMin(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID) {
    console.info(
        `Stopping pcc min on ${studyUuid} on root network '${currentRootNetworkUuid}' and node ${currentNodeUuid} ...`
    );
    const url = `${getStudyUrlWithNodeUuidAndRootNetworkUuid(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid
    )}/pcc-min/stop`;
    console.debug(url);
    return backendFetch(url, { method: 'put' });
}

export function fetchPccMinStatus(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID) {
    console.info(
        `Fetching pcc min status on ${studyUuid} on root network '${currentRootNetworkUuid}' and node ${currentNodeUuid} ...`
    );
    const url = `${getStudyUrlWithNodeUuidAndRootNetworkUuid(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid
    )}/pcc-min/status`;
    console.debug(url);
    return backendFetchText(url);
}

export function fetchPccMinPagedResults({
    studyUuid,
    currentNodeUuid,
    currentRootNetworkUuid,
    selector = {},
    globalFilters,
}: PccMinPagedResults) {
    console.info(
        `Fetching pcc min result on '${studyUuid}' , node '${currentNodeUuid}' and root network '${currentRootNetworkUuid}'...`
    );

    const urlSearchParams = new URLSearchParams();

    const { page = 0, sort, size, filter } = selector;

    urlSearchParams.append('page', String(page));

    sort?.map((value) => urlSearchParams.append('sort', `${value.colId},${value.sort}`));

    if (size) {
        urlSearchParams.append('size', String(size));
    }

    if (filter?.length) {
        urlSearchParams.append('filters', JSON.stringify(filter));
    }

    if (globalFilters && Object.keys(globalFilters).length > 0) {
        urlSearchParams.append('globalFilters', JSON.stringify(globalFilters));
    }

    const url =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/pcc-min/result?' +
        urlSearchParams.toString();
    console.debug(url);
    return backendFetchJson(url);
}
