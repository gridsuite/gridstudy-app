/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ColumnState } from 'ag-grid-community';

export const ROW_INDEX_COLUMN_ID = 'rowIndex';
export const MAX_FORMULA_CHARACTERS = 2000;

export const ROW_INDEX_COLUMN_STATE: ColumnState = {
    colId: ROW_INDEX_COLUMN_ID,
    pinned: 'left',
};
