/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FILTER_DATA_TYPES, FilterDataType, FilterParams, FilterSelectorType } from '../custom-aggrid-header.type';
import { useCallback, useEffect, useState } from 'react';
import { debounce } from '@mui/material';
import { FilterType, useAggridRowFilter } from './use-aggrid-row-filter';
import { GridApi } from 'ag-grid-community';

export const useCustomAggridFilter = (
    api: GridApi,
    field: string,
    filterParams: FilterParams,
    filterType: FilterType,
    filterTab: string,
    updateFilterCallback?: (api?: GridApi, filters?: FilterSelectorType[]) => void
) => {
    const { updateFilter, filterSelector } = useAggridRowFilter(api, filterType, filterTab, updateFilterCallback);
    const [selectedFilterComparator, setSelectedFilterComparator] = useState<string>('');
    const [selectedFilterData, setSelectedFilterData] = useState<unknown>();
    const [tolerance, setTolerance] = useState<number | undefined>();

    const {
        filterDataType = FILTER_DATA_TYPES.TEXT,
        filterComparators = [], // used for text filter as a UI type (examples: contains, startsWith..)
        debounceMs = 1000, // used to debounce the api call to not fetch the back end too fast
    } = filterParams;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedUpdateFilter = useCallback(
        debounce((data) => updateFilter(field, data), debounceMs),
        [field, debounceMs, updateFilter]
    );
    const handleChangeFilterValue = (filterData: FilterDataType) => {
        setSelectedFilterData(filterData.value);
        setTolerance(filterData.tolerance);
        debouncedUpdateFilter({
            value: filterData.value,
            type: filterData.type ?? selectedFilterComparator,
            dataType: filterDataType,
            tolerance: filterData.tolerance,
        });
    };

    const handleChangeComparator = (newType: string) => {
        setSelectedFilterComparator(newType);
        debouncedUpdateFilter({
            value: selectedFilterData,
            type: newType,
            dataType: filterDataType,
            tolerance: tolerance,
        });
    };

    useEffect(() => {
        if (!selectedFilterComparator) {
            setSelectedFilterComparator(filterComparators[0]);
        }
    }, [selectedFilterComparator, filterComparators]);

    useEffect(() => {
        if (filterSelector && filterSelector.length !== 0) {
            updateFilterCallback && updateFilterCallback(api, filterSelector);
        }
    }, [api, filterSelector, updateFilterCallback]);

    useEffect(() => {
        if (!filterSelector?.length) {
            setSelectedFilterData(undefined);
        } else {
            const filterObject = filterSelector?.find((filter) => filter.column === field);
            if (filterObject) {
                setSelectedFilterData(filterObject.value);
                setSelectedFilterComparator(filterObject.type ?? selectedFilterComparator);
            } else {
                setSelectedFilterData(undefined);
            }
        }
    }, [filterSelector, field, selectedFilterComparator]);

    return {
        selectedFilterData,
        selectedFilterComparator,
        handleChangeFilterValue,
        handleChangeComparator,
    };
};
