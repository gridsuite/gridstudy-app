/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { Property } from '../components/dialogs/network-modifications/common/properties/property-utils';
import {
    DataType,
    FieldValue,
} from '../components/dialogs/network-modifications/by-filter/by-assignment/assignment/assignment.type';
import { Filter } from '../components/dialogs/network-modifications/by-filter/commons/by-filter.type';
import { ConverterStationElementModificationInfos } from '../components/dialogs/network-modifications/hvdc-line/vsc/converter-station/converter-station-type';
import { ReactiveCapabilityCurvePoints } from '../components/dialogs/reactive-limits/reactive-limits.type';
import { ModificationType, Option } from '@gridsuite/commons-ui';
import { ENABLE_OLG_MODIFICATION } from '../components/utils/field-constants';
import { VARIATION_TYPES } from '../components/network/constants';
import { OperationalLimitsGroupFormSchema } from '../components/dialogs/limits/operational-limits-groups-types';

export enum OperationType {
    SET = 'SET',
    UNSET = 'UNSET',
}

export type AttributeModification<T> = {
    value?: T;
    op: OperationType;
};

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
    connectionDirection: string | null;
    connectionName?: string | null;
    connectionPosition?: string | null;
    terminalConnected?: boolean | null;
}

export interface BatteryModificationInfos {
    type: string;
    uuid: string | null;
    equipmentId: string;
    equipmentName: AttributeModification<string> | null;
    maxP: AttributeModification<number> | null;
    minP: AttributeModification<number> | null;
    targetP: AttributeModification<number> | null;
    targetQ: AttributeModification<number> | null;
    participate: AttributeModification<boolean> | null;
    droop: AttributeModification<number> | null;
    reactiveCapabilityCurve: AttributeModification<boolean> | null;
    minQ: AttributeModification<number> | null;
    maxQ: AttributeModification<number> | null;
    reactiveCapabilityCurvePoints: ReactiveCapabilityCurvePoints[] | null;
    voltageLevelId: AttributeModification<string> | null;
    busOrBusbarSectionId: AttributeModification<string> | null;
    connectionDirection: AttributeModification<string> | null;
    connectionName: AttributeModification<string> | null;
    connectionPosition: AttributeModification<number> | null;
    terminalConnected: AttributeModification<boolean> | null;
    properties: Property[] | null;
    directTransX: AttributeModification<number> | null;
    stepUpTransformerX: AttributeModification<number> | null;
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
    properties?: Property[] | null;
}

export interface LoadModificationInfo {
    studyUuid: string;
    nodeUuid: UUID;
    modificationUuid?: string;
    id: string | null;
    name?: string | null;
    loadType?: string | null;
    voltageLevelId?: string;
    busOrBusbarSectionId?: string;
    connectionName?: string | null;
    connectionDirection?: string | null;
    connectionPosition?: number | null;
    terminalConnected?: boolean | null;
    p0?: number | null;
    q0?: number | null;
    pMeasurementValue?: number;
    pMeasurementValidity?: boolean;
    qMeasurementValue?: number;
    qMeasurementValidity?: boolean;
    isUpdate?: boolean;
    properties: Property[] | null;
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
    properties: Property[] | null;
}

export interface GeneratorModificationInfos {
    type: string;
    uuid: string | null;
    equipmentId: string;
    equipmentName: AttributeModification<string> | null;
    energySource?: AttributeModification<string> | null;
    maxP: AttributeModification<number> | null;
    minP: AttributeModification<number> | null;
    targetP: AttributeModification<number> | null;
    targetQ: AttributeModification<number> | null;
    participate: AttributeModification<boolean> | null;
    droop: AttributeModification<number> | null;
    reactiveCapabilityCurve: AttributeModification<boolean> | null;
    minQ: AttributeModification<number> | null;
    maxQ: AttributeModification<number> | null;
    reactiveCapabilityCurvePoints: ReactiveCapabilityCurvePoints[] | null;
    voltageLevelId: AttributeModification<string> | null;
    busOrBusbarSectionId: AttributeModification<string> | null;
    connectionDirection: AttributeModification<string> | null;
    connectionName?: AttributeModification<string> | null;
    connectionPosition?: AttributeModification<number> | null;
    terminalConnected?: AttributeModification<boolean> | null;
    properties: Property[] | null;
    ratedS: AttributeModification<number> | null;
    voltageRegulationOn: AttributeModification<boolean> | null;
    targetV: AttributeModification<number> | null;
    qPercent: AttributeModification<number> | null;
    plannedActivePowerSetPoint: AttributeModification<number> | null;
    marginalCost: AttributeModification<number> | null;
    plannedOutageRate: AttributeModification<number> | null;
    forcedOutageRate: AttributeModification<number> | null;
    directTransX: AttributeModification<number> | null;
    stepUpTransformerX: AttributeModification<number> | null;
    voltageRegulationType?: AttributeModification<string> | null;
    regulatingTerminalId: AttributeModification<string> | null;
    regulatingTerminalType: AttributeModification<string> | null;
    regulatingTerminalVlId: AttributeModification<string> | null;
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
    isRegulating: boolean;
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
    properties?: Property[] | null;
}

