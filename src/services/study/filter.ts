/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetchJson, getRequestParamFromList } from '../utils';
import { UUID } from 'crypto';
import { getStudyUrlWithNodeUuidAndRootNetworkUuid, getStudyUrlWithRootNetworkUuid } from './index';
import { RuleGroupTypeExport } from '../../components/dialogs/filter/expert/expert-filter.type';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';

export interface ExpertFilter {
    id?: UUID;
    name?: string;
    type: 'EXPERT';
    equipmentType: string; // TODO must be EquipmentType enum
    rules: RuleGroupTypeExport;
    topologyKind?: string; // TODO must be TopologyKind enum
}

export interface FilterEquipments {
    filterId: UUID;
    identifiableAttributes: IdentifiableAttributes[];
    notFoundEquipments: string[];
}

export interface IdentifiableAttributes {
    id: string;
    type: EQUIPMENT_TYPES;
    distributionKey: number;
}

export function evaluateJsonFilter(
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

export function evaluateFilters(
    studyUuid: UUID,
    currentRootNetworkUuid: UUID,
    filters: UUID[]
): Promise<FilterEquipments[]> {
    console.info(`Get matched elements of study '${studyUuid}' with a root network '${currentRootNetworkUuid}' ...`);

    const filtersListsQueryParams = getRequestParamFromList(filters, 'filtersUuid');
    const urlSearchParams = new URLSearchParams(filtersListsQueryParams);

    const evaluateFilterUrl =
        getStudyUrlWithRootNetworkUuid(studyUuid, currentRootNetworkUuid) + `/filters/elements?${urlSearchParams}`;
    console.debug(evaluateFilterUrl);
    return backendFetchJson(evaluateFilterUrl, {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
    });
}
