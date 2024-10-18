/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// only moved here to resolve cyclic dependency problem

import { EQUIPMENT_TYPES } from '../components/utils/equipment-types';

export type ColumnWithFormula = {
    name: string;
    formula: string;
};

export type FormulaFilter = {
    formula: string;
};

export type CustomEntry = {
    columns: ColumnWithFormula[];
    filter: FormulaFilter;
};

export type SpreadsheetConfig = {
    sheetType: EQUIPMENT_TYPES;
    customColumns: ColumnWithFormula[];
};
