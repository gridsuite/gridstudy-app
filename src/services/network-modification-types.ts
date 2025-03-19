/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UUID } from 'crypto';
import { Property } from '../components/dialogs/network-modifications/common/properties/property-utils';
import {
    DataType,
    FieldValue,
} from '../components/dialogs/network-modifications/by-filter/by-assignment/assignment/assignment.type';
import { Filter } from '../components/dialogs/network-modifications/by-filter/commons/by-filter.type';
import { ShuntCompensatorInfos } from '../components/dialogs/network-modifications/hvdc-line/lcc/creation/lcc-creation.type';
import {
    AttributeModification,
    ConverterStationElementModificationInfos,
} from '../components/dialogs/network-modifications/hvdc-line/vsc/converter-station/converter-station-type';
import { ReactiveCapabilityCurvePoints } from '../components/dialogs/reactive-limits/reactive-limits.type';

export interface HvdcAngleDroopActivePowerControlInfo {
    isEnabled: boolean;
    droop: number;
    p0: number;
}

export interface HvdcOperatorActivePowerRange {
    oprFromCS1toCS2: number;
    oprFromCS2toCS1: number;
}

export interface VscModificationInfo {
    id: string;
    name: string;
    nominalV: number;
    r: number;
    maxP: number;
    hvdcOperatorActivePowerRange: HvdcOperatorActivePowerRange;
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
    reactiveCapabilityCurve?: ReactiveCapabilityCurvePoints[] | null;
    targetP: number;
    targetQ: number;
    participate: boolean;
    droop: number;
    isUpdate?: boolean;
    properties?: Property[];
}

export interface LoadCreationInfo {
    studyUuid: string;
    nodeUuid: UUID;
    id: string;
    name?: string | null;
    loadType: string;
    p0: number;
    q0: number;
    voltageLevelId?: string;
    busOrBusbarSectionId?: string;
    isUpdate: boolean;
    modificationUuid?: string;
    connectionDirection: string | null;
    connectionName?: string | null;
    connectionPosition?: number | null;
    terminalConnected?: boolean;
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
    reactiveCapabilityCurve?: ReactiveCapabilityCurvePoints[] | null;
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
    staticCompensatorName?: string | null;
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
    modificationUuid?: string;
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
    ratioTapChanger: Record<string, any> | null;
    phaseTapChanger: Record<string, any> | null;
    connectionName1?: string | null;
    connectionDirection1?: string | null;
    connectionName2?: string | null;
    connectionDirection2?: string | null;
    connectionPosition1?: string | null;
    connectionPosition2?: string | null;
    connected1?: boolean;
    connected2?: boolean;
    properties: Property[];
    p1MeasurementValue: number | null;
    p1MeasurementValidity: boolean | null;
    q1MeasurementValue: number | null;
    q1MeasurementValidity: boolean | null;
    p2MeasurementValue: number | null;
    p2MeasurementValidity: boolean | null;
    q2MeasurementValue: number | null;
    q2MeasurementValidity: boolean | null;
    ratioTapChangerToBeEstimated: boolean | null;
    phaseTapChangerToBeEstimated: boolean | null;
}

export interface OperationalLimitsGroup {
    id: string;
    currentLimits: CurrentLimits;
}

export interface Limit {
    name: string;
    acceptableDuration: number | null;
    value: number | null;
}

export interface TemporaryLimit extends Limit {
    modificationType: string | null;
    selected?: boolean;
}

export interface CurrentLimits {
    id?: string;
    permanentLimit: number | null;
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
    substationCreation?: SubstationCreationInfo | null;
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
    type: string;
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
    reactiveCapabilityCurvePoints: ReactiveCapabilityCurvePoints[] | null;
}

export interface LCCCreationConverterStation {
    type: string;
    equipmentId: string;
    equipmentName?: string;
    lossFactor: number;
    powerFactor: number;
    voltageLevelId?: string;
    busOrBusbarSectionId?: string;
    connectionName?: string | null;
    connectionDirection: string;
    connectionPosition?: number;
    terminalConnected?: boolean;
    shuntCompensatorsOnSide: ShuntCompensatorInfos[];
}

export interface VSCModificationConverterStation {
    voltageSetpoint: AttributeModification<number> | null;
    lossFactor: AttributeModification<number> | null;
    reactiveCapabilityCurve: AttributeModification<boolean> | null;
    busOrBusbarSectionId: AttributeModification<string> | null;
    type: string;
    minQ: AttributeModification<number> | null;
    equipmentId: string;
    reactiveCapabilityCurvePoints: ReactiveCapabilityCurvePoints[] | null;
    voltageLevelId: AttributeModification<string> | null;
    reactivePowerSetpoint: AttributeModification<number> | null;
    equipmentName: AttributeModification<string> | null;
    voltageRegulationOn: AttributeModification<boolean> | null;
    maxQ: AttributeModification<number> | null;
}

