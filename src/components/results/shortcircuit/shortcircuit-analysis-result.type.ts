/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Page } from '../common/utils';

export interface SCAFault {
    id: string;
    elementId: string;
    voltageLevelId: string;
    faultType: string;
}

export interface SCALimitViolation {
    subjectId: string;
    limitType: string;
    limit: number;
    limitName: string;
    value: number;
}

export interface SCAFeederResult {
    connectableId: string;
    current: number;
    positiveMagnitude: number;
    side: string;
}

interface SCAShortCircuitLimits {
    ipMin: number;
    ipMax: number;
    deltaCurrentIpMax: number | null;
    deltaCurrentIpMin: number | null;
}

export interface SCAFaultResult {
    fault: SCAFault;
    current: number;
    positiveMagnitude: number;
    shortCircuitPower: number;
    shortCircuitLimits: SCAShortCircuitLimits;
    limitViolations?: SCALimitViolation[];
    feederResults?: SCAFeederResult[];
}

export type SCAResult = {
    resultUuid: string;
    writeTimeStamp: any;
    faults: SCAFaultResult[];
};

export type SCAPagedResults = Page<SCAFaultResult> | Page<SCAFeederResult>;

export enum ShortCircuitAnalysisResultTabs {
    ALL_BUSES = 0,
    ONE_BUS = 1,
}

export enum ShortCircuitAnalysisType {
    ALL_BUSES = 0,
    ONE_BUS = 1,
}

export const getShortCircuitAnalysisTypeFromEnum = (type: ShortCircuitAnalysisType) => {
    switch (type) {
        case ShortCircuitAnalysisType.ALL_BUSES:
            return 'ALL_BUSES';
        case ShortCircuitAnalysisType.ONE_BUS:
            return 'ONE_BUS';
        default:
            return null;
    }
};
