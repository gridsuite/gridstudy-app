/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { type ComputingTypeAndNetworkModificationKeys } from './report/report.constant';

//Loadflow result store fields
const LOADFLOW_RESULT_STORE = 'loadflowResult';
export const LOADFLOW_RESULT_STORE_FILTER = `${LOADFLOW_RESULT_STORE}Filter` as const;
export const LOADFLOW_RESULT_STORE_SORT = `${LOADFLOW_RESULT_STORE}Sort` as const;
export const LOADFLOW_CURRENT_LIMIT_VIOLATION = 'loadflowCurrentLimitViolation';
export const LOADFLOW_VOLTAGE_LIMIT_VIOLATION = 'loadflowVoltageLimitViolation';
export const LOADFLOW_RESULT = 'loadflowResult';

//Security analysis result store fields
const SECURITY_ANALYSIS_RESULT_STORE = 'securityAnalysisResult';
export const SECURITY_ANALYSIS_RESULT_STORE_FILTER = `${SECURITY_ANALYSIS_RESULT_STORE}Filter` as const;
export const SECURITY_ANALYSIS_RESULT_STORE_SORT = `${SECURITY_ANALYSIS_RESULT_STORE}Sort` as const;
export const SECURITY_ANALYSIS_RESULT_N = 'securityAnalysisResultN';
export const SECURITY_ANALYSIS_RESULT_N_K = 'securityAnalysisResultNK';

//Sensitivity analysis result store fields
const SENSITIVITY_ANALYSIS_RESULT_STORE = 'sensitivityAnalysisResult';
export const SENSITIVITY_ANALYSIS_RESULT_STORE_FILTER = `${SENSITIVITY_ANALYSIS_RESULT_STORE}Filter` as const;
export const SENSITIVITY_ANALYSIS_RESULT_STORE_SORT = `${SENSITIVITY_ANALYSIS_RESULT_STORE}Sort` as const;
export const SENSITIVITY_IN_DELTA_MW_N = 'sensitivityInDeltaMWN';
export const SENSITIVITY_IN_DELTA_MW_N_K = 'sensitivityInDeltaMWNK';
export const SENSITIVITY_IN_DELTA_A_N = 'sensitivityInDeltaAN';
export const SENSITIVITY_IN_DELTA_A_N_K = 'sensitivityInDeltaANK';
export const SENSITIVITY_AT_NODE_N = 'sensitivityAtNodeN';
export const SENSITIVITY_AT_NODE_N_K = 'sensitivityAtNodeNK';

//Shortcircuit analysis result store fields
const SHORTCIRCUIT_ANALYSIS_RESULT_STORE = 'shortcircuitAnalysisResult';
export const SHORTCIRCUIT_ANALYSIS_RESULT_STORE_FILTER = `${SHORTCIRCUIT_ANALYSIS_RESULT_STORE}Filter` as const;
export const SHORTCIRCUIT_ANALYSIS_RESULT_STORE_SORT = `${SHORTCIRCUIT_ANALYSIS_RESULT_STORE}Sort` as const;
export const ONE_BUS = 'oneBus';
export const ALL_BUSES = 'allBuses';

//Dynamic simulation result store fields
const DYNAMIC_SIMULATION_RESULT_STORE = 'dynamicSimulationResult';
export const DYNAMIC_SIMULATION_RESULT_STORE_FILTER = `${DYNAMIC_SIMULATION_RESULT_STORE}Filter` as const;
export const DYNAMIC_SIMULATION_RESULT_STORE_SORT = `${DYNAMIC_SIMULATION_RESULT_STORE}Sort` as const;
export const TIMELINE = 'timeline';

//spreadsheet store fields
const SPREADSHEET_STORE = 'spreadsheet';
export const SPREADSHEET_STORE_FILTER = `${SPREADSHEET_STORE}Filter` as const;
export const SPREADSHEET_STORE_SORT = `${SPREADSHEET_STORE}Sort` as const;

//logs store fields
export const LOGS_STORE_FILTER = 'logsFilter';

// types resuming redux possibilities & organisation
type StoreTables =
    | typeof LOADFLOW_RESULT_STORE
    | typeof SECURITY_ANALYSIS_RESULT_STORE
    | typeof SENSITIVITY_ANALYSIS_RESULT_STORE
    | typeof SHORTCIRCUIT_ANALYSIS_RESULT_STORE
    | typeof DYNAMIC_SIMULATION_RESULT_STORE
    | typeof SPREADSHEET_STORE;
export type StoreTableKeys<IsFilter extends boolean = false> =
    | `${StoreTables}${IsFilter extends true ? 'Filter' : 'Sort'}`
    | (IsFilter extends true ? typeof LOGS_STORE_FILTER : never);
export type StoreTableTabs<T extends StoreTableKeys<true> | StoreTableKeys<false>> =
    T extends `${typeof LOADFLOW_RESULT_STORE}${'Sort' | 'Filter'}`
        ? typeof LOADFLOW_CURRENT_LIMIT_VIOLATION | typeof LOADFLOW_VOLTAGE_LIMIT_VIOLATION | typeof LOADFLOW_RESULT
        : T extends `${typeof SECURITY_ANALYSIS_RESULT_STORE}${'Sort' | 'Filter'}`
        ? typeof SECURITY_ANALYSIS_RESULT_N | typeof SECURITY_ANALYSIS_RESULT_N_K
        : T extends `${typeof SENSITIVITY_ANALYSIS_RESULT_STORE}${'Sort' | 'Filter'}`
        ?
              | typeof SENSITIVITY_IN_DELTA_MW_N
              | typeof SENSITIVITY_IN_DELTA_MW_N_K
              | typeof SENSITIVITY_IN_DELTA_A_N
              | typeof SENSITIVITY_IN_DELTA_A_N_K
              | typeof SENSITIVITY_AT_NODE_N
              | typeof SENSITIVITY_AT_NODE_N_K
        : T extends `${typeof SHORTCIRCUIT_ANALYSIS_RESULT_STORE}${'Sort' | 'Filter'}`
        ? typeof ONE_BUS | typeof ALL_BUSES
        : T extends `${typeof DYNAMIC_SIMULATION_RESULT_STORE}${'Sort' | 'Filter'}`
        ? typeof TIMELINE
        : T extends `${typeof SPREADSHEET_STORE}${'Sort' | 'Filter'}`
        ? string
        : T extends typeof LOGS_STORE_FILTER
        ? ComputingTypeAndNetworkModificationKeys
        : never;
