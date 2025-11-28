/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FilterConfig, FilterType } from '../types/custom-aggrid-types';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../redux/reducer';
import { GlobalFilter } from '../components/results/common/global-filter/global-filter-types';
import { updateColumnFiltersAction, updateGlobalFiltersAction } from '../redux/actions';
import { useCallback, useMemo } from 'react';
import { updateComputationResultFilters } from '../services/study/study-config';
import { createSelector } from '@reduxjs/toolkit';
import useGlobalFilters from '../components/results/common/global-filter/use-global-filters';

export const makeSelectColumnFilters = () =>
    createSelector(
        (state: AppState) => state.computationFilters,
        (_: AppState, filterType: FilterType) => filterType,
        (_: AppState, __: FilterType, tabId: string) => tabId,
        (computationFilters, filterType, tabId) => computationFilters?.[filterType]?.columnsFilters?.[tabId]
    );

export const makeSelectGlobalFilters = () =>
    createSelector(
        (state: AppState) => state.computationFilters,
        (_: AppState, filterType: FilterType) => filterType,
        (computationFilters, filterType) => computationFilters?.[filterType]?.globalFilters
    );

export function useComputationFilters(filterType: FilterType, tabId: string) {
    const dispatch = useDispatch();
    const { buildGlobalFilters } = useGlobalFilters();
    const selectColumnFilters = useMemo(makeSelectColumnFilters, []);
    const selectGlobalFilters = useMemo(makeSelectGlobalFilters, []);
    const studyUuid = useSelector((state: any) => state.studyUuid);
    const config = useSelector((state: AppState) => state.computationFilters?.[filterType]);

    const columnFilters = useSelector((state: AppState) => selectColumnFilters(state, filterType, tabId));

    const globalFilters = useSelector((state: AppState) => selectGlobalFilters(state, filterType));

    const updateColumnFilters = useCallback(
        (filters: FilterConfig[]) => {
            dispatch(updateColumnFiltersAction(filterType, tabId, filters));
        },
        [dispatch, filterType, tabId]
    );

    const updateGlobalFilters = useCallback(
        (rawGlobalFilters: GlobalFilter[]) => {
            if (!config?.id) return;
            dispatch(updateGlobalFiltersAction(filterType, rawGlobalFilters));
            updateComputationResultFilters(studyUuid, config.id, rawGlobalFilters).then();
        },
        [dispatch, filterType, studyUuid, config?.id]
    );
    const builtGlobalFilters = useMemo(() => {
        return globalFilters ? buildGlobalFilters(globalFilters) : {};
    }, [globalFilters, buildGlobalFilters]);

    return useMemo(
        () => ({
            columnFilters,
            globalFilters: builtGlobalFilters,
            updateColumnFilters,
            updateGlobalFilters,
        }),
        [builtGlobalFilters, columnFilters, updateColumnFilters, updateGlobalFilters]
    );
}
