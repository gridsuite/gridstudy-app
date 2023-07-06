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
