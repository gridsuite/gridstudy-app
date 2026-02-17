/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ColDef, ICellRendererParams, type IFilterOptionDef } from 'ag-grid-community';
import { makeAgGridCustomHeaderColumn } from '../../../custom-aggrid/utils/custom-aggrid-header-utils';
import { CustomAggridAutocompleteFilter } from '../../../custom-aggrid/custom-aggrid-filters/custom-aggrid-autocomplete-filter';
import { FILTER_DATA_TYPES } from '../../../custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { IntlShape } from 'react-intl';
import { JSX } from 'react';

export const createMultiEnumFilterParams = (): { filterOptions: IFilterOptionDef[] } => ({
    filterOptions: [
        {
            displayKey: 'customInRange',
            displayName: 'customInRange',
            predicate: (filterValues: string[], cellValue: string | number) => {
                if (!filterValues[0]) return false;
                const allowedValues = filterValues[0].split(',');
                return allowedValues.includes(String(cellValue));
            },
        },
    ],
});

export const createEnumColumn = (
    field: string,
    headerId: string,
    options: string[],
    getEnumLabel: (value: string) => string,
    intl: IntlShape,
    sortParams: any,
    filterParams: any,
    cellRenderer?: (cellData: ICellRendererParams) => JSX.Element
): ColDef =>
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: headerId }),
        colId: field,
        field,
        filterParams: createMultiEnumFilterParams,
        context: {
            sortParams,
            filterComponent: CustomAggridAutocompleteFilter,
            filterComponentParams: {
                filterParams: {
                    dataType: FILTER_DATA_TYPES.TEXT,
                    ...filterParams,
                },
                options: options,
                getOptionLabel: getEnumLabel,
            },
        },
        valueGetter: (params) => params.data[field],
        valueFormatter: (params) => getEnumLabel(params.value as string),
        cellRenderer: cellRenderer,
    });
