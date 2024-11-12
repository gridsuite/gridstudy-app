/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ConverterStationElementModificationInfos,
    ReactiveCapabilityCurvePointsData,
} from '../components/dialogs/network-modifications/vsc/converter-station/converter-station-utils';
import { UUID } from 'crypto';
import { Property } from '../components/dialogs/network-modifications/common/properties/property-utils';
import { MODIFICATION_TYPE } from '../components/utils/modification-type';
import {
    DataType,
    FieldValue,
} from '../components/dialogs/network-modifications/by-filter/by-assignment/assignment/assignment.type';
import { Filter } from '../components/dialogs/network-modifications/by-filter/commons/by-filter.type';

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
    voltageLevelId: string;
    busOrBusbarSectionId: string;
    busbarSectionName?: string;
    connectionDirection: string | null;
    connectionName?: string | null;
    connectionPosition?: string | null;
    terminalConnected?: boolean | null;
}

type AttributeModification<T> = { value: T; op: string };

export interface BatteryModificationInfo {
    studyUuid: string;
    nodeUuid: UUID;
    modificationUuid?: string;
    batteryId: string;
    name: string | null;
    voltageLevelId?: string;
    busOrBusbarSectionId?: string;
    connectionName?: string | null;
    connectionDirection?: string | null;
    connectionPosition?: string | null;
    terminalConnected?: boolean | null;
    minP: number | null;
    maxP: number | null;
    isReactiveCapabilityCurveOn?: boolean;
    minQ?: number | null;
    maxQ?: number | null;
    reactiveCapabilityCurve?: ReactiveCapabilityCurvePointsData | undefined;
    targetP: number;
    targetQ: number;
    participate: boolean;
    droop: number;
    isUpdate?: boolean;
    properties?: Property[];
}

export interface LoadModificationInfo {
    studyUuid: string;
    nodeUuid: UUID;
    modificationUuid?: string;
    id: string;
    name: string | null;
    loadType: string;
    voltageLevelId?: string;
    busOrBusbarSectionId?: string;
    connectionName?: string | null;
    connectionDirection?: string | null;
    connectionPosition?: string | null;
    terminalConnected?: boolean | null;
    p0: number;
    q0: number;
    isUpdate?: boolean;
    properties?: Property[];
}

export interface ShuntCompensatorModificationInfo {
    studyUuid: string;
    nodeUuid: UUID;
    shuntCompensatorId: string;
    shuntCompensatorName: string | null;
    maxSusceptance: number | null;
    maxQAtNominalV: number | null;
    shuntCompensatorType: string;
    voltageLevelId?: string;
    busOrBusbarSectionId?: string;
    sectionCount: number;
    maximumSectionCount: number;
    connectivity?: any;
    isUpdate?: boolean;
    modificationUuid?: string;
    connectionDirection?: string | null;
    connectionName?: string | null;
    connectionPosition?: string | null;
    terminalConnected?: boolean | null;
    properties?: Property[];
}

export interface GeneratorModificationInfo {
    studyUuid: string;
    nodeUuid: UUID;
    generatorId: string;
    name: string | null;
    energySource: string;
    minP: number;
    maxP: number;
    ratedS?: number | null;
    targetP: number | null;
    targetQ: number | null;
    voltageRegulation: boolean;
    targetV: number | null;
    qPercent: number | null;
    voltageLevelId?: string;
    busOrBusbarSectionId?: string;
    isUpdate?: boolean;
    modificationUuid?: string;
    plannedActivePowerSetPoint: number;
    marginalCost: number;
    plannedOutageRate: number;
    forcedOutageRate: number;
    directTransX: number;
    stepUpTransformerX: number;
    voltageRegulationType?: any;
    regulatingTerminalId: string | null;
    regulatingTerminalType: string | null;
    regulatingTerminalVlId: string | null;
    isReactiveCapabilityCurveOn?: boolean;
    participate: boolean;
    droop: number | null;
    maxQ?: number | null;
    minQ?: number | null;
    reactiveCapabilityCurve?: ReactiveCapabilityCurvePointsData[] | undefined;
    connectionDirection?: string | null;
    connectionName?: string | null;
    connectionPosition?: string | null;
    terminalConnected?: boolean | null;
    properties?: Property[];
}

export interface StaticVarCompensatorCreationInfo {
    studyUuid: string;
    nodeUuid: UUID;
    staticCompensatorId: string;
    staticCompensatorName: string | null | undefined;
    voltageLevelId: string;
    busOrBusbarSectionId?: string;
    connectionDirection?: string | null;
    connectionName?: string | null;
    connectionPosition?: string | null;
    terminalConnected?: boolean | null;
    maxSusceptance: number | null;
    minSusceptance: number | null;
    maxQAtNominalV: number | null;
    minQAtNominalV: number | null;
    regulationMode: string;
    voltageSetpoint: number;
    reactivePowerSetpoint: number;
    voltageRegulationType: string;
    regulatingTerminalId: string | null;
    regulatingTerminalType: string | null;
    regulatingTerminalVlId: string | null;
    standbyAutomatonOn: boolean;
    standby: boolean;
    lowVoltageSetpoint: number | null;
    highVoltageSetpoint: number | null;
    lowVoltageThreshold: number | null;
    highVoltageThreshold: number | null;
    b0: number | null;
    q0: number | null;
    isUpdate?: boolean;
    modificationUuid: string;
    properties?: Property[];
}

