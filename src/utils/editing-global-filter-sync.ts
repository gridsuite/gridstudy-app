/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Module-level tracker for global filters being edited by the user.
 * When a key is marked as editing, notification-triggered dispatches should be skipped
 * to prevent stale backend data from overwriting more recent local state.
 */
const editingGlobalFilters = new Set<string>();

export function markEditingGlobalFilter(key: string): void {
    editingGlobalFilters.add(key);
}

export function unmarkEditingGlobalFilter(key: string): void {
    editingGlobalFilters.delete(key);
}

export function isEditingGlobalFilter(key: string): boolean {
    return editingGlobalFilters.has(key);
}
