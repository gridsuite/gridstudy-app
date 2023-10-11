/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ColDef } from 'ag-grid-community';
import { AgGridReactProps } from 'ag-grid-react';

export interface LimitViolationBase {
    limit: number;
    limitType?: string;
    loading?: number | undefined;
    subjectId?: string;
    value: number;
}

export interface LimitViolation extends LimitViolationBase {
    limitReduction: number;
    side?: string;
}

export interface PreContingencyResult {
    limitViolationsResult?: {
        limitViolations?: LimitViolation[];
    };
}

interface Element {
    elementType?: string;
    id?: string;
}

export interface Contingency extends LimitViolationBase {
    acceptableDuration?: number;
    computationStatus?: string;
    contingencyId?: string;
    elements?: Element[];
    limitName?: string | null;
    side?: string | undefined;
}

export interface Constraint extends LimitViolationBase {
    acceptableDuration?: number;
    limitName?: string | null;
    side?: string | undefined;
}

export interface ContingenciesFromConstraintItem {
    constraintId?: string;
    contingencies?: Contingency[];
}

export interface ConstraintsFromContingencyItem {
    id?: string;
    status?: string;
    elements?: Element[];
    constraints?: Constraint[];
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

export interface SecurityAnalysisNTableRow extends LimitViolationBase {}

export interface SecurityAnalysisNmkTableRow extends LimitViolationBase {
    side?: string | undefined;
    linkedElementId?: string;
    contingencyId?: string;
    contingencyEquipmentsIds?: (string | undefined)[];
    computationStatus?: string;
    violationCount?: number;
}

export interface SecurityAnalysisResultProps {
    rows: SecurityAnalysisNTableRow[] | SecurityAnalysisNmkTableRow[];
    columnDefs: ColDef[];
    isLoadingResult: boolean;
    agGridProps?: AgGridReactProps;
}
