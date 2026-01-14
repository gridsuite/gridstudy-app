/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FilterType } from '../types/custom-aggrid-types';
import { useSelector } from 'react-redux';
import { AppState } from '../redux/reducer';
import { GlobalFilter } from '../components/results/common/global-filter/global-filter-types';
import { useCallback } from 'react';
import { useGlobalFilterSelector } from './use-global-filter-selector';
import { updateComputationResultFilters } from '../services/study/study-config';

export function useComputationGlobalFilters(filterType: FilterType) {
    const { filters: globalFiltersFromState, dispatchFilters: dispatchGlobalFilters } =
        useGlobalFilterSelector(filterType);
    const studyUuid = useSelector((state: any) => state.studyUuid);
    const config = useSelector((state: AppState) => state.computationFilters?.[filterType]);

    const updateGlobalFilters = useCallback(
        (rawGlobalFilters: GlobalFilter[]) => {
            if (!config?.id) return;
            dispatchGlobalFilters(rawGlobalFilters);
            updateComputationResultFilters(studyUuid, config.id, rawGlobalFilters).then();
        },
        [dispatchGlobalFilters, studyUuid, config?.id]
    );

    return {
        globalFiltersFromState,
        updateGlobalFilters,
    };
}