export interface TapChangerModificationInfos {
    enabled: AttributeModification<boolean> | null;
    regulationType: AttributeModification<string> | null;
    regulationSide: AttributeModification<string> | null;
    lowTapPosition: AttributeModification<number> | null;
    tapPosition: AttributeModification<number> | null;
    isRegulating: AttributeModification<boolean> | null;
    targetDeadband: AttributeModification<number> | null;
    terminalRefConnectableId: AttributeModification<string> | null;
    terminalRefConnectableType: AttributeModification<string> | null;
    terminalRefConnectableVlId: AttributeModification<string> | null;
    steps: TapChangerStepCreationInfos[] | null;
    hasLoadTapChangingCapabilities: AttributeModification<boolean> | null;
}

export interface RatioTapChangerModificationInfos extends TapChangerModificationInfos {
    targetV: AttributeModification<number> | null;
}

export interface PhaseTapChangerModificationInfos extends TapChangerModificationInfos {
    regulationMode: AttributeModification<string> | null;
    regulationValue: AttributeModification<number> | null;
}

export interface CurrentTemporaryLimitModificationInfos {
    name: AttributeModification<string> | null;
    value: AttributeModification<number> | null;
    acceptableDuration: AttributeModification<number> | null;
    modificationType: string | null;
}

export interface CurrentLimitsModificationInfos {
    permanentLimit: number | null;
    temporaryLimits: CurrentTemporaryLimitModificationInfos[] | null;
}

export interface OperationalLimitsGroupModificationInfos {
    id: string;
    currentLimits: CurrentLimitsModificationInfos | null;
    modificationType?: string | null;
    temporaryLimitsModificationType?: string | null;
    limitsProperties?: LimitsPropertyInfos[] | null;
    applicability: string | null;
}

export interface TwoWindingsTransformerModificationInfo {
    studyUuid: string;
    nodeUuid: UUID;
    modificationUuid?: string;
    equipmentId: string;
    equipmentName: AttributeModification<string> | null;
    r: AttributeModification<number> | null;
    x: AttributeModification<number> | null;
    g: AttributeModification<number> | null;
    b: AttributeModification<number> | null;
    ratedS: AttributeModification<number> | null;
    ratedU1: AttributeModification<number> | null;
    ratedU2: AttributeModification<number> | null;
    selectedOperationalLimitsGroupId1: AttributeModification<string> | null;
    selectedOperationalLimitsGroupId2: AttributeModification<string> | null;
    [ENABLE_OLG_MODIFICATION]: boolean;
    voltageLevelId1?: string | null;
    busOrBusbarSectionId1?: string | null;
    voltageLevelId2?: string | null;
    busOrBusbarSectionId2?: string | null;
    connectionName1?: string | null;
    connectionDirection1?: string | null;
    connectionName2?: string | null;
    connectionDirection2?: string | null;
    connectionPosition1?: number | null;
    connectionPosition2?: number | null;
    terminal1Connected?: boolean | null;
    terminal2Connected?: boolean | null;
    properties: Property[] | null;
    p1MeasurementValue?: number | null;
    p1MeasurementValidity?: boolean | null;
    q1MeasurementValue?: number | null;
    q1MeasurementValidity?: boolean | null;
    p2MeasurementValue?: number | null;
    p2MeasurementValidity?: boolean | null;
    q2MeasurementValue?: number | null;
    q2MeasurementValidity?: boolean | null;
    ratioTapChangerToBeEstimated?: boolean | null;
    phaseTapChangerToBeEstimated?: boolean | null;

