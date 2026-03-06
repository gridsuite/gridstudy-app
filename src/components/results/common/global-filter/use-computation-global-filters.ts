/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { TableType } from '../../../../types/custom-aggrid-types';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer.type';
import { GlobalFilter } from './global-filter-types';
import { useEffect } from 'react';
import { getComputationResultGlobalFilters } from '../../../../services/study/study-config';
import { initOrUpdateGlobalFilters } from '../../../../redux/actions';
import { useSelectedGlobalFilters } from './use-selected-global-filters';
import { UUID } from 'node:crypto';
import { Dispatch } from 'redux';

export function updateComputationGlobalFilters(dispatch: Dispatch, studyUuid: UUID, tableType: TableType) {
    getComputationResultGlobalFilters(studyUuid, tableType).then((globalFiltersInfos: GlobalFilter[] | null) => {
        const globalFilters = Array.isArray(globalFiltersInfos) ? globalFiltersInfos : [];
        dispatch(initOrUpdateGlobalFilters(tableType, globalFilters));
    });
}

// Get the global filters for a given table from the server and store them in the Redux store
export function useFetchComputationGlobalFilters(tableType: TableType) {
    const dispatch = useDispatch();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    useEffect(() => {
        if (studyUuid) {
            updateComputationGlobalFilters(dispatch, studyUuid, tableType);
        }
    }, [dispatch, studyUuid, tableType]);
}

export function useComputationGlobalFilters(tableType: TableType, onGlobalFiltersChange?: () => void) {
    useFetchComputationGlobalFilters(tableType);
    const selectedGlobalFilters = useSelectedGlobalFilters(tableType);

    useEffect(() => {
        onGlobalFiltersChange?.();
    }, [onGlobalFiltersChange, selectedGlobalFilters]);

    return selectedGlobalFilters;
}
