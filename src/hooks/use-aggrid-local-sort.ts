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
import { AnyAction } from 'redux';

export const useAgGridLocalSort = (
    gridRef: React.MutableRefObject<AgGridReact | null>,
    initSortConfig: SortConfigType[],
    sortAction?: (tab: string, sortConfig: SortConfigType[]) => AnyAction,
    tab?: string
): SortPropsType => {
    const { onSortChanged, sortConfig, initSort } = useAgGridSort(
        initSortConfig,
        sortAction,
        tab
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
