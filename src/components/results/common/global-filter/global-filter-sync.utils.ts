/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { GlobalFilter } from './global-filter-types';

const DEFAULT_GLOBAL_FILTER_SYNC_DEBOUNCE_MS = 2000;

const debouncedSyncTimers: Record<string, ReturnType<typeof setTimeout>> = {};

export type SyncGlobalFiltersParameters = {
    index: string;
    globalFilters: GlobalFilter[];
    save: (globalFilters: GlobalFilter[]) => Promise<unknown>;
    onSyncStart: (index: string) => void;
    onSyncEnd: (index: string) => void;
    onError: (error: unknown) => void;
    debounceMs?: number;
};

export function syncGlobalFilters({
    index,
    globalFilters,
    save,
    onSyncStart,
    onSyncEnd,
    onError,
    debounceMs = DEFAULT_GLOBAL_FILTER_SYNC_DEBOUNCE_MS,
}: SyncGlobalFiltersParameters): void {
    onSyncStart(index);

    if (debouncedSyncTimers[index]) {
        clearTimeout(debouncedSyncTimers[index]);
    }

    debouncedSyncTimers[index] = setTimeout(() => {
        save(globalFilters)
            .catch(onError)
            .finally(() => {
                // Only end the sync if no new debounce timer was started while the save was in flight.
                if (!debouncedSyncTimers[index]) {
                    onSyncEnd(index);
                }
            });

        delete debouncedSyncTimers[index];
    }, debounceMs);
}
