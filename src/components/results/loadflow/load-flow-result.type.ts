import { UUID } from 'crypto';

export interface ComponentResult {
    componentResultUuid: UUID;
    connectedComponentNum: number;
    synchronousComponentNum: number;
    status: string;
    iterationCount: number;
    slackBusId: string;
    slackBusActivePowerMismatch: number;
    distributedActivePower: number;
}
export interface LoadFlowResult {
    resultUuid: UUID;
    writeTimeStamp: Date;
    componentResults: ComponentResult[];
}

export enum LimitTypes {
    HIGH_VOLTAGE = 'HIGH_VOLTAGE',
    LOW_VOLTAGE = 'LOW_VOLTAGE',
    CURRENT = 'CURRENT',
}
export interface LoadflowResultProps {
    result: LoadFlowResult;
    studyUuid: string;
    nodeUuid: string;
    tabIndex: number;
}

export interface OverloadedEquipment {
    overload: number;
    name: string;
    value: number;
    acceptableDuration: number | null;
    limit: number;
    limitName: string | null;
    side: string | undefined;
    limitType: string;
}
export interface OverloadedEquipmentFromBack {
    subjectId: string;
    limit: number;
    limitName: string | null;
    acceptableDuration: 300;
    value: number;
    side: 'ONE' | 'TWO' | '';
    limitType:
        | LimitTypes.LOW_VOLTAGE
        | LimitTypes.HIGH_VOLTAGE
        | LimitTypes.CURRENT;
}
