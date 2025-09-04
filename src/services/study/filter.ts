/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetchJson, getRequestParamFromList } from '../utils';
import type { UUID } from 'crypto';
import { getStudyUrlWithNodeUuidAndRootNetworkUuid } from './index';
import type { ExpertFilter } from '../../types/filter-lib/expert-filter';
import type { FilterEquipments, IdentifiableAttributes } from '../../types/filter-lib';

export async function evaluateJsonFilter(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    filter: ExpertFilter // at moment only ExpertFilter but in futur may add others filter types to compose a union type
): Promise<IdentifiableAttributes[]> {
    console.info(
        `Get matched elements of study '${studyUuid}'  with a root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' ...`
    );

    const evaluateFilterUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        '/filters/evaluate?inUpstreamBuiltParentNode=true';
    console.debug(evaluateFilterUrl);
    return backendFetchJson(evaluateFilterUrl, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filter),
    });
}

export async function evaluateFilters(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    filters: UUID[],
    inUpstreamBuiltParentNode: boolean = false
): Promise<FilterEquipments[]> {
    console.info(
        `Get matched elements of study '${studyUuid}' with a root network '${currentRootNetworkUuid}' and node '${currentNodeUuid}' ...`
    );

    const filtersListsQueryParams = getRequestParamFromList(filters, 'filtersUuid');
    const urlSearchParams = new URLSearchParams(filtersListsQueryParams);

    urlSearchParams.append('inUpstreamBuiltParentNode', inUpstreamBuiltParentNode.toString());

    const evaluateFilterUrl =
        getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid) +
        `/filters/elements?${urlSearchParams}`;
    console.debug(evaluateFilterUrl);
    return backendFetchJson(evaluateFilterUrl, {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
    });
}
