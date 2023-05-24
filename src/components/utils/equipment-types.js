/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const EQUIPMENT_INFOS_TYPES = {
    LIST: { type: 'LIST' },
    MAP: { type: 'MAP' },
    FORM: { type: 'FORM' },
    TAB: { type: 'TAB' },
};

export const EQUIPMENT_TYPES = {
    SUBSTATION: {
        type: 'SUBSTATION',
    },
    VOLTAGE_LEVEL: {
        type: 'VOLTAGE_LEVEL',
    },
    LINE: {
        type: 'LINE',
    },
    TWO_WINDINGS_TRANSFORMER: {
        type: 'TWO_WINDINGS_TRANSFORMER',
    },
    THREE_WINDINGS_TRANSFORMER: {
        type: 'THREE_WINDINGS_TRANSFORMER',
    },
    HVDC_LINE: {
        type: 'HVDC_LINE',
    },
    GENERATOR: {
        type: 'GENERATOR',
    },
    BATTERY: {
        type: 'BATTERY',
    },
    LOAD: {
        type: 'LOAD',
    },
    SHUNT_COMPENSATOR: {
        type: 'SHUNT_COMPENSATOR',
    },
    DANGLING_LINE: {
        type: 'DANGLING_LINE',
    },
    STATIC_VAR_COMPENSATOR: {
        type: 'STATIC_VAR_COMPENSATOR',
    },
    HVDC_CONVERTER_STATION: {
        type: 'HVDC_CONVERTER_STATION',
    },
    VSC_CONVERTER_STATION: {
        type: 'VSC_CONVERTER_STATION',
    },
    LCC_CONVERTER_STATION: {
        type: 'LCC_CONVERTER_STATION',
    },
    SWITCH: {
        type: 'SWITCH',
    },
};
