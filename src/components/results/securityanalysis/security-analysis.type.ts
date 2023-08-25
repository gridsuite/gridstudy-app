/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ColDef } from 'ag-grid-community/dist/lib/entities/colDef';
import {
    ICellRendererParams,
    ITooltipParams,
    ValueFormatterParams,
} from 'ag-grid-community';
import { FunctionComponent } from 'react';

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
export interface LimitViolationsResultFromBack {
    limitViolations: LimitViolationFromBack[];
}
export interface PreContingencyResult {
    status?: string;
    limitViolationsResult?: LimitViolationsResultFromBack;
}
export interface Contingency {
    id: string;
    elements: { id: string }[];
}
export interface PostContingencyResult {
    contingency: Contingency;
    status: string;
    limitViolationsResult: LimitViolationsResultFromBack;
}
export interface SecurityAnalysisResultTableNmKProps {
    postContingencyResults?: PostContingencyResult[];
    onClickNmKConstraint: (row: NmKConstraintRow, codDef?: ColDef) => void;
    nmkTypeResult: string;
}
export interface SecurityAnalysisResult {
    preContingencyResult: PreContingencyResult;
    postContingencyResults: PostContingencyResult[];
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
    contingencyEquipmentsIds?: string[];
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

export interface SecurityAnalysisColumnDefinition {
    headerName?: string;
    field: string;
    filter?: string;
    valueFormatter?: (value: ValueFormatterParams) => any;
    cellRenderer?: (
        cellData: ICellRendererParams
    ) => React.JSX.Element | undefined;
    tooltipComponent?: FunctionComponent<ITooltipParams>;
    tooltipValueGetter?: (
        params: ITooltipParams
    ) => { title: null; values: string | undefined } | null;
    hide?: boolean;
}
