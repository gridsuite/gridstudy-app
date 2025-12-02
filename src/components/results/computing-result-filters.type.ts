/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FilterConfig, FilterType } from '../../types/custom-aggrid-types';
import { GlobalFilter } from './common/global-filter/global-filter-types';
import { ComputationFiltersState } from '../../redux/reducer';

const mappingComputationTypeToFilterType: Record<string, FilterType> = {
    LOAD_FLOW: FilterType.Loadflow,
    SECURITY_ANALYSIS: FilterType.SecurityAnalysis,
    SENSITIVITY_ANALYSIS: FilterType.SensitivityAnalysis,
    SHORT_CIRCUIT: FilterType.ShortcircuitAnalysis,
    DYNAMIC_SIMULATION: FilterType.DynamicSimulation,
    STATE_ESTIMATION: FilterType.StateEstimation,
    PCC_MIN: FilterType.PccMin,
    VOLTAGE_INITIALIZATION: FilterType.VoltageInit,
};

const mappingComputationSubTypeToFilterSubType: Record<string, string> = {
    LOADFLOW_CURRENT_LIMIT_VIOLATION: 'loadflowCurrentLimitViolation',
    LOADFLOW_VOLTAGE_LIMIT_VIOLATION: 'loadflowVoltageLimitViolation',
    SECURITY_ANALYSIS_RESULT_N: 'securityAnalysisResultN',
    SECURITY_ANALYSIS_RESULT_N_K: 'securityAnalysisResultNK',
    SENSITIVITY_IN_DELTA_MW_N: 'sensitivityInDeltaMWN',
    SENSITIVITY_IN_DELTA_MW_N_K: 'sensitivityInDeltaMWNK',
    SENSITIVITY_IN_DELTA_A_N: 'sensitivityInDeltaAN',
    SENSITIVITY_IN_DELTA_A_N_K: 'sensitivityInDeltaANK',
    SENSITIVITY_AT_NODE_N: 'sensitivityAtNodeN',
    SENSITIVITY_AT_NODE_N_K: 'sensitivityAtNodeNK',
    ONE_BUS: 'oneBus',
    TIMELINE: 'timeline',
    STATEESTIMATION_QUALITY_CRITERION: 'stateEstimationQualityCriterion',
    STATEESTIMATION_QUALITY_PER_REGION: 'stateEstimationQualityPerRegion',
    PCCMIN_RESULT: 'pccMinResults',
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
export function setComputationResultFiltersState(filtersInfos: ComputationResultFiltersInfos): ComputationFiltersState {
    const state: ComputationFiltersState = {
        id: filtersInfos.id,
    };

    filtersInfos.computationResultFilters?.forEach((computationResultFilter) => {
        const mappedType = mappingComputationTypeToFilterType[computationResultFilter.computationType];
        if (!mappedType) return;
        const columnsFilters = Object.fromEntries(
            (computationResultFilter.columnsFilters ?? []).map((computationResultColumnsFilters) => {
                const key =
                    mappingComputationSubTypeToFilterSubType[computationResultColumnsFilters.computationSubType] ??
                    computationResultColumnsFilters.id;

                return [
                    key,
                    {
                        id: computationResultColumnsFilters.id,
                        columns: (computationResultColumnsFilters.columns ?? []).map(mapColumn),
                    },
                ];
            })
        );

        state[mappedType] = {
            id: computationResultFilter.id,
            columnsFilters,
            globalFilters: computationResultFilter.globalFilters ?? {},
        };
    });
    return state;
}
