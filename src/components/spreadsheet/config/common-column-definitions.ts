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

export const textAgGridColumnDefinition: ColDef = {
    cellDataType: 'text',
    filter: 'agTextColumnFilter',
    filterParams: {
        caseSensitive: false,
        maxNumConditions: 1,
        filterOptions: [FILTER_TEXT_COMPARATORS.STARTS_WITH, FILTER_TEXT_COMPARATORS.CONTAINS],
        debounceMs: 200,
    },
    sortable: true,
    resizable: true,
    cellRenderer: DefaultCellRenderer,
};

export const textColumnDefinition = (field: string, displayName: string, sortTab: string): ColDef => {
    return {
        cellDataType: 'text',
        headerComponent: CustomHeaderComponent,
        headerComponentParams: {
            field,
            displayName,
            sortParams: {
                table: SPREADSHEET_SORT_STORE,
                tab: sortTab,
            },
            filterComponent: CustomAggridComparatorFilter,
            filterComponentParams: {
                field,
                filterParams: {
                    type: FilterType.Spreadsheet,
                    tab: sortTab,
                    updateFilterCallback: updateFilters,
                    dataType: FILTER_DATA_TYPES.TEXT,
                    comparators: [FILTER_TEXT_COMPARATORS.STARTS_WITH, FILTER_TEXT_COMPARATORS.CONTAINS],
                    debounceMs: 200,
                },
            },
        },
        resizable: true,
        cellRenderer: DefaultCellRenderer,
    };
};

export const numberAgGridColumnDefinition = (fractionDigits?: number): ColDef => {
    return {
        cellDataType: 'number',
        filter: 'agNumberColumnFilter',
        filterParams: {
            maxNumConditions: 2,
            filterOptions: Object.values(FILTER_NUMBER_COMPARATORS),
            debounceMs: 200,
        },
        sortable: true,
        resizable: true,
        cellRenderer: NumericCellRenderer,
        cellRendererParams: {
            fractionDigits,
        },
    };
};

export const numberColumnDefinition = (
    field: string,
    displayName: string,
    sortTab: string,
    fractionDigits?: number
): ColDef => {
    return {
        cellDataType: 'number',
        headerComponent: CustomHeaderComponent,
        headerComponentParams: {
            field,
            displayName,
            sortParams: {
                table: SPREADSHEET_SORT_STORE,
                tab: sortTab,
            },
            filterComponent: CustomAggridComparatorFilter,
            filterComponentParams: {
                field,
                filterParams: {
                    type: FilterType.Spreadsheet,
                    tab: sortTab,
                    updateFilterCallback: updateFilters,
                    dataType: FILTER_DATA_TYPES.NUMBER,
                    comparators: Object.values(FILTER_NUMBER_COMPARATORS),
                    debounceMs: 200,
                },
            },
        },
        resizable: true,
        cellRenderer: NumericCellRenderer,
        cellRendererParams: {
            fractionDigits,
        },
    };
};

export const booleanAgGridColumnDefinition: ColDef = {
    filterParams: {
        maxNumConditions: 1,
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
    cellRenderer: BooleanCellRenderer,
    sortable: true,
    resizable: true,
};

export const booleanColumnDefinition = (field: string, displayName: string, sortTab: string): ColDef => {
    return {
        headerComponent: CustomHeaderComponent,
        headerComponentParams: {
            field,
            displayName,
            sortParams: {
                table: SPREADSHEET_SORT_STORE,
                tab: sortTab,
            },
            filterComponent: CustomAggridBooleanFilter,
            filterComponentParams: {
                field,
                filterParams: {
                    type: FilterType.Spreadsheet,
                    tab: sortTab,
                    dataType: FILTER_DATA_TYPES.BOOLEAN,
                    updateFilterCallback: updateFilters,
                    debounceMs: 200,
                },
            },
        },
        cellRenderer: BooleanCellRenderer,
        resizable: true,
    };
};
