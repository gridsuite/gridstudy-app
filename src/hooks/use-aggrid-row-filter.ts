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

type FilterType = {
    field: string;
    data: FilterDataType;
};

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
    filtersArrayToRemoveFieldValueFrom: FilterType[],
    field: string
) => {
    return filtersArrayToRemoveFieldValueFrom.filter(
        (f: FilterType) => f.field !== field
    );
};

const changeValueFromArrayWithFieldValue = (
    filtersArrayToModify: FilterType[],
    field: string,
    newData: FilterDataType
) => {
    const filterIndex = filtersArrayToModify.findIndex(
        (f: FilterType) => f.field === field
    );
    if (filterIndex === -1) {
        return [
            ...filtersArrayToModify,
            {
                field,
                data: newData,
            },
        ];
    } else {
        const updatedArray = [...filtersArrayToModify];
        updatedArray[filterIndex].data = newData;
        return updatedArray;
    }
};

export const useAggridRowFilter = (
    filterSelectorKeys: Record<string, string>,
    filterTab: string,
    setFilterStore?: (dispatch: FilterSelectorType[]) => AnyAction,
    updateFilterCallback?: () => void
): UseAggridRowFilterOutputType => {
    const dispatch = useDispatch();
    const filterStore = useSelector((state: any) => state[filterTab]);
    const [filters, setFilters] = useState<FilterType[]>([]);

    useEffect(() => {
        if (filterStore?.length) {
            const filterState: FilterType[] = filterStore.map(
                (element: FilterSelectorType) => {
                    return {
                        field: element.column,
                        data: {
                            value: element.value,
                            type: element.type,
                            dataType: element.dataType,
                        },
                    };
                }
            );
            setFilters(filterState);
        }
    }, [filterStore]);

    const transformFilter = useCallback(
        (filters: FilterType[]) => {
            const result = filters.reduce(
                (selector: Record<string, FilterDataType>, { field, data }) => {
                    selector[filterSelectorKeys[field]] = data;
                    return selector;
                },
                {}
            );

            const resultKeys = Object.keys(result);

            if (!resultKeys.length) {
                return null;
            }

            return resultKeys.map((field: string) => {
                const selectedValue = result[field];

                const { value, type, dataType } = selectedValue;

                return {
                    column: field,
                    dataType,
                    type,
                    value,
                };
            });
        },
        [filterSelectorKeys]
    );

    const updateFilter = useCallback(
        (field: string, data: FilterDataType): void => {
            let filter: FilterType[] = [];
            setFilters((oldRowFilters: FilterType[]) => {
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
                        data
                    );
                }

                updateFilterCallback && updateFilterCallback();
                filter = updatedFilters;
                return updatedFilters;
            });
            const newFilterValue = transformFilter(filter);
            setFilterStore && dispatch(setFilterStore(newFilterValue || []));
        },
        [updateFilterCallback, dispatch, transformFilter, setFilterStore]
    );

    const filterSelector: FilterSelectorType[] | null = useMemo(() => {
        if (filterStore?.length) {
            return filterStore;
        }
        return transformFilter(filters);
    }, [filters, filterStore, transformFilter]);

    const initFilters = useCallback(() => {
        setFilters([]);
    }, []);

    return { updateFilter, filterSelector, initFilters };
};
