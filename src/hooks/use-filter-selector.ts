/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { UnknownAction } from 'redux';
import { LOGS_STORE_FIELD, SPREADSHEET_STORE_FIELD } from '../utils/store-sort-filter-fields';
import { setLogsFilter, setSpreadsheetFilter, updateColumnFiltersAction } from '../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../redux/reducer';
import { FilterConfig, TableType } from '../types/custom-aggrid-types';
import { useCallback } from 'react';

const FILTER_ACTIONS: Partial<
    Record<
        TableType,
        { filterType: string; filterStoreAction: (filterTab: any, filter: FilterConfig[]) => UnknownAction }
    >
> = {
    [TableType.Spreadsheet]: {
        filterType: SPREADSHEET_STORE_FIELD,
        filterStoreAction: setSpreadsheetFilter,
    },
    [TableType.Logs]: {
        filterType: LOGS_STORE_FIELD,
        filterStoreAction: setLogsFilter,
    },
};

const EMPTY_ARRAY: FilterConfig[] = [];

const getFilterFromState = (state: AppState, storeField: string, filterTab: string): FilterConfig[] => {
    return (state as Record<string, any>)[storeField]?.[filterTab] || [];
};

export const useFilterSelector = (filterType: TableType, filterTab: string) => {
    const filterAction = FILTER_ACTIONS[filterType];

    const selectFilters = useCallback(
        (state: AppState): FilterConfig[] => {
            if (filterAction) {
                return getFilterFromState(state, filterAction.filterType, filterTab);
            }
            const columnsFilter = state.tableFilters.columnsFilters?.[filterType]?.[filterTab];
            if (Array.isArray(columnsFilter)) return columnsFilter;
            return columnsFilter?.columns ?? EMPTY_ARRAY;
        },
        [filterAction, filterType, filterTab]
    );
    const filters = useSelector<AppState, FilterConfig[]>(selectFilters);
    const dispatch = useDispatch();
    const dispatchFilters = useCallback(
        (newFilters: FilterConfig[]) => {
            const action =
                filterAction?.filterStoreAction ??
                ((tab: string, filters: FilterConfig[]) => updateColumnFiltersAction(filterType, tab, filters));
            dispatch(action(filterTab, newFilters));
        },
        [dispatch, filterAction, filterType, filterTab]
    );

    return { filters, dispatchFilters };
};
