/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

type ComputationResultColumnFilterInfos = {
    columnId: string;
    columnFilterInfos: FilterConfig;
};
export const EMPTY_ARRAY: FilterConfig[] = [];
function toFilterConfig(infos: ComputationResultColumnFilterInfos[] | null): FilterConfig[] {
    if (!Array.isArray(infos)) {
        return EMPTY_ARRAY;
    }
    return infos.flatMap(({ columnId, columnFilterInfos }) =>
        (Array.isArray(columnFilterInfos) ? columnFilterInfos : [columnFilterInfos]).map((filter) => ({
            column: columnId,
            value: JSON.parse(filter.filterValue),
            type: filter.filterType,
            dataType: filter.filterDataType,
            tolerance: filter.filterTolerance,
        }))
    );
}

export function updateComputationColumnFilters(
    dispatch: Dispatch,
    studyUuid: UUID,
    tableType: TableType,
    computationSubtype: string
) {
    getComputationResultColumnFilters(studyUuid, tableType, computationSubtype).then((infos) => {
        const filters = toFilterConfig(infos);
        dispatch(updateColumnFiltersAction(tableType, computationSubtype, filters));
    });
}

export function updateComputationGlobalFilters(dispatch: Dispatch, studyUuid: UUID, tableType: TableType) {
    getComputationResultGlobalFilters(studyUuid, tableType).then((globalFiltersInfos: GlobalFilter[] | null) => {
        const globalFilters = Array.isArray(globalFiltersInfos) ? globalFiltersInfos : [];
        dispatch(initOrUpdateGlobalFilters(tableType, globalFilters));
    });
}
