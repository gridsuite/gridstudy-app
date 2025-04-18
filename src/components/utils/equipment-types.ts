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

export interface VoltageLevel extends Identifiable {
    nominalV: number;
    subtationId?: string;
}

export const convertToEquipmentType = (type: EQUIPMENT_TYPES): EquipmentType => {
    return EquipmentType[type as keyof typeof EquipmentType];
};
