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
            const agGridFilterModel: FilterModel = {};
            filters.forEach((filter) => {
                if (Array.isArray(filter.value)) {
                    //this case means that the filter is an enum
                    agGridFilterModel[filter.column] =
                        generateEnumFilterModel(filter);
                } else {
                    // Check if there's already an existing filter for this column
                    if (
                        agGridFilterModel[filter.column] &&
                        filter.dataType === FILTER_DATA_TYPES.NUMBER
                    ) {
                        // If so, prepare the existing and new conditions using the current filter settings
                        const existingCondition = {
                            type: agGridFilterModel[filter.column].type,
                            filter: agGridFilterModel[filter.column].filter,
                            filterType: 'number',
                        };
                        const newCondition = {
                            type: filter.type,
                            filter: Number(filter.value),
                            filterType: 'number',
                        };

                        // Set up the filter model with an 'OR' operator, including both existing and new conditions
                        agGridFilterModel[filter.column] = {
                            filterType: 'number',
                            type: 'number',
                            operator: 'OR',
                            condition1: existingCondition, // Use the existing condition
                            condition2: newCondition, // Add the new condition
                        };
                    } else {
                        // If no existing filter for this column, create a new filter configuration
                        agGridFilterModel[filter.column] = {
                            filterType: filter.dataType,
                            type: filter.type,
                            filter:
                                filter.dataType === FILTER_DATA_TYPES.NUMBER
                                    ? Number(filter.value)
                                    : filter.value,
                        };
                    }
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
                        'field' in colDef &&
                        filter &&
                        colDef?.field === filter.column
                    );
                })
            );

            // If all columns referenced by the filters exist, apply the filters
            if (allColumnsExist) {
                const filterWithTolerance = addToleranceToFilter(filters);
                // Format the filters for AG Grid and apply them using setFilterModel
                const formattedFilters =
                    formatCustomFiltersForAgGrid(filterWithTolerance);
                gridRef.current.api.setFilterModel(formattedFilters);
            }
        },
        [formatCustomFiltersForAgGrid, gridRef]
    );

    const addToleranceToFilter = (
        filters: FilterSelectorType[],
        tolerance: number = 0.00001
    ): FilterSelectorType[] => {
        return filters
            .map((filter): FilterSelectorType | FilterSelectorType[] => {
                // Attempt to convert filter value to a number if it's a string, otherwise keep it as is
                let valueAsNumber: number | string[] =
                    typeof filter.value === 'string'
                        ? parseFloat(filter.value)
                        : filter.value;
                // If the value is successfully converted to a number, apply tolerance adjustments
                if (typeof valueAsNumber === 'number') {
                    let facteur = Math.pow(10, 5);
                    // Truncate the number to maintain precision
                    let nombre1Tronque =
                        Math.floor(valueAsNumber * facteur) / facteur;
                    // Depending on the filter type, adjust the filter value by adding or subtracting the tolerance
                    switch (filter.type) {
                        case 'notEqual':
                            // For 'notEqual', create two conditions: one for greaterThan and one for lessThan
                            return [
                                {
                                    ...filter,
                                    type: 'greaterThan',
                                    value: (nombre1Tronque + tolerance).toFixed(
                                        5
                                    ),
                                },
                                {
                                    ...filter,
                                    type: 'lessThan',
                                    value: (nombre1Tronque - tolerance).toFixed(
                                        5
                                    ),
                                },
                            ];
                        case 'lessThanOrEqual':
                            // For 'lessThanOrEqual', adjust the value upwards by the tolerance
                            return {
                                ...filter,
                                value: (nombre1Tronque + tolerance).toFixed(5),
                            };
                        case 'greaterThanOrEqual':
                            // For 'greaterThanOrEqual', adjust the value downwards by the tolerance
                            return {
                                ...filter,
                                value: (nombre1Tronque - tolerance).toFixed(5),
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
