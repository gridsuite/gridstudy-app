/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { isAction, Middleware } from '@reduxjs/toolkit';
import {
    ADD_GLOBAL_FILTERS,
    ADD_TO_GLOBAL_FILTER_OPTIONS,
    CLEAR_GLOBAL_FILTERS,
    GlobalFilterAction,
    MARK_NOT_FOUND_GLOBAL_FILTERS_AS_DELETED,
    REMOVE_GLOBAL_FILTERS,
} from './actions';
import { setComputationResultGlobalFilters, setGlobalFiltersToSpreadsheetConfig } from 'services/study/study-config';
import { TableType } from '../types/custom-aggrid-types';
import { UUID } from 'node:crypto';
import type { AppState } from './reducer.type';
import { markEditingGlobalFilter, unmarkEditingGlobalFilter } from '../utils/editing-global-filter-sync';

const debouncedSyncTimers: Record<string, ReturnType<typeof setTimeout>> = {};

/**
 * Redux middleware that synchronizes global filter changes with the backend.
 * When global filters are added or removed, this middleware automatically sends the updated filters list to the server.
 * This ensures that the server state remains in sync with the client-side filter state from Redux.
 */
export const globalFiltersMiddleware: Middleware<{}, AppState> = (store) => (next) => (action) => {
    const result = next(action); // Let Redux update the state first

    if (!isAction(action)) {
        return result;
    }

    // Synchronize filter changes with the backend
    switch (action.type) {
        case ADD_GLOBAL_FILTERS:
        case ADD_TO_GLOBAL_FILTER_OPTIONS:
        case MARK_NOT_FOUND_GLOBAL_FILTERS_AS_DELETED:
        case REMOVE_GLOBAL_FILTERS:
        case CLEAR_GLOBAL_FILTERS: {
            const { tableType, tableId } = action as GlobalFilterAction;

            // State after the action
            const state = store.getState();
            const studyUuid = state.studyUuid;
            const index = tableId ?? tableType;
            if (!studyUuid || !index) {
                break;
            }

            // Protection from overriding more recent filters from backend notification
            markEditingGlobalFilter(index);

            const tableFiltersState = state.tableFilters.globalFilters[index];

            const selectedFiltersIds = tableFiltersState?.selected ?? [];
            const selectedGlobalFilters = state.globalFilterOptions.filter((filter) =>
                selectedFiltersIds.includes(filter.id)
            );

            const recentFilters = tableFiltersState?.recents ?? [];
            const recentGlobalFilters = recentFilters
                .map((recentFilter) => {
                    const filterOption = state.globalFilterOptions.find((opt) => opt.id === recentFilter.id);
                    return filterOption ? { ...filterOption, unselectedDate: recentFilter.unselectedDate } : undefined;
                })
                .filter((f) => f !== undefined);

            const globalFilters = [...selectedGlobalFilters, ...recentGlobalFilters];

            // Debounce per table to avoid excessive requests
            if (debouncedSyncTimers[index]) {
                clearTimeout(debouncedSyncTimers[index]);
            }

            debouncedSyncTimers[index] = setTimeout(() => {
                const globalFilterPromise =
                    tableType === TableType.Spreadsheet
                        ? setGlobalFiltersToSpreadsheetConfig(studyUuid, tableId as UUID, globalFilters)
                        : setComputationResultGlobalFilters(studyUuid, tableType, globalFilters);

                globalFilterPromise
                    .catch((error) => {
                        console.error('Failed to save global filters: ', error);
                    })
                    .finally(() => {
                        // Only unmark if no new debounce timer was started while the POST was in flight
                        if (!debouncedSyncTimers[index]) {
                            unmarkEditingGlobalFilter(index);
                        }
                    });

                delete debouncedSyncTimers[index];
            }, 2000);

            break;
        }
    }

    return result;
};
