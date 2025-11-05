/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { numericFilterParams, textFilterParams, FilterType as AgGridFilterType } from 'types/custom-aggrid-types';
import { ColumnContext } from 'components/custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { CustomAggridComparatorFilter } from 'components/custom-aggrid/custom-aggrid-filters/custom-aggrid-comparator-filter';
import { PCCMIN_ANALYSIS_RESULT_SORT_STORE, PCCMIN_RESULT } from 'utils/store-sort-filter-fields';
import { IntlShape } from 'react-intl';
import { makeAgGridCustomHeaderColumn } from 'components/custom-aggrid/utils/custom-aggrid-header-utils';

export const getPccMinColumns = (intl: IntlShape, onFilter: (filters: any) => void) => {
    const sortParams: ColumnContext['sortParams'] = {
        table: PCCMIN_ANALYSIS_RESULT_SORT_STORE,
        tab: PCCMIN_RESULT,
    };

    const pccMinFilterParams = {
        type: AgGridFilterType.PccMin,
        tab: PCCMIN_RESULT,
        updateFilterCallback: onFilter,
    };

    const inputPccMinFilterParams = (
        filterDefinition: Pick<
            Required<ColumnContext>['filterComponentParams']['filterParams'],
            'dataType' | 'comparators'
        >
    ) => ({
        filterComponent: CustomAggridComparatorFilter,
        filterComponentParams: {
            filterParams: {
                ...filterDefinition,
                ...pccMinFilterParams,
            },
        },
    });

    return [
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Bus' }),
            colId: 'busId',
            field: 'busId',
            context: { sortParams, ...inputPccMinFilterParams(textFilterParams) },
            minWidth: 180,
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Contingency' }),
            colId: 'limitingEquipment',
            field: 'limitingEquipment',
            context: { sortParams, ...inputPccMinFilterParams(textFilterParams) },
            minWidth: 180,
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'PccMinTri' }),
            colId: 'pccMinTri',
            field: 'pccMinTri',
            context: { numeric: true, fractionDigits: 2, sortParams, ...inputPccMinFilterParams(numericFilterParams) },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'IccMinTri' }),
            colId: 'iccMinTri',
            field: 'iccMinTri',
            context: { numeric: true, fractionDigits: 2, sortParams, ...inputPccMinFilterParams(numericFilterParams) },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'xOhm' }),
            colId: 'x',
            field: 'x',
            context: { numeric: true, fractionDigits: 2, sortParams, ...inputPccMinFilterParams(numericFilterParams) },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'rOhm' }),
            colId: 'r',
            field: 'r',
            context: { numeric: true, fractionDigits: 2, sortParams, ...inputPccMinFilterParams(numericFilterParams) },
        }),
    ];
};
