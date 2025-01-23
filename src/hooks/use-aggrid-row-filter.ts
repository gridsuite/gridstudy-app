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
    FilterStorePropsType,
} from 'components/custom-aggrid/custom-aggrid-header.type';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../redux/store';
import { AppState } from '../redux/reducer';
import { computeTolerance } from './use-aggrid-local-row-filter';

export type UseAggridRowFilterOutputType = {
    updateFilter: (colId: string, data: FilterDataType) => void;
    filterSelector: FilterSelectorType[] | null;
};

const removeElementFromArrayWithFieldValue = (
    filtersArrayToRemoveFieldValueFrom: FilterSelectorType[],
    colId: string
) => {
    return filtersArrayToRemoveFieldValueFrom.filter((f: FilterSelectorType) => f.column !== colId);
};

const changeValueFromArrayWithFieldValue = (
    filtersArrayToModify: FilterSelectorType[],
    colId: string,
    newData: FilterSelectorType
) => {
    const filterIndex = filtersArrayToModify.findIndex((f: FilterSelectorType) => f.column === colId);
    if (filterIndex === -1) {
        return [...filtersArrayToModify, newData];
    } else {
        const updatedArray = [...filtersArrayToModify];
        updatedArray[filterIndex] = newData;
        return updatedArray;
    }
};

export const useAggridRowFilter = (
    filterStoreParam: FilterStorePropsType,
    updateFilterCallback?: () => void
): UseAggridRowFilterOutputType => {
    const dispatch = useDispatch<AppDispatch>();
    const { filterType, filterTab, filterStoreAction } = filterStoreParam;
    const filterStore = useSelector(
        // @ts-expect-error TODO: found a better way to go into state
        (state: AppState) => state[filterType][filterTab]
    );

    const updateFilter = useCallback(
        (colId: string, data: FilterDataType): void => {
            const newFilter = {
                column: colId,
                dataType: data.dataType,
                tolerance: data.dataType === FILTER_DATA_TYPES.NUMBER ? computeTolerance(data.value) : undefined,
                type: data.type,
                value: data.value,
            };
            let updatedFilters;

            if (!data.value) {
                updatedFilters = removeElementFromArrayWithFieldValue(filterStore, colId);
            } else {
                updatedFilters = changeValueFromArrayWithFieldValue(filterStore, colId, newFilter);
            }

            updateFilterCallback && updateFilterCallback();
            filterStoreAction &&
                filterTab &&
                // @ts-expect-error TODO: maybe resolve this with discriminate union parameter in FilterStorePropsType?
                dispatch(filterStoreAction(filterTab, updatedFilters));
        },
        [filterTab, filterStore, updateFilterCallback, dispatch, filterStoreAction]
    );

    return { updateFilter, filterSelector: filterStore };
};

export const getColumnFilterValue = (array: FilterSelectorType[] | null, columnName: string): any => {
    return array?.find((item) => item.column === columnName)?.value ?? null;
};
