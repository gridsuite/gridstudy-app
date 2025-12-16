/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { GsLangUser } from '@gridsuite/commons-ui';
import type { UUID } from 'node:crypto';

export enum DistributionType {
    PROPORTIONAL = 'PROPORTIONAL',
    PROPORTIONAL_MAXP = 'PROPORTIONAL_MAXP',
    REGULAR = 'REGULAR',
    VENTILATION = 'VENTILATION',
}

export enum SensitivityType {
    DELTA_MW = 'DELTA_MW',
    DELTA_A = 'DELTA_A',
}

interface EquipmentsContainer {
    containerId: string;
    containerName: string;
}

interface SensitivityParamsCommon {
    contingencies?: EquipmentsContainer[];
    activated?: boolean | null;
}

export interface SensitivityInjectionsSet extends SensitivityParamsCommon {
    monitoredBranches?: EquipmentsContainer[];
    injections?: EquipmentsContainer[];
    distributionType?: DistributionType;
}

export interface SensitivityInjection extends SensitivityParamsCommon {
    monitoredBranches?: EquipmentsContainer[];
    injections?: EquipmentsContainer[];
}

export interface SensitivityHVDC extends SensitivityParamsCommon {
    monitoredBranches?: EquipmentsContainer[];
    sensitivityType?: SensitivityType;
    hvdcs?: EquipmentsContainer[];
}

export interface SensitivityPST extends SensitivityParamsCommon {
    monitoredBranches?: EquipmentsContainer[];
    sensitivityType?: SensitivityType;
    psts?: EquipmentsContainer[];
}

export interface SensitivityNodes extends SensitivityParamsCommon {
    monitoredVoltageLevels?: EquipmentsContainer[];
    equipmentsInVoltageRegulation?: EquipmentsContainer[];
}

export interface SensitivityAnalysisParametersInfos {
    provider: string;
    uuid?: UUID;
    date?: Date;
    name?: string;
    flowFlowSensitivityValueThreshold: number;
    angleFlowSensitivityValueThreshold: number;
    flowVoltageSensitivityValueThreshold: number;
    sensitivityInjectionsSet?: SensitivityInjectionsSet[];
    sensitivityInjection?: SensitivityInjection[];
    sensitivityHVDC?: SensitivityHVDC[];
    sensitivityPST?: SensitivityPST[];
    sensitivityNodes?: SensitivityNodes[];
}

export type SensitivityAnalysisFactorsCountParameters = {
    injections?: string[];
    monitoredBranches?: string[];
    contingencies?: string[];
    hvdcs?: string[];
    psts?: string[];
};

// result types
export type SelectorFilterOptions = {
    tabSelection: string;
    functionType: string;
};
export type CsvConfig = {
    csvHeaders: string[];
    resultTab: string;
    sensitivityFunctionType?: string;
    language: GsLangUser;
};
export type SensitivityOfTo = {
    type: 'SensitivityOfTo' | 'SensitivityWithContingency'; // discrimination field
    funcId: string;
    varId: string;
    varIsAFilter: boolean;
    value: number;
    functionReference: number;
};
export type SensitivityWithContingency = SensitivityOfTo & {
    contingencyId: string;
    valueAfter: number;
    functionReferenceAfter: number;
};
export type Sensitivity = SensitivityOfTo | SensitivityWithContingency;
export type SensitivityResult = {
    resultTab: string; // should be enum ResultTab
    functionType: string; // should be enum SensitivityFunctionType
    requestedChunkSize: number;
    chunkOffset: number;
    totalSensitivitiesCount: number;
    filteredSensitivitiesCount: number;
    sensitivities: Sensitivity[];
};
export type SensitivityResultFilterOptions = {
    allContingencyIds?: string[];
    allFunctionIds?: string[];
    allVariableIds?: string[];
};
