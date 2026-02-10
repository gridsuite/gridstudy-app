/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FilterType } from '../../../../types/custom-aggrid-types';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer';
import { GlobalFilter } from './global-filter-types';
import { useCallback, useEffect } from 'react';
import {
    getComputationResultGlobalFilters,
    updateComputationResultFilters,
} from '../../../../services/study/study-config';
import { updateGlobalFiltersAction } from '../../../../redux/actions';

const EMPTY_ARRAY: GlobalFilter[] = [];
export function useComputationGlobalFilters(filterType: FilterType) {
    const dispatch = useDispatch();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    useEffect(() => {
        studyUuid &&
            getComputationResultGlobalFilters(studyUuid, filterType).then(
                (globalFiltersInfos: GlobalFilter[] | null) => {
                    const globalFilters = Array.isArray(globalFiltersInfos) ? globalFiltersInfos : EMPTY_ARRAY;
                    dispatch(updateGlobalFiltersAction(filterType, globalFilters));
                }
            );
    }, [dispatch, studyUuid, filterType]);
    const updateGlobalFilters = useCallback(
        (rawGlobalFilters: GlobalFilter[], afterChange?: () => void) => {
            dispatch(updateGlobalFiltersAction(filterType, rawGlobalFilters));
            studyUuid && updateComputationResultFilters(studyUuid, filterType, rawGlobalFilters).then();
            afterChange?.();
        },
        [dispatch, filterType, studyUuid]
    );
    const globalFiltersFromState = useSelector<AppState, GlobalFilter[]>(
        (state) => state.computationFilters?.[filterType]?.globalFilters ?? EMPTY_ARRAY
    );
    return {
        globalFiltersFromState,
        updateGlobalFilters,
    };
}