    operationalLimitsGroupsModificationType?: string | null;
    operationalLimitsGroups: OperationalLimitsGroupModificationInfos[] | null;
    ratioTapChanger: RatioTapChangerModificationInfos | null;
    phaseTapChanger: PhaseTapChangerModificationInfos | null;
    uuid?: string;
    activated?: boolean | null;
}

export interface OperationalLimitsGroup {
    id: string;
    name: string;
    applicability?: string;
    limitsProperties?: LimitsProperty[];
    currentLimits: CurrentLimits;
    modificationType?: string | null; // only needed when the data is used for a branch modification
}

export interface Limit {
    name: AttributeModification<string> | null;
    acceptableDuration: AttributeModification<number> | null;
    value: AttributeModification<number> | null;
}

export interface TemporaryLimit extends Limit {
    modificationType: string | null;
    selected?: boolean;
}

export interface LimitsProperty {
    name: string;
    value: string;
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
    id: string | null;
    name: string | null;
    country: string | null;
    properties: Property[] | null;
}

export enum SwitchKind {
    BREAKER = 'BREAKER',
    DISCONNECTOR = 'DISCONNECTOR',
    LOAD_BREAK_SWITCH = 'LOAD_BREAK_SWITCH',
}

export interface VoltageLeveInfo {
    studyUuid: string;
    nodeUuid: UUID;
    equipmentId: string;
    equipmentName?: string;
    substationId?: string | null;
    nominalV?: number | null;
    lowVoltageLimit?: number | null;
    highVoltageLimit?: number | null;
    busbarCount?: number;
    sectionCount?: number;
    switchKinds?: SwitchKind[];
    couplingDevices?: CouplingDeviceInfos[];
    isUpdate?: boolean;
    modificationUuid?: UUID;
    properties: Property[] | null;
}

export interface VoltageLevelCreationInfo extends VoltageLeveInfo {
    substationCreation?: AttachedSubstationCreationInfo | null;
    ipMin: number | null;
    ipMax: number | null;
    topologyKind?: string;
}

export interface VoltageLeveModificationInfo extends VoltageLeveInfo {
    lowShortCircuitCurrentLimit: number | null;
    highShortCircuitCurrentLimit: number | null;
}

type VariationFilter = {
    id: string;
    name: string;
    specificMetadata: { type: string };
};

export type VariationType = keyof typeof VARIATION_TYPES;

export interface ItemFilterType {
    type?: string;
    specificMetadata?: {
        type?: string;
        filterEquipmentsAttributes?: {
            distributionKey?: number;
        }[];
    };
}

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

export interface LccShuntCompensatorInfos {
    id: string;
    name?: string | null;
    maxQAtNominalV: number;
    connectedToHvdc?: boolean | null;
    terminalConnected?: boolean | null;
    type?: string;
}

