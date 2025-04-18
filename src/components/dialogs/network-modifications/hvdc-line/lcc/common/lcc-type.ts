/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Property } from '../../../common/properties/property-utils';
import { EQUIPMENT_TYPES } from '../../../../../utils/equipment-types';
import { ConnectablePositionInfos } from '../../../../connectivity/connectivity.type';
import {
    ACTIVE_POWER_SETPOINT,
    ADDITIONAL_PROPERTIES,
    CONVERTER_STATION_1,
    CONVERTER_STATION_2,
    CONVERTER_STATION_NAME,
    CONVERTERS_MODE,
    EQUIPMENT_NAME,
    FILTERS_SHUNT_COMPENSATOR_TABLE,
    HVDC_LINE_TAB,
    LOSS_FACTOR,
    MAX_P,
    NOMINAL_V,
    POWER_FACTOR,
    R,
} from '../../../../../utils/field-constants';
import {
    AttributeModification,
    ShuntCompensatorInfos,
    ShuntCompensatorModificationInfos,
} from '../../../../../../services/network-modification-types';

export const LccDialogTab = {
    HVDC_LINE_TAB: 0,
    CONVERTER_STATION_1: 1,
    CONVERTER_STATION_2: 2,
};

export type LccModificationSchemaForm = {
    [CONVERTER_STATION_1]: ConverterStationBaseType;
    [CONVERTER_STATION_2]: ConverterStationBaseType;
} & Partial<LccBaseSchemaForm>;

export type LccBaseSchemaForm = {
    [EQUIPMENT_NAME]?: string;
    [HVDC_LINE_TAB]: {
        [NOMINAL_V]: number;
        [R]: number;
        [MAX_P]: number;
        [CONVERTERS_MODE]: string;
        [ACTIVE_POWER_SETPOINT]: number;
        [ADDITIONAL_PROPERTIES]?: Property[];
    };
};

interface ConverterStationBaseType {
    [CONVERTER_STATION_NAME]?: string;
    [LOSS_FACTOR]: number;
    [POWER_FACTOR]: number;
    [FILTERS_SHUNT_COMPENSATOR_TABLE]?: ShuntCompensatorFormSchema[];
}

export interface LccCreationInfos {
    uuid: string;
    equipmentType: EQUIPMENT_TYPES;
    equipmentId: string;
    equipmentName: string;
    nominalV: number;
    r: number;
    maxP: number;
    convertersMode: string;
    activePowerSetpoint: number;
    converterStation1: LccConverterStationCreationInfos;
    converterStation2: LccConverterStationCreationInfos;
    properties?: Property[];
}

export interface LccModificationInfos {
    uuid: string;
    equipmentType: EQUIPMENT_TYPES;
    equipmentId: string;
    equipmentName: AttributeModification<string> | null;
    nominalV: AttributeModification<number> | null;
    r: AttributeModification<number> | null;
    maxP: AttributeModification<number> | null;
    convertersMode: AttributeModification<string> | null;
    activePowerSetpoint: AttributeModification<number> | null;
    converterStation1: LccConverterStationModificationInfos;
    converterStation2: LccConverterStationModificationInfos;
    properties?: Property[];
}

export interface LccConverterStationCreationInfos {
    equipmentId: string;
    equipmentName: string | null;
    lossFactor: number;
    powerFactor: number;
    voltageLevelId: string;
    busOrBusbarSectionId: string;
    terminalConnected: boolean;
    connectionDirection: string | null;
    connectionName: string | null;
    connectionPosition: number | null;
    shuntCompensatorsOnSide: ShuntCompensatorInfos[];
}

export interface LccConverterStationModificationInfos {
    equipmentId: string;
    equipmentName: AttributeModification<string> | null;
    lossFactor: AttributeModification<number> | null;
    powerFactor: AttributeModification<number> | null;
    shuntCompensatorsOnSide: ShuntCompensatorModificationInfos[];
}

export interface LccConverterStationFormInfos {
    id: string;
    name: string | null;
    lossFactor: number;
    powerFactor: number;
    voltageLevelId: string;
    busOrBusbarSectionId: string;
    terminalConnected: boolean;
    connectablePosition: ConnectablePositionInfos;
    shuntCompensatorsOnSide: ShuntCompensatorInfos[];
}

export interface LccFormInfos {
    id: string;
    name: string;
    nominalV: number;
    r: number;
    maxP: number;
    convertersMode: string;
    activePowerSetpoint: number;
    lccConverterStation1: LccConverterStationFormInfos;
    lccConverterStation2: LccConverterStationFormInfos;
    properties?: Record<string, string>;
}

// this type used instead of ShuntCompensatorInfos because RHF uses 'id' to manage array, see useFieldArray
export interface ShuntCompensatorFormSchema {
    shuntCompensatorId: string;
    shuntCompensatorName?: string | null;
    maxQAtNominalV: number;
    connectedToHvdc?: boolean;
}
