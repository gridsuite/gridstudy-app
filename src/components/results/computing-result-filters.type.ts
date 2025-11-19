/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FilterConfig, FilterType } from '../../types/custom-aggrid-types';
import { GlobalFilters } from './common/global-filter/global-filter-types';
import { ComputationFiltersState } from '../../redux/reducer';

export type ComputationResultFiltersInfos = {
    id: string;
    computationResultFilters: {
        filterType: FilterType;
        columnsFilters: Record<string, FilterConfig[]>;
        globalFilters: GlobalFilters;
    }[];
};

export function processComputationResultFilters(dto: ComputationResultFiltersInfos): ComputationFiltersState {
    const state: ComputationFiltersState = {};

    dto.computationResultFilters?.forEach((entry) => {
        state[entry.filterType] = {
            columnsFilters: entry.columnsFilters ?? {},
            globalFilters: entry.globalFilters ?? [],
        };
    });

    return state;
}
