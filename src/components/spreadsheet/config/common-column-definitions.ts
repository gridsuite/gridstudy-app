/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    FILTER_DATA_TYPES,
    FILTER_NUMBER_COMPARATORS,
    FILTER_TEXT_COMPARATORS,
} from '../../custom-aggrid/custom-aggrid-header.type';
import {
    BooleanFilterValue,
    CustomAggridBooleanFilter,
} from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-boolean-filter';
import { BooleanCellRenderer, DefaultCellRenderer, NumericCellRenderer } from '../utils/cell-renderers';
import { ColDef } from 'ag-grid-community';
import CustomHeaderComponent from '../../custom-aggrid/custom-aggrid-header';
import { CustomAggridComparatorFilter } from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-comparator-filter';
import { SPREADSHEET_SORT_STORE } from '../../../utils/store-sort-filter-fields';
import { updateFilters } from '../../custom-aggrid/custom-aggrid-filters/utils/aggrid-filters-utils';
import { FilterType } from '../../../types/custom-aggrid-types';
import { CustomAggridAutocompleteFilter } from 'components/custom-aggrid/custom-aggrid-filters/custom-aggrid-autocomplete-filter';

export const textColumnDefinition = (displayName: string, tab: string): ColDef => {
    return {
        headerComponent: CustomHeaderComponent,
        headerComponentParams: {
            displayName,
            sortParams: {
                table: SPREADSHEET_SORT_STORE,
                tab,
            },
            filterComponent: CustomAggridComparatorFilter,
            filterComponentParams: {
                filterParams: {
                    type: FilterType.Spreadsheet,
                    tab,
                    updateFilterCallback: updateFilters,
                    dataType: FILTER_DATA_TYPES.TEXT,
                    comparators: [FILTER_TEXT_COMPARATORS.STARTS_WITH, FILTER_TEXT_COMPARATORS.CONTAINS],
                    debounceMs: 200,
                },
            },
        },
        cellRenderer: DefaultCellRenderer,
    };
};

export const enumColumnDefinition = (displayName: string, tab: string): ColDef => {
    return {
        filterParams: {
            filterOptions: [
                {
                    displayKey: 'customInRange',
                    displayName: 'customInRange',
                    predicate: (filterValues: string[], cellValue: string) =>
                        // We receive here the filter enum values as a string (filterValue)
                        filterValues[0]?.includes(cellValue) ?? false,
                },
            ],
        },
        headerComponent: CustomHeaderComponent,
        headerComponentParams: {
            displayName,
            sortParams: {
                table: SPREADSHEET_SORT_STORE,
                tab,
            },
            filterComponent: CustomAggridAutocompleteFilter,
            filterComponentParams: {
                filterParams: {
                    type: FilterType.Spreadsheet,
                    tab,
                    updateFilterCallback: updateFilters,
                    dataType: FILTER_DATA_TYPES.TEXT,
                    debounceMs: 200,
                },
            },
        },
        cellRenderer: DefaultCellRenderer,
    };
};

export const numberColumnDefinition = (displayName: string, tab: string, fractionDigits?: number): ColDef => {
    return {
        filter: 'agNumberColumnFilter',
        headerComponent: CustomHeaderComponent,
        headerComponentParams: {
            displayName,
            sortParams: {
                table: SPREADSHEET_SORT_STORE,
                tab,
            },
            filterComponent: CustomAggridComparatorFilter,
            filterComponentParams: {
                filterParams: {
                    type: FilterType.Spreadsheet,
                    tab,
                    updateFilterCallback: updateFilters,
                    dataType: FILTER_DATA_TYPES.NUMBER,
                    comparators: Object.values(FILTER_NUMBER_COMPARATORS),
                    debounceMs: 200,
                },
            },
        },
        cellRenderer: NumericCellRenderer,
        cellRendererParams: {
            fractionDigits,
        },
    };
};

export const booleanColumnDefinition = (displayName: string, tab: string): ColDef => {
    return {
        filterParams: {
            filterOptions: [
                {
                    displayKey: 'booleanMatches',
                    displayName: 'booleanMatches',
                    predicate: (filterValues: string[], cellValue: boolean) => {
                        const filterValue = filterValues.at(0);
                        if (filterValue === undefined) {
                            return false;
                        }
                        // We receive here the filter boolean value as a string (filterValue)
                        // we check if the cellValue is not null neither undefined
                        if (cellValue != null) {
                            return filterValue === cellValue.toString();
                        }

                        // we return true if the filter chosen is undefinedValue
                        return filterValue === BooleanFilterValue.UNDEFINED;
                    },
                },
            ],
        },
        headerComponent: CustomHeaderComponent,
        headerComponentParams: {
            displayName,
            sortParams: {
                table: SPREADSHEET_SORT_STORE,
                tab,
            },
            filterComponent: CustomAggridBooleanFilter,
            filterComponentParams: {
                filterParams: {
                    type: FilterType.Spreadsheet,
                    tab,
                    dataType: FILTER_DATA_TYPES.BOOLEAN,
                    updateFilterCallback: updateFilters,
                    debounceMs: 50,
                },
            },
        },
        cellRenderer: BooleanCellRenderer,
    };
};
