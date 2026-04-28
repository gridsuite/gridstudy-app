/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { store } from '../store';
import { FilterConfig, TableType } from '../../types/custom-aggrid-types';
import { getColumnFiltersFromState } from './filter-selectors';

/**
 * Get column filters directly from Redux store without using hooks.
 * This is useful in callbacks to avoid re-creating callbacks on every filter change.
 */
export const getColumnFiltersFromStore = (filterType: TableType, filterTab: string): FilterConfig[] | undefined => {
    return getColumnFiltersFromState(store.getState(), filterType, filterTab);
};
