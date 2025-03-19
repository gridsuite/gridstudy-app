/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { COLUMN_TYPES } from '../../custom-aggrid/custom-aggrid-header.type';
import { CustomAggridBooleanFilter } from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-boolean-filter';
import {
    BooleanCellRenderer,
    DefaultCellRenderer,
    NumericCellRenderer,
    RowIndexCellRenderer,
} from '../utils/cell-renderers';
import { ColDef } from 'ag-grid-community';
import CustomHeaderComponent from '../../custom-aggrid/custom-aggrid-header';
import { CustomAggridComparatorFilter } from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-comparator-filter';
import { SPREADSHEET_SORT_STORE } from '../../../utils/store-sort-filter-fields';
import {
    BooleanFilterValue,
    updateFilters,
} from '../../custom-aggrid/custom-aggrid-filters/utils/aggrid-filters-utils';
import { FilterType } from '../../../types/custom-aggrid-types';
import { CustomAggridAutocompleteFilter } from 'components/custom-aggrid/custom-aggrid-filters/custom-aggrid-autocomplete-filter';
import {
    CustomColDef,
    FILTER_DATA_TYPES,
    FILTER_NUMBER_COMPARATORS,
    FILTER_TEXT_COMPARATORS,
} from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { UUID } from 'crypto';
import { isCalculationRow } from '../utils/calculation-utils';

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
        context: {
            columnType: COLUMN_TYPES.TEXT,
        },
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
        context: {
            columnType: COLUMN_TYPES.ENUM,
        },
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
        context: {
            columnType: COLUMN_TYPES.NUMBER,
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
        context: {
            columnType: COLUMN_TYPES.BOOLEAN,
        },
    };
};

export const rowIndexColumnDefinition = (tabUuid: UUID): CustomColDef => {
    return {
        colId: 'rowIndex',
        headerName: '',
        cellRenderer: (params: any) => {
            // For pinned rows, use the RowIndexCellRenderer which handles the calculate icon
            if (isCalculationRow(params.node?.data?.rowType)) {
                return RowIndexCellRenderer(params);
            }
            return params.node.rowIndex + 1;
        },
        width: 65,
        pinned: 'left',
        suppressMovable: true,
        lockPosition: true,
        sortable: false,
        filter: false,
        resizable: true,
        cellStyle: { textAlign: 'center' },
        editable: false,
        suppressAutoSize: false,
        context: {
            tabUuid: tabUuid,
        },
    };
};
