/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { UnknownAction } from 'redux';
import {
    DYNAMIC_SIMULATION_RESULT_STORE_FIELD,
    LOADFLOW_RESULT_STORE_FIELD,
    LOGS_STORE_FIELD,
    SECURITY_ANALYSIS_RESULT_STORE_FIELD,
    SENSITIVITY_ANALYSIS_RESULT_STORE_FIELD,
    SHORTCIRCUIT_ANALYSIS_RESULT_STORE_FIELD,
    SPREADSHEET_STORE_FIELD,
    STATEESTIMATION_RESULT_STORE_FIELD,
} from '../utils/store-sort-filter-fields';
import {
    setDynamicSimulationResultFilter,
    setLoadflowResultFilter,
    setLogsFilter,
    setSecurityAnalysisResultFilter,
    setSensitivityAnalysisResultFilter,
    setShortcircuitAnalysisResultFilter,
    setSpreadsheetFilter,
    setStateEstimationResultFilter,
} from '../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../redux/reducer';
import { FilterConfig, FilterType } from '../types/custom-aggrid-types';

const FILTER_PARAMS: Record<
    FilterType,
    { filterType: string; filterStoreAction: (filterTab: any, filter: FilterConfig[]) => UnknownAction }
> = {
    [FilterType.Loadflow]: {
        filterType: LOADFLOW_RESULT_STORE_FIELD,
        filterStoreAction: setLoadflowResultFilter,
    },
    [FilterType.SecurityAnalysis]: {
        filterType: SECURITY_ANALYSIS_RESULT_STORE_FIELD,
        filterStoreAction: setSecurityAnalysisResultFilter,
    },
    [FilterType.SensitivityAnalysis]: {
        filterType: SENSITIVITY_ANALYSIS_RESULT_STORE_FIELD,
        filterStoreAction: setSensitivityAnalysisResultFilter,
    },
    [FilterType.ShortcircuitAnalysis]: {
        filterType: SHORTCIRCUIT_ANALYSIS_RESULT_STORE_FIELD,
        filterStoreAction: setShortcircuitAnalysisResultFilter,
    },
    [FilterType.DynamicSimulation]: {
        filterType: DYNAMIC_SIMULATION_RESULT_STORE_FIELD,
        filterStoreAction: setDynamicSimulationResultFilter,
    },
    [FilterType.Spreadsheet]: {
        filterType: SPREADSHEET_STORE_FIELD,
        filterStoreAction: setSpreadsheetFilter,
    },
    [FilterType.Logs]: {
        filterType: LOGS_STORE_FIELD,
        filterStoreAction: setLogsFilter,
    },
    [FilterType.StateEstimation]: {
        filterType: STATEESTIMATION_RESULT_STORE_FIELD,
        filterStoreAction: setStateEstimationResultFilter,
    },
};

export const useFilterSelector = (filterType: FilterType, filterTab: string) => {
    const filters = useSelector<AppState, FilterConfig[]>(
        // @ts-expect-error TODO: found a better way to go into state
        (state: AppState) => state[FILTER_PARAMS[filterType].filterType][filterTab]
    );

    const dispatch = useDispatch();

    const dispatchFilters = (newFilters: FilterConfig[]) =>
        dispatch(FILTER_PARAMS[filterType].filterStoreAction(filterTab, newFilters));

    return { filters, dispatchFilters };
};
