/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AgGridReact } from 'ag-grid-react';
import React, { useCallback, useEffect } from 'react';
import {
    UseAggridRowFilterOutputType,
    useAggridRowFilter,
} from './use-aggrid-row-filter';
import {
    FilterSelectorType,
    FilterStorePropsType,
    FILTER_DATA_TYPES,
} from 'components/custom-aggrid/custom-aggrid-header.type';

interface FilterModel {
    [colId: string]: any;
}

export const useAggridLocalRowFilter = (
    gridRef: React.MutableRefObject<AgGridReact | null>,
    filterStoreParam: FilterStorePropsType
): UseAggridRowFilterOutputType => {
    const { updateFilter, filterSelector } =
        useAggridRowFilter(filterStoreParam);

    const generateEnumFilterModel = useCallback(
        (filter: FilterSelectorType) => {
            const filterValue = filter.value as string[];
            return {
                filterType: 'text',
                type: 'customInRange',
                filter: filterValue,
            };
        },
        []
    );

    const formatCustomFiltersForAgGrid = useCallback(
        (filters: FilterSelectorType[]) => {
            const agGrifFilterModel: FilterModel = {};
            filters.forEach((filter) => {
                if (Array.isArray(filter.value)) {
                    //this case means that the filter is an enum
                    agGrifFilterModel[filter.column] =
                        generateEnumFilterModel(filter);
                } else {
                    agGrifFilterModel[filter.column] = {
                        filterType: filter.dataType,
                        type: filter.type,
                        filter:
                            filter.dataType === FILTER_DATA_TYPES.NUMBER
                                ? Number(filter.value)
                                : filter.value,
                    };
                }
            });
            return agGrifFilterModel;
        },
        [generateEnumFilterModel]
    );

    const setFiltersInAgGrid = useCallback(
        (filters: FilterSelectorType[] | null) => {
            if (filters) {
                const formattedFilters = formatCustomFiltersForAgGrid(filters);
                gridRef.current?.api?.setFilterModel(formattedFilters);
            } else {
                gridRef.current?.api?.setFilterModel(null);
            }
        },
        [formatCustomFiltersForAgGrid, gridRef]
    );

    useEffect(() => {
        setFiltersInAgGrid(filterSelector);
    }, [filterSelector, setFiltersInAgGrid]);

    return { updateFilter, filterSelector };
};
