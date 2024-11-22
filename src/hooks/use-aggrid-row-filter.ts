/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { FilterDataType, FilterSelectorType } from '../components/custom-aggrid/custom-aggrid-header.type';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../redux/store';
import { type AppState } from '../redux/reducer';
import { type StoreTableKeys, type StoreTableTabs } from '../utils/store-sort-filter-fields';
import { setTableFilter } from '../redux/redux.tables';

export type UseAggridRowFilterOutputType = {
    updateFilter: (field: string, data: FilterDataType) => void;
    filterSelector: FilterSelectorType[];
};

function changeValueFromArrayWithFieldValue(
    filtersArrayToModify: FilterSelectorType[],
    field: string,
    newData: FilterSelectorType
) {
    const filterIndex = filtersArrayToModify.findIndex((f: FilterSelectorType) => f.column === field);
    if (filterIndex === -1) {
        return [...filtersArrayToModify, newData];
    } else {
        const updatedArray = [...filtersArrayToModify];
        updatedArray[filterIndex] = newData;
        return updatedArray;
    }
}

export function useAggridRowFilter<T extends StoreTableKeys<true>>(
    table: T,
    tab: StoreTableTabs<T>,
    updateFilterCallback?: () => void
): UseAggridRowFilterOutputType {
    // @ts-expect-error we don't know at compile time which table tab it is
    const filterStore: FilterSelectorType[] = useSelector((state: AppState) => state[table][tab]);

    const dispatch = useDispatch<AppDispatch>();
    const updateFilter = useCallback(
        (field: string, data: FilterDataType): void => {
            const newFilter: FilterSelectorType = {
                column: field,
                dataType: data.dataType,
                type: data.type,
                value: data.value,
            };
            let updatedFilters: FilterSelectorType[];

            if (!data.value) {
                // remove element from array with field value
                updatedFilters = filterStore.filter((f: FilterSelectorType) => f.column !== field);
            } else {
                updatedFilters = changeValueFromArrayWithFieldValue(filterStore, field, newFilter);
            }

            updateFilterCallback?.();
            dispatch(setTableFilter(table, tab, updatedFilters));
        },
        [updateFilterCallback, dispatch, table, tab, filterStore]
    );

    return { updateFilter, filterSelector: filterStore };
}
