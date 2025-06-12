/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EquipmentType, Identifiable } from '@gridsuite/commons-ui';

type EquipmentInfosTypesStruct<T extends string = string> = { type: T };
//TODO: rename to PascalCase
export const EQUIPMENT_INFOS_TYPES: Record<string, EquipmentInfosTypesStruct> = {
    LIST: { type: 'LIST' },
    MAP: { type: 'MAP' },
    FORM: { type: 'FORM' },
    TAB: { type: 'TAB' },
    TOOLTIP: { type: 'TOOLTIP' },
    OPERATING_STATUS: { type: 'OPERATING_STATUS' },
};
export type EquipmentInfosTypes = EquipmentInfosTypesStruct<
    'LIST' | 'MAP' | 'FORM' | 'TAB' | 'TOOLTIP' | 'OPERATING_STATUS'
>;

//TODO: Compare with commons-ui's EquipmentType enum (not same order)
//TODO: rename to PascalCase
export enum EQUIPMENT_TYPES {
    SUBSTATION = 'SUBSTATION',
    VOLTAGE_LEVEL = 'VOLTAGE_LEVEL',
    LINE = 'LINE',
    TIE_LINE = 'TIE_LINE',
    TWO_WINDINGS_TRANSFORMER = 'TWO_WINDINGS_TRANSFORMER',
    THREE_WINDINGS_TRANSFORMER = 'THREE_WINDINGS_TRANSFORMER',
    HVDC_LINE = 'HVDC_LINE',
    BUS = 'BUS',
    BUSBAR_SECTION = 'BUSBAR_SECTION',
    GENERATOR = 'GENERATOR',
    BATTERY = 'BATTERY',
    LOAD = 'LOAD',
    SHUNT_COMPENSATOR = 'SHUNT_COMPENSATOR',
    DANGLING_LINE = 'DANGLING_LINE',
    STATIC_VAR_COMPENSATOR = 'STATIC_VAR_COMPENSATOR',
    HVDC_CONVERTER_STATION = 'HVDC_CONVERTER_STATION',
    VSC_CONVERTER_STATION = 'VSC_CONVERTER_STATION',
    LCC_CONVERTER_STATION = 'LCC_CONVERTER_STATION',
    SWITCH = 'SWITCH',
    DISCONNECTOR = 'DISCONNECTOR',
    BREAKER = 'BREAKER',
}

export const EQUIPMENTS_WITH_ONE_NOMINAL_VOLTAGE = [
    EQUIPMENT_TYPES.SUBSTATION,
    EQUIPMENT_TYPES.VOLTAGE_LEVEL,
    EQUIPMENT_TYPES.BATTERY,
    EQUIPMENT_TYPES.BUS,
    EQUIPMENT_TYPES.BUSBAR_SECTION,
    EQUIPMENT_TYPES.GENERATOR,
    EQUIPMENT_TYPES.SHUNT_COMPENSATOR,
    EQUIPMENT_TYPES.LOAD,
];
export const EQUIPMENTS_WITH_TWO_NOMINAL_VOLTAGES = [
    EQUIPMENT_TYPES.LINE,
    EQUIPMENT_TYPES.TIE_LINE,
    EQUIPMENT_TYPES.DANGLING_LINE,
    EQUIPMENT_TYPES.HVDC_LINE,
    EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER,
];

export const EQUIPMENTS_WITH_THREE_NOMINAL_VOLTAGES = [EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER];

export const EQUIPMENTS_WITH_ONE_SUBSTATION = [
    EQUIPMENT_TYPES.SUBSTATION,
    EQUIPMENT_TYPES.VOLTAGE_LEVEL,
    EQUIPMENT_TYPES.BATTERY,
    EQUIPMENT_TYPES.BUS,
    EQUIPMENT_TYPES.BUSBAR_SECTION,
    EQUIPMENT_TYPES.GENERATOR,
    EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER,
    EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER,
    EQUIPMENT_TYPES.SHUNT_COMPENSATOR,
    EQUIPMENT_TYPES.LOAD,
];
export const EQUIPMENTS_WITH_TWO_SUBSTATIONS = [
    EQUIPMENT_TYPES.LINE,
    EQUIPMENT_TYPES.TIE_LINE,
    EQUIPMENT_TYPES.DANGLING_LINE,
    EQUIPMENT_TYPES.HVDC_LINE,
];

export interface VoltageLevel extends Identifiable {
    nominalV: number;
    subtationId?: string;
}

export const convertToEquipmentType = (type: EQUIPMENT_TYPES): EquipmentType => {
    return EquipmentType[type as keyof typeof EquipmentType];
};
