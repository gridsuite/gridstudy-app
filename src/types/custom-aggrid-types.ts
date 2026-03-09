/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ColDef, GridApi, IFilterOptionDef } from 'ag-grid-community';
import {
    ALL_BUSES,
    DYNAMIC_SIMULATION_RESULT_SORT_STORE,
    LOADFLOW_RESULT_SORT_STORE,
    ONE_BUS,
    PCCMIN_ANALYSIS_RESULT_SORT_STORE,
    PCCMIN_RESULT,
    SECURITY_ANALYSIS_RESULT_N,
    SECURITY_ANALYSIS_RESULT_N_K,
    SECURITY_ANALYSIS_RESULT_SORT_STORE,
    SENSITIVITY_ANALYSIS_RESULT_SORT_STORE,
    SENSITIVITY_AT_NODE_N,
    SENSITIVITY_AT_NODE_N_K,
    SENSITIVITY_IN_DELTA_A_N,
    SENSITIVITY_IN_DELTA_A_N_K,
    SENSITIVITY_IN_DELTA_MW_N,
    SENSITIVITY_IN_DELTA_MW_N_K,
    SHORTCIRCUIT_ANALYSIS_RESULT_SORT_STORE,
    SPREADSHEET_SORT_STORE,
    STATEESTIMATION_RESULT_SORT_STORE,
} from 'utils/store-sort-filter-fields';
import { UUID } from 'node:crypto';
import React, { ComponentType } from 'react';

export type SortConfig = {
    colId: string;
    sort: SortWay;
    children?: boolean;
};

export enum SortWay {
    ASC = 'asc',
    DESC = 'desc',
}

export type TableSortConfig = Record<string, SortConfig[]>;

export type TableSort = {
    [SPREADSHEET_SORT_STORE]: TableSortConfig;
    [LOADFLOW_RESULT_SORT_STORE]: TableSortConfig;
    [SECURITY_ANALYSIS_RESULT_SORT_STORE]: TableSortConfig;
    [SENSITIVITY_ANALYSIS_RESULT_SORT_STORE]: TableSortConfig;
    [DYNAMIC_SIMULATION_RESULT_SORT_STORE]: TableSortConfig;
    [SHORTCIRCUIT_ANALYSIS_RESULT_SORT_STORE]: TableSortConfig;
    [STATEESTIMATION_RESULT_SORT_STORE]: TableSortConfig;
    [PCCMIN_ANALYSIS_RESULT_SORT_STORE]: TableSortConfig;
};
export type TableSortKeysType = keyof TableSort;

export type SortParams = {
    table: TableSortKeysType;
    tab: string;
    isChildren?: boolean;
    persistSort?: (api: GridApi, sort: SortConfig) => Promise<void>;
};

export enum TableType {
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
    type: TableType;
    tab: string;
    dataType?: string;
    comparators?: string[];
    debounceMs?: number;
    updateFilterCallback?: (
        agGridApi?: GridApi,
        filters?: FilterConfig[],
        colId?: string,
        studyUuid?: UUID,
        filterType?: TableType,
        filterSubType?: string,
        onBeforePersist?: () => void
    ) => void;
};

export type PaginationConfig = {
    page: number;
    rowsPerPage: number | { value: number; label: string };
};

export type LogsPaginationConfig = {
    page: number;
    rowsPerPage: number;
};

export enum FILTER_DATA_TYPES {
    TEXT = 'text',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
}

export enum FILTER_TEXT_COMPARATORS {
    EQUALS = 'equals',
    CONTAINS = 'contains',
    STARTS_WITH = 'startsWith',
    IS_EMPTY = 'blank',
    IS_NOT_EMPTY = 'notBlank',
}

export enum FILTER_NUMBER_COMPARATORS {
    EQUALS = 'equals',
    NOT_EQUAL = 'notEqual',
    LESS_THAN_OR_EQUAL = 'lessThanOrEqual',
    GREATER_THAN_OR_EQUAL = 'greaterThanOrEqual',
}

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

export enum SPREADSHEET_FILTER_NUMBER_COMPARATORS {
    EQUALS = 'equals',
    NOT_EQUAL = 'notEqual',
    LESS_THAN_OR_EQUAL = 'lessThanOrEqual',
    GREATER_THAN_OR_EQUAL = 'greaterThanOrEqual',
    IS_EMPTY = 'blank',
    IS_NOT_EMPTY = 'notBlank',
}

// not visible in the base interface :
export enum UNDISPLAYED_FILTER_NUMBER_COMPARATORS {
    GREATER_THAN = 'greaterThan',
    LESS_THAN = 'lessThan',
}

export type FilterEnumsType = Record<string, string[] | null>;

export interface CustomAggridFilterParams {
    api: GridApi;
    colId: string;
    filterParams: FilterParams;
}

export enum COLUMN_TYPES {
    TEXT = 'TEXT',
    ENUM = 'ENUM',
    NUMBER = 'NUMBER',
    BOOLEAN = 'BOOLEAN',
}

export interface ColumnContext<F extends CustomAggridFilterParams = CustomAggridFilterParams> {
    agGridFilterParams?: {
        filterOptions: IFilterOptionDef[];
    };
    tabUuid?: UUID;
    columnType?: COLUMN_TYPES;
    columnWidth?: number;
    fractionDigits?: number;
    isDefaultSort?: boolean;
    numeric?: boolean;
    forceDisplayFilterIcon?: boolean;
    tabIndex?: number;
    isCustomColumn?: boolean;
    Menu?: React.ComponentType<any>;
    filterComponent?: ComponentType<F>;
    //We omit colId and api here to avoid duplicating its declaration, we reinject it later inside CustomHeaderComponent
    filterComponentParams?: Omit<F, 'colId' | 'api'>;
    sortParams?: SortParams;
}

export type CustomCellType = {
    cellValue: number;
    tooltipValue: number;
};

export interface ValidationError {
    error: string;
}
export type CustomAggridValue = boolean | string | number | CustomCellType | ValidationError;

export interface CustomColDef<TData = any, F extends CustomAggridFilterParams = CustomAggridFilterParams>
    extends ColDef<TData, CustomAggridValue> {
    colId: string;
    context?: ColumnContext<F>;
}
