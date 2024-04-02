/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const MODIFICATION_TYPES = {
    GROOVY_SCRIPT: {
        type: 'GROOVY_SCRIPT',
    },
    LOAD_CREATION: {
        type: 'LOAD_CREATION',
    },
    LOAD_MODIFICATION: {
        type: 'LOAD_MODIFICATION',
    },
    BATTERY_CREATION: {
        type: 'BATTERY_CREATION',
    },
    BATTERY_MODIFICATION: {
        type: 'BATTERY_MODIFICATION',
    },
    GENERATOR_CREATION: {
        type: 'GENERATOR_CREATION',
    },
    GENERATOR_MODIFICATION: {
        type: 'GENERATOR_MODIFICATION',
    },
    LINE_CREATION: {
        type: 'LINE_CREATION',
    },
    LINE_MODIFICATION: {
        type: 'LINE_MODIFICATION',
    },
    SUBSTATION_CREATION: {
        type: 'SUBSTATION_CREATION',
    },
    SUBSTATION_MODIFICATION: {
        type: 'SUBSTATION_MODIFICATION',
    },
    VOLTAGE_LEVEL_CREATION: {
        type: 'VOLTAGE_LEVEL_CREATION',
    },
    VOLTAGE_LEVEL_MODIFICATION: {
        type: 'VOLTAGE_LEVEL_MODIFICATION',
    },
    SHUNT_COMPENSATOR_CREATION: {
        type: 'SHUNT_COMPENSATOR_CREATION',
    },
    SHUNT_COMPENSATOR_MODIFICATION: {
        type: 'SHUNT_COMPENSATOR_MODIFICATION',
    },
    TWO_WINDINGS_TRANSFORMER_CREATION: {
        type: 'TWO_WINDINGS_TRANSFORMER_CREATION',
    },
    TWO_WINDINGS_TRANSFORMER_MODIFICATION: {
        type: 'TWO_WINDINGS_TRANSFORMER_MODIFICATION',
    },
    VSC_CREATION: {
        type: 'VSC_CREATION',
    },
    EQUIPMENT_DELETION: {
        type: 'EQUIPMENT_DELETION',
    },
    BY_FILTER_DELETION: {
        type: 'BY_FILTER_DELETION',
    },
    LINE_SPLIT_WITH_VOLTAGE_LEVEL: {
        type: 'LINE_SPLIT_WITH_VOLTAGE_LEVEL',
    },
    LINE_ATTACH_TO_VOLTAGE_LEVEL: {
        type: 'LINE_ATTACH_TO_VOLTAGE_LEVEL',
    },
    LINES_ATTACH_TO_SPLIT_LINES: {
        type: 'LINES_ATTACH_TO_SPLIT_LINES',
    },
    OPERATING_STATUS_MODIFICATION: {
        type: 'OPERATING_STATUS_MODIFICATION',
    },
    EQUIPMENT_ATTRIBUTE_MODIFICATION: {
        type: 'EQUIPMENT_ATTRIBUTE_MODIFICATION',
    },
    LOAD_SCALING: {
        type: 'LOAD_SCALING',
    },
    DELETE_VOLTAGE_LEVEL_ON_LINE: {
        type: 'DELETE_VOLTAGE_LEVEL_ON_LINE',
    },
    DELETE_ATTACHING_LINE: {
        type: 'DELETE_ATTACHING_LINE',
    },
    GENERATOR_SCALING: {
        type: 'GENERATOR_SCALING',
    },
    GENERATION_DISPATCH: {
        type: 'GENERATION_DISPATCH',
    },
    VOLTAGE_INIT_MODIFICATION: {
        type: 'VOLTAGE_INIT_MODIFICATION',
    },
    CONVERTER_STATION_CREATION: {
        type: 'CONVERTER_STATION_CREATION',
    },
    TABULAR_MODIFICATION: {
        type: 'TABULAR_MODIFICATION',
    },
    BY_FORMULA_MODIFICATION: {
        type: 'BY_FORMULA_MODIFICATION',
    },
    TABULAR_CREATION: {
        type: 'TABULAR_CREATION',
    },
    VSC_MODIFICATION: {
        type: 'VSC_MODIFICATION',
    },
    CONVERTER_STATION_MODIFICATION: {
        type: 'CONVERTER_STATION_MODIFICATION',
    },
};
