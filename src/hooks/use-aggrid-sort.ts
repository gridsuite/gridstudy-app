/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTableSort } from '../redux/actions';
import { ReduxState, TableSortKeysType } from '../redux/reducer.type';

export type SortConfigType = {
    colId: string;
    sort: SortWay;
    children?: boolean;
};

export type SortPropsType = {
    onSortChanged: (sortConfig: SortConfigType) => void;
    sortConfig: SortConfigType[];
    children?: boolean;
};

export enum SortWay {
    ASC = 'asc',
    DESC = 'desc',
}

export const useAgGridSort = (
    table: TableSortKeysType,
    tab: string
): SortPropsType => {
    const sortConfig = useSelector(
        (state: ReduxState) => state.tableSort[table][tab]
    );

    const dispatch = useDispatch();

    const onSortChanged = useCallback(
        (newSortConfig: SortConfigType) => {
            const updatedSortConfig = sortConfig
                .filter(
                    (sort) =>
                        (sort.children ?? false) !==
                        (newSortConfig.children ?? false)
                )
                .concat(newSortConfig);

            dispatch(
                setTableSort({
                    table: table,
                    tab: tab,
                    sort: updatedSortConfig,
                })
            );
        },
        [dispatch, table, tab, sortConfig]
    );

    return { onSortChanged, sortConfig };
};
