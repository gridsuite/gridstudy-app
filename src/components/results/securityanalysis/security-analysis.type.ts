/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import { ColDef, GridReadyEvent, ICellRendererParams } from 'ag-grid-community';
import type { UUID } from 'node:crypto';
import { FilterConfig, SortConfig } from '../../../types/custom-aggrid-types';
import { GlobalFilters } from '../common/global-filter/global-filter-types';
import { RunningStatusMessage } from '../../utils/aggrid-rows-handler';
import RunningStatus from '../../utils/running-status';
import { LimitViolation } from '@gridsuite/commons-ui';

export interface PreContingencyResult {
    subjectId?: string;
    status: string;
    limitViolation?: LimitViolation;
}

export enum RESULT_TYPE {
    N = 'N',
    NMK_LIMIT_VIOLATIONS = 'NMK_LIMIT_VIOLATIONS',
    NMK_CONTINGENCIES = 'NMK_CONTINGENCIES',
    NMK_CUT_OFF_POWER = 'NMK_CUT_OFF_POWER',
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

// Components props interfaces
export interface SecurityAnalysisTabProps {
    studyUuid: UUID;
    nodeUuid: UUID;
    currentRootNetworkUuid: UUID;
}

export interface SecurityAnalysisResultNProps {
    result?: PreContingencyResult[];
    isLoadingResult: boolean;
    columnDefs: ColDef[];
    resultStatusMessages: RunningStatusMessage;
    securityAnalysisStatus: RunningStatus;
    onGridReady: (params: GridReadyEvent) => void;
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
