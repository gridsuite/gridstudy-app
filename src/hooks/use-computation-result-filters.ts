/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FilterType, FilterConfig } from '../types/custom-aggrid-types';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../redux/reducer';
import { GlobalFilter } from '../components/results/common/global-filter/global-filter-types';
import { updateColumnFiltersAction, updateGlobalFiltersAction } from '../redux/actions';
import useGlobalFilters from '../components/results/common/global-filter/use-global-filters';
import { useCallback, useMemo } from 'react';

export function useComputationFilters(filterType: FilterType, tabId: string) {
    const dispatch = useDispatch();
    const { buildGlobalFilters } = useGlobalFilters();

    const config = useSelector((state: AppState) => state.computationFilters?.[filterType]);

    const columnFilters = useMemo(() => config?.columnsFilters?.[tabId] || [], [config?.columnsFilters, tabId]);

    const globalFilters = useMemo(() => config?.globalFilters ?? undefined, [config?.globalFilters]);

    const updateColumnFilters = useCallback(
        (filters: FilterConfig[]) => {
            dispatch(updateColumnFiltersAction(filterType, tabId, filters));
        },
        [dispatch, filterType, tabId]
    );

    const updateGlobalFilters = useCallback(
        (rawGlobalFilters: GlobalFilter[]) => {
            const newGlobalFilters = buildGlobalFilters(rawGlobalFilters);
            dispatch(updateGlobalFiltersAction(filterType, newGlobalFilters));
        },
        [dispatch, filterType, buildGlobalFilters]
    );

    return useMemo(
        () => ({
            columnFilters,
            globalFilters,
            updateColumnFilters,
            updateGlobalFilters,
        }),
        [columnFilters, globalFilters, updateColumnFilters, updateGlobalFilters]
    );
}
