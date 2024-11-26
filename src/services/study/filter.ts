/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { backendFetchJson } from '../utils';
import { UUID } from 'crypto';
import { getStudyUrlWithNodeUuid } from './index';
import { EquipmentType, FilterType, RuleGroupTypeExport } from '@gridsuite/commons-ui';

export interface ExpertFilter {
    id?: UUID;
    type: typeof FilterType.EXPERT.id;
    equipmentType: EquipmentType;
    rules: RuleGroupTypeExport;
    topologyKind?: string; // TODO must be TopologyKind enum
}

export interface IdentifiableAttributes {
    id: string;
    type: EquipmentType;
    distributionKey: number;
}

export function evaluateJsonFilter(
    studyUuid: UUID,
    currentNodeUuid: UUID,
    filter: ExpertFilter // at moment only ExpertFilter but in futur may add others filter types to compose a union type
) {
    console.info(`Get matched elements of study '${studyUuid}' and node '${currentNodeUuid}' ...`);

    const evaluateFilterUrl =
        getStudyUrlWithNodeUuid(studyUuid, currentNodeUuid) + '/filters/evaluate?inUpstreamBuiltParentNode=true';
    console.debug(evaluateFilterUrl);
    return backendFetchJson(evaluateFilterUrl, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filter),
    }) as Promise<IdentifiableAttributes[]>;
}
