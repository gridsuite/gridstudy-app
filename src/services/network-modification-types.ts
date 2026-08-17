/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { Filter } from '../components/dialogs/network-modifications/by-filter/commons/by-filter.type';
import { ConverterStationElementModificationInfos } from '../components/dialogs/network-modifications/hvdc-line/vsc/converter-station/converter-station-type';
import {
    AssignmentDataType,
    AssignmentFieldValue,
    AttributeModification,
    LineCreationDto,
    ModificationType,
    Property,
    ReactiveCapabilityCurvePoints,
} from '@gridsuite/commons-ui';
import { VARIATION_TYPES } from '../components/network/constants';

export interface WithModificationId {
    uuid: UUID;
}

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

export interface ConverterStationCreationInfos {
    equipmentId: string;
    equipmentName: string | null;
    lossFactor: number | null;
    reactivePowerSetpoint: number | null;
    voltageRegulationOn?: boolean;
    voltageSetpoint: number | null;
    voltageLevelId: string;
    busOrBusbarSectionId: string;
    connectionDirection: string | null;
    connectionName?: string | null;
    connectionPosition?: number | null;
    terminalConnected?: boolean | null;
    reactiveCapabilityCurvePoints: ReactiveCapabilityCurvePoints[];
    reactiveCapabilityCurve: boolean;
    minQ: number | null;
    maxQ: number | null;
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
    dataType?: AssignmentDataType;
    value?: AssignmentFieldValue;
    filters: Filter[];
    editedField: string;
    propertyName?: string;
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

export interface AttachedSubstationCreationInfo {
    type: ModificationType;
    equipmentId: string | null;
    equipmentName: string | null;
    country: string | null;
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
    attachmentLine: LineCreationDto;
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

export interface VscCreationInfos {
    type: ModificationType;
    uuid?: string;
    equipmentId: string;
    equipmentName: string | null;
    nominalV: number | null;
    r: number | null;
    maxP: number | null;
    operatorActivePowerLimitFromSide1ToSide2: number | null;
    operatorActivePowerLimitFromSide2ToSide1: number | null;
    convertersMode: string;
    activePowerSetpoint: number | null;
    angleDroopActivePowerControl: boolean | null;
    p0: number | null;
    droop: number | null;
    converterStation1: ConverterStationCreationInfos;
    converterStation2: ConverterStationCreationInfos;
    properties: Property[] | null;
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
