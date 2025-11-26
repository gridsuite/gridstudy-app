/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FilterConfig, FilterType } from '../../types/custom-aggrid-types';
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

export type ComputationResultFiltersInfos = {
    id: string;
    computationResultFilters: {
        id: string;
        computationType: FilterType;
        columnsFilters: { id: string; computationSubType: string; columns: FilterConfig[] }[];
        globalFilters: GlobalFilter[];
    }[];
};

export function processComputationResultFilters(dto: ComputationResultFiltersInfos): ComputationFiltersState {
    const state: ComputationFiltersState = {
        id: dto.id,
    };

    dto.computationResultFilters?.forEach((entry) => {
        const mappedType = backendToFrontendFilterTypeMap[entry.computationType];
        if (!mappedType) return;

        state[mappedType] = {
            id: entry.id,
            columnsFilters: Object.fromEntries(
                (entry.columnsFilters ?? []).map((cf) => [cf.computationSubType ?? cf.id, cf.columns ?? []])
            ),
            globalFilters: entry.globalFilters ?? {},
        };
    });
    return state;
}
