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
    GLOBAL = 0,
    SELECTIVE = 1,
}

export enum ShortcircuitAnalysisType {
    GLOBAL = 0,
    SELECTIVE = 1,
}

export const getShortcircuitAnalysisTypeFromEnum = (
    type: ShortcircuitAnalysisType
) => {
    switch (type) {
        case ShortcircuitAnalysisType.GLOBAL:
            return 'Global';
        case ShortcircuitAnalysisType.SELECTIVE:
            return 'Selective';
        default:
            return null;
    }
};
