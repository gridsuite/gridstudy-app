/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FilterConfig, TableType } from '../../../../types/custom-aggrid-types';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer';
import { useEffect } from 'react';
import { getComputationResultColumnFilters } from '../../../../services/study/study-config';
import { updateColumnFiltersAction } from '../../../../redux/actions';

export type ComputationResultColumnFilterInfos = {
    columnId: string;
    columnFilterInfos: FilterConfig;
};
function toColumnFilterInfos(infos: ComputationResultColumnFilterInfos[] | null): FilterConfig[] {
    if (!Array.isArray(infos)) {
        return EMPTY_ARRAY;
    }
    return infos.flatMap(mapColumnFilters);
}

function mapColumnFilters({ columnId, columnFilterInfos }: ComputationResultColumnFilterInfos): FilterConfig[] {
    const filters = Array.isArray(columnFilterInfos) ? columnFilterInfos : [columnFilterInfos];

    return filters.map((filter) => ({
        column: columnId,
        value: filter.filterValue,
        type: filter.filterType,
        dataType: filter.filterDataType,
        tolerance: filter.filterTolerance ?? undefined,
    }));
}

const EMPTY_ARRAY: FilterConfig[] = [];
export function useComputationColumnFilters(tableType: TableType, computationSubType: string) {
    const dispatch = useDispatch();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    useEffect(() => {
        studyUuid &&
            getComputationResultColumnFilters(studyUuid, tableType, computationSubType).then((infos) => {
                const filters = toColumnFilterInfos(infos);
                dispatch(updateColumnFiltersAction(tableType, computationSubType, filters));
            });
    }, [dispatch, studyUuid, tableType, computationSubType]);
    const filters = useSelector<AppState, FilterConfig[]>(
        (state) => state.tableFilters.columnsFilters?.[tableType]?.[computationSubType]?.columns ?? EMPTY_ARRAY
    );
    return {
        filters,
    };
}
