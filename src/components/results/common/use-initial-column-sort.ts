/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { useSelector } from 'react-redux';
import type { AppState } from '../../../redux/reducer.type';

// Applies the sort stored in the redux store for this table to the client side ag-grid
export const useInitialColumnSort = (sortStore: string, tableName: string, enabled: boolean) => {
    const [gridApi, setGridApi] = useState<GridApi>();
    const sortConfig = useSelector((state: AppState) => state.tableSort[sortStore]?.[tableName]);

    useEffect(() => {
        if (!enabled || !gridApi || gridApi.isDestroyed()) {
            return;
        }

        gridApi.applyColumnState({
            state: sortConfig?.map((columnSort, sortIndex) => ({ ...columnSort, sortIndex })) ?? [],
            defaultState: { sort: null },
        });
    }, [enabled, gridApi, sortConfig]);

    return useCallback(
        (params: GridReadyEvent) => {
            if (!enabled || !params.api || params.api.isDestroyed()) {
                return;
            }

            setGridApi(params.api);
        },
        [enabled]
    );
};
