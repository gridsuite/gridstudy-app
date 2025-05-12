/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { EquipmentUpdateType } from '../../../redux/reducer';
import { SpreadsheetEquipmentType } from '../types/spreadsheet.type';

export const getEquipmentUpdateTypeFromType = (type: SpreadsheetEquipmentType) => {
    switch (type) {
        case 'SUBSTATION':
            return EquipmentUpdateType.SUBSTATIONS;
        case 'VOLTAGE_LEVEL':
            return EquipmentUpdateType.VOLTAGE_LEVELS;
        case 'TIE_LINE':
            return EquipmentUpdateType.TIE_LINES;
        case 'LINE':
            return EquipmentUpdateType.LINES;
        case 'TWO_WINDINGS_TRANSFORMER':
            return EquipmentUpdateType.TWO_WINDINGS_TRANSFORMERS;
        case 'THREE_WINDINGS_TRANSFORMER':
            return EquipmentUpdateType.THREE_WINDINGS_TRANSFORMERS;
        case 'HVDC_LINE':
            return EquipmentUpdateType.HVDC_LINES;
        case 'BUS':
            return EquipmentUpdateType.BUSES;
        case 'BUSBAR_SECTION':
            return EquipmentUpdateType.BUSBAR_SECTIONS;
        case 'GENERATOR':
            return EquipmentUpdateType.GENERATORS;
        case 'BATTERY':
            return EquipmentUpdateType.BATTERIES;
        case 'LOAD':
            return EquipmentUpdateType.LOADS;
        case 'SHUNT_COMPENSATOR':
            return EquipmentUpdateType.SHUNT_COMPENSATORS;
        case 'DANGLING_LINE':
            return EquipmentUpdateType.DANGLING_LINES;
        case 'STATIC_VAR_COMPENSATOR':
            return EquipmentUpdateType.STATIC_VAR_COMPENSATORS;
        case 'VSC_CONVERTER_STATION':
            return EquipmentUpdateType.VSC_CONVERTER_STATIONS;
        case 'LCC_CONVERTER_STATION':
            return EquipmentUpdateType.LCC_CONVERTER_STATIONS;
        default:
            return;
    }
};
