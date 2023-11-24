/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ColDef } from 'ag-grid-community';
import { AgGridReactProps } from 'ag-grid-react';
import { ISortConfig } from '../../../hooks/use-aggrid-sort';
import * as React from 'react';

export interface LimitViolation {
    subjectId?: string;
    acceptableDuration?: number;
    limit?: number;
    limitName?: string;
    limitReduction?: number;
    limitType?: string;
    loading?: number;
    side?: string;
    value?: number;
}

interface Element {
    elementType?: string;
    id?: string;
}

export interface ContingencyItem {
    status?: string;
    contingencyId?: string;
    elements?: Element[];
}

export interface Contingency {
    contingency?: ContingencyItem;
    limitViolation?: LimitViolation;
}

export interface SecurityAnalysisNmkTableRow {
    subjectId?: string;
    acceptableDuration?: number | null;
    status?: string;
    contingencyEquipmentsIds?: (string | undefined)[];
    contingencyId?: string;
    limit?: number;
    limitName?: string;
    limitType?: string;
    linkedElementId?: string;
    loading?: number;
    side?: string;
    value?: number;
    violationCount?: number;
}

export interface Constraint {
    limitViolation?: LimitViolation;
    subjectId?: string;
}

export interface ContingenciesFromConstraintItem {
    subjectId: string;
    contingencies?: Contingency[];
}

export interface ConstraintsFromContingencyItem {
    subjectLimitViolations?: Constraint[];
    contingency?: ContingencyItem;
}

export interface PreContingencyResult {
    subjectId?: string;
    status: string;
    limitViolation?: LimitViolation;
}

type FilterValueType = string[] | { text: string; type: string }[];

export type FilterSelectorType = Record<string, FilterValueType> | null;

export type SortTableStateType = {
    colKey: string;
    sortValue?: string;
};

export type FilterTableStateType = {
    dataType?: string;
    field?: string;
    type?: string;
    value?: FilterValueType;
};

export type QueryParamsType = Record<
    string,
    string | number | SortTableStateType | FilterTableStateType[]
>;

type Sort = {
    empty?: boolean;
    sorted?: boolean;
    unsorted?: boolean;
};

type Pageable = {
    offset?: number;
    pageNumber?: number;
    pageSize?: number;
    paged?: boolean;
    sort?: Sort;
    unpaged?: boolean;
};

type PaginationProps = {
    count?: number;
    rowsPerPage?: number;
    page?: number;
    onPageChange?: (
        event: React.MouseEvent<HTMLButtonElement> | null,
        page: number
    ) => void;
    onRowsPerPageChange?: React.ChangeEventHandler<
        HTMLTextAreaElement | HTMLInputElement
    >;
};

type SortProps = {
    onSortChanged: (colKey: string, sortWay: number) => void;
    sortConfig?: ISortConfig;
};

type FilterProps = {
    updateFilter: (field: string, value: string) => void;
    filterSelector: FilterSelectorType | undefined;
    filterEnums: FilterEnums;
};

type FilterParams = {
    filterUIType?: string;
    filterComparators?: string[];
    debounceMs?: number;
    parser?: (value: string) => void;
};

export type FilterEnums = Record<string, string[] | null>;

export type FilterDef = {
    field: string;
    options: string[] | null;
};

export interface CustomColDef extends ColDef {
    isSortable?: boolean;
    isHidden?: boolean;
    isFilterable?: boolean;
    filterParams?: FilterParams;
    filtersDef: FilterDef[];
    filterSelector: FilterSelectorType | undefined;
    sortConfig?: ISortConfig;
    onSortChanged: (colKey: string, sortWay: number) => void;
    updateFilter: (field: string, value: string) => void;
}

export interface SecurityAnalysisNmkResult {
    content?:
        | ContingenciesFromConstraintItem[]
        | ConstraintsFromContingencyItem[]
        | null;
    empty?: boolean;
    first?: boolean;
    last?: boolean;
    number?: number;
    numberOfElements?: number;
    pageable?: Pageable;
    size?: number;
    sort?: Sort;
    totalElements?: number;
    totalPages?: number;
}

// Components props interfaces
export interface SecurityAnalysisTabProps {
    studyUuid: string;
    nodeUuid: string;
    openVoltageLevelDiagram: (id: string) => void;
}

export interface SecurityAnalysisResultNProps {
    result?: PreContingencyResult[];
    isLoadingResult: boolean;
    onSortChanged: (colKey: string, sortWay: number) => void;
    sortConfig?: ISortConfig;
    updateFilter: (field: string, value: string) => void;
    filterSelector: FilterSelectorType;
    filterEnums: FilterEnums;
}

export interface SecurityAnalysisResultNmkProps {
    result?: SecurityAnalysisNmkResult;
    isLoadingResult: boolean;
    isFromContingency: boolean;
    openVoltageLevelDiagram?: (voltageLevelId: string) => void;
    studyUuid?: string;
    nodeUuid?: string;
    paginationProps: PaginationProps;
    sortProps: SortProps;
    filterProps: FilterProps;
}

export interface SecurityAnalysisNTableRow {
    limit?: number;
    limitType?: string;
    loading?: number;
    subjectId?: string;
    value?: number;
}

export interface SecurityAnalysisResultProps {
    rows: SecurityAnalysisNTableRow[] | SecurityAnalysisNmkTableRow[];
    columnDefs: ColDef[];
    isLoadingResult: boolean;
    agGridProps?: AgGridReactProps;
}
