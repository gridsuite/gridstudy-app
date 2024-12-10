/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UUID } from 'crypto';

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
