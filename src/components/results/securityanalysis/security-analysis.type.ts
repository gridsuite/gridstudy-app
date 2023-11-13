/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { ColDef } from 'ag-grid-community';
import { AgGridReactProps } from 'ag-grid-react';
import {
    FilterSelectorType,
    SortConfigType,
} from '../../custom-aggrid/custom-aggrid-header.type';

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
    acceptableDuration?: number;
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
    subjectId?: string;
    contingencies?: Contingency[];
}

export interface ConstraintsFromContingencyItem {
    subjectLimitViolations?: Constraint[];
    contingency?: ContingencyItem;
}

export interface PreContingencyResult {
    limitViolationsResult?: {
        limitViolations?: LimitViolation[];
    };
}

export type SortTableStateType = {
    colKey: string;
    sortWay?: string;
};

export type QueryParamsType = Record<
    string,
    string | number | SortTableStateType[] | FilterSelectorType
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
    onSortChanged: (sortConfig: SortConfigType[]) => void;
    sortConfig?: SortConfigType[];
};

type FilterProps = {
    updateFilter: (field: string, value: string) => void;
    filterSelector: FilterSelectorType;
    filterEnums: FilterEnums;
};

export type FilterEnums = Record<string, string[] | null>;

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
    result?: PreContingencyResult;
    isLoadingResult: boolean;
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
