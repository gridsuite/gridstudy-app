/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
// see Java filter-lib project for up-to-date type definitions

import type { UUID } from 'crypto';

export enum FilterEquipmentType {
    BATTERY = 'BATTERY',
    BRANCH = 'BRANCH',
    BUS = 'BUS',
    BUSBAR_SECTION = 'BUSBAR_SECTION',
    DANGLING_LINE = 'DANGLING_LINE',
    GENERATOR = 'GENERATOR',
    HVDC_LINE = 'HVDC_LINE',
    LCC_CONVERTER_STATION = 'LCC_CONVERTER_STATION',
    LINE = 'LINE',
    LOAD = 'LOAD',
    SHUNT_COMPENSATOR = 'SHUNT_COMPENSATOR',
    STATIC_VAR_COMPENSATOR = 'STATIC_VAR_COMPENSATOR',
    SUBSTATION = 'SUBSTATION',
    THREE_WINDINGS_TRANSFORMER = 'THREE_WINDINGS_TRANSFORMER',
    TWO_WINDINGS_TRANSFORMER = 'TWO_WINDINGS_TRANSFORMER',
    VOLTAGE_LEVEL = 'VOLTAGE_LEVEL',
    VSC_CONVERTER_STATION = 'VSC_CONVERTER_STATION',
}

export enum FilterType {
    IDENTIFIER_LIST = 'IDENTIFIER_LIST',
    EXPERT = 'EXPERT',
}

export type AbstractFilter = {
    id?: UUID;
    modificationDate?: string; //Date,
    equipmentType: FilterEquipmentType;
    type: FilterType; // discriminator field
};
