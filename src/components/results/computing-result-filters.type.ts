/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FilterConfig } from '../../types/custom-aggrid-types';
import { GlobalFilter } from './common/global-filter/global-filter-types';
import { ColumnFilterEntry, ComputationFiltersState } from '../../redux/reducer';

export type ComputationResultFiltersInfos = {
    computationTypeFiltersInfos: {
        computationType: string;
        globalFilters: GlobalFilter[];
        computationSubTypeFilterInfos: {
            computationSubType: string;
            columns: FilterConfig[];
        }[];
    }[];
};
const mapColumn = (c: any): FilterConfig => ({
    column: c.id,
    type: c.filterType,
    value: c.filterValue,
    dataType: c.filterDataType,
    tolerance: c.filterTolerance ?? undefined,
});
export function initComputationResultFiltersState(
    filtersInfos: ComputationResultFiltersInfos | ComputationResultFiltersInfos[]
): ComputationFiltersState {
    const state: ComputationFiltersState = {};
    const roots = Array.isArray(filtersInfos) ? filtersInfos : [filtersInfos];

    roots.forEach((root) => {
        (root.computationTypeFiltersInfos ?? []).forEach((typeInfo) => {
            const computationTypeKey = typeInfo.computationType;
            const columnsFilters: Record<string, ColumnFilterEntry> = {};

            (typeInfo.computationSubTypeFilterInfos ?? []).forEach((subTypeInfo) => {
                const subTypeKey = subTypeInfo.computationSubType;

                columnsFilters[subTypeKey] = {
                    columns: (subTypeInfo.columns ?? []).map(mapColumn),
                };
            });

            state[computationTypeKey] = {
                columnsFilters,
                globalFilters: typeInfo.globalFilters ?? [],
            };
        });
    });
    return state;
}
