/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    BooleanCellRenderer,
    BooleanFilterValue,
    COLUMN_TYPES,
    CustomAggridAutocompleteFilter,
    CustomAggridBooleanFilter,
    CustomAggridComparatorFilter,
    CustomColDef,
    CustomHeaderComponent,
    DefaultCellRenderer,
    FILTER_DATA_TYPES,
    FILTER_NUMBER_COMPARATORS,
    FILTER_TEXT_COMPARATORS,
    NumericCellRenderer,
    RowIndexCellRenderer,
    updateFilters,
} from '@gridsuite/commons-ui';
import type { ColDef, GridApi, IFilterOptionDef } from 'ag-grid-community';
import { SPREADSHEET_SORT_STORE } from '../../../utils/store-sort-filter-fields';
import { FilterConfig, FilterType } from '../../../types/custom-aggrid-types';
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

export const enumColumnDefinition = (colDef: ColumnDefinition, tab: string): ColDef => {
    return {
        filterParams: {
            filterOptions: [
                {
                    displayKey: 'customInRange',
                    displayName: 'customInRange', // translation key
                    predicate: (filterValues: string[], cellValue: string) =>
                        // We receive here the filter enum values as a string (filterValue)
                        filterValues[0]?.includes(cellValue) ?? false,
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
                    debounceMs: 200,
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

type RowIndexContextExtras = {
    getCalculationSelections?: (tabUuid: string) => string[];
    setCalculationSelections?: (tabUuid: string, selections: string[]) => void;
};

export const rowIndexColumnDefinition = (tabUuid: UUID, contextExtras?: RowIndexContextExtras): CustomColDef => {
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
            getCalculationSelections: contextExtras?.getCalculationSelections,
            setCalculationSelections: contextExtras?.setCalculationSelections,
        },
    };
};
