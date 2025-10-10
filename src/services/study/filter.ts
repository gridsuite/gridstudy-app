/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { NonEmptyTuple } from 'type-fest';
import type { UUID } from 'node:crypto';
import { backendFetchJson, getRequestParamFromList } from '../utils';
import { getStudyUrlWithNodeUuidAndRootNetworkUuid } from './index';
import { RuleGroupTypeExport } from '../../components/dialogs/filter/expert/expert-filter.type';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import type { GlobalFilters } from '../../components/results/common/global-filter/global-filter-types';
import type { FilterEquipmentType } from '../../types/filter-lib/filter';

export interface ExpertFilter {
    id?: UUID;
    name?: string;
    type: 'EXPERT';
    equipmentType: string; // TODO must be EquipmentType enum
    rules: RuleGroupTypeExport;
    topologyKind?: string; // TODO must be TopologyKind enum
}

export type EquipmentsFilter = {
    equipmentID: string;
    distributionKey?: number;
};

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

/**
 * Evaluate a {@link GlobalFilter} on a network
 * @param studyUuid the {@link UUID} of the study to work on
 * @param currentNodeUuid the current node to get the variant
 * @param currentRootNetworkUuid the root network to work on to get the variant
 * @param equipmentTypes The types of equipment to filter
 * @param filters the filters description
 * @return The equipment IDs that pass the filters
 */
export async function evaluateGlobalFilter(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    equipmentTypes: NonEmptyTuple<FilterEquipmentType>,
    filters: GlobalFilters
): Promise<string[]> {
    return backendFetchJson(
        `${getStudyUrlWithNodeUuidAndRootNetworkUuid(studyUuid, currentNodeUuid, currentRootNetworkUuid)}/global-filter/evaluate?${new URLSearchParams(
            { equipmentTypes: equipmentTypes.join(',') }
        )}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filters),
        }
    );
}

/** @deprecated migrate to {@link #evaluateGlobalFilter} */
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

/** @deprecated migrate to {@link #evaluateGlobalFilter} */
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
