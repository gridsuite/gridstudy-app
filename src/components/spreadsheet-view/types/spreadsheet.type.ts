/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'crypto';
import type { EQUIPMENT_TYPES } from '../../utils/equipment-types';
import { Identifiable } from '@gridsuite/commons-ui';
import type { COLUMN_TYPES } from '../../custom-aggrid/custom-aggrid-header.type';
import { GlobalFilter } from '../../results/common/global-filter/global-filter-types';

export type EquipmentFetcher = (
    studyUuid: UUID,
    currentNodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    substationsIds?: string[]
) => Promise<any>;

export type SpreadsheetEquipmentType = Exclude<
    EQUIPMENT_TYPES,
    | EQUIPMENT_TYPES.HVDC_CONVERTER_STATION
    | EQUIPMENT_TYPES.SWITCH
    | EQUIPMENT_TYPES.BREAKER
    | EQUIPMENT_TYPES.DISCONNECTOR
>;

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
    nodesId: string[];
    equipmentsByNodeId: Record<string, Identifiable[]>;
};

export type SpreadsheetConfig = {
    name: string;
    sheetType: SpreadsheetEquipmentType;
    columns: ColumnDefinitionDto[];
    globalFilters?: GlobalFilter[];
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
