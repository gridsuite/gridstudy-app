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
import { Page } from '../common/utils';

export enum RESULT_TYPE {
    N = 'N',
    NMK_LIMIT_VIOLATIONS = 'NMK_LIMIT_VIOLATIONS',
    NMK_CONTINGENCIES = 'NMK_CONTINGENCIES',
    NMK_POWER_CUT_OFF = 'NMK_POWER_CUT_OFF',
}
export enum NMK_TYPE {
    CONSTRAINTS_FROM_CONTINGENCIES = 'constraints-from-contingencies',
    CONTINGENCIES_FROM_CONSTRAINTS = 'contingencies-from-constraints',
    POWER_CUT_OFF_FROM_CONTINGENCIES = 'power-cut-off-from-contingencies',
}
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

export interface ConnectivityResult {
    disconnectedLoadActivePower: number;
    disconnectedGenerationActivePower: number;
}

export interface ContingencyItem {
    status?: string;
    contingencyId?: string;
    elements?: Element[];
    connectivityResult?: ConnectivityResult;
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
    disconnectedLoadActivePower?: number;
    disconnectedGenerationActivePower?: number;
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

export interface PowerCutOffFromContingencyItem {
    status?: string;
    contingencyId?: string;
    connectivityResult?: ConnectivityResult;
}

export interface PreContingencyResult {
    subjectId?: string;
    status: string;
    limitViolation?: LimitViolation;
}

export type SecurityAnalysisQueryParams = {
    resultType: RESULT_TYPE;
    globalFilters?: GlobalFilters;
    filters?: FilterConfig[];
    sort?: SortConfig[];
    page?: number;
    size?: number;
};

export type SubjectIdRendererType = (cellData: ICellRendererParams) => React.JSX.Element | undefined;

export type SecurityAnalysisNmkResult = Page<
    ContingenciesFromConstraintItem[] | ConstraintsFromContingencyItem[] | PowerCutOffFromContingencyItem[] | null
>;

// Components props interfaces
export interface SecurityAnalysisTabProps {
    studyUuid: UUID;
    nodeUuid: UUID;
    currentRootNetworkUuid: UUID;
}

export interface SecurityAnalysisResultNProps {
    result?: PreContingencyResult[];
    isLoadingResult: boolean;
    columnDefs: ColDef<any>[];
    computationSubType: string;
}

export interface SecurityAnalysisResultNmkProps {
    result?: SecurityAnalysisNmkResult;
    columnDefs: ColDef<any>[];
    isLoadingResult: boolean;
    nmkType: NMK_TYPE;
    paginationProps: TablePaginationProps;
    computationSubType: string;
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
    rows: SecurityAnalysisNTableRow[] | SecurityAnalysisNmkTableRow[] | undefined;
    columnDefs: ColDef[];
    isLoadingResult: boolean;
    agGridProps?: AgGridReactProps;
    computationSubType: string;
}
