/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { TableType } from '@gridsuite/commons-ui';
import { updateAgGridFilters } from '../../custom-aggrid/custom-aggrid-filters/utils/aggrid-filters-utils';
import type { RootState } from '../../../redux/store';

/**
 * A hook to handle the initialization of AG Grid with saved filters.
 * It applies filters from the store and sizes columns to fit.
 *
 * @param tableType The type of computation (e.g., Short circuitAnalysis, SecurityAnalysis)
 * @param computationSubType The subtype of computation (e.g., ONE_BUS, ALL_BUSES)
 * @param onGridReady Optional callback to be called at the end of onGridReady
 */
export const useAgGridInitialColumnFilters = (
    tableType: TableType,
    computationSubType: string,
    onGridReady?: (params: GridReadyEvent) => void
) => {
    const [gridApi, setGridApi] = useState<GridApi | undefined>(undefined);
    const filters = useSelector(
        (state: RootState) => state.tableFilters.columnsFilters?.[tableType]?.[computationSubType]
    );

    // re-runs when the filters change AND when a new grid becomes ready
    useEffect(() => {
        if (!gridApi || gridApi.isDestroyed()) {
            return;
        }
        updateAgGridFilters(gridApi, filters);
    }, [filters, gridApi]);

    return useCallback(
        (params: GridReadyEvent) => {
            if (!params.api) {
                return;
            }
            setGridApi(params.api); // triggers the effect above with the current filters
            requestAnimationFrame(() => {
                if (!params.api.isDestroyed()) {
                    params.api.sizeColumnsToFit();
                }
            });
            onGridReady?.(params);
        },
        [onGridReady]
    );
};
