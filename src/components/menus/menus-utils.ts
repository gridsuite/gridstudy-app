/*
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { EquipmentType } from '@gridsuite/commons-ui';

export function getCommonEquipmentType(equipmentType: EquipmentType): EquipmentType | null {
    switch (equipmentType) {
        case EquipmentType.SUBSTATION:
        case EquipmentType.VOLTAGE_LEVEL:
        case EquipmentType.LINE:
        case EquipmentType.LOAD:
        case EquipmentType.BATTERY:
        case EquipmentType.TIE_LINE:
        case EquipmentType.DANGLING_LINE:
        case EquipmentType.GENERATOR:
        case EquipmentType.HVDC_LINE:
        case EquipmentType.SHUNT_COMPENSATOR:
        case EquipmentType.STATIC_VAR_COMPENSATOR:
        case EquipmentType.TWO_WINDINGS_TRANSFORMER:
        case EquipmentType.THREE_WINDINGS_TRANSFORMER:
            return equipmentType;

        case EquipmentType.VSC_CONVERTER_STATION:
        case EquipmentType.LCC_CONVERTER_STATION:
            return EquipmentType.HVDC_CONVERTER_STATION;
        default: {
            console.info('Unrecognized equipment type encountered ', equipmentType);
            return null;
        }
    }
}
