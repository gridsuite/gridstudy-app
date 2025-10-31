/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { FilterConfig, SortConfig } from 'types/custom-aggrid-types';
import { GlobalFilters } from '../common/global-filter/global-filter-types';
import { Page, Selector } from '../common/utils';

export interface SinglePccMinResultInfos {
    singlePccMinResultUuid: string;
    busId: String;
    pccMinTri: number;
    limitingEquipment: String;
    x: number;
    r: number;
}

export interface PccMinResultTabProps {
    studyUuid: UUID;
    nodeUuid: UUID;
    currentRootNetworkUuid: UUID;
}
export type PagedPccMinResults = Page<SinglePccMinResultInfos>;

export interface PccMinResultTableProps {
    result: SinglePccMinResultInfos[];
    isFetching: boolean;
    onFilter: () => void;
    filters: FilterConfig[];
}

interface PccMinResults {
    studyUuid: UUID | null;
    currentNodeUuid?: UUID;
    currentRootNetworkUuid?: UUID;
    globalFilters?: GlobalFilters;
}

export interface PccMinPagedResults extends PccMinResults {
    selector: Partial<Selector>;
}

export const FROM_COLUMN_TO_FIELD_PCC_MIN: Record<string, string> = {
    busId: 'busId',
    pccMinTri: 'pccMinTri',
    iccMinTri: 'iccMinTri',
    limitingEquipment: 'limitingEquipment',
    x: 'xOhm',
    r: 'rOhm',
};
