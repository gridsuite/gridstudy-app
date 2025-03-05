/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EquipmentType } from '@gridsuite/commons-ui';

export const TABLES_TYPES = [
    EquipmentType.SUBSTATION,
    EquipmentType.VOLTAGE_LEVEL,
    EquipmentType.LINE,
    EquipmentType.TWO_WINDINGS_TRANSFORMER,
    EquipmentType.THREE_WINDINGS_TRANSFORMER,
    EquipmentType.GENERATOR,
    EquipmentType.LOAD,
    EquipmentType.SHUNT_COMPENSATOR,
    EquipmentType.STATIC_VAR_COMPENSATOR,
    EquipmentType.BATTERY,
    EquipmentType.HVDC_LINE,
    EquipmentType.LCC_CONVERTER_STATION,
    EquipmentType.VSC_CONVERTER_STATION,
    EquipmentType.TIE_LINE,
    EquipmentType.DANGLING_LINE,
    EquipmentType.BUS,
    EquipmentType.BUSBAR_SECTION,
];
