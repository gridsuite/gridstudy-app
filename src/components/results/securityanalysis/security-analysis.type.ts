/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ColDef } from 'ag-grid-community';
import { AgGridReactProps } from 'ag-grid-react';

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
    computationStatus?: string;
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
    computationStatus?: string;
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

export type SecurityAnalysisResultType =
    | PreContingencyResult
    | ContingenciesFromConstraintItem[]
    | ConstraintsFromContingencyItem[]
    | null;

// Components props interfaces
export interface SecurityAnalysisTabProps {
    studyUuid: string;
    nodeUuid: string;
    openVoltageLevelDiagram: (id: string) => void;
}

export interface SecurityAnalysisResultNProps {
    result: SecurityAnalysisResultType;
    isLoadingResult: boolean;
}

export interface SecurityAnalysisResultNmkProps
    extends SecurityAnalysisResultNProps {
    isFromContingency: boolean;
    openVoltageLevelDiagram?: (voltageLevelId: string) => void;
    studyUuid?: string;
    nodeUuid?: string;
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
