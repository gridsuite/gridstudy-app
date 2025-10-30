/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ColDef } from 'ag-grid-community';
import type { UUID } from 'node:crypto';
import { FilterConfig, SortConfig } from 'types/custom-aggrid-types';
import { GlobalFilters } from '../common/global-filter/global-filter-types';

export interface PccMinResult {
    resultUuid: UUID;
    writeTimeStamp: Date;
    singlePccMinResultInfos: SinglePccMinResultInfos[];
}
export interface SinglePccMinResultInfos {
    singlePccMinResultUuid: string;
    busId: String;
    pccMinTri: number;
    limitingEquipment: String;
    x: number;
    r: number;
}

type Pageable = {
    sort: {
        sorted: boolean;
        empty: boolean;
        unsorted: boolean;
    };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
};

interface Page<ResultType> {
    content: ResultType[];
    pageable: Pageable;
    last: boolean;
    totalPages: number;
    totalElements: number;
    first: boolean;
    size: number;
    number: number;
    sort: {
        sorted: boolean;
        empty: boolean;
        unsorted: boolean;
    };
    numberOfElements: number;
    empty: boolean;
}

export interface PccMinResultTabProps {
    studyUuid: UUID;
    nodeUuid: UUID;
    currentRootNetworkUuid: UUID;
}
export type SCAPagedResults = Page<SinglePccMinResultInfos>;

export interface PccMinResultTableProps {
    isLoadingResult: boolean;
    columnDefs: ColDef<any>[];
    tableName: string;
}

export interface PccMinResultStatusProps {
    result: PccMinResult;
}
interface PccMinResults {
    studyUuid: UUID | null;
    currentNodeUuid?: UUID;
    currentRootNetworkUuid?: UUID;
    globalFilters?: GlobalFilters;
}
export interface PccMinResultProps extends PccMinResultTableProps, PccMinResultStatusProps {}
interface Selector {
    page: number;
    size: number;
    filter: FilterConfig[] | null;
    sort: SortConfig[];
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
