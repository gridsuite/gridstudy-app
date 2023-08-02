/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UUID } from 'crypto';

export interface SCAResultFaultFault {
    id: string;
    elementId: string;
    faultType: string;
}

export interface SCAResultFaultLimitViolation {
    subjectId: string;
    limitType: string;
    limit: number;
    limitName: string;
    value: number;
}

export interface SCAResultFaultFeederResult {
    connectableId: string;
    current: number;
}

interface SCAShortCircuitLimits {
    ipMin: number;
    ipMax: number;
}

export interface SCAResultFault {
    fault: SCAResultFaultFault;
    current: number;
    shortCircuitPower: number;
    shortCircuitLimits: SCAShortCircuitLimits;
    limitViolations: SCAResultFaultLimitViolation[];
    feederResults: SCAResultFaultFeederResult[];
}

export interface ShortcircuitAnalysisResult {
    resultUuid: UUID;
    writeTimeStamp: Date;
    faults: SCAResultFault[];
}

export enum ShortcircuitAnalysisResultTabs {
    ALL_BUSES = 0,
    ONE_BUS = 1,
}

export enum ShortcircuitAnalysisType {
    ALL_BUSES = 0,
    ONE_BUS = 1,
}

export const getShortcircuitAnalysisTypeFromEnum = (
    type: ShortcircuitAnalysisType
) => {
    switch (type) {
        case ShortcircuitAnalysisType.ALL_BUSES:
            return 'ALL_BUSES';
        case ShortcircuitAnalysisType.ONE_BUS:
            return 'ONE_BUS';
        default:
            return null;
    }
};
