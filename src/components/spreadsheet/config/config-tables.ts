/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { SpreadsheetTabDefinition } from './spreadsheet.type';
import { SUBSTATION_TAB_DEF } from './equipment/substation';
import { VOLTAGE_LEVEL_TAB_DEF } from './equipment/voltage-level';
import { LINE_TAB_DEF } from './equipment/line';
import { TWO_WINDINGS_TRANSFORMER_TAB_DEF } from './equipment/two-windings-transformer';
import { THREE_WINDINGS_TRANSFORMER_TAB_DEF } from './equipment/three-windings-transformer';
import { GENERATOR_TAB_DEF } from './equipment/generator';
import { LOAD_TAB_DEF } from './equipment/load';
import { SHUNT_COMPENSATOR_TAB_DEF } from './equipment/shunt-compensator';
import { STATIC_VAR_COMPENSATOR_TAB_DEF } from './equipment/static-var-compensator';
import { BATTERY_TAB_DEF } from './equipment/battery';
import { HVDC_LINE_TAB_DEF } from './equipment/hvdc-line';
import { LCC_CONVERTER_STATION_TAB_DEF } from './equipment/lcc-converter-station';
import { VSC_CONVERTER_STATION_TAB_DEF } from './equipment/vsc-converter-station';
import { DANGLING_LINE_TAB_DEF } from './equipment/dangling-line';
import { BUS_TAB_DEF } from './equipment/bus';
import { TIE_LINE_TAB_DEF } from './equipment/tie-line';
import { BUSBAR_SECTION_TAB_DEF } from './equipment/busbar-section';

export const TABLES_DEFINITIONS: SpreadsheetTabDefinition[] = [
    SUBSTATION_TAB_DEF,
    VOLTAGE_LEVEL_TAB_DEF,
    LINE_TAB_DEF,
    TWO_WINDINGS_TRANSFORMER_TAB_DEF,
    THREE_WINDINGS_TRANSFORMER_TAB_DEF,
    GENERATOR_TAB_DEF,
    LOAD_TAB_DEF,
    SHUNT_COMPENSATOR_TAB_DEF,
    STATIC_VAR_COMPENSATOR_TAB_DEF,
    BATTERY_TAB_DEF,
    HVDC_LINE_TAB_DEF,
    LCC_CONVERTER_STATION_TAB_DEF,
    VSC_CONVERTER_STATION_TAB_DEF,
    DANGLING_LINE_TAB_DEF,
    BUS_TAB_DEF,
    TIE_LINE_TAB_DEF,
    BUSBAR_SECTION_TAB_DEF,
];

export type TablesDefinitionsType = typeof TABLES_DEFINITIONS;
export type TablesDefinitionsNames = TablesDefinitionsType[number]['name'];

export type GenericTablesDefinitions = SpreadsheetTabDefinition[];
export type GenericTablesColumnsNames = { colId: string; visible: boolean }[][];

export const TABLES_NAMES = TABLES_DEFINITIONS.map((tabDef) => tabDef.name);
export const TABLES_TYPES = TABLES_DEFINITIONS.map((tabDef) => tabDef.type);
