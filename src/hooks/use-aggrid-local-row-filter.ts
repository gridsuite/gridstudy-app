/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { type AgGridReact } from 'ag-grid-react';
import { type MutableRefObject, useCallback, useEffect } from 'react';
import { useAggridRowFilter, UseAggridRowFilterOutputType } from './use-aggrid-row-filter';
import {
    FILTER_DATA_TYPES,
    FILTER_NUMBER_COMPARATORS,
    type FilterSelectorType,
} from '../components/custom-aggrid/custom-aggrid-header.type';
import { countDecimalPlaces, truncateNumber } from '../utils/rounding';
import type { StoreTableKeys, StoreTableTabs } from '../utils/store-sort-filter-fields';

interface FilterModel {
    [colId: string]: any;
}

function generateEnumFilterModel(filter: FilterSelectorType) {
    return {
        filterType: 'text',
        type: 'customInRange',
        filter: filter.value as string[],
    };
}

function formatCustomFiltersForAgGrid(filters: FilterSelectorType[]): FilterModel {
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
}

function addToleranceToFilter(filters: FilterSelectorType[], tolerance: number = 0.00001): FilterSelectorType[] {
    const decimalPrecision = countDecimalPlaces(tolerance);
    return filters
        .map((filter): FilterSelectorType | FilterSelectorType[] => {
            // Attempt to convert filter value to a number if it's a string, otherwise keep it as is
            const valueAsNumber: number | string[] | null | undefined =
                typeof filter.value === 'string' ? parseFloat(filter.value) : filter.value;
            // If the value is successfully converted to a number, apply tolerance adjustments
            if (typeof valueAsNumber !== 'number') {
                return filter;
            }
            // Call the truncateNumber function to accurately truncate 'valueAsNumber' to 'decimalPrecision' decimal places.
            const truncatedNumber = truncateNumber(valueAsNumber, decimalPrecision);
            // Depending on the filter type, adjust the filter value by adding or subtracting the tolerance
            switch (filter.type) {
                case FILTER_NUMBER_COMPARATORS.NOT_EQUAL:
                    // Create two conditions to test we are not in [value-tolerance..value+tolerance]
                    return [
                        {
                            ...filter,
                            type: FILTER_NUMBER_COMPARATORS.GREATER_THAN_OR_EQUAL,
                            value: (truncatedNumber + tolerance).toFixed(decimalPrecision),
                        },
                        {
                            ...filter,
                            type: FILTER_NUMBER_COMPARATORS.LESS_THAN_OR_EQUAL,
                            value: (truncatedNumber - tolerance).toFixed(decimalPrecision),
                        },
                    ];
                case FILTER_NUMBER_COMPARATORS.LESS_THAN_OR_EQUAL:
                    // Adjust the value upwards by the tolerance
                    return {
                        ...filter,
                        value: (truncatedNumber + tolerance).toFixed(decimalPrecision),
                    };
                case FILTER_NUMBER_COMPARATORS.GREATER_THAN_OR_EQUAL:
                    // Adjust the value downwards by the tolerance
                    return {
                        ...filter,
                        value: (truncatedNumber - tolerance).toFixed(decimalPrecision),
                    };
                default:
                    return filter;
            }
        })
        .flat(); // Flatten the array in case any filters were expanded into multiple conditions
}

export function useAggridLocalRowFilter<T extends StoreTableKeys<true>>(
    gridRef: MutableRefObject<AgGridReact | null>,
    table: T,
    tab: StoreTableTabs<T>
): UseAggridRowFilterOutputType {
    const columns = gridRef.current?.api?.getColumnDefs();
    const { updateFilter, filterSelector } = useAggridRowFilter(table, tab);

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
        [gridRef]
    );

    useEffect(() => {
        setFiltersInAgGrid(filterSelector);
    }, [filterSelector, setFiltersInAgGrid, columns]);

    return { updateFilter, filterSelector };
}
