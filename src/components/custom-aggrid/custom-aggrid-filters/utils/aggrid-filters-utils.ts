/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { GridApi } from 'ag-grid-community';
import { addToleranceToFilter } from './filter-tolerance-utils';
import { FILTER_DATA_TYPES, FILTER_NUMBER_COMPARATORS, FilterConfig } from '../../../../types/custom-aggrid-types';

export enum BooleanFilterValue {
    TRUE = 'true',
    FALSE = 'false',
    UNDEFINED = 'undefinedValue',
}

interface FilterModel {
    [colId: string]: any;
}

const generateEnumFilterModel = (filter: FilterConfig) => {
    const filterValue = filter.value as string[];
    return {
        type: 'text',
        filterType: 'customInRange',
        filter: filterValue,
    };
};

const formatCustomFiltersForAgGrid = (filters: FilterConfig[]): FilterModel => {
    const agGridFilterModel: FilterModel = {};
    const groupedFilters: { [key: string]: FilterConfig[] } = {};

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
                    type: filter.type,
                    tolerance: filter.tolerance,
                    filterType: filter.dataType,
                    filter: filter.dataType === FILTER_DATA_TYPES.NUMBER ? Number(filter.value) : filter.value,
                };
            }
        } else {
            // Multiple filters on the same column
            const conditions = filters.map((filter) => ({
                type: filter.type,
                tolerance: filter.tolerance,
                filterType: filter.dataType,
                filter: filter.dataType === FILTER_DATA_TYPES.NUMBER ? Number(filter.value) : filter.value,
            }));
            // Determine operator based on filter types
            let operator = 'OR';
            if (filters.length === 2 && filters.every((f) => f?.originalType === FILTER_NUMBER_COMPARATORS.EQUALS)) {
                operator = 'AND'; // For EQUALS with tolerance
            }

            // Create a combined filter model with 'OR' for all conditions
            agGridFilterModel[column] = {
                type: filters[0].type,
                tolerance: filters[0].tolerance,
                operator: operator,
                conditions,
            };
        }
    });

    return agGridFilterModel;
};

export const updateAgGridFilters = (api: GridApi | undefined, filters: FilterConfig[] | undefined) => {
    // Check if filters are provided and if the AG Grid API is accessible
    if (!api) return;
    if (!filters?.length) {
        api.setFilterModel(null); // No filters → clear and exit early
        return;
    }

    // Retrieve the current column definitions from AG Grid
    const currentColumnDefs = api.getColumns();

    // Filter out any filters that reference columns which are not visible or don't exist in the current column definitions
    const validFilters = filters.filter((filter) =>
        currentColumnDefs?.some((col) => col.getColId() === filter.column && col.isVisible())
    );

    if (!validFilters.length) {
        api.setFilterModel(null);
        return;
    }
    // If we have any valid filters, apply them
    const filterWithTolerance = addToleranceToFilter(validFilters);
    // Format the valid filters for AG Grid and apply them using setFilterModel
    const formattedFilters = formatCustomFiltersForAgGrid(filterWithTolerance);
    api.setFilterModel(formattedFilters);
    // Ensure AG Grid reacts immediately
    api.onFilterChanged();
};
