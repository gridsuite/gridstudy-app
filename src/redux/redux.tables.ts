/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ALL_BUSES,
    DYNAMIC_SIMULATION_RESULT_STORE_FILTER,
    DYNAMIC_SIMULATION_RESULT_STORE_SORT,
    LOADFLOW_CURRENT_LIMIT_VIOLATION,
    LOADFLOW_RESULT,
    LOADFLOW_RESULT_STORE_FILTER,
    LOADFLOW_RESULT_STORE_SORT,
    LOADFLOW_VOLTAGE_LIMIT_VIOLATION,
    LOGS_STORE_FILTER,
    ONE_BUS,
    SECURITY_ANALYSIS_RESULT_N,
    SECURITY_ANALYSIS_RESULT_N_K,
    SECURITY_ANALYSIS_RESULT_STORE_FILTER,
    SECURITY_ANALYSIS_RESULT_STORE_SORT,
    SENSITIVITY_ANALYSIS_RESULT_STORE_FILTER,
    SENSITIVITY_ANALYSIS_RESULT_STORE_SORT,
    SENSITIVITY_AT_NODE_N,
    SENSITIVITY_AT_NODE_N_K,
    SENSITIVITY_IN_DELTA_A_N,
    SENSITIVITY_IN_DELTA_A_N_K,
    SENSITIVITY_IN_DELTA_MW_N,
    SENSITIVITY_IN_DELTA_MW_N_K,
    SHORTCIRCUIT_ANALYSIS_RESULT_STORE_FILTER,
    SHORTCIRCUIT_ANALYSIS_RESULT_STORE_SORT,
    SPREADSHEET_STORE_FILTER,
    SPREADSHEET_STORE_SORT,
    type StoreTableKeys,
    type StoreTableTabs,
    TIMELINE,
} from '../utils/store-sort-filter-fields';
import { TABLES_DEFINITIONS } from '../components/spreadsheet/config/config-tables';
import { createAction } from '@reduxjs/toolkit';
import type { FilterSelectorType } from '../components/custom-aggrid/custom-aggrid-header.type';
import {
    COMPUTING_AND_NETWORK_MODIFICATION_TYPE,
    type ComputingTypeAndNetworkModificationKeys,
} from '../utils/report/report.constant';
import { type SortConfigType, SortWay } from '../hooks/use-aggrid.type';

export type AppStateTables = {
    // result & spreadsheet config for tables sort & filter
    [K in StoreTableKeys<false> | StoreTableKeys<true>]: K extends StoreTableKeys
        ? Record<StoreTableTabs<K>, SortConfigType[]>
        : Record<StoreTableTabs<K>, FilterSelectorType[]>;
};

export const initialLogsFilterState: Record<ComputingTypeAndNetworkModificationKeys, FilterSelectorType[]> = {
    [COMPUTING_AND_NETWORK_MODIFICATION_TYPE.NETWORK_MODIFICATION]: [],
    [COMPUTING_AND_NETWORK_MODIFICATION_TYPE.LOAD_FLOW]: [],
    [COMPUTING_AND_NETWORK_MODIFICATION_TYPE.SECURITY_ANALYSIS]: [],
    [COMPUTING_AND_NETWORK_MODIFICATION_TYPE.SENSITIVITY_ANALYSIS]: [],
    [COMPUTING_AND_NETWORK_MODIFICATION_TYPE.SHORT_CIRCUIT]: [],
    [COMPUTING_AND_NETWORK_MODIFICATION_TYPE.SHORT_CIRCUIT_ONE_BUS]: [],
    [COMPUTING_AND_NETWORK_MODIFICATION_TYPE.DYNAMIC_SIMULATION]: [],
    [COMPUTING_AND_NETWORK_MODIFICATION_TYPE.VOLTAGE_INITIALIZATION]: [],
    [COMPUTING_AND_NETWORK_MODIFICATION_TYPE.STATE_ESTIMATION]: [],
    [COMPUTING_AND_NETWORK_MODIFICATION_TYPE.NON_EVACUATED_ENERGY_ANALYSIS]: [],
};

