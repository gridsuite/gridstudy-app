/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { PropsWithChildren, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { UUID } from 'node:crypto';
import {
    CustomAggridFilterContext,
    type CustomAggridFilterContextValue,
    CustomAggridSortContext,
    type CustomAggridSortContextValue,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { AppState } from '../../redux/reducer.type';
import { setTableSort, updateColumnFiltersAction } from '../../redux/actions';
import { FilterConfig, FilterParams, SortConfig, SortParams, TableType } from '../../types/custom-aggrid-types';
import { persistSpreadsheetColumnFilter } from '../spreadsheet-view/columns/utils/persist-spreadsheet-column-filter';
import { persistComputationColumnFilter } from '../results/common/column-filter/persist-computation-column-filter';

const CustomAggridSortReduxProvider = ({ children }: PropsWithChildren) => {
    const dispatch = useDispatch();
    const tableSort = useSelector((state: AppState) => state.tableSort);

    const getSortConfig = useCallback(
        (sortParams: SortParams | undefined): SortConfig[] | undefined => {
            if (!sortParams) {
                return undefined;
            }
            return tableSort[sortParams.table]?.[sortParams.tab];
        },
        [tableSort]
    );

    const setSortConfig = useCallback(
        (sortParams: SortParams, updatedSortConfig: SortConfig[]) => {
            dispatch(setTableSort(sortParams.table, sortParams.tab, updatedSortConfig));
        },
        [dispatch]
    );

    const value: CustomAggridSortContextValue = useMemo(
        () => ({ getSortConfig, setSortConfig }),
        [getSortConfig, setSortConfig]
    );

    return <CustomAggridSortContext.Provider value={value}>{children}</CustomAggridSortContext.Provider>;
};

const CustomAggridFilterReduxProvider = ({ children }: PropsWithChildren) => {
    const dispatch = useDispatch();
    const { snackError } = useSnackMessage();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const tableDefinitions = useSelector((state: AppState) => state.tables.definitions);
    const tableFilters = useSelector((state: AppState) => state.tableFilters);

    const getFilters = useCallback(
        ({ type, tab }: Pick<FilterParams, 'type' | 'tab'>): FilterConfig[] => {
            return tableFilters.columnsFilters?.[type]?.[tab] ?? [];
        },
        [tableFilters]
    );

    const updateFilter = useCallback(
        (
            colId: string,
            filterParams: FilterParams,
            updatedFilters: FilterConfig[],
            colFilter: FilterConfig | undefined
        ) => {
            if (!studyUuid) {
                return;
            }
            const { type, tab } = filterParams;
            const onError = (error: unknown) => snackWithFallback(snackError, error);
            const colDef = tableDefinitions.find((t) => t.uuid === tab)?.columns?.find((col) => col.id === colId);

            if (type === TableType.Logs) {
                dispatch(updateColumnFiltersAction(TableType.Logs, tab, updatedFilters));
            } else if (type === TableType.Spreadsheet) {
                persistSpreadsheetColumnFilter(studyUuid, tab as UUID, colDef, colFilter, onError);
            } else {
                persistComputationColumnFilter(studyUuid, type, tab, colId, colFilter, onError);
            }
        },
        [studyUuid, tableDefinitions, dispatch, snackError]
    );

    const value: CustomAggridFilterContextValue = useMemo(
        () => ({ getFilters, updateFilter }),
        [getFilters, updateFilter]
    );

    return <CustomAggridFilterContext.Provider value={value}>{children}</CustomAggridFilterContext.Provider>;
};

export const CustomAggridReduxProvider = ({ children }: PropsWithChildren) => (
    <CustomAggridSortReduxProvider>
        <CustomAggridFilterReduxProvider>{children}</CustomAggridFilterReduxProvider>
    </CustomAggridSortReduxProvider>
);