export interface Assignment {
    dataType?: DataType;
    value?: FieldValue;
    filters: Filter[];
    editedField: string;
    propertyName?: string;
}

export interface BatteryCreationInfo {
    studyUuid: string;
    nodeUuid: UUID;
    id: string;
    name: string | null;
    voltageLevelId: string;
    busOrBusbarSectionId: string;
    connectionName: string | null;
    connectionDirection: string | null;
    connectionPosition: string | null;
    terminalConnected: boolean | null;
    minP: number | null;
    maxP: number | null;
    isReactiveCapabilityCurveOn: boolean;
    minQ: number | null;
    maxQ: number | null;
    reactiveCapabilityCurve?: ReactiveCapabilityCurvePoints[] | null;
    targetP: number;
    targetQ: number;
    participate: boolean;
    droop: number;
    isUpdate: boolean;
    modificationUuid: string;
    properties?: Property[];
}

export interface GeneratorCreationInfo {
    studyUuid: string;
    nodeUuid: UUID;
    id: string;
    name: string | null;
    energySource: string;
    minP: number;
    maxP: number;
    ratedS: number | null;
    targetP: number | null;
    targetQ: number | null;
    voltageRegulationOn: boolean;
    targetV: number | null;
    qPercent: number | null;
    voltageLevelId: string;
    busOrBusbarSectionId: string;
    isUpdate: boolean;
    modificationUuid: string;
    plannedActivePowerSetPoint: number;
    marginalCost: number;
    plannedOutageRate: number;
    forcedOutageRate: number;
    directTransX: number;
    stepUpTransformerX: number;
    regulatingTerminalId: string | null;
    regulatingTerminalType: string | null;
    regulatingTerminalVlId: string | null;
    isReactiveCapabilityCurveOn: boolean;
    participate: boolean;
    droop: number | null;
    maxQ: number | null;
    minQ: number | null;
    reactiveCapabilityCurve?: ReactiveCapabilityCurvePoints[] | null;
    connectionDirection: string | null;
    connectionName: string | null;
    connectionPosition: string | null;
    terminalConnected: boolean | null;
    properties?: Property[];
}

export interface ShuntCompensatorCreationInfo {
    studyUuid: string;
    nodeUuid: UUID;
    shuntCompensatorId: string;
    shuntCompensatorName: string | null;
    maxSusceptance: number | null;
    maxQAtNominalV: number | null;
    shuntCompensatorType: string;
    sectionCount: number;
    maximumSectionCount: number;
    connectivity: any;
    isUpdate: boolean;
    modificationUuid: string;
    connectionDirection: string | null;
    connectionName: string | null;
    connectionPosition: string | null;
    terminalConnected: boolean | null;
    properties?: Property[];
}

export interface LineCreationInfo {
    studyUuid: string;
    nodeUuid: UUID;
    lineId: string;
    lineName: string | null;
    r: number;
    x: number;
    g1: number;
    b1: number;
    g2: number;
    b2: number;
    voltageLevelId1: string;
    busOrBusbarSectionId1: string;
    voltageLevelId2: string;
    busOrBusbarSectionId2: string;
    permanentCurrentLimit1: number;
    permanentCurrentLimit2: number;
    limitsGroups1: OperationalLimitsGroup[];
    limitsGroups2: OperationalLimitsGroup[];
    selectedLimitsGroup1: string;
    selectedLimitsGroup2: string;
    isUpdate: boolean;
    modificationUuid: string;
    connectionName1: string | null;
    connectionDirection1: string | null;
    connectionName2: string | null;
    connectionDirection2: string | null;
    connectionPosition1: string | null;
    connectionPosition2: string | null;
    connected1: boolean;
    connected2: boolean;
    properties?: Property[];
}

export interface LineModificationInfo {
    studyUuid: string;
    nodeUuid: UUID;
    modificationUuid: string;
    lineId: string;
    lineName: string | null;
    r: number;
    x: number;
    g1: number;
    b1: number;
    g2: number;
    b2: number;
    currentLimit1: CurrentLimits;
    currentLimit2: CurrentLimits;
    voltageLevelId1: string;
    busOrBusbarSectionId1: string;
    voltageLevelId2: string;
    busOrBusbarSectionId2: string;
    connectionName1: string | null;
    connectionName2: string | null;
    connectionDirection1: string | null;
    connectionDirection2: string | null;
    connectionPosition1: string | null;
    connectionPosition2: string | null;
    connected1: boolean;
    connected2: boolean;
    properties?: Property[];
    p1MeasurementValue: number | null;
    p1MeasurementValidity: boolean | null;
    q1MeasurementValue: number | null;
    q1MeasurementValidity: boolean | null;
    p2MeasurementValue: number | null;
    p2MeasurementValidity: boolean | null;
    q2MeasurementValue: number | null;
    q2MeasurementValidity: boolean | null;
}

