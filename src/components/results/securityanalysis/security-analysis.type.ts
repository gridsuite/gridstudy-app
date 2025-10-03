/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { AgGridReactProps } from 'ag-grid-react';
import type { UUID } from 'node:crypto';
import { FilterConfig, SortConfig } from '../../../types/custom-aggrid-types';
import { TablePaginationProps } from '@mui/material';
import { GlobalFilters } from '../common/global-filter/global-filter-types';

export interface LimitViolation {
    subjectId?: string;
    acceptableDuration?: number;
    upcomingAcceptableDuration?: number;
    limit?: number;
    patlLimit?: number;
    limitName?: string;
    nextLimitName?: string;
    limitReduction?: number;
    limitType?: string;
    loading?: number;
    patlLoading?: number;
    side?: string;
    value?: number;
    locationId?: string;
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
    locationId?: string;
    acceptableDuration?: number | null;
    upcomingAcceptableDuration?: number | null;
    status?: string;
    contingencyEquipmentsIds?: (string | undefined)[];
    contingencyId?: string;
    limit?: number;
    patlLimit?: number;
    limitName?: string | null;
    nextLimitName?: string | null;
    limitType?: string;
    linkedElementId?: string;
    loading?: number;
    patlLoading?: number;
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
    subjectId?: string;
    status: string;
    limitViolation?: LimitViolation;
}

export type QueryParamsType = Record<string, string | number | SortConfig[] | FilterConfig[] | GlobalFilters>;

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

export type SubjectIdRendererType = (cellData: ICellRendererParams) => React.JSX.Element | undefined;

export interface SecurityAnalysisNmkResult {
    content?: ContingenciesFromConstraintItem[] | ConstraintsFromContingencyItem[] | null;
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
    studyUuid: UUID;
    nodeUuid: UUID;
    currentRootNetworkUuid: UUID;
    openVoltageLevelDiagram: (id: string) => void;
}

export interface SecurityAnalysisResultNProps {
    result?: PreContingencyResult[];
    isLoadingResult: boolean;
    columnDefs: ColDef<any>[];
}

export interface SecurityAnalysisResultNmkProps {
    result?: SecurityAnalysisNmkResult;
    columnDefs: ColDef<any>[];
    isLoadingResult: boolean;
    isFromContingency: boolean;
    paginationProps: TablePaginationProps;
}

export interface SecurityAnalysisNTableRow {
    subjectId?: string;
    locationId?: string;
    limit?: number;
    limitName?: string | null;
    limitType?: string;
    nextLimitName?: string | null;
    value?: number;
    loading?: number;
    patlLoading?: number;
    patlLimit?: number;
    acceptableDuration?: number | null;
    upcomingAcceptableDuration?: number | null;
    side?: string;
}

export interface SecurityAnalysisResultProps {
    rows: SecurityAnalysisNTableRow[] | SecurityAnalysisNmkTableRow[];
    columnDefs: ColDef[];
    isLoadingResult: boolean;
    agGridProps?: AgGridReactProps;
}
