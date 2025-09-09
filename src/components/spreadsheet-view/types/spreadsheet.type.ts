/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'crypto';
import type { Identifiable } from '@gridsuite/commons-ui';
import type { COLUMN_TYPES } from '../../custom-aggrid/custom-aggrid-header.type';
import type { GlobalFilter } from '../../results/common/global-filter/global-filter-types';

export enum SpreadsheetEquipmentType {
    BATTERY = 'BATTERY',
    BRANCH = 'BRANCH', // LINE + TWO_WINDINGS_TRANSFORMER
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
    TIE_LINE = 'TIE_LINE',
    TWO_WINDINGS_TRANSFORMER = 'TWO_WINDINGS_TRANSFORMER',
    VOLTAGE_LEVEL = 'VOLTAGE_LEVEL',
    VSC_CONVERTER_STATION = 'VSC_CONVERTER_STATION',
}

export function isSpreadsheetEquipmentType(type: string): type is SpreadsheetEquipmentType {
    return type in SpreadsheetEquipmentType;
}

export type EditableEquipmentType =
    | SpreadsheetEquipmentType.SUBSTATION
    | SpreadsheetEquipmentType.VOLTAGE_LEVEL
    | SpreadsheetEquipmentType.LINE
    | SpreadsheetEquipmentType.TWO_WINDINGS_TRANSFORMER
    | SpreadsheetEquipmentType.GENERATOR
    | SpreadsheetEquipmentType.LOAD
    | SpreadsheetEquipmentType.BATTERY
    | SpreadsheetEquipmentType.SHUNT_COMPENSATOR;

export interface SpreadsheetTabDefinition {
    uuid: UUID;
    index: number;
    name: string;
    type: SpreadsheetEquipmentType;
    columns: ColumnDefinition[];
}

export type ColumnDefinition = {
    uuid: UUID;
    id: string;
    name: string;
    type: COLUMN_TYPES;
    precision?: number;
    formula: string;
    dependencies?: string[];
    visible: boolean;
    locked?: boolean;
};

export type ColumnDefinitionDto = Omit<ColumnDefinition, 'dependencies'> & {
    dependencies?: string;
    filterDataType?: string;
    filterTolerance?: number;
    filterType?: string;
    filterValue?: string;
    visible?: boolean;
};

export type ColumnStateDto = {
    columnId: UUID;
    visible: boolean;
    order: number;
};

export type SpreadsheetEquipmentsByNodes = {
    nodesId: UUID[];
    equipmentsByNodeId: Record<UUID, Record<string, Identifiable>>;
};

export type SpreadsheetConfig = {
    name: string;
    sheetType: SpreadsheetEquipmentType;
    columns: ColumnDefinitionDto[];
    globalFilters?: GlobalFilter[];
    nodeAliases?: string[];
};

export type SpreadsheetConfigDto = SpreadsheetConfig & {
    id: UUID;
};

export type SpreadsheetCollection = {
    id?: string;
    spreadsheetConfigs: SpreadsheetConfig[];
    nodeAliases?: string[];
};

export type SpreadsheetCollectionDto = {
    id: UUID;
    name: string;
    spreadsheetConfigs: SpreadsheetConfigDto[];
    nodeAliases?: string[];
};

type BranchOptionalLoadingParameters = {
    operationalLimitsGroups: boolean;
};

export type SpreadsheetOptionalLoadingParameters = {
    [SpreadsheetEquipmentType.BRANCH]: BranchOptionalLoadingParameters;
    [SpreadsheetEquipmentType.LINE]: BranchOptionalLoadingParameters;
    [SpreadsheetEquipmentType.TWO_WINDINGS_TRANSFORMER]: BranchOptionalLoadingParameters;
    [SpreadsheetEquipmentType.GENERATOR]: {
        regulatingTerminal: boolean;
    };
};
