/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FILTER_DATA_TYPES, FilterDataType, FilterParams } from '../custom-aggrid-header.type';
import { useCallback, useEffect, useState } from 'react';
import { debounce } from '@mui/material';

export const useCustomAggridFilter = (colId: string, filterParams: FilterParams) => {
    const [selectedFilterComparator, setSelectedFilterComparator] = useState('');
    const [selectedFilterData, setSelectedFilterData] = useState<unknown>();
    const [tolerance, setTolerance] = useState<number | undefined>();

    const {
        filterDataType = FILTER_DATA_TYPES.TEXT,
        filterComparators = [], // used for text filter as a UI type (examples: contains, startsWith..)
        debounceMs = 1000, // used to debounce the api call to not fetch the back end too fast
        filterSelector, // used to detect a tab change on the agGrid table
        updateFilter = () => {}, // used to update the filter and fetch the new data corresponding to the filter
    } = filterParams;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedUpdateFilter = useCallback(
        debounce((data) => updateFilter(colId, data), debounceMs),
        [colId, debounceMs, updateFilter]
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
        if (!filterSelector?.length) {
            setSelectedFilterData(undefined);
        } else {
            const filterObject = filterSelector?.find((filter) => filter.column === colId);
            if (filterObject) {
                setSelectedFilterData(filterObject.value);
                setSelectedFilterComparator(filterObject.type ?? selectedFilterComparator);
            } else {
                setSelectedFilterData(undefined);
            }
        }
    }, [filterSelector, colId, selectedFilterComparator]);

    return {
        selectedFilterData,
        selectedFilterComparator,
        handleChangeFilterValue,
        handleChangeComparator,
    };
};
