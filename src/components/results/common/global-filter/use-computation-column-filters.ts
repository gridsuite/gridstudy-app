/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FilterConfig, FilterType } from '../../../../types/custom-aggrid-types';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer';
import { GlobalFilter } from './global-filter-types';
import { useEffect } from 'react';
import { getComputationResultColumnFilters } from '../../../../services/study/study-config';
import { updateColumnFiltersAction } from '../../../../redux/actions';

type ComputationResultColumnFilterInfos = {
    id: string;
    columnFilterInfos: any;
};
const EMPTY_ARRAY: GlobalFilter[] = [];
export function useComputationColumnFilters(filterType: FilterType, computationSubType: string) {
    const dispatch = useDispatch();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    useEffect(() => {
        studyUuid &&
            getComputationResultColumnFilters(studyUuid, filterType, computationSubType).then(
                (columnFilterInfos: ComputationResultColumnFilterInfos[]) => {
                    const filters: FilterConfig[] = columnFilterInfos.flatMap(({ id, columnFilterInfos }) =>
                        (Array.isArray(columnFilterInfos) ? columnFilterInfos : [columnFilterInfos]).map(
                            (f): FilterConfig => ({
                                column: id,
                                value: f.filterValue,
                                type: f.filterType,
                                dataType: f.filterDataType,
                                tolerance: f.filterTolerance ?? undefined,
                            })
                        )
                    );
                    dispatch(updateColumnFiltersAction(filterType, computationSubType, filters));
                }
            );
    }, [dispatch, studyUuid, filterType, computationSubType]);
    const filters = useSelector<AppState, FilterConfig[]>(
        (state) => state.computationFilters?.[filterType]?.columnsFilters?.[computationSubType]?.columns ?? EMPTY_ARRAY
    );
    return {
        filters,
    };
}
