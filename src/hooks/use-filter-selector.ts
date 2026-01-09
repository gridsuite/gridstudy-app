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
import { FilterConfig, FilterType } from '../types/custom-aggrid-types';
import { useCallback } from 'react';

const FILTER_PARAMS: Partial<
    Record<
        FilterType,
        { filterType: string; filterStoreAction: (filterTab: any, filter: FilterConfig[]) => UnknownAction }
    >
> = {
    [FilterType.Spreadsheet]: {
        filterType: SPREADSHEET_STORE_FIELD,
        filterStoreAction: setSpreadsheetFilter,
    },
    [FilterType.Logs]: {
        filterType: LOGS_STORE_FIELD,
        filterStoreAction: setLogsFilter,
    },
};

const EMPTY_ARRAY: FilterConfig[] = [];

const getFilterFromState = (state: AppState, storeField: string, filterTab: string): FilterConfig[] => {
    return (state as Record<string, any>)[storeField]?.[filterTab] || [];
};

export const useFilterSelector = (filterType: FilterType, filterTab: string) => {
    const entry = FILTER_PARAMS[filterType];

    const filters = useSelector<AppState, FilterConfig[]>((state: AppState) => {
        if (!entry) {
            const cf = state.computationFilters?.[filterType]?.columnsFilters?.[filterTab];
            if (!cf) return EMPTY_ARRAY;
            if (Array.isArray(cf)) return cf;
            return cf.columns ?? EMPTY_ARRAY;
        }
        return getFilterFromState(state, entry.filterType, filterTab);
    });

    const dispatch = useDispatch();

    const dispatchFilters = useCallback(
        (newFilters: FilterConfig[]) => {
            if (!entry) {
                dispatch(updateColumnFiltersAction(filterType, filterTab, newFilters));
            } else {
                dispatch(entry.filterStoreAction(filterTab, newFilters));
            }
        },
        [entry, dispatch, filterType, filterTab]
    );

    return { filters, dispatchFilters };
};
