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

export interface SCAResultFault {
    fault: SCAResultFaultFault;
    current: number;
    shortCircuitPower: number;
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
            return 'AllBuses';
        case ShortcircuitAnalysisType.ONE_BUS:
            return 'OneBus';
        default:
            return null;
    }
};
