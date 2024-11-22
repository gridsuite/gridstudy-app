/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTableSort } from '../redux/redux.tables';
import { type AppState } from '../redux/reducer';
import { type StoreTableKeys, type StoreTableTabs } from '../utils/store-sort-filter-fields';
import { type SortConfigType, type SortPropsType } from './use-aggrid.type';

export function useAgGridSort<T extends StoreTableKeys>(table: T, tab: StoreTableTabs<T>): SortPropsType {
    // @ts-expect-error we don't know at compile time which table tab it is
    const sortConfig: SortConfigType[] = useSelector((state: AppState) => state[table][tab]);

    const dispatch = useDispatch();
    const onSortChanged = useCallback(
        (newSortConfig: SortConfigType) => {
            const updatedSortConfig = sortConfig
                .filter((sort) => (sort.children ?? false) !== (newSortConfig.children ?? false))
                .concat(newSortConfig);
            dispatch(setTableSort(table, tab, updatedSortConfig));
        },
        [dispatch, table, tab, sortConfig]
    );

    return { onSortChanged, sortConfig };
}
