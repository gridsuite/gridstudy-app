import {
    FILTER_DATA_TYPES,
    FILTER_NUMBER_COMPARATORS,
    FILTER_TEXT_COMPARATORS,
} from '../../custom-aggrid/custom-aggrid-header.type';
import { CustomAggridBooleanFilter } from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-boolean-filter';
import { BooleanCellRenderer, DefaultCellRenderer, NumericCellRenderer } from '../utils/cell-renderers';
import { ColDef } from 'ag-grid-community';
import CustomHeaderComponent from '../../custom-aggrid/custom-aggrid-header';
import { CustomAggridComparatorFilter } from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-comparator-filter';
import { SPREADSHEET_SORT_STORE } from '../../../utils/store-sort-filter-fields';
import { updateFilters } from '../../custom-aggrid/custom-aggrid-filters/utils/aggrid-filters-utils';
import { FilterType } from '../../../types/custom-aggrid-types';

export const textColumnDefinition = (colId: string, displayName: string, tab: string): ColDef => {
    return {
        colId,
        cellDataType: 'text',
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
        resizable: true,
        cellRenderer: DefaultCellRenderer,
    };
};

export const numberColumnDefinition = (
    colId: string,
    displayName: string,
    tab: string,
    fractionDigits?: number
): ColDef => {
    return {
        colId,
        cellDataType: 'number',
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
        resizable: true,
        cellRenderer: NumericCellRenderer,
        cellRendererParams: {
            fractionDigits,
        },
    };
};

export const booleanColumnDefinition = (colId: string, displayName: string, tab: string): ColDef => {
    return {
        colId,
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
                    debounceMs: 200,
                },
            },
        },
        cellRenderer: BooleanCellRenderer,
        resizable: true,
    };
};