export interface LccShuntCompensatorModificationInfos extends LccShuntCompensatorInfos {
    deletionMark: boolean;
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
    shuntCompensatorsOnSide: LccShuntCompensatorInfos[];
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

export interface BatteryCreationInfos {
    type: ModificationType;
    uuid: string | null;
    equipmentId: string;
    equipmentName: string | null;
    minP: number | null;
    maxP: number | null;
    reactiveCapabilityCurve?: boolean | null;
    targetP: number | null;
    targetQ: number | null;
    voltageLevelId: string | null;
    busOrBusbarSectionId: string | null;
    reactiveCapabilityCurvePoints: ReactiveCapabilityCurvePoints[] | null;
    directTransX: number | null;
    stepUpTransformerX: number | null;
    participate: boolean | null;
    droop: number | null;
    maxQ: number | null;
    minQ: number | null;
    connectionDirection: string | null;
    connectionName?: string | null;
    connectionPosition?: number | null;
    terminalConnected?: boolean | null;
    properties: Property[] | null;
}

export interface GeneratorCreationInfos {
    type: ModificationType;
    uuid?: string;
    equipmentId: string;
    equipmentName: string | null;
    energySource: string | null;
    minP: number | null;
    maxP: number | null;
    ratedS: number | null;
    targetP: number | null;
    targetQ: number | null;
    voltageRegulationOn: boolean | null;
    targetV: number | null;
    qPercent: number | null;
    voltageLevelId: string | null;
    busOrBusbarSectionId: string | null;
    plannedActivePowerSetPoint: number | null;
    marginalCost: number | null;
    plannedOutageRate: number | null;
    forcedOutageRate: number | null;
    directTransX: number | null;
    stepUpTransformerX: number | null;
    regulatingTerminalId: string | null;
    regulatingTerminalType: string | null;
    regulatingTerminalVlId: string | null;
    reactiveCapabilityCurve: boolean;
    participate: boolean | null;
    droop: number | null;
    maxQ: number | null;
    minQ: number | null;
    reactiveCapabilityCurvePoints: ReactiveCapabilityCurvePoints[] | null;
    connectionDirection: string | null;
    connectionName: string | null;
    connectionPosition: number | null;
    terminalConnected: boolean | null;
    properties: Property[] | null;
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
    properties: Property[] | null;
}

export interface LineCreationInfos {
    type: ModificationType;
    uuid?: string | null;
    equipmentId: string;
    equipmentName: string | null;
    r: number | null;
    x: number | null;
    g1: number | null;
    b1: number | null;
    g2: number | null;
    b2: number | null;
    voltageLevelId1: string | null;
    busOrBusbarSectionId1: string | null;
    voltageLevelId2: string | null;
    busOrBusbarSectionId2: string | null;
    operationalLimitsGroups: OperationalLimitsGroupFormSchema[];
    selectedOperationalLimitsGroupId1?: string | null;
    selectedOperationalLimitsGroupId2?: string | null;
    connectionName1: string | null;
    connectionDirection1: string | null;
    connectionName2: string | null;
    connectionDirection2: string | null;
    connectionPosition1: number | null;
    connectionPosition2: number | null;
    connected1: boolean | null;
    connected2: boolean | null;
    properties: Property[] | null;
}

export interface LineModificationInfos {
    uuid?: string | null;
    studyUuid: string;
    equipmentId?: string;
    equipmentName?: AttributeModification<string> | null;
    nodeUuid: UUID;
    modificationUuid: string;
    lineId: string;
    r: AttributeModification<number> | null;
    x: AttributeModification<number> | null;
    g1: AttributeModification<number> | null;
    b1: AttributeModification<number> | null;
    g2: AttributeModification<number> | null;
    b2: AttributeModification<number> | null;
    operationalLimitsGroups: OperationalLimitsGroup[];
    selectedOperationalLimitsGroupId1: AttributeModification<string> | null;
    selectedOperationalLimitsGroupId2: AttributeModification<string> | null;
    [ENABLE_OLG_MODIFICATION]: boolean;
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
    properties: Property[] | null;
    p1MeasurementValue: number | null;
    p1MeasurementValidity: boolean | null;
    q1MeasurementValue: number | null;
    q1MeasurementValidity: boolean | null;
    p2MeasurementValue: number | null;
    p2MeasurementValidity: boolean | null;
    q2MeasurementValue: number | null;
    q2MeasurementValidity: boolean | null;
}

export interface LimitsPropertyInfos {
    name: string;
    value: string;
}

export interface CurrentTemporaryLimitCreationInfos {
    name: string | null;
    value: number | null;
    acceptableDuration: number | null;
}

export interface CurrentLimitsInfos {
    permanentLimit: number | null;
    temporaryLimits: CurrentTemporaryLimitCreationInfos[] | null;
}

export interface OperationalLimitsGroupInfos {
    id: string | null;
    currentLimits: CurrentLimitsInfos | null;
    applicability: string | null;
    limitsProperties?: LimitsPropertyInfos[] | null;
}

export interface TapChangerStepCreationInfos {
    index: number;
    rho: number;
    r: number;
    x: number;
    g: number;
    b: number;
    alpha?: number;
}
export interface TapChangerCreationInfos {
    lowTapPosition: number;
    tapPosition: number;
    isRegulating: boolean;
    targetDeadband: number | null;
    terminalRefConnectableId: string | null;
    terminalRefConnectableType: string | null;
    terminalRefConnectableVlId: string | null;
    steps: TapChangerStepCreationInfos[];
    hasLoadTapChangingCapabilities: boolean;
}

export interface RatioTapChangerCreationInfos extends TapChangerCreationInfos {
    targetV: number | null;
}

export interface PhaseTapChangerCreationInfos extends TapChangerCreationInfos {
    regulationMode: string | null;
    regulationValue: number | null;
}

export interface TwoWindingsTransformerCreationInfo {
    studyUuid: string;
    nodeUuid: UUID;
    isUpdate: boolean;
    uuid: string;
    equipmentId: string;
    equipmentName: string | null;
    r: number | null;
    x: number;
    g: number;
    b: number;
    ratedS: number | null;
    ratedU1: number;
    ratedU2: number;
    voltageLevelId1: string;
    busOrBusbarSectionId1: string;
    voltageLevelId2: string;
    busOrBusbarSectionId2: string;
    connectionName1: string | null;
    connectionDirection1: string | null;
    connectionName2: string | null;
    connectionDirection2: string | null;
    connectionPosition1: string | null;
    connectionPosition2: string | null;
    connected1: boolean;
    connected2: boolean;
    properties: Property[] | null;

