/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState, TableSortKeysType } from '../../../redux/reducer';
import { setTableSort } from '../../../redux/actions';
import { SortWay } from '../../../types/custom-aggrid-types';

export type SortParams = {
    table: TableSortKeysType;
    tab: string;
    isChildren?: boolean;
};

export const useCustomAggridSort = (colId: string, sortParams?: SortParams) => {
    const sortConfig = useSelector((state: AppState) =>
        sortParams ? state.tableSort[sortParams.table][sortParams.tab] : undefined
    );

    const dispatch = useDispatch();

    const columnSort = sortConfig?.find((value) => value.colId === colId);
    const isColumnSorted = !!columnSort;

    const handleSortChange = useCallback(() => {
        if (!sortParams || !sortConfig) {
            return;
        }

        let newSort;
        if (!isColumnSorted) {
            newSort = SortWay.ASC;
        } else if (columnSort.sort === SortWay.DESC) {
            newSort = SortWay.ASC;
        } else {
            newSort = SortWay.DESC;
        }

        const updatedSortConfig = sortConfig
            .filter((sort) => (sort.children ?? false) !== (sortParams.isChildren ?? false))
            .concat({ colId, sort: newSort, children: sortParams.isChildren });

        dispatch(setTableSort(sortParams.table, sortParams.tab, updatedSortConfig));
    }, [sortParams, sortConfig, isColumnSorted, columnSort?.sort, colId, dispatch]);

    return { columnSort, handleSortChange };
};
