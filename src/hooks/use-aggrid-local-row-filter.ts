/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AgGridReact } from 'ag-grid-react';
import React, { useCallback, useEffect } from 'react';
import { UseAggridRowFilterOutputType, useAggridRowFilter } from './use-aggrid-row-filter';
import {
    FilterSelectorType,
    FilterStorePropsType,
    FILTER_DATA_TYPES,
} from 'components/custom-aggrid/custom-aggrid-header.type';
import { countDecimalPlaces, truncateNumber } from 'utils/rounding';

interface FilterModel {
    [colId: string]: any;
}

export const useAggridLocalRowFilter = (
    gridRef: React.MutableRefObject<AgGridReact | null>,
    filterStoreParam: FilterStorePropsType
): UseAggridRowFilterOutputType => {
    const columns = gridRef.current?.api?.getColumnDefs();
    const { updateFilter, filterSelector } = useAggridRowFilter(filterStoreParam);

    const generateEnumFilterModel = useCallback((filter: FilterSelectorType) => {
        const filterValue = filter.value as string[];
        return {
            filterType: 'text',
            type: 'customInRange',
            filter: filterValue,
        };
    }, []);

    const formatCustomFiltersForAgGrid = useCallback(
        (filters: FilterSelectorType[]): FilterModel => {
            const agGridFilterModel: FilterModel = {};
            const groupedFilters: { [key: string]: FilterSelectorType[] } = {};

            // Group filters by column
            filters.forEach((filter) => {
                if (groupedFilters[filter.column]) {
                    groupedFilters[filter.column].push(filter);
                } else {
                    groupedFilters[filter.column] = [filter];
                }
            });

            // Transform groups of filters into a FilterModel
            Object.keys(groupedFilters).forEach((column) => {
                const filters = groupedFilters[column];
                if (filters.length === 1) {
                    const filter = filters[0];
                    if (Array.isArray(filter.value)) {
                        agGridFilterModel[column] = generateEnumFilterModel(filter);
                    } else {
                        agGridFilterModel[column] = {
                            filterType: filter.dataType,
                            type: filter.type,
                            filter: filter.dataType === FILTER_DATA_TYPES.NUMBER ? Number(filter.value) : filter.value,
                        };
                    }
                } else {
                    // Multiple filters on the same column
                    const conditions = filters.map((filter) => ({
                        filterType: filter.dataType,
                        type: filter.type,
                        filter: filter.dataType === FILTER_DATA_TYPES.NUMBER ? Number(filter.value) : filter.value,
                    }));

                    // Create a combined filter model with 'OR' for all conditions
                    agGridFilterModel[column] = {
                        filterType: filters[0].dataType,
                        operator: 'OR',
                        // Dynamically add additional conditions
                        // Each additional condition is added as 'condition1', 'condition2', etc.
                        ...conditions.reduce((acc: FilterModel, condition: FilterModel, index: number) => {
                            acc[`condition${index + 1}`] = condition;
                            return acc;
                        }, {}),
                    };
                }
            });

            return agGridFilterModel;
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
                        'field' in colDef && filter && colDef?.field === filter.column
                    );
                })
            );

            // If all columns referenced by the filters exist, apply the filters
            if (allColumnsExist) {
                const filterWithTolerance = addToleranceToFilter(filters);
                // Format the filters for AG Grid and apply them using setFilterModel
                const formattedFilters = formatCustomFiltersForAgGrid(filterWithTolerance);
                gridRef.current.api.setFilterModel(formattedFilters);
            }
        },
        [formatCustomFiltersForAgGrid, gridRef]
    );

    const addToleranceToFilter = (filters: FilterSelectorType[], tolerance: number = 0.00001): FilterSelectorType[] => {
        const decimalPrecision: number = countDecimalPlaces(tolerance);
        return filters
            .map((filter): FilterSelectorType | FilterSelectorType[] => {
                // Attempt to convert filter value to a number if it's a string, otherwise keep it as is
                let valueAsNumber: number | string[] | null | undefined =
                    typeof filter.value === 'string' ? parseFloat(filter.value) : filter.value;
                // If the value is successfully converted to a number, apply tolerance adjustments
                if (typeof valueAsNumber === 'number') {
                    // Call the truncateNumber function to accurately truncate 'valueAsNumber' to 'decimalPrecision' decimal places.
                    let truncatedNumber = truncateNumber(valueAsNumber, decimalPrecision);
                    // Depending on the filter type, adjust the filter value by adding or subtracting the tolerance
                    switch (filter.type) {
                        case 'notEqual':
                            // For 'notEqual', create two conditions: one for greaterThan and one for lessThan
                            return [
                                {
                                    ...filter,
                                    type: 'greaterThan',
                                    value: (truncatedNumber + tolerance).toFixed(decimalPrecision),
                                },
                                {
                                    ...filter,
                                    type: 'lessThan',
                                    value: (truncatedNumber - tolerance).toFixed(decimalPrecision),
                                },
                            ];
                        case 'lessThanOrEqual':
                            // For 'lessThanOrEqual', adjust the value upwards by the tolerance
                            return {
                                ...filter,
                                value: (truncatedNumber + tolerance).toFixed(decimalPrecision),
                            };
                        case 'greaterThanOrEqual':
                            // For 'greaterThanOrEqual', adjust the value downwards by the tolerance
                            return {
                                ...filter,
                                value: (truncatedNumber - tolerance).toFixed(decimalPrecision),
                            };
                        default:
                            return filter;
                    }
                }
                return filter;
            })
            .flat(); // Flatten the array in case any filters were expanded into multiple conditions
    };

    useEffect(() => {
        setFiltersInAgGrid(filterSelector);
    }, [filterSelector, setFiltersInAgGrid, columns]);

    return { updateFilter, filterSelector };
};
