/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { GlobalFilter, RecentGlobalFilter } from '../global-filter.type';

export const MAX_RECENT_GLOBAL_FILTERS = 10;

export type GlobalFilterTableState = {
    selected: string[];
    recents: RecentGlobalFilter[];
};

const EMPTY_GLOBAL_FILTER_TABLE_STATE: GlobalFilterTableState = { selected: [], recents: [] };

function ensureGlobalFilterTableState(tableState?: GlobalFilterTableState): GlobalFilterTableState {
    return tableState ?? EMPTY_GLOBAL_FILTER_TABLE_STATE;
}

export function addSelectedGlobalFiltersToTableState(
    tableState: GlobalFilterTableState | undefined,
    filterIds: string[]
): GlobalFilterTableState {
    const currentTableState = ensureGlobalFilterTableState(tableState);
    const selected = [...currentTableState.selected];
    let recents = currentTableState.recents;

    filterIds.forEach((id) => {
        if (!selected.includes(id)) {
            selected.push(id);
        }
        recents = recents.filter((recentFilter) => recentFilter.id !== id);
    });

    return {
        selected,
        recents,
    };
}

export function removeSelectedGlobalFiltersFromTableState(
    tableState: GlobalFilterTableState | undefined,
    filterIds: string[],
    globalFilterOptions: GlobalFilter[],
    unselectedDate: number = Date.now()
): GlobalFilterTableState {
    const currentTableState = ensureGlobalFilterTableState(tableState);
    const selected = currentTableState.selected.filter((id) => !filterIds.includes(id));
    const recents = [...currentTableState.recents];

    filterIds.forEach((filterId) => {
        const filterOption = globalFilterOptions.find((opt) => opt.id === filterId);
        if (!filterOption?.deleted) {
            recents.unshift({ id: filterId, unselectedDate });
        }
    });

    return {
        selected,
        recents: recents.slice(0, MAX_RECENT_GLOBAL_FILTERS),
    };
}

export function clearSelectedGlobalFiltersFromTableState(
    tableState: GlobalFilterTableState | undefined,
    globalFilterOptions: GlobalFilter[],
    unselectedDate: number = Date.now()
): GlobalFilterTableState {
    const currentTableState = ensureGlobalFilterTableState(tableState);
    const newRecents = currentTableState.selected
        .filter((filterId) => {
            const filterOption = globalFilterOptions.find((opt) => opt.id === filterId);
            return !filterOption?.deleted;
        })
        .map((filterId) => ({ id: filterId, unselectedDate }));

    return {
        selected: [],
        recents: [...newRecents, ...currentTableState.recents].slice(0, MAX_RECENT_GLOBAL_FILTERS),
    };
}

export type MarkNotFoundGlobalFiltersAsDeletedResult = {
    globalFilterOptions: GlobalFilter[];
    tableState?: GlobalFilterTableState;
};

export function markNotFoundGlobalFiltersAsDeletedInState(
    globalFilterOptions: GlobalFilter[],
    tableState: GlobalFilterTableState | undefined,
    notFoundGlobalFilters: GlobalFilter[]
): MarkNotFoundGlobalFiltersAsDeletedResult {
    const ids = new Set(notFoundGlobalFilters.map((filter) => filter.id));
    const updatedGlobalFilterOptions = globalFilterOptions.map((globalFilter) =>
        ids.has(globalFilter.id) ? { ...globalFilter, deleted: true } : globalFilter
    );

    if (!tableState) {
        return {
            globalFilterOptions: updatedGlobalFilterOptions,
        };
    }

    return {
        globalFilterOptions: updatedGlobalFilterOptions,
        tableState: {
            selected: tableState.selected,
            recents: tableState.recents?.length
                ? tableState.recents.filter((recentFilter) => !ids.has(recentFilter.id))
                : tableState.recents,
        },
    };
}
