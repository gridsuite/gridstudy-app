/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback } from 'react';
import { useStore } from 'react-redux';
import { GridReadyEvent } from 'ag-grid-community';
import { FilterType } from '../../../types/custom-aggrid-types';
import { updateAgGridFilters } from '../../custom-aggrid/custom-aggrid-filters/utils/aggrid-filters-utils';
import type { RootState } from '../../../redux/store';

/**
 * A hook to handle the initialization of AG Grid with saved filters.
 * It applies filters from the store and sizes columns to fit.
 *
 * @param filterType The type of computation (e.g., Short circuitAnalysis, SecurityAnalysis)
 * @param computationSubType The subtype of computation (e.g., ONE_BUS, ALL_BUSES)
 * @param onGridReady Optional callback to be called at the end of onGridReady
 */
export const useAgGridInitialColumnFilters = (
    filterType: FilterType,
    computationSubType: string,
    onGridReady?: (params: GridReadyEvent) => void
) => {
    const store = useStore<RootState>();

    return useCallback(
        (params: GridReadyEvent) => {
            const api = params.api;
            if (!api) return;
            const { computationFilters } = store.getState();
            const filters = computationFilters?.[filterType]?.columnsFilters?.[computationSubType]?.columns;
            updateAgGridFilters(api, filters);
            requestAnimationFrame(() => {
                api.sizeColumnsToFit();
            });
            onGridReady?.(params);
        },
        [filterType, computationSubType, store, onGridReady]
    );
};
