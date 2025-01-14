/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    FILTER_DATA_TYPES,
    FILTER_NUMBER_COMPARATORS,
    FilterSelectorType,
    UNDISPLAYED_FILTER_NUMBER_COMPARATORS,
} from 'components/custom-aggrid/custom-aggrid-header.type';
import { countDecimalPlaces, countDecimalPlacesFromString } from 'utils/rounding';
import { isNumber } from 'mathjs';
import { GridApi } from 'ag-grid-community';

interface FilterModel {
    [colId: string]: any;
}

/**
 * Compute the tolerance that should be applied when comparing filter values to database values
 * @param value value entered in the filter
 */
export const computeTolerance = (value: unknown) => {
    if (!value) {
        return 0;
    }
    let decimalPrecision: number;
    // the reference for the comparison is the number of digits after the decimal point in 'value'
    // extra digits are ignored, but the user may add '0's after the decimal point in order to get a better precision
    if (isNumber(value)) {
        decimalPrecision = countDecimalPlaces(value);
    } else {
        decimalPrecision = countDecimalPlacesFromString(value as string);
    }
    // tolerance is multiplied by 0.5 to simulate the fact that the database value is rounded (in the front, from the user viewpoint)
    // more than 13 decimal after dot will likely cause rounding errors due to double precision
    return (1 / Math.pow(10, decimalPrecision)) * 0.5;
};

const generateEnumFilterModel = (filter: FilterSelectorType) => {
    const filterValue = filter.value as string[];
    return {
        filterType: 'text',
        type: 'customInRange',
        filter: filterValue,
    };
};

const formatCustomFiltersForAgGrid = (filters: FilterSelectorType[]): FilterModel => {
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
                    tolerance: filter.tolerance,
                    type: filter.type,
                    filter: filter.dataType === FILTER_DATA_TYPES.NUMBER ? Number(filter.value) : filter.value,
                };
            }
        } else {
            // Multiple filters on the same column
            const conditions = filters.map((filter) => ({
                filterType: filter.dataType,
                tolerance: filter.tolerance,
                type: filter.type,
                filter: filter.dataType === FILTER_DATA_TYPES.NUMBER ? Number(filter.value) : filter.value,
            }));

            // Create a combined filter model with 'OR' for all conditions
            agGridFilterModel[column] = {
                filterType: filters[0].dataType,
                tolerance: filters[0].tolerance,
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
};

const addToleranceToFilter = (
    filters: FilterSelectorType[],
    tolerance: number | undefined = undefined
): FilterSelectorType[] => {
    let finalTolerance: number;
    if (tolerance !== undefined) {
        finalTolerance = tolerance;
    }
    return filters
        .map((filter): FilterSelectorType | FilterSelectorType[] => {
            // Attempt to convert filter value to a number if it's a string, otherwise keep it as is
            let valueAsNumber = typeof filter.value === 'string' ? parseFloat(filter.value) : filter.value;
            // If the value is successfully converted to a number, apply tolerance adjustments
            if (typeof valueAsNumber === 'number') {
                if (tolerance === undefined) {
                    // better to use the string value (filter.value) in order not to lose the decimal precision for values like 420.0000000
                    finalTolerance = computeTolerance(filter.value);
                }

                // Depending on the filter type, adjust the filter value by adding or subtracting the tolerance
                switch (filter.type) {
                    // Creates two conditions to test we are not in [value-tolerance..value+tolerance] (handles rounded decimal precision)
                    case FILTER_NUMBER_COMPARATORS.NOT_EQUAL:
                        return [
                            {
                                ...filter,
                                type: UNDISPLAYED_FILTER_NUMBER_COMPARATORS.GREATER_THAN,
                                value: valueAsNumber + finalTolerance,
                            },
                            {
                                ...filter,
                                type: UNDISPLAYED_FILTER_NUMBER_COMPARATORS.LESS_THAN,
                                value: valueAsNumber - finalTolerance,
                            },
                        ];
                    case FILTER_NUMBER_COMPARATORS.LESS_THAN_OR_EQUAL:
                        // Adjust the value upwards by the tolerance
                        return {
                            ...filter,
                            value: valueAsNumber + finalTolerance,
                        };
                    case FILTER_NUMBER_COMPARATORS.GREATER_THAN_OR_EQUAL:
                        return {
                            ...filter,
                            value: valueAsNumber - finalTolerance,
                        };
                    default:
                        return filter;
                }
            }
            return filter;
        })
        .flat(); // Flatten the array in case any filters were expanded into multiple conditions
};

export const updateFilters = (api: GridApi | undefined, filters: FilterSelectorType[] | undefined) => {
    // Check if filters are provided and if the AG Grid API is accessible
    if (!filters || !api) {
        return; // Exit if no filters are provided or if the grid API is not accessible
    }

    // Retrieve the current column definitions from AG Grid
    const currentColumnDefs = api.getColumnDefs();

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
        api.setFilterModel(formattedFilters);
    }
};
