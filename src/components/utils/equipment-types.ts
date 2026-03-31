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

export const EQUIPMENTS_WITH_ONE_NOMINAL_VOLTAGE = [
    EquipmentType.SUBSTATION,
    EquipmentType.VOLTAGE_LEVEL,
    EquipmentType.BUS,
    EquipmentType.BUSBAR_SECTION,
    EquipmentType.GENERATOR,
    EquipmentType.BATTERY,
    EquipmentType.LOAD,
    EquipmentType.SHUNT_COMPENSATOR,
    EquipmentType.STATIC_VAR_COMPENSATOR,
    EquipmentType.VSC_CONVERTER_STATION,
    EquipmentType.LCC_CONVERTER_STATION,
];
export const EQUIPMENTS_WITH_TWO_NOMINAL_VOLTAGES = [
    EquipmentType.LINE,
    EquipmentType.TWO_WINDINGS_TRANSFORMER,
    EquipmentType.HVDC_LINE,
    EquipmentType.DANGLING_LINE,
    EquipmentType.TIE_LINE,
];

export const EQUIPMENTS_WITH_THREE_NOMINAL_VOLTAGES = [EquipmentType.THREE_WINDINGS_TRANSFORMER];

export const EQUIPMENTS_WITH_ONE_SUBSTATION = [
    EquipmentType.SUBSTATION,
    EquipmentType.VOLTAGE_LEVEL,
    EquipmentType.BUS,
    EquipmentType.BUSBAR_SECTION,
    EquipmentType.GENERATOR,
    EquipmentType.BATTERY,
    EquipmentType.LOAD,
    EquipmentType.SHUNT_COMPENSATOR,
    EquipmentType.STATIC_VAR_COMPENSATOR,
    EquipmentType.TWO_WINDINGS_TRANSFORMER,
    EquipmentType.THREE_WINDINGS_TRANSFORMER,
    EquipmentType.VSC_CONVERTER_STATION,
    EquipmentType.LCC_CONVERTER_STATION,
];
export const EQUIPMENTS_WITH_TWO_SUBSTATIONS = [EquipmentType.LINE, EquipmentType.HVDC_LINE];

export interface VoltageLevel extends Identifiable {
    nominalV: number;
    substationId?: string;
}
