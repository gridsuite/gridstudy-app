import { ColDef } from 'ag-grid-community/dist/lib/entities/colDef';
import { IRowNode } from 'ag-grid-community';

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
