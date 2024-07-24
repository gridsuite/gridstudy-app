/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AgGridReact } from 'ag-grid-react';
import { useCallback, useEffect } from 'react';
import {
    SortConfigType,
    SortPropsType,
    useAgGridSort,
} from './use-aggrid-sort';
import { useSelector } from 'react-redux';
import { ReduxState, TableSortKeysType } from '../redux/reducer.type';

export const useAgGridLocalSort = (
    gridRef: React.MutableRefObject<AgGridReact | null>,
    initSortConfig: SortConfigType[],
    table: (typeof TableSortKeysType)[string],
    tab: string
): SortPropsType => {
    const { onSortChanged, initSort } = useAgGridSort(
        initSortConfig,
        table,
        tab
    );

    const sortConfig = useSelector(
        (state: ReduxState) => state.tableSort[table][tab]
    );

    const setSortInAgGrid = useCallback(
        (sortConfig: SortConfigType[]) => {
            gridRef.current?.columnApi?.applyColumnState({
                state: sortConfig,
                defaultState: { sort: null },
            });
        },
        [gridRef]
    );

    useEffect(() => {
        setSortInAgGrid(sortConfig);
    }, [sortConfig, setSortInAgGrid]);

    return { onSortChanged, sortConfig, initSort };
};
