/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ColDef, ColGroupDef, GridApi } from 'ag-grid-community';

export function isColDef(col: ColDef | ColGroupDef): col is ColDef {
    return (col as ColDef).field !== undefined;
}

export function getColumnHeaderDisplayNames(gridApi: GridApi): string[] {
    return (
        gridApi.getColumnDefs()?.map((c) => {
            if (isColDef(c)) {
                return c.headerComponentParams?.displayName;
            }
            return '';
        }) ?? []
    );
}
