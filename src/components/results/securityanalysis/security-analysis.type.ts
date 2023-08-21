/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ColDef } from 'ag-grid-community/dist/lib/entities/colDef';

export interface LimitViolation {
    subjectId: string;
    limitType: string;
    limit: number;
    value: number;
    loading: number | undefined;
}
export interface LimitViolationFromBack extends LimitViolation {
    limitReduction: number;
    limitName?: string;
    acceptableDuration?: number;
    side?: string;
}
export interface LimitViolationsResult {
    limitViolations: LimitViolationFromBack[];
}
export interface PreContingencyResult {
    status?: string;
    limitViolationsResult: LimitViolationsResult;
}
export interface Contingency {
    id: string;
}
export interface PostContingencyResult {
    contingency: Contingency;
    status: string;
    limitViolationsResult: LimitViolationsResult;
}
export interface PostContingencyResultProps {
    postContingencyResults: PostContingencyResult[];
    onClickNmKConstraint: (row: NmKConstraintRow, codDef?: ColDef) => void;
    nmkTypeResult: string;
}
export interface SecurityAnalysisResult {
    preContingencyResult: PreContingencyResult;
    postContingencyResults: any[];
}

export interface SecurityAnalysisResultProps {
    result: SecurityAnalysisResult;
    onClickNmKConstraint: (row: NmKConstraintRow, codDef?: ColDef) => void;
}
export interface SecurityAnalysisTabProps {
    studyUuid: string;
    nodeUuid: string;
    openVoltageLevelDiagram: (id: string) => void;
}

export interface NmKConstraintRow {
    subjectId: string;
    side: string;
}

export interface ResultContingencie {
    contingencyId?: string;
    computationStatus?: string;
    subjectId?: string;
    limitType?: string;
    limit?: number;
    value?: number;
    loading?: number | undefined;
    side?: string | undefined;
    linkedElementId?: string;
    violationCount?: number;
}

export interface ResultConstraint extends ResultContingencie {
    constraintId?: string;
    acceptableDuration?: number;
    limitName?: string | undefined;
}
