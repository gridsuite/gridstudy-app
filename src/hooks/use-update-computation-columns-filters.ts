/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { GridApi } from 'ag-grid-community';
import { FilterConfig, FilterType } from '../types/custom-aggrid-types';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { updateFilters } from '../components/custom-aggrid/custom-aggrid-filters/utils/aggrid-filters-utils';
import { updateComputationResultFiltersColumn } from '../services/study/study-config';

export type AgGridFilterContext = {
    filterType: FilterType;
    filterTab: string;
    onFilterChange?: (params: { agGridApi: GridApi; filters: FilterConfig[]; colId: string }) => void;
};

export function useUpdateComputationColumnsFilters(
    filterType: FilterType,
    tab: string,
    onBeforePersist?: () => void
): AgGridFilterContext {
    const studyUuid = useSelector((state: any) => state.studyUuid);
    const computationResultFilterUuid = useSelector((state: any) => state.computationFilters?.[filterType]?.id);
    const columnUuid = useSelector((state: any) => state.computationFilters?.[filterType]?.columnsFilters?.[tab]?.id);

    const onFilterChange = useCallback(
        ({ agGridApi, filters, colId }: { agGridApi: GridApi; filters: FilterConfig[]; colId: string }) => {
            if (!studyUuid || !computationResultFilterUuid || !columnUuid) return;
            onBeforePersist?.();
            const filter = filters.find((f) => f.column === colId);
            updateFilters(agGridApi, filters);
            const columnDto = {
                name: colId,
                id: colId,
                filterDataType: filter?.dataType,
                filterType: filter?.type,
                filterValue: filter?.value,
                filterTolerance: filter?.tolerance,
            };
            updateComputationResultFiltersColumn(studyUuid, computationResultFilterUuid, columnUuid, columnDto).then();
        },
        [studyUuid, computationResultFilterUuid, columnUuid, onBeforePersist]
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
