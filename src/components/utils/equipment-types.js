/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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

//TODO merge the labels with the equipement types
export function equipementTypeToLabel(equipmentType) {
    switch (equipmentType) {
        case EQUIPMENT_TYPES.GENERATOR:
            return 'Generators';
        case EQUIPMENT_TYPES.LOAD:
            return 'Loads';
        case EQUIPMENT_TYPES.BATTERY:
            return 'Batteries';
        case EQUIPMENT_TYPES.VOLTAGE_LEVEL:
            return 'VoltageLevels';
        case EQUIPMENT_TYPES.SUBSTATION:
            return 'Substations';
        case EQUIPMENT_TYPES.SHUNT_COMPENSATOR:
            return 'ShuntCompensators';
        case EQUIPMENT_TYPES.LINE:
            return 'Lines';
        case EQUIPMENT_TYPES.TIE_LINE:
            return 'TIE_LINE';
        case EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER:
            return 'TwoWindingsTransformers';
        case EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER:
            return 'ThreeWindingsTransformers';
        case EQUIPMENT_TYPES.DANGLING_LINE:
            return 'DanglingLines';
        case EQUIPMENT_TYPES.LCC_CONVERTER_STATION:
            return 'LccConverterStations';
        case EQUIPMENT_TYPES.VSC_CONVERTER_STATION:
            return 'VscConverterStations';
        case EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR:
            return 'StaticVarCompensators';
        default:
            return equipmentType;
    }
}