export const initialTablesAppState: AppStateTables = {
    [LOADFLOW_RESULT_STORE_SORT]: {
        [LOADFLOW_CURRENT_LIMIT_VIOLATION]: [{ colId: 'overload', sort: SortWay.DESC }],
        [LOADFLOW_VOLTAGE_LIMIT_VIOLATION]: [{ colId: 'subjectId', sort: SortWay.DESC }],
        [LOADFLOW_RESULT]: [{ colId: 'connectedComponentNum', sort: SortWay.DESC }],
    },
    [SECURITY_ANALYSIS_RESULT_STORE_SORT]: {
        [SECURITY_ANALYSIS_RESULT_N]: [{ colId: 'subjectId', sort: SortWay.ASC }],
        [SECURITY_ANALYSIS_RESULT_N_K]: [{ colId: 'contingencyId', sort: SortWay.ASC }],
    },
    [SENSITIVITY_ANALYSIS_RESULT_STORE_SORT]: {
        [SENSITIVITY_IN_DELTA_MW_N]: [{ colId: 'value', sort: SortWay.ASC }],
        [SENSITIVITY_IN_DELTA_MW_N_K]: [{ colId: 'valueAfter', sort: SortWay.ASC }],
        [SENSITIVITY_IN_DELTA_A_N]: [{ colId: 'value', sort: SortWay.ASC }],
        [SENSITIVITY_IN_DELTA_A_N_K]: [{ colId: 'valueAfter', sort: SortWay.ASC }],
        [SENSITIVITY_AT_NODE_N]: [{ colId: 'value', sort: SortWay.ASC }],
        [SENSITIVITY_AT_NODE_N_K]: [{ colId: 'valueAfter', sort: SortWay.ASC }],
    },
    [DYNAMIC_SIMULATION_RESULT_STORE_SORT]: {
        [TIMELINE]: [{ colId: 'time', sort: SortWay.ASC }],
    },
    [SHORTCIRCUIT_ANALYSIS_RESULT_STORE_SORT]: {
        [ONE_BUS]: [{ colId: 'current', sort: SortWay.DESC }],
        [ALL_BUSES]: [{ colId: 'elementId', sort: SortWay.ASC }],
    },

    // Results filters
    [LOADFLOW_RESULT_STORE_FILTER]: {
        [LOADFLOW_CURRENT_LIMIT_VIOLATION]: [],
        [LOADFLOW_VOLTAGE_LIMIT_VIOLATION]: [],
        [LOADFLOW_RESULT]: [],
    },
    [SECURITY_ANALYSIS_RESULT_STORE_FILTER]: {
        [SECURITY_ANALYSIS_RESULT_N]: [],
        [SECURITY_ANALYSIS_RESULT_N_K]: [],
    },
    [SENSITIVITY_ANALYSIS_RESULT_STORE_FILTER]: {
        [SENSITIVITY_IN_DELTA_MW_N]: [],
        [SENSITIVITY_IN_DELTA_MW_N_K]: [],
        [SENSITIVITY_IN_DELTA_A_N]: [],
        [SENSITIVITY_IN_DELTA_A_N_K]: [],
        [SENSITIVITY_AT_NODE_N]: [],
        [SENSITIVITY_AT_NODE_N_K]: [],
    },
    [SHORTCIRCUIT_ANALYSIS_RESULT_STORE_FILTER]: {
        [ONE_BUS]: [],
        [ALL_BUSES]: [],
    },
    [DYNAMIC_SIMULATION_RESULT_STORE_FILTER]: {
        [TIMELINE]: [],
    },

    // Logs filters
    [LOGS_STORE_FILTER]: { ...initialLogsFilterState },

    // Spreadsheet sorts & filters
    [SPREADSHEET_STORE_SORT]: Object.values(TABLES_DEFINITIONS)
        .map((tabDef) => tabDef.name)
        .reduce((acc, tabName) => {
            acc[tabName] = [{ colId: 'id', sort: SortWay.ASC }];
            return acc;
        }, {} as Record<string, SortConfigType[]>),
    [SPREADSHEET_STORE_FILTER]: Object.values(TABLES_DEFINITIONS)
        .map((tabDef) => tabDef.name)
        .reduce((acc, tabName) => ({ ...acc, [tabName]: [] }), {}),
};

export const setTableSort = createAction(
    'TABLE_SORT',
    <T extends StoreTableKeys>(table: T, tab: StoreTableTabs<T>, sort: SortConfigType[]) => ({
        payload: { table, tab, sort },
    })
);
export type TableSortAction = ReturnType<typeof setTableSort>;

export const setTableFilter = createAction(
    'TABLE_FILTER',
    <T extends StoreTableKeys<true>>(table: T, tab: StoreTableTabs<T>, filter: FilterSelectorType[]) => ({
        payload: { table, tab, filter },
    })
);
export type TableFilterAction = ReturnType<typeof setTableFilter>;

export const addFilterForNewSpreadsheet = createAction(
    'ADD_FILTER_FOR_NEW_SPREADSHEET',
    (newTabName: string, value: FilterSelectorType[]) => ({ payload: { newTabName, value } })
);
export type AddFilterForNewSpreadsheetAction = ReturnType<typeof addFilterForNewSpreadsheet>;

export const addSortForNewSpreadsheet = createAction(
    'ADD_SORT_FOR_NEW_SPREADSHEET',
    (newTabName: string, value: SortConfigType[]) => ({ payload: { newTabName, value } })
);
export type AddSortForNewSpreadsheetAction = ReturnType<typeof addSortForNewSpreadsheet>;

export const setLogsFilter = createAction(
    'LOGS_FILTER',
    (filterTab: ComputingTypeAndNetworkModificationKeys, logsFilter: FilterSelectorType[]) => ({
        payload: {
            filterTab: filterTab,
            newConfig: logsFilter,
        },
    })
);
export type LogsFilterAction = ReturnType<typeof setLogsFilter>;

export const resetLogsFilter = createAction('RESET_LOGS_FILTER');
export type ResetLogsFilterAction = ReturnType<typeof resetLogsFilter>;
