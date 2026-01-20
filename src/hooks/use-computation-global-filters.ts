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
import { useCallback } from 'react';
import { updateComputationResultFilters } from '../services/study/study-config';
import { updateGlobalFiltersAction } from '../redux/actions';

export function useComputationGlobalFilters(filterType: FilterType) {
    const dispatch = useDispatch();

    const globalFiltersFromState = useSelector<AppState, GlobalFilter[]>(
        (state) => state.computationFilters?.[filterType]?.globalFilters || []
    );
    const studyUuid = useSelector((state: any) => state.studyUuid);
    const comuputationResultFiltersId = useSelector((state: AppState) => state.computationFilters?.[filterType]);

    const updateGlobalFilters = useCallback(
        (rawGlobalFilters: GlobalFilter[]) => {
            if (!comuputationResultFiltersId?.id) return;

            dispatch(updateGlobalFiltersAction(filterType, rawGlobalFilters));

            updateComputationResultFilters(studyUuid, comuputationResultFiltersId.id, rawGlobalFilters).then();
        },
        [dispatch, filterType, studyUuid, comuputationResultFiltersId?.id]
    );

    return {
        globalFiltersFromState,
        updateGlobalFilters,
    };
}