    ratioTapChanger: RatioTapChangerCreationInfos | null;
    phaseTapChanger: PhaseTapChangerCreationInfos | null;

    operationalLimitsGroups: OperationalLimitsGroupInfos[] | null;
    selectedOperationalLimitsGroupId1: string | null;
    selectedOperationalLimitsGroupId2: string | null;
}

export interface AttachedSubstationCreationInfo {
    type: ModificationType;
    equipmentId: string | null;
    equipmentName: string | null;
    country: string | null;
    properties: Property[] | null;
}

export interface SubstationCreationInfo {
    studyUuid: string;
    nodeUuid: UUID;
    substationId: string;
    substationName: string | null;
    country: string | null;
    isUpdate: boolean;
    modificationUuid?: UUID;
    properties: Property[] | null;
}

export interface DivideLineInfo {
    studyUuid: string;
    nodeUuid: UUID;
    modificationUuid?: UUID;
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

export interface ExtendedVoltageLevelCreationInfo extends VoltageLevelCreationInfo {
    type: ModificationType.VOLTAGE_LEVEL_CREATION;
    busbarSections?: Option[];
}

export interface AttachLineInfo {
    studyUuid: string;
    nodeUuid: UUID;
    uuid?: UUID;
    lineToAttachToId: string;
    percent: number;
    attachmentPointId: string;
    attachmentPointName: string | null;
    attachmentPointDetailInformation: ExtendedVoltageLevelCreationInfo;
    mayNewVoltageLevelInfos?: ExtendedVoltageLevelCreationInfo;
    existingVoltageLevelId: string;
    bbsOrBusId: string;
    attachmentLine: LineCreationInfos;
    newLine1Id: string;
    newLine1Name: string | null;
    newLine2Id: string;
    newLine2Name: string | null;
}

export interface LinesAttachToSplitLinesInfo {
    studyUuid: string;
    nodeUuid: UUID;
    uuid?: UUID;
    lineToAttachTo1Id: string;
    lineToAttachTo2Id: string;
    attachedLineId: string;
    voltageLevelId: string | null;
    bbsBusId: string | null;
    replacingLine1Id: string;
    replacingLine1Name: string | null;
    replacingLine2Id: string;
    replacingLine2Name: string | null;
}

export interface DeleteAttachingLineInfo {
    studyUuid: string;
    nodeUuid: UUID;
    modificationUuid?: UUID;
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
    properties: Property[] | null;
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
    properties?: Property[] | null;
    isUpdate: boolean;
    modificationUuid?: string;
}

export interface LccConverterStationModificationInfos {
    type: string;
    equipmentId: string;
    equipmentName: AttributeModification<string> | null;
    lossFactor: AttributeModification<number> | null;
    powerFactor: AttributeModification<number> | null;
    shuntCompensatorsOnSide: LccShuntCompensatorModificationInfos[];
}

export interface LccModificationInfos {
    uuid: string | null;
    type: string;
    equipmentId: string;
    equipmentName: AttributeModification<string> | null;
    nominalV: AttributeModification<number> | null;
    r: AttributeModification<number> | null;
    maxP: AttributeModification<number> | null;
    convertersMode: AttributeModification<string> | null;
    activePowerSetpoint: AttributeModification<number> | null;
    converterStation1: LccConverterStationModificationInfos;
    converterStation2: LccConverterStationModificationInfos;
    properties?: Property[] | null;
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
    properties?: Property[] | null;
    isUpdate: boolean;
    modificationUuid: UUID;
}

export type EquipmentAttributeModificationInfos = {
    type: string;
    equipmentId: string;
    equipmentAttributeName: string;
    equipmentAttributeValue: boolean;
    equipmentType: string;
};

type GenerationDispatchInfos = {
    lossCoefficient: number | null;
    defaultOutageRate: number | null;
    generatorsWithoutOutage: Filter[] | null;
    generatorsWithFixedSupply: Filter[] | null;
    generatorsFrequencyReserve:
        | {
              generatorsFilters: Filter[];
              frequencyReserve: number;
          }[]
        | null;
    substationsGeneratorsOrdering:
        | {
              substationIds: string[];
          }[]
        | null;
};

export type GenerationDispatchModificationInfos = GenerationDispatchInfos & {
    studyUuid: UUID;
    nodeUuid: UUID;
    uuid?: UUID;
};

export interface TopologyVoltageLevelModificationInfos {
    type: ModificationType;
    uuid: string | null;
    equipmentId: string;
    equipmentAttributeModificationList: EquipmentAttributeModificationInfos[];
}

export type CouplingDeviceInfos = {
    busbarSectionId1: string;
    busbarSectionId2: string;
};

export interface CreateCouplingDeviceInfos {
    type: ModificationType;
    uuid?: string;
    voltageLevelId: string;
    couplingDeviceInfos: CouplingDeviceInfos;
}

export interface CreateVoltageLevelTopologyInfos {
    type: ModificationType;
    uuid?: string;
    voltageLevelId: string;
    sectionCount?: number | null;
    switchKinds?: string[] | null;
}

export interface CreateVoltageLevelSectionInfos {
    type: ModificationType;
    uuid?: string;
    voltageLevelId: string;
    busbarIndex: string | null;
    busbarSectionId: string | null;
    allBusbars: boolean;
    afterBusbarSectionId: boolean;
    leftSwitchKind: string | null;
    rightSwitchKind: string | null;
    switchOpen: boolean;
}

export type NetworkModificationRequestInfos = {
    studyUuid: UUID;
    nodeUuid: UUID;
    modificationUuid?: UUID;
};

export enum ShiftEquipmentType {
    LOAD = 'LOAD',
    GENERATOR = 'GENERATOR',
}

export enum ShiftType {
    PROPORTIONAL = 'PROPORTIONAL',
    BALANCED = 'BALANCED',
}

export enum BalanceType {
    PROPORTIONAL_TO_GENERATION_P = 'PROPORTIONAL_TO_GENERATION_P',
    PROPORTIONAL_TO_GENERATION_P_MAX = 'PROPORTIONAL_TO_GENERATION_P_MAX',
    PROPORTIONAL_TO_LOAD = 'PROPORTIONAL_TO_LOAD',
    PROPORTIONAL_TO_CONFORM_LOAD = 'PROPORTIONAL_TO_CONFORM_LOAD',
}

export type BalancesAdjustmentZoneInfos = {
    name: string;
    countries: string[];
    netPosition: number;
    shiftEquipmentType: ShiftEquipmentType;
    shiftType: ShiftType;
};

export type BalancesAdjustmentInfos = {
    uuid: UUID | null;
    maxNumberIterations: number;
    thresholdNetPosition: number;
    countriesToBalance: string[];
    balanceType: BalanceType;
    withLoadFlow: boolean;
    loadFlowParametersId: string | null;
    withRatioTapChangers: boolean;
    subtractLoadFlowBalancing: boolean;
    areas: BalancesAdjustmentZoneInfos[];
};

export interface MoveVoltageLevelFeederBaysInfos {
    type: ModificationType;
    uuid: string | null;
    voltageLevelId: string;
    feederBays: MoveFeederBayInfos[];
}

export interface MoveFeederBayInfos {
    equipmentId: string;
    busbarSectionId: string;
    connectionSide: string | null;
    connectionPosition: string | null;
    connectionName: string | null;
    connectionDirection: string | null;
}
