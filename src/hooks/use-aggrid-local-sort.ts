/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AgGridReact } from 'ag-grid-react';
import { useCallback, useEffect } from 'react';
import {
    ColumnSortConfig,
    SortPropsType,
    getSortValue,
    useAgGridSort,
    getPrimarySort,
} from './use-aggrid-sort';

export const useAgGridLocalSort = (
    gridRef: React.MutableRefObject<AgGridReact | null>,
    initSortConfig: ColumnSortConfig
): SortPropsType => {
    const { onSortChanged, sortConfig, initSort } =
        useAgGridSort(initSortConfig);

    const setSortInAgGrid = useCallback(
        (sortConfig: ColumnSortConfig) => {
            gridRef.current?.columnApi?.applyColumnState({
                state: [
                    {
                        colId: sortConfig.colKey,
                        sort: getSortValue(sortConfig.sortWay),
                    },
                ],
                defaultState: { sort: null },
            });
        },
        [gridRef]
    );

    useEffect(() => {
        setSortInAgGrid(getPrimarySort(sortConfig));
    }, [sortConfig, setSortInAgGrid]);

    return { onSortChanged, sortConfig, initSort };
};
