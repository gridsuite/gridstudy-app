/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { COLUMN_TYPES } from '../../custom-aggrid/custom-aggrid-header.type';
import { CustomAggridBooleanFilter } from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-boolean-filter';
import { BooleanCellRenderer, DefaultCellRenderer, NumericCellRenderer } from '@gridsuite/commons-ui';
import { RowIndexCellRenderer } from 'components/custom-aggrid/rowindex-cell-renderer';
import type { ColDef, GridApi, IFilterOptionDef } from 'ag-grid-community';
import CustomHeaderComponent from '../../custom-aggrid/custom-aggrid-header';
import { CustomAggridComparatorFilter } from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-comparator-filter';
import { SPREADSHEET_SORT_STORE } from '../../../utils/store-sort-filter-fields';
import {
    BooleanFilterValue,
    updateFilters,
} from '../../custom-aggrid/custom-aggrid-filters/utils/aggrid-filters-utils';
import { FilterConfig, FilterType } from '../../../types/custom-aggrid-types';
import { CustomAggridAutocompleteFilter } from 'components/custom-aggrid/custom-aggrid-filters/custom-aggrid-autocomplete-filter';
import {
    CustomColDef,
    FILTER_DATA_TYPES,
    FILTER_NUMBER_COMPARATORS,
    FILTER_TEXT_COMPARATORS,
} from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import type { UUID } from 'node:crypto';
import { isCalculationRow } from '../utils/calculation-utils';
import { ROW_INDEX_COLUMN_ID } from '../constants';
import { updateSpreadsheetColumn } from 'services/study/study-config';
import { ColumnDefinition } from '../types/spreadsheet.type';
import { mapColDefToDto } from '../add-spreadsheet/dialogs/add-spreadsheet-utils';

const updateAndPersistFilters = (colDef: ColumnDefinition, tab: string, api: GridApi, filters: FilterConfig[]) => {
    updateFilters(api, filters);
    const studyUuid = api.getGridOption('context')?.studyUuid;
    if (studyUuid) {
        const filter = filters?.find((f) => f.column === colDef.id);
        const columnDto = mapColDefToDto(colDef, filter);
        updateSpreadsheetColumn(studyUuid, tab as UUID, colDef.uuid, columnDto);
    }
};

export const textColumnDefinition = (colDef: ColumnDefinition, tab: string): ColDef => {
    return {
        headerComponent: CustomHeaderComponent,
        headerComponentParams: {
            displayName: colDef.name,
            sortParams: {
                table: SPREADSHEET_SORT_STORE,
                tab,
            },
            filterComponent: CustomAggridComparatorFilter,
            filterComponentParams: {
                filterParams: {
                    type: FilterType.Spreadsheet,
                    tab,
                    updateFilterCallback: updateAndPersistFilters.bind(null, colDef, tab),
                    dataType: FILTER_DATA_TYPES.TEXT,
                    comparators: [FILTER_TEXT_COMPARATORS.STARTS_WITH, FILTER_TEXT_COMPARATORS.CONTAINS],
                    debounceMs: 500,
                },
            },
        },
        cellRenderer: DefaultCellRenderer,
        context: {
            columnType: COLUMN_TYPES.TEXT,
        },
    };
};

export const enumColumnDefinition = (colDef: ColumnDefinition, tab: string): ColDef => {
    return {
        filterParams: {
            filterOptions: [
                {
                    displayKey: 'customInRange',
                    displayName: 'customInRange', // translation key
                    predicate: (filterValues: string[], cellValue: string | number) => {
                        if (!filterValues[0]) return false;
                        // filterValues[0] contains the selected enum values as a comma-separated string.
                        // Convert it to an array and check for exact matches.
                        const allowedValues = filterValues[0].split(',');
                        return allowedValues.includes(String(cellValue));
                    },
                },
            ] as IFilterOptionDef[],
        },
        headerComponent: CustomHeaderComponent,
        headerComponentParams: {
            displayName: colDef.name,
            sortParams: {
                table: SPREADSHEET_SORT_STORE,
                tab,
            },
            filterComponent: CustomAggridAutocompleteFilter,
            filterComponentParams: {
                filterParams: {
                    type: FilterType.Spreadsheet,
                    tab,
                    updateFilterCallback: updateAndPersistFilters.bind(null, colDef, tab),
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

export const numberColumnDefinition = (colDef: ColumnDefinition, tab: string): ColDef => {
    return {
        filter: 'agNumberColumnFilter',
        headerComponent: CustomHeaderComponent,
        headerComponentParams: {
            displayName: colDef.name,
            sortParams: {
                table: SPREADSHEET_SORT_STORE,
                tab,
            },
            filterComponent: CustomAggridComparatorFilter,
            filterComponentParams: {
                filterParams: {
                    type: FilterType.Spreadsheet,
                    tab,
                    updateFilterCallback: updateAndPersistFilters.bind(null, colDef, tab),
                    dataType: FILTER_DATA_TYPES.NUMBER,
                    comparators: Object.values(FILTER_NUMBER_COMPARATORS),
                    debounceMs: 500,
                },
            },
        },
        cellRenderer: NumericCellRenderer,
        cellRendererParams: {
            fractionDigits: colDef?.precision,
        },
        context: {
            columnType: COLUMN_TYPES.NUMBER,
        },
    };
};

export const booleanColumnDefinition = (colDef: ColumnDefinition, tab: string): ColDef => {
    return {
        filterParams: {
            filterOptions: [
                {
                    displayKey: 'booleanMatches',
                    displayName: 'booleanMatches', // translation key
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
            ] as IFilterOptionDef[],
        },
        headerComponent: CustomHeaderComponent,
        headerComponentParams: {
            displayName: colDef.name,
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
                    updateFilterCallback: updateAndPersistFilters.bind(null, colDef, tab),
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
        colId: ROW_INDEX_COLUMN_ID,
        headerName: '',
        cellRenderer: (params: any) => {
            // For pinned rows, use the RowIndexCellRenderer which handles the calculate icon
            if (isCalculationRow(params.node?.data?.rowType)) {
                return RowIndexCellRenderer(params);
            }
            return params.node.rowIndex + 1;
        },
        width: 70,
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