export interface TwoWindingsTransformerModificationInfo {
    studyUuid: string;
    nodeUuid: UUID;
    twoWindingsTransformerId: string;
    twoWindingsTransformerName: AttributeModification<string> | null;
    r: AttributeModification<number> | null;
    x: AttributeModification<number> | null;
    g: AttributeModification<number> | null;
    b: AttributeModification<number> | null;
    ratedS: AttributeModification<number> | null;
    ratedU1: AttributeModification<number> | null;
    ratedU2: AttributeModification<number> | null;
    currentLimit1?: CurrentLimits;
    currentLimit2?: CurrentLimits;
    voltageLevelId1?: string;
    busOrBusbarSectionId1?: string;
    voltageLevelId2?: string;
    busOrBusbarSectionId2?: string;
    ratioTapChanger: any;
    phaseTapChanger: any;
    isUpdate?: boolean;
    modificationUuid?: string;
    connectionName1?: string | null;
    connectionDirection1?: string | null;
    connectionName2?: string | null;
    connectionDirection2?: string | null;
    connectionPosition1?: string | null;
    connectionPosition2?: string | null;
    connected1?: boolean;
    connected2?: boolean;
    properties: Property[];
}

export interface TemporaryLimit {
    value: number | null;
    acceptableDuration: number | null;
    modificationType: string | null;
    selected: boolean;
    name: string;
}
export interface CurrentLimits {
    permanentLimit: number;
    temporaryLimits: TemporaryLimit[];
}

export interface SubstationModificationInfo {
    studyUuid: string;
    nodeUuid: UUID;
    modificationUuid?: UUID;
    id: string;
    name: string | null;
    country: string;
    properties?: Property[];
}

export interface VoltageLeveInfo {
    studyUuid: string;
    nodeUuid: UUID;
    voltageLevelId: string;
    voltageLevelName: string | null;
    substationId?: string | null;
    nominalV: number | null;
    lowVoltageLimit: number | null;
    highVoltageLimit: number | null;
    busbarCount?: number;
    sectionCount?: number;
    switchKinds?: any[];
    couplingDevices?: any[];
    isUpdate?: boolean;
    modificationUuid?: UUID;
    properties?: Property[];
}

export interface VoltageLeveCreationlInfo extends VoltageLeveInfo {
    ipMin: number | null;
    ipMax: number | null;
}
export interface VoltageLeveModificationInfo extends VoltageLeveInfo {
    lowShortCircuitCurrentLimit: number | null;
    highShortCircuitCurrentLimit: number | null;
}

export interface AttachmentLine {
    type: string;
    equipmentId: string;
    equipmentName: string | null;
    r: number;
    x: number;
    g1: number;
    b1: number;
    g2: number;
    b2: number;
    currentLimits1: CurrentLimits;
    currentLimits2: CurrentLimits;
}
type VariationFilter = {
    id: string;
    name: string;
    specificMetadata: { type: string };
};
export interface Variations {
    variationMode: string | null;
    variationValue: number | null;
    reactiveVariationMode: string | null;
    filters: VariationFilter[];
}

export interface VSCCreationConverterStation {
    type: MODIFICATION_TYPE;
    equipmentId: string;
    equipmentName: string | null;
    lossFactor: number;
    voltageSetpoint: number | null;
    reactivePowerSetpoint: number | null;
    voltageLevelId: string;
    busOrBusbarSectionId: string;
    connectionName: string | null;
    connectionDirection: string | null;
    connectionPosition: string | null;
    voltageRegulationOn: boolean;
    reactiveCapabilityCurve: boolean;
    minQ: number | null;
    maxQ: number | null;
    reactiveCapabilityCurvePoints: ReactiveCapabilityCurvePointsData[];
}

export interface VSCModificationConverterStation {
    voltageSetpoint: AttributeModification<number> | null;
    lossFactor: AttributeModification<number> | null;
    reactiveCapabilityCurve: AttributeModification<boolean> | null;
    busOrBusbarSectionId: AttributeModification<string> | null;
    type: MODIFICATION_TYPE;
    minQ: AttributeModification<number> | null;
    equipmentId: string;
    reactiveCapabilityCurvePoints:
        | {
              p: number | null;
              oldP: number | null;
              minQ: number | null;
              oldMinQ: number | null;
              maxQ: number | null;
              oldMaxQ: number | null;
          }[]
        | null;
    voltageLevelId: AttributeModification<string> | null;
    reactivePowerSetpoint: AttributeModification<number> | null;
    equipmentName: AttributeModification<string> | null;
    voltageRegulationOn: AttributeModification<boolean> | null;
    maxQ: AttributeModification<number> | null;
}

export interface Assignment {
    dataType: DataType | undefined;
    value: FieldValue | undefined;
    filters: Filter[];
    editedField: string;
    propertyName?: string | undefined;
}
