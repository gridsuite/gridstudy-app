/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { GlobalFilter } from './global-filter-types';
import { RootState, store } from '../../../../redux/store';

/**
 * Subscribes to the store and returns the selected global filters for the given table key.
 * Use this when you need that your component is re-rendered whenever the selected filters change.
 * Otherwise, use `getSelectedGlobalFilters` which get the current state of the selected filters.
 */
export function useSelectedGlobalFilters(tableKey: string): GlobalFilter[] {
    const globalFilterOptions = useSelector((state: RootState) => state.globalFilterOptions);
    const selectedFilterIds = useSelector((state: RootState) => state.tableFilters.globalFilters[tableKey]);

    return useMemo(
        () =>
            selectedFilterIds
                ? selectedFilterIds
                      .map((id) => globalFilterOptions.find((opt) => opt.id === id))
                      .filter((f) => f !== undefined)
                : [],
        [selectedFilterIds, globalFilterOptions]
    );
}

/**
 * Reads the selected global filter IDs for the given table key from the store,
 * joins them with the global filter options, and returns the resolved `GlobalFilter[]`.
 * Use this when you need the selected filters at a T time, e.g. when fetching the data.
 * Otherwise, use `useSelectedGlobalFilters` which subscribes to the store.
 */
export function getSelectedGlobalFilters(tableKey: string): GlobalFilter[] {
    const state = store.getState() as RootState;
    const filterIds = state.tableFilters.globalFilters[tableKey] ?? [];
    const globalFilterOptions = state.globalFilterOptions;
    return filterIds.map((id) => globalFilterOptions.find((opt) => opt.id === id)).filter((f) => f !== undefined);
}
