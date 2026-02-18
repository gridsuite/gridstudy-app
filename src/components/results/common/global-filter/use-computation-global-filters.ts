/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { TableType } from '../../../../types/custom-aggrid-types';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer';
import { GlobalFilter } from './global-filter-types';
import { useEffect } from 'react';
import { getComputationResultGlobalFilters } from '../../../../services/study/study-config';
import { addToGlobalFilterOptions, addToSelectedGlobalFilters } from '../../../../redux/actions';
import { isCriteriaFilter } from '../utils';
import { addGlobalFilterId, getGlobalFilterId } from './global-filter-utils';

// Get the global filters for a given table from the server and store them in the Redux store
export function useComputationGlobalFilters(tableType: TableType) {
    const dispatch = useDispatch();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    useEffect(() => {
        studyUuid &&
            getComputationResultGlobalFilters(studyUuid, tableType).then(
                (globalFiltersInfos: GlobalFilter[] | null) => {
                    const globalFilters = Array.isArray(globalFiltersInfos) ? globalFiltersInfos : [];
                    const criteriaFilters = globalFilters.filter(isCriteriaFilter).map(addGlobalFilterId);
                    // Store full criteria filters in globalFilterOptions
                    if (criteriaFilters.length > 0) dispatch(addToGlobalFilterOptions(criteriaFilters));
                    // Store only IDs in globalFilters
                    dispatch(addToSelectedGlobalFilters(tableType, tableType, globalFilters.map(getGlobalFilterId)));
                }
            );
    }, [dispatch, studyUuid, tableType]);
}
