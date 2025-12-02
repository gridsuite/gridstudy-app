/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FilterType } from '../types/custom-aggrid-types';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../redux/reducer';
import { GlobalFilter } from '../components/results/common/global-filter/global-filter-types';
import { updateGlobalFiltersAction } from '../redux/actions';
import { useCallback } from 'react';

const getGlobalFiltersFromState = (state: AppState, filterType: FilterType): GlobalFilter[] => {
    return state.computationFilters?.[filterType]?.globalFilters || [];
};

export const useGlobalFilterSelector = (filterType: FilterType) => {
    const filters = useSelector<AppState, GlobalFilter[]>((state: AppState) =>
        getGlobalFiltersFromState(state, filterType)
    );

    const dispatch = useDispatch();

    const dispatchGlobalFilters = useCallback(
        (newFilters: GlobalFilter[]) => {
            dispatch(updateGlobalFiltersAction(filterType, newFilters));
        },
        [dispatch, filterType]
    );

    return { filters, dispatchFilters: dispatchGlobalFilters };
};
