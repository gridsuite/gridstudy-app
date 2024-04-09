/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const EQUIPMENT_INFOS_OPERATION = {
    CREATION: 'CREATION',
    MODIFICATION: 'MODIFICATION',
};

export const EQUIPMENT_INFOS_TYPES = {
    LIST: { type: 'LIST' },
    MAP: { type: 'MAP' },
    FORM: { type: 'FORM' },
    TAB: { type: 'TAB' },
    TOOLTIP: { type: 'TOOLTIP' },
};

export const EQUIPMENT_TYPES = {
    SUBSTATION: 'SUBSTATION',
    VOLTAGE_LEVEL: 'VOLTAGE_LEVEL',
    LINE: 'LINE',
    TIE_LINE: 'TIE_LINE',
    TWO_WINDINGS_TRANSFORMER: 'TWO_WINDINGS_TRANSFORMER',
    THREE_WINDINGS_TRANSFORMER: 'THREE_WINDINGS_TRANSFORMER',
    HVDC_LINE: 'HVDC_LINE',
    BUS: 'BUS',
    BUSBAR_SECTION: 'BUSBAR_SECTION',
    GENERATOR: 'GENERATOR',
    BATTERY: 'BATTERY',
    LOAD: 'LOAD',
    SHUNT_COMPENSATOR: 'SHUNT_COMPENSATOR',
    DANGLING_LINE: 'DANGLING_LINE',
    STATIC_VAR_COMPENSATOR: 'STATIC_VAR_COMPENSATOR',
    HVDC_CONVERTER_STATION: 'HVDC_CONVERTER_STATION',
    VSC_CONVERTER_STATION: 'VSC_CONVERTER_STATION',
    LCC_CONVERTER_STATION: 'LCC_CONVERTER_STATION',
    SWITCH: 'SWITCH',
};

export const EXPERT_FILTER_EQUIPMENTS = {
    GENERATOR: {
        id: EQUIPMENT_TYPES.GENERATOR,
        label: 'Generators',
    },
    LOAD: {
        id: EQUIPMENT_TYPES.LOAD,
        label: 'Loads',
    },
    BATTERY: {
        id: EQUIPMENT_TYPES.BATTERY,
        label: 'Batteries',
    },
    VOLTAGE_LEVEL: {
        id: EQUIPMENT_TYPES.VOLTAGE_LEVEL,
        label: 'VoltageLevels',
    },
    SUBSTATION: {
        id: EQUIPMENT_TYPES.SUBSTATION,
        label: 'Substations',
    },
    SHUNT_COMPENSATOR: {
        id: EQUIPMENT_TYPES.SHUNT_COMPENSATOR,
        label: 'ShuntCompensators',
    },
    LINE: {
        id: EQUIPMENT_TYPES.LINE,
        label: 'Lines',
    },
    TWO_WINDINGS_TRANSFORMER: {
        id: EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER,
        label: 'TwoWindingsTransformers',
    },
    THREE_WINDINGS_TRANSFORMER: {
        id: EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER,
        label: 'ThreeWindingsTransformers',
    },
    DANGLING_LINE: {
        id: EQUIPMENT_TYPES.DANGLING_LINE,
        label: 'DanglingLines',
    },
    LCC_CONVERTER_STATION: {
        id: EQUIPMENT_TYPES.LCC_CONVERTER_STATION,
        label: 'LccConverterStations',
    },
    VSC_CONVERTER_STATION: {
        id: EQUIPMENT_TYPES.VSC_CONVERTER_STATION,
        label: 'VscConverterStations',
    },
    STATIC_VAR_COMPENSATOR: {
        id: EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR,
        label: 'StaticVarCompensators',
    },
};
