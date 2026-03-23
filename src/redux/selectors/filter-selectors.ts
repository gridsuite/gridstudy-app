/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AppState } from '../reducer.type';
import { FilterConfig, TableType } from '../../types/custom-aggrid-types';

export const getColumnFiltersFromState = (
    state: AppState,
    filterType: TableType,
    filterTab: string
): FilterConfig[] | undefined => {
    return state.tableFilters.columnsFilters?.[filterType]?.[filterTab];
};
