/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FilterConfig, TableType } from '../../../../types/custom-aggrid-types';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer.type';
import { useEffect } from 'react';
import { updateComputationColumnFilters } from '../utils';

const EMPTY_ARRAY: FilterConfig[] = [];

// This hook has two purposes :
// 1. Initialize the column filters for a given table by fetching the server and storing them in the Redux store
// 2. Return the up-to-date column filters for this table from the Redux store
export function useComputationColumnFilters(tableType: TableType, computationSubType: string) {
    const dispatch = useDispatch();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    // Fetch from server and update Redux store
    useEffect(() => {
        if (studyUuid) {
            updateComputationColumnFilters(dispatch, studyUuid, tableType, computationSubType);
        }
    }, [dispatch, studyUuid, tableType, computationSubType]);
    const filters = useSelector<AppState, FilterConfig[]>(
        (state) => state.tableFilters.columnsFilters?.[tableType]?.[computationSubType] ?? EMPTY_ARRAY
    );
    return {
        filters,
    };
}
