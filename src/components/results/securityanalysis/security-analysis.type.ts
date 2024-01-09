/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { AgGridReactProps } from 'ag-grid-react';
import { SortConfigType, SortPropsType } from '../../../hooks/use-aggrid-sort';
import {
    FilterEnumsType,
    FilterPropsType,
    FilterSelectorType,
} from '../../../hooks/use-aggrid-row-filter';
import { UUID } from 'crypto';
import { RESULT_TYPE } from './security-analysis-result-utils';

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

export type QueryParamsType = Record<
    string,
    string | number | SortConfigType | FilterSelectorType[]
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

export type SubjectIdRendererType = (
    cellData: ICellRendererParams
) => React.JSX.Element | undefined;

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
    studyUuid: UUID;
    nodeUuid: UUID;
    openVoltageLevelDiagram: (id: string) => void;
}

export interface SecurityAnalysisResultNProps {
    result?: PreContingencyResult[];
    isLoadingResult: boolean;
    sortProps: SortPropsType;
    filterProps: FilterPropsType;
    filterEnums: FilterEnumsType;
    studyUuid: UUID;
    nodeUuid: UUID;
    enumValueTranslations?: Record<string, string>;
}

export interface SecurityAnalysisResultNmkProps {
    result?: SecurityAnalysisNmkResult;
    isLoadingResult: boolean;
    isFromContingency: boolean;
    openVoltageLevelDiagram?: (voltageLevelId: string) => void;
    studyUuid?: string;
    nodeUuid?: string;
    paginationProps: PaginationProps;
    sortProps: SortPropsType;
    filterProps: FilterPropsType;
    filterEnums: FilterEnumsType;
    enumValueTranslations?: Record<string, string>;
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
    exportCsv?: () => void;
}
