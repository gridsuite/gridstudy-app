/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnyAction } from 'redux';

type FilterDataType = { value: string; type: string; dataType: string };

export type FilterEnumsType = Record<string, string[] | null>;

export type FilterSelectorType = {
    column: string;
    dataType: string;
    type: string;
    value: string | string[];
};

export type FilterPropsType = {
    updateFilter: (field: string, value: FilterDataType) => void;
    filterSelector: FilterSelectorType[] | null;
    initFilters?: () => void;
};

export type UseAggridRowFilterOutputType = {
    updateFilter: (field: string, data: FilterDataType) => void;
    filterSelector: FilterSelectorType[] | null;
    initFilters: () => void;
};

const removeElementFromArrayWithFieldValue = (
    filtersArrayToRemoveFieldValueFrom: FilterSelectorType[],
    field: string
) => {
    return filtersArrayToRemoveFieldValueFrom.filter(
        (f: FilterSelectorType) => f.column !== field
    );
};

const changeValueFromArrayWithFieldValue = (
    filtersArrayToModify: FilterSelectorType[],
    field: string,
    newData: FilterSelectorType
) => {
    const filterIndex = filtersArrayToModify.findIndex(
        (f: FilterSelectorType) => f.column === field
    );
    if (filterIndex === -1) {
        return [...filtersArrayToModify, newData];
    } else {
        const updatedArray = [...filtersArrayToModify];
        updatedArray[filterIndex] = newData;
        return updatedArray;
    }
};

export const useAggridRowFilter = (
    typeFilter: string,
    tabFilter: string,
    setFilterStore?: (dispatch: any) => AnyAction,
    updateFilterCallback?: () => void
): UseAggridRowFilterOutputType => {
    const dispatch = useDispatch();
    const filterStore = useSelector(
        (state: any) => state[typeFilter][tabFilter]
    );
    const [filters, setFilters] = useState<FilterSelectorType[]>([]);

    useEffect(() => {
        if (filterStore?.length) {
            setFilters(filterStore);
        }
    }, [filterStore]);

    const updateFilter = useCallback(
        (field: string, data: FilterDataType): void => {
            const newFilter = {
                column: field,
                dataType: data.dataType,
                type: data.type,
                value: data.value,
            };
            let filter: FilterSelectorType[] = [];
            setFilters((oldRowFilters: FilterSelectorType[]) => {
                let updatedFilters;

                if (!data.value) {
                    updatedFilters = removeElementFromArrayWithFieldValue(
                        oldRowFilters,
                        field
                    );
                } else {
                    updatedFilters = changeValueFromArrayWithFieldValue(
                        oldRowFilters,
                        field,
                        newFilter
                    );
                }

                updateFilterCallback && updateFilterCallback();
                filter = updatedFilters;
                return updatedFilters;
            });
            setFilterStore &&
                dispatch(
                    setFilterStore({
                        [tabFilter]: filter || [],
                    })
                );
        },
        [tabFilter, updateFilterCallback, dispatch, setFilterStore]
    );

    const filterSelector: FilterSelectorType[] | null = useMemo(() => {
        if (filterStore?.length) {
            return filterStore;
        }
        return filters;
    }, [filters, filterStore]);

    const initFilters = useCallback(() => {
        setFilters([]);
    }, []);

    return { updateFilter, filterSelector, initFilters };
};
