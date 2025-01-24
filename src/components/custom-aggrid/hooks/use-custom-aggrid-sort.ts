/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback } from 'react';
import { SortPropsType, SortWay } from '../../../hooks/use-aggrid-sort';

export const useCustomAggridSort = (colId: string, sortParams: SortPropsType) => {
    const {
        sortConfig, // used to get sort data
        onSortChanged = () => {}, // used to handle sort change
    } = sortParams;

    const columnSort = sortConfig?.find((value) => value.colId === colId);
    const isColumnSorted = !!columnSort;

    const handleSortChange = useCallback(() => {
        let newSort;
        if (!isColumnSorted) {
            newSort = SortWay.ASC;
        } else if (columnSort.sort === SortWay.DESC) {
            newSort = SortWay.ASC;
        } else {
            newSort = SortWay.DESC;
        }

        if (typeof onSortChanged === 'function') {
            onSortChanged({ colId: colId, sort: newSort, children: columnSort?.children });
        }
    }, [isColumnSorted, onSortChanged, columnSort?.sort, columnSort?.children, colId]);

    return { columnSort, handleSortChange };
};
