/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { COLUMN_TYPES } from 'components/custom-aggrid/custom-aggrid-header.type';

export type ColumnGlobalModel = {
    columnId: string;
    columnName: string;
    columnType: COLUMN_TYPES;
    columnPrecision?: number;
    columnFormula: string;
    columnDependencies?: string[];
    columnVisible: boolean;
};
