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
import { LccShuntCompensatorInfos } from '../../../../../../services/network-modification-types';

export const LccDialogTab = {
    HVDC_LINE_TAB: 0,
    CONVERTER_STATION_1: 1,
    CONVERTER_STATION_2: 2,
};

export type LccModificationSchemaForm = {
    [EQUIPMENT_NAME]?: string;
    [HVDC_LINE_TAB]: {
        [NOMINAL_V]?: number;
        [R]?: number;
        [MAX_P]?: number;
        [CONVERTERS_MODE]?: string;
        [ACTIVE_POWER_SETPOINT]?: number;
        [ADDITIONAL_PROPERTIES]?: Property[];
    };
    [CONVERTER_STATION_1]: ConverterStationType;
    [CONVERTER_STATION_2]: ConverterStationType;
};

interface ConverterStationType {
    [CONVERTER_STATION_NAME]?: string;
    [LOSS_FACTOR]?: number;
    [POWER_FACTOR]?: number;
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
    shuntCompensatorsOnSide: LccShuntCompensatorInfos[];
}

export interface LccConverterStationFormInfos {
    id: string;
    name: string;
    lossFactor: number;
    powerFactor: number;
    voltageLevelId: string;
    busOrBusbarSectionId: string;
    terminalConnected: boolean;
    connectablePosition: ConnectablePositionInfos;
    shuntCompensatorsOnSide: LccShuntCompensatorInfos[];
}

export interface LccCommonFormInfos {
    id: string;
    name: string;
    nominalV: number;
    r: number;
    maxP: number;
    convertersMode: string;
    activePowerSetpoint: number;
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
    connectedToHvdc?: boolean | null;
}
