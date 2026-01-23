/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { debounce } from '@mui/material';
import { GridApi } from 'ag-grid-community';
import { useFilterSelector } from '../../../../hooks/use-filter-selector';
import { computeTolerance } from '../utils/filter-tolerance-utils';
import { FilterConfig, FilterData, FilterParams } from '../../../../types/custom-aggrid-types';
import { FILTER_DATA_TYPES, FILTER_TEXT_COMPARATORS } from '../custom-aggrid-filter.type';
import { updateAgGridFilters } from '../utils/aggrid-filters-utils';
import { useSelector } from 'react-redux';

const removeElementFromArrayWithFieldValue = (filtersArrayToRemoveFieldValueFrom: FilterConfig[], field: string) => {
    return filtersArrayToRemoveFieldValueFrom.filter((f) => f.column !== field);
};

const changeValueFromArrayWithFieldValue = (
    filtersArrayToModify: FilterConfig[],
    field: string,
    newData: FilterConfig
) => {
    const filterIndex = filtersArrayToModify.findIndex((f) => f.column === field);
    if (filterIndex === -1) {
        return [...filtersArrayToModify, newData];
    } else {
        const updatedArray = [...filtersArrayToModify];
        updatedArray[filterIndex] = newData;
        return updatedArray;
    }
};

export const useCustomAggridFilter = (
    api: GridApi,
    colId: string,
    { type, tab, dataType, comparators = [], debounceMs = 1000, updateFilterCallback }: FilterParams
) => {
    const [selectedFilterComparator, setSelectedFilterComparator] = useState<string>('');
    const [selectedFilterData, setSelectedFilterData] = useState<unknown>();
    const [tolerance, setTolerance] = useState<number | undefined>();

    // Track if user is currently editing to prevent external sync from overriding input
    const isEditingRef = useRef(false);
    const editingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { filters, dispatchFilters } = useFilterSelector(type, tab);
    const studyUuid = useSelector((state: any) => state.studyUuid);

    const updateFilter = useCallback(
        (colId: string, data: FilterData): void => {
            const newFilter = {
                column: colId,
                dataType: data.dataType,
                tolerance:
                    data.dataType === FILTER_DATA_TYPES.NUMBER &&
                    data.type !== FILTER_TEXT_COMPARATORS.IS_EMPTY &&
                    data.type !== FILTER_TEXT_COMPARATORS.IS_NOT_EMPTY
                        ? computeTolerance(data.value)
                        : undefined,
                type: data.type,
                value: data.value,
            };

            let updatedFilters: FilterConfig[];
            const filterWithoutValue =
                data.type === FILTER_TEXT_COMPARATORS.IS_EMPTY || data.type === FILTER_TEXT_COMPARATORS.IS_NOT_EMPTY;
            if (!data.value && !filterWithoutValue) {
                updatedFilters = removeElementFromArrayWithFieldValue(filters, colId);
            } else {
                updatedFilters = changeValueFromArrayWithFieldValue(filters, colId, newFilter);
            }
            updateAgGridFilters(api, filters);
            updateFilterCallback?.(api, updatedFilters, colId, studyUuid, type, tab);
            dispatchFilters(updatedFilters);
        },
        [updateFilterCallback, api, dispatchFilters, filters, studyUuid, type, tab]
    );

    // We intentionally exclude `updateFilter` from dependencies.
    // `updateFilter` depends on `filters`, which changes on every filter update.
    // Including it would recreate the debounced function on each change,
    // canceling any pending debounced call and preventing updates from being sent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedUpdateFilter = useCallback(
        debounce((data) => {
            updateFilter(colId, data);
            isEditingRef.current = false;
        }, debounceMs),
        [colId, debounceMs]
    );

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            debouncedUpdateFilter.clear();
            if (editingTimeoutRef.current) {
                clearTimeout(editingTimeoutRef.current);
            }
        };
    }, [debouncedUpdateFilter]);

    const handleChangeFilterValue = useCallback(
        (filterData: FilterData) => {
            isEditingRef.current = true;
            if (editingTimeoutRef.current) clearTimeout(editingTimeoutRef.current);
            editingTimeoutRef.current = setTimeout(() => {
                isEditingRef.current = false;
            }, debounceMs);

            setSelectedFilterData(filterData.value);
            setTolerance(filterData.tolerance);
            debouncedUpdateFilter({
                value: filterData.value,
                type: filterData.type ?? selectedFilterComparator,
                dataType,
                tolerance: filterData.tolerance,
            });
        },
        [dataType, debouncedUpdateFilter, selectedFilterComparator, debounceMs]
    );

    const handleChangeComparator = useCallback(
        (newType: string) => {
            setSelectedFilterComparator(newType);
            const filterWithoutValue =
                newType === FILTER_TEXT_COMPARATORS.IS_EMPTY || newType === FILTER_TEXT_COMPARATORS.IS_NOT_EMPTY;
            if (filterWithoutValue) {
                updateFilter(colId, {
                    value: true,
                    type: newType,
                    dataType,
                    tolerance: tolerance,
                });
            } else if (selectedFilterData && selectedFilterData !== true) {
                updateFilter(colId, {
                    value: selectedFilterData,
                    type: newType,
                    dataType,
                    tolerance: tolerance,
                });
            } else {
                // We switch from IS_EMPTY or IS_NOT_EMPTY comparator to a comparator with a value
                setSelectedFilterData(undefined);
                const updatedFilters = removeElementFromArrayWithFieldValue(filters, colId);
                updateFilterCallback?.(api, updatedFilters);
                dispatchFilters(updatedFilters);
            }
        },
        [
            colId,
            dataType,
            selectedFilterData,
            tolerance,
            updateFilter,
            filters,
            updateFilterCallback,
            api,
            dispatchFilters,
        ]
    );

    useEffect(() => {
        if (!selectedFilterComparator && comparators.length > 0) {
            setSelectedFilterComparator(comparators[0]);
        }
    }, [selectedFilterComparator, comparators]);

    // Sync from external filter changes (Redux store)
    // Only sync when NOT actively editing to prevent race conditions
    useEffect(() => {
        // Skip sync if user is currently editing
        if (isEditingRef.current) {
            return;
        }

        const filterObject = filters?.find((filter) => filter.column === colId);

        if (filterObject) {
            setSelectedFilterData(filterObject.value);
            setSelectedFilterComparator(filterObject.type ?? '');
        } else {
            setSelectedFilterData(undefined);
        }
    }, [filters, colId]);

    return {
        selectedFilterData,
        selectedFilterComparator,
        handleChangeFilterValue,
        handleChangeComparator,
    };
};
