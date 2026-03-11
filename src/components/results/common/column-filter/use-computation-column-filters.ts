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
export function useComputationColumnFilters(tableType: TableType, computationSubType: string) {
    const dispatch = useDispatch();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    useEffect(() => {
        if (studyUuid) {
            updateComputationColumnFilters(dispatch, studyUuid, tableType, computationSubType);
        }
    }, [dispatch, studyUuid, tableType, computationSubType]);
    const filters = useSelector<AppState, FilterConfig[]>(
        (state) => state.tableFilters.columnsFilters?.[tableType]?.[computationSubType]?.columns ?? EMPTY_ARRAY
    );
    return {
        filters,
    };
}
