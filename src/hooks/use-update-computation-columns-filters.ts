/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FilterConfig, FilterType } from '../types/custom-aggrid-types';
import { useSelector } from 'react-redux';
import { useCallback } from 'react';
import { updateComputationResultFiltersColumn } from '../services/study/study-config';
import { updateFilters } from '../components/custom-aggrid/custom-aggrid-filters/utils/aggrid-filters-utils';
import { GridApi } from 'ag-grid-community';

export function useUpdateComputationColumnsFilters(filterType: FilterType, filterTab: string) {
    const studyUuid = useSelector((state: any) => state.studyUuid);
    const computationResultFilterUuid = useSelector((state: any) => state.computationFilters?.[filterType]?.id);
    const columnUuid = useSelector(
        (state: any) => state.computationFilters?.[filterType]?.columnsFilters?.[filterTab]?.id
    );

    const updateColumnFilters = useCallback(
        (colId: string, agGridApi: GridApi, filters: FilterConfig[]) => {
            if (!studyUuid || !computationResultFilterUuid || !columnUuid) return;
            const filter = filters.find((f) => f.column === colId);
            const columnDto = {
                name: colId,
                id: colId,
                filterDataType: filter?.dataType,
                filterType: filter?.type,
                filterValue: filter?.value,
                filterTolerance: filter?.tolerance,
            };
            updateFilters(agGridApi, filters);
            updateComputationResultFiltersColumn(studyUuid, computationResultFilterUuid, columnUuid, columnDto).then();
        },
        [studyUuid, computationResultFilterUuid, columnUuid]
    );

    return { updateColumnFilters };
}
