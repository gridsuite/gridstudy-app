import {
    ConverterStationElementInfos,
} from '../components/dialogs/network-modifications/vsc/converter-station/converter-station-utils';

export interface VscModificationInfo {//FIXME: rename to VscInfo ?
    id: string;
    name: string;
    dcNominalVoltage: number;
    dcResistance: number;
    maximumActivePower: number;
    operatorActivePowerLimitFromSide1ToSide2: number;
    operatorActivePowerLimitFromSide2ToSide1: number;
    convertersMode: string; //TODO change to an enum ?
    activePower: number;
    angleDroopActivePowerControl: boolean;
    p0: number;
    droop: number;
    converterStation1: ConverterStationElementInfos;
    converterStation2: ConverterStationElementInfos;
}

