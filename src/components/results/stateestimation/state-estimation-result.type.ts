/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ColDef } from 'ag-grid-community';
import { UUID } from 'crypto';

export interface QualityCriterionResult {
    type: string;
    validity: number;
    value: number;
    threshold: number;
}

export interface QualityPerRegionResult {
    name: string;
    level: number;
}

export interface StateEstimationResult {
    resultUuid: UUID;
    writeTimeStamp: Date;
    status: string;
    qualityLevel: number;
    qualityCriterionResults: QualityCriterionResult[];
    qualityPerRegionResults: QualityPerRegionResult[];
}

export interface StateEstimationTabProps {
    studyUuid: UUID;
    nodeUuid: UUID;
    currentRootNetworkUuid: UUID;
}

export interface StateEstimationResultTableProps {
    isLoadingResult: boolean;
    columnDefs: ColDef<any>[];
    tableName: string;
}

export interface StateEstimationResultStatusProps {
    result: StateEstimationResult;
}

export interface StateEstimationResultProps extends StateEstimationResultTableProps, StateEstimationResultStatusProps {}
