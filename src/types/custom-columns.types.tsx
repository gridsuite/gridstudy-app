/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// only moved here to resolve cyclic dependency problem

import { SpreadsheetEquipmentType } from '../components/spreadsheet/config/spreadsheet.type';

export type ColumnWithFormula = {
    id: string;
    name: string;
    formula: string;
    formulaForEval: string | null;
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
