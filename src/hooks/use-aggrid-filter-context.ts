/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { GridApi } from 'ag-grid-community';
import { FilterConfig, FilterType } from '../types/custom-aggrid-types';
import { useCallback, useMemo } from 'react';
import { useUpdateComputationColumnsFilters } from './use-update-computation-columns-filters';

export type AgGridFilterContext = {
    filterType: FilterType;
    filterTab: string;
    onFilterChange?: (params: { api: GridApi; filters: FilterConfig[]; colId: string }) => void;
};

export function useAgGridFilterContext(filterType: FilterType, tab: string): AgGridFilterContext {
    const { persistFilters } = useUpdateComputationColumnsFilters(filterType, tab);

    const onFilterChange = useCallback(
        ({ api, filters, colId }: { api: GridApi; filters: FilterConfig[]; colId: string }) => {
            persistFilters(colId, api, filters);
        },
        [persistFilters]
    );

    return useMemo(
        () => ({
            filterType,
            filterTab: tab,
            onFilterChange,
        }),
        [filterType, tab, onFilterChange]
    );
}
