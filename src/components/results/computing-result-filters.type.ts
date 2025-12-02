/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FilterConfig, FilterSubType, FilterType } from '../../types/custom-aggrid-types';
import { GlobalFilter } from './common/global-filter/global-filter-types';
import { ComputationFiltersState } from '../../redux/reducer';

const backendToFrontendFilterTypeMap: Record<string, FilterType> = {
    LOAD_FLOW: FilterType.Loadflow,
    SECURITY_ANALYSIS: FilterType.SecurityAnalysis,
    SENSITIVITY_ANALYSIS: FilterType.SensitivityAnalysis,
    SHORT_CIRCUIT: FilterType.ShortcircuitAnalysis,
    DYNAMIC_SIMULATION: FilterType.DynamicSimulation,
    STATE_ESTIMATION: FilterType.StateEstimation,
    PCC_MIN: FilterType.PccMin,
    VOLTAGE_INITIALIZATION: FilterType.VoltageInit,
};

const backendToFrontendFilterSubTypeMap: Record<string, FilterSubType> = {
    LOADFLOW_CURRENT_LIMIT_VIOLATION: FilterSubType.LOADFLOW_CURRENT_LIMIT_VIOLATION,
    LOADFLOW_VOLTAGE_LIMIT_VIOLATION: FilterSubType.LOADFLOW_VOLTAGE_LIMIT_VIOLATION,
    SECURITY_ANALYSIS_RESULT_N: FilterSubType.SECURITY_ANALYSIS_RESULT_N,
};

export type ComputationResultFiltersInfos = {
    id: string;
    computationResultFilters: {
        id: string;
        computationType: FilterType;
        columnsFilters: { id: string; computationSubType: string; columns: FilterConfig[] }[];
        globalFilters: GlobalFilter[];
    }[];
};
const mapColumn = (c: any): FilterConfig => ({
    column: c.name,
    type: c.filterType,
    value: c.filterValue,
    dataType: c.filterDataType,
    tolerance: c.filterTolerance ?? undefined,
});
export function processComputationResultFilters(dto: ComputationResultFiltersInfos): ComputationFiltersState {
    const state: ComputationFiltersState = {
        id: dto.id,
    };

    dto.computationResultFilters?.forEach((entry) => {
        const mappedType = backendToFrontendFilterTypeMap[entry.computationType];
        if (!mappedType) return;
        const columnsFilters = Object.fromEntries(
            (entry.columnsFilters ?? []).map((cf) => {
                // Key = subType (frontend mapping) OR cf.id as fallback
                const key = backendToFrontendFilterSubTypeMap[cf.computationSubType] ?? cf.id;

                return [
                    key,
                    {
                        id: cf.id,
                        columns: (cf.columns ?? []).map(mapColumn),
                    },
                ];
            })
        );

        state[mappedType] = {
            id: entry.id,
            columnsFilters,
            globalFilters: entry.globalFilters ?? {},
        };
    });
    return state;
}
