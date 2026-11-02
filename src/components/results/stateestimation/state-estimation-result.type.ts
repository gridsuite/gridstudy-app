/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ColDef, GridReadyEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import type { UUID } from 'node:crypto';
import { Key, RefObject } from 'react';

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

export enum MeasurementType {
    UNKNOWN = 'UNKNOWN',
    TENSION = 'TENSION',
    TRANS_ACT_OR = 'TRANS_ACT_OR',
    TRANS_ACT_EX = 'TRANS_ACT_EX',
    TRANS_REA_OR = 'TRANS_REA_OR',
    TRANS_REA_EX = 'TRANS_REA_EX',
    INJ_ACT = 'INJ_ACT',
    INJ_REA = 'INJ_REA',
    PUISS_HVDC = 'PUISS_HVDC',
}

export enum ValidityType {
    UNKNOWN = 'UNKNOWN',
    REDONDANTE = 'REDONDANTE',
    CRITIQUE = 'CRITIQUE',
    INV_OBS = 'INV_OBS',
    INV_VERR = 'INV_VERR',
    INV_PIV_NUL = 'INV_PIV_NUL',
    INV_ERR = 'INV_ERR',
    INV = 'INV',
}

export interface MeasurementInformationResultDto {
    equipmentId: string;
    measurementType: string;
    validityType: string;
    currentValue: number;
    estimatedValue: number;
    differenceValue: number;
    outOfBound: boolean;
}

export interface MeasurementInformationResult {
    equipmentId: string;
    measurementType: MeasurementType;
    validityType: ValidityType;
    currentValue: number;
    estimatedValue: number;
    differenceValue: number;
    outOfBound: boolean;
}

export interface StateEstimationResult {
    resultUuid: UUID;
    writeTimeStamp: Date;
    status: string;
    qualityLevel: number;
    measurementInformationResults: MeasurementInformationResult[];
    qualityCriterionResults: QualityCriterionResult[];
    qualityPerRegionResults: QualityPerRegionResult[];
}

export interface StateEstimationTabProps {
    studyUuid: UUID;
    nodeUuid: UUID;
    currentRootNetworkUuid: UUID;
}

export interface StateEstimationResultTableProps extends Partial<StateEstimationStatusResultProps> {
    // When defined, the measurement table shows exactly these rows and never the ones embedded in `result`
    measurementRows?: MeasurementInformationResult[];
    isLoadingResult: boolean;
    columnDefs: ColDef<any>[];
    tableName: string;
    exportCsvResetKey: Key;
    filter?: boolean;
    sortable?: boolean;
    // to access the grid from outside the table (e.g. to count the displayed rows)
    gridRef?: RefObject<AgGridReact | null>;
    onGridReady?: (params: GridReadyEvent) => void;
}

export interface StateEstimationStatusResultProps {
    result: StateEstimationResult;
}
