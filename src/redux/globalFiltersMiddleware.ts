/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { isAction, Middleware } from '@reduxjs/toolkit';
import { ADD_GLOBAL_FILTERS, CLEAR_GLOBAL_FILTERS, GlobalFilterAction, REMOVE_GLOBAL_FILTERS } from './actions';
import { setComputationResultGlobalFilters, setGlobalFiltersToSpreadsheetConfig } from 'services/study/study-config';
import { TableType } from '../types/custom-aggrid-types';
import { UUID } from 'node:crypto';
import { AppState } from './reducer';

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
        case REMOVE_GLOBAL_FILTERS:
        case CLEAR_GLOBAL_FILTERS: {
            const { tableType, tableId } = action as GlobalFilterAction;
            // State after the action
            const state = store.getState();
            const studyUuid = state.studyUuid;
            if (!studyUuid) {
                break;
            }

            const index = tableId ?? tableType;
            const globalFiltersIds = state.tableFilters.globalFilters[index] ?? [];
            const globalFilters =
                globalFiltersIds.length === 0
                    ? []
                    : state.globalFilterOptions.filter((filter) => globalFiltersIds.includes(filter.id));

            // Debounce per table to avoid excessive requests
            if (debouncedSyncTimers[index]) {
                clearTimeout(debouncedSyncTimers[index]);
            }
            debouncedSyncTimers[index] = setTimeout(() => {
                if (tableType === TableType.Spreadsheet) {
                    setGlobalFiltersToSpreadsheetConfig(studyUuid, tableId as UUID, globalFilters).catch((error) =>
                        console.error('Failed to save spreadsheet global filters: ', error)
                    );
                } else {
                    setComputationResultGlobalFilters(studyUuid, tableType, globalFilters).catch((error) =>
                        console.error('Failed to save computation global filters: ', error)
                    );
                }
                delete debouncedSyncTimers[index];
            }, 2000);

            break;
        }
    }

    return result;
};
