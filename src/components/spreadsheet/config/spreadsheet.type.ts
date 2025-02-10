/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'crypto';
import type { EQUIPMENT_TYPES } from '../../utils/equipment-types';
import type { COLUMN_TYPES } from '../../custom-aggrid/custom-aggrid-header.type';
import { FieldType } from '@gridsuite/commons-ui';

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
    index: number;
    name: string;
    type: SpreadsheetEquipmentType;
    columns: ColumnDefinition[];
    groovyEquipmentGetter?: string;
}

export type ColumnDefinition = {
    uuid?: string;
    id: string;
    name: string;
    type: COLUMN_TYPES;
    precision?: number;
    conversion?: FieldType;
    formula: string;
    dependencies: string[] | string;
};

export type ColumnState = { colId: string; visible: boolean };

export type SpreadsheetConfig = {
    sheetType: SpreadsheetEquipmentType;
    customColumns: ColumnDefinition[];
};
