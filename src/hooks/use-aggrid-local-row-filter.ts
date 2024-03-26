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
    const columns = gridRef.current?.api?.getColumnDefs();
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
            // Check if filters are provided and if the AG Grid API is accessible
            if (!filters || !gridRef.current?.api) {
                return; // Exit if no filters are provided or if the grid API is not accessible
            }
    
            // Retrieve the current column definitions from AG Grid
            const currentColumnDefs = gridRef.current.api.getColumnDefs();
            
            // Check if all filters' columns exist in the current column definitions
            const allColumnsExist = filters.every((filter) =>
                currentColumnDefs?.some((colDef) => {
                    return (
                        // Ensure the column definition has a 'field' property
                        // and it matches the filter's column field
                        'field' in colDef &&
                        filter &&
                        colDef?.field === filter.column
                    );
                })
            );
    
            // If all columns referenced by the filters exist, apply the filters
            if (allColumnsExist) {
                // Format the filters for AG Grid and apply them using setFilterModel
                const formattedFilters = formatCustomFiltersForAgGrid(filters);
                gridRef.current.api.setFilterModel(formattedFilters);
            }
        },
        [formatCustomFiltersForAgGrid, gridRef]
    );
    

    useEffect(() => {
        setFiltersInAgGrid(filterSelector);
    }, [filterSelector, setFiltersInAgGrid, columns]);

    return { updateFilter, filterSelector };
};
