import { ConverterStationElementModificationInfos } from '../components/dialogs/network-modifications/vsc/converter-station/converter-station-utils';

export interface HvdcAngleDroopActivePowerControlInfo {
    isEnabled: boolean;
    droop: number;
    p0: number;
}

export interface hvdcOperatorActivePowerRange {
    oprFromCS1toCS2: number;
    oprFromCS2toCS1: number;
}
export interface VscModificationInfo {
    id: string;
    name: string;
    nominalV: number;
    r: number;
    maxP: number;
    hvdcOperatorActivePowerRange: hvdcOperatorActivePowerRange;
    convertersMode: string;
    activePowerSetpoint: number;
    hvdcAngleDroopActivePowerControl: HvdcAngleDroopActivePowerControlInfo;
    converterStation1: ConverterStationElementModificationInfos;
    converterStation2: ConverterStationElementModificationInfos;
}
