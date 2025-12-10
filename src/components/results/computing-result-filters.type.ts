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
    PCC_MIN: FilterType.PccMin,
    SECURITY_ANALYSIS: FilterType.SecurityAnalysis,
    SENSITIVITY_ANALYSIS: FilterType.SensitivityAnalysis,
    SHORT_CIRCUIT: FilterType.ShortcircuitAnalysis,
    VOLTAGE_INITIALIZATION: FilterType.VoltageInit,
};

const mappingComputationSubTypeToFilterSubType: Record<string, string> = {
    LOADFLOW_CURRENT_LIMIT_VIOLATION: 'loadflowCurrentLimitViolation',
    LOADFLOW_VOLTAGE_LIMIT_VIOLATION: 'loadflowVoltageLimitViolation',
    PCCMIN_RESULT: 'pccMinResults',
    SECURITY_ANALYSIS_RESULT_N: 'securityAnalysisResultN',
    SECURITY_ANALYSIS_RESULT_N_K: 'securityAnalysisResultNK',
    SENSITIVITY_IN_DELTA_MW_N: 'sensitivityInDeltaMWN',
    SENSITIVITY_IN_DELTA_MW_N_K: 'sensitivityInDeltaMWNK',
    SENSITIVITY_IN_DELTA_A_N: 'sensitivityInDeltaAN',
    SENSITIVITY_IN_DELTA_A_N_K: 'sensitivityInDeltaANK',
    SENSITIVITY_AT_NODE_N: 'sensitivityAtNodeN',
    SENSITIVITY_AT_NODE_N_K: 'sensitivityAtNodeNK',
    ONE_BUS: 'oneBus',
    ALL_BUS: 'allBus',
};

export type ComputationResultFiltersInfos = {
    id: string;
    computationResultFilters: Record<
        string,
        {
            id: string;
            columnsFilters: Record<string, { id: string; columns: FilterConfig[] }>;
            globalFilters: GlobalFilter[];
        }[]
    >;
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

    Object.entries(filtersInfos.computationResultFilters ?? {}).forEach(
        ([computationTypeKey, computationResultFiltersArray]) => {
            const mappedType = mappingComputationTypeToFilterType[computationTypeKey];
            if (!mappedType) return;

            computationResultFiltersArray.forEach((computationResultFilter) => {
                const columnsFilters = Object.fromEntries(
                    Object.entries(computationResultFilter.columnsFilters ?? {}).map(
                        ([subTypeKey, columnFilterData]) => {
                            const key = mappingComputationSubTypeToFilterSubType[subTypeKey] ?? columnFilterData.id;

                            return [
                                key,
                                {
                                    id: columnFilterData.id,
                                    columns: (columnFilterData.columns ?? []).map(mapColumn),
                                },
                            ];
                        }
                    )
                );

                state[mappedType] = {
                    id: computationResultFilter.id,
                    columnsFilters,
                    globalFilters: computationResultFilter.globalFilters ?? [],
                };
            });
        }
    );
    return state;
}
