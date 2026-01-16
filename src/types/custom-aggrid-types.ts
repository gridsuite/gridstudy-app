/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { GridApi } from 'ag-grid-community';
import {
    FILTER_DATA_TYPES,
    FILTER_NUMBER_COMPARATORS,
    FILTER_TEXT_COMPARATORS,
} from 'components/custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import {
    ALL_BUSES,
    ONE_BUS,
    PCCMIN_RESULT,
    SECURITY_ANALYSIS_RESULT_N,
    SECURITY_ANALYSIS_RESULT_N_K,
    SENSITIVITY_AT_NODE_N,
    SENSITIVITY_AT_NODE_N_K,
    SENSITIVITY_IN_DELTA_A_N,
    SENSITIVITY_IN_DELTA_A_N_K,
    SENSITIVITY_IN_DELTA_MW_N,
    SENSITIVITY_IN_DELTA_MW_N_K,
} from 'utils/store-sort-filter-fields';

export type SortConfig = {
    colId: string;
    sort: SortWay;
    children?: boolean;
};

export enum SortWay {
    ASC = 'asc',
    DESC = 'desc',
}

export enum FilterType {
    Loadflow = 'Loadflow',
    SecurityAnalysis = 'SecurityAnalysis',
    SensitivityAnalysis = 'SensitivityAnalysis',
    ShortcircuitAnalysis = 'ShortcircuitAnalysis',
    DynamicSimulation = 'DynamicSimulation',
    Spreadsheet = 'Spreadsheet',
    Logs = 'Logs',
    StateEstimation = 'StateEstimation',
    PccMin = 'PccMin',
    VoltageInit = 'VoltageInit',
}

export type FilterData = {
    dataType?: string;
    type?: string;
    originalType?: string; // used to store the original type of the filter before any transformation (e.g EQUALS and NOT_EQUAL in number filters)
    value: unknown;
    tolerance?: number; // tolerance when comparing values. Only useful for the number type
};

export type FilterConfig = FilterData & {
    column: string;
};

export type FilterParams = {
    type: FilterType;
    tab: string;
    dataType?: string;
    comparators?: string[];
    debounceMs?: number;
    updateFilterCallback?: (api?: GridApi, filters?: FilterConfig[], colId?: string) => void;
};

export type PaginationConfig = {
    page: number;
    rowsPerPage: number | { value: number; label: string };
};

export type LogsPaginationConfig = {
    page: number;
    rowsPerPage: number;
};

export const textFilterParams = {
    dataType: FILTER_DATA_TYPES.TEXT,
    comparators: [FILTER_TEXT_COMPARATORS.STARTS_WITH, FILTER_TEXT_COMPARATORS.CONTAINS],
};

export const numericFilterParams = {
    dataType: FILTER_DATA_TYPES.NUMBER,
    comparators: Object.values(FILTER_NUMBER_COMPARATORS),
};

export enum PaginationType {
    SecurityAnalysis = 'SecurityAnalysis',
    SensitivityAnalysis = 'SensitivityAnalysis',
    ShortcircuitAnalysis = 'ShortcircuitAnalysis',
    PccMin = 'PccMin',
}

export const SECURITY_ANALYSIS_TABS = [SECURITY_ANALYSIS_RESULT_N, SECURITY_ANALYSIS_RESULT_N_K] as const;

export const SENSITIVITY_ANALYSIS_TABS = [
    SENSITIVITY_IN_DELTA_MW_N,
    SENSITIVITY_IN_DELTA_MW_N_K,
    SENSITIVITY_IN_DELTA_A_N,
    SENSITIVITY_IN_DELTA_A_N_K,
    SENSITIVITY_AT_NODE_N,
    SENSITIVITY_AT_NODE_N_K,
] as const;

export const SHORTCIRCUIT_ANALYSIS_TABS = [ONE_BUS, ALL_BUSES] as const;
export const PCCMIN_ANALYSIS_TABS = [PCCMIN_RESULT] as const;

export type SecurityAnalysisTab = (typeof SECURITY_ANALYSIS_TABS)[number];
export type SensitivityAnalysisTab = (typeof SENSITIVITY_ANALYSIS_TABS)[number];
export type ShortcircuitAnalysisTab = (typeof SHORTCIRCUIT_ANALYSIS_TABS)[number];
export type PccminTab = (typeof PCCMIN_ANALYSIS_TABS)[number];

export type PaginationTab = SecurityAnalysisTab | SensitivityAnalysisTab | ShortcircuitAnalysisTab | PccminTab;
