/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    FILTER_DATA_TYPES,
    FilterDataType,
    FilterSelectorType,
} from 'components/custom-aggrid/custom-aggrid-header.type';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../redux/store';
import { AppState } from '../../../redux/reducer';
import { computeTolerance } from '../custom-aggrid-filters/aggrid-filters-utils';
import { AnyAction } from 'redux';
import {
    DYNAMIC_SIMULATION_RESULT_STORE_FIELD,
    LOADFLOW_RESULT_STORE_FIELD,
    LOGS_STORE_FIELD,
    SECURITY_ANALYSIS_RESULT_STORE_FIELD,
    SENSITIVITY_ANALYSIS_RESULT_STORE_FIELD,
    SHORTCIRCUIT_ANALYSIS_RESULT_STORE_FIELD,
    SPREADSHEET_STORE_FIELD,
    STATEESTIMATION_RESULT_STORE_FIELD,
} from '../../../utils/store-sort-filter-fields';
import {
    setDynamicSimulationResultFilter,
    setLoadflowResultFilter,
    setLogsFilter,
    setSecurityAnalysisResultFilter,
    setSensitivityAnalysisResultFilter,
    setShortcircuitAnalysisResultFilter,
    setSpreadsheetFilter,
    setStateEstimationResultFilter,
} from '../../../redux/actions';
import { GridApi } from 'ag-grid-community';

export type UseAggridRowFilterOutputType = {
    updateFilter: (field: string, data: FilterDataType) => void;
    filterSelector: FilterSelectorType[] | null;
};

const removeElementFromArrayWithFieldValue = (
    filtersArrayToRemoveFieldValueFrom: FilterSelectorType[],
    field: string
) => {
    return filtersArrayToRemoveFieldValueFrom.filter((f: FilterSelectorType) => f.column !== field);
};

export const useAggridRowFilter = (
    api: GridApi,
    filterType: FilterType,
    filterTab: string,
    updateFilterCallback?: (api?: GridApi, filters?: FilterSelectorType[]) => void
): UseAggridRowFilterOutputType => {
    const dispatch = useDispatch<AppDispatch>();
    const filterStore = useSelector(
        // @ts-expect-error TODO: found a better way to go into state
        (state: AppState) => state[FILTER_PARAMS[filterType].filterType][filterTab]
    );

    const updateFilter = useCallback(
        (field: string, data: FilterDataType): void => {
            const newFilter = {
                column: field,
                dataType: data.dataType,
                tolerance: data.dataType === FILTER_DATA_TYPES.NUMBER ? computeTolerance(data.value) : undefined,
                type: data.type,
                value: data.value,
            };

            let updatedFilters: FilterSelectorType[];
            if (!data.value) {
                updatedFilters = removeElementFromArrayWithFieldValue(filterStore, field);
            } else {
                updatedFilters = changeValueFromArrayWithFieldValue(filterStore, field, newFilter);
            }

            updateFilterCallback && updateFilterCallback(api, updatedFilters);
            FILTER_PARAMS[filterType].filterStoreAction &&
                filterTab &&
                // @ts-expect-error TODO: maybe resolve this with discriminate union parameter in FilterStorePropsType?
                dispatch(FILTER_PARAMS[filterType].filterStoreAction(filterTab, updatedFilters));
        },
        [updateFilterCallback, api, filterType, filterTab, dispatch, filterStore]
    );

    return { updateFilter, filterSelector: filterStore };
};

const changeValueFromArrayWithFieldValue = (
    filtersArrayToModify: FilterSelectorType[],
    field: string,
    newData: FilterSelectorType
) => {
    const filterIndex = filtersArrayToModify.findIndex((f: FilterSelectorType) => f.column === field);
    if (filterIndex === -1) {
        return [...filtersArrayToModify, newData];
    } else {
        const updatedArray = [...filtersArrayToModify];
        updatedArray[filterIndex] = newData;
        return updatedArray;
    }
};

export enum FilterType {
    Loadflow = 'Loadflow',
    SecurityAnalysis = 'SecurityAnalysis',
    SensitivityAnalysis = 'SensitivityAnalysis',
    ShortcircuitAnalysis = 'ShortcircuitAnalysis',
    DynamicSimulation = 'DynamicSimulation',
    Spreadsheet = 'Spreadsheet',
    Logs = 'Logs',
    StateEstimation = 'StateEstimation',
}

export const FILTER_PARAMS: Record<
    FilterType,
    { filterType: string; filterStoreAction: (filterTab: any, filter: FilterSelectorType[]) => AnyAction }
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

export const getColumnFilterValue = (array: FilterSelectorType[] | null, columnName: string): any => {
    return array?.find((item) => item.column === columnName)?.value ?? null;
};
