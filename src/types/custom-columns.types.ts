/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// only moved here to resolve cyclic dependency problem

import { COLUMN_TYPES } from 'components/custom-aggrid/custom-aggrid-header.type';
import { SpreadsheetEquipmentType } from '../components/spreadsheet/config/spreadsheet.type';

export type ColumnWithFormulaDto = {
    uuid: string;
    id: string;
    name: string;
    type: COLUMN_TYPES;
    precision?: number;
    formula: string;
    dependencies: string | null;
};

export type ColumnWithFormula = {
    uuid: string;
    id: string;
    name: string;
    type: COLUMN_TYPES;
    precision?: number;
    formula: string;
    dependencies: string[];
};

export type FormulaFilter = {
    formula: string;
};

export type CustomEntry = {
    columns: ColumnWithFormula[];
    filter: FormulaFilter;
};

export type SpreadsheetConfig = {
    sheetType: SpreadsheetEquipmentType;
    customColumns: ColumnWithFormula[];
};