export interface TwoWindingsTransformerCreationInfo {
    studyUuid: string;
    nodeUuid: UUID;
    isUpdate: boolean;
    modificationUuid: string;
    twoWindingsTransformerId: string;
    twoWindingsTransformerName: string | null;
    r: number;
    x: number;
    g: number;
    b: number;
    ratedS: number | null;
    ratedU1: number;
    ratedU2: number;
    limitsGroups1: OperationalLimitsGroup[];
    limitsGroups2: OperationalLimitsGroup[];
    selectedLimitsGroup1: string;
    selectedLimitsGroup2: string;
    voltageLevelId1: string;
    busOrBusbarSectionId1: string;
    voltageLevelId2: string;
    busOrBusbarSectionId2: string;
    ratioTapChanger: any;
    phaseTapChanger: any;
    connectionName1: string | null;
    connectionDirection1: string | null;
    connectionName2: string | null;
    connectionDirection2: string | null;
    connectionPosition1: string | null;
    connectionPosition2: string | null;
    connected1: boolean;
    connected2: boolean;
    properties?: Property[];
}

export interface SubstationCreationInfo {
    studyUuid: string;
    nodeUuid: UUID;
    substationId: string;
    substationName: string | null;
    country: string;
    isUpdate: boolean;
    modificationUuid: UUID;
    properties?: Property[];
}

export interface DivideLineInfo {
    studyUuid: string;
    nodeUuid: UUID;
    modificationUuid: UUID;
    lineToSplitId: string;
    percent: number;
    mayNewVoltageLevelInfos: any;
    existingVoltageLevelId: string;
    bbsOrBusId: string;
    newLine1Id: string;
    newLine1Name: string | null;
    newLine2Id: string;
    newLine2Name: string | null;
}

export interface AttachLineInfo {
    studyUuid: string;
    nodeUuid: UUID;
    modificationUuid: UUID;
    lineToAttachToId: string;
    percent: number;
    attachmentPointId: string;
    attachmentPointName: string | null;
    mayNewVoltageLevelInfos: any;
    existingVoltageLevelId: string;
    bbsOrBusId: string;
    attachmentLine: AttachmentLine;
    newLine1Id: string;
    newLine1Name: string | null;
    newLine2Id: string;
    newLine2Name: string | null;
}

export interface LinesAttachToSplitLinesInfo {
    studyUuid: string;
    nodeUuid: UUID;
    modificationUuid: UUID;
    lineToAttachTo1Id: string;
    lineToAttachTo2Id: string;
    attachedLineId: string;
    voltageLevelId: string;
    bbsBusId: string;
    replacingLine1Id: string;
    replacingLine1Name: string | null;
    replacingLine2Id: string;
    replacingLine2Name: string | null;
}

export interface DeleteAttachingLineInfo {
    studyUuid: string;
    nodeUuid: UUID;
    modificationUuid: UUID;
    lineToAttachTo1Id: string;
    lineToAttachTo2Id: string;
    attachedLineId: string;
    replacingLine1Id: string;
    replacingLine1Name: string | null;
}

export interface VSCCreationInfo {
    studyUuid: string;
    nodeUuid: UUID;
    id: string;
    name: string | null;
    nominalV: number;
    r: number;
    maxP: number;
    operatorActivePowerLimitSide1: any;
    operatorActivePowerLimitSide2: any;
    convertersMode: string;
    activePowerSetpoint: number;
    angleDroopActivePowerControl: boolean;
    p0: number | null;
    droop: number | null;
    converterStation1: VSCCreationConverterStation;
    converterStation2: VSCCreationConverterStation;
    properties?: Property[];
    isUpdate: boolean;
    modificationUuid: UUID;
}

export interface LCCCreationInfo {
    studyUuid: string;
    nodeUuid: UUID;
    id: string;
    name?: string | null;
    nominalV: number;
    r: number;
    maxP: number;
    convertersMode: string;
    activePowerSetpoint: number;
    converterStation1: LCCCreationConverterStation;
    converterStation2: LCCCreationConverterStation;
    properties?: Property[];
    isUpdate: boolean;
    modificationUuid?: string;
}

export interface VSCModificationInfo {
    studyUuid: string;
    nodeUuid: UUID;
    id: string | null;
    name?: string | null;
    nominalV: number;
    r: number;
    maxP: number;
    operatorActivePowerLimitSide1: any;
    operatorActivePowerLimitSide2: any;
    convertersMode: string;
    activePowerSetpoint: number;
    angleDroopActivePowerControl: boolean;
    p0: number | null;
    droop: number | null;
    converterStation1: VSCModificationConverterStation;
    converterStation2: VSCModificationConverterStation;
    properties?: Property[];
    isUpdate: boolean;
    modificationUuid: UUID;
}

export interface GenerationDispatchInfo {
    studyUuid: UUID;
    nodeUuid: UUID;
    modificationUuid?: UUID;
    lossCoefficient: number;
    defaultOutageRate: number;
    generatorsWithoutOutage: any;
    generatorsWithFixedActivePower: any;
    generatorsFrequencyReserve: any;
    substationsGeneratorsOrdering: any;
}
