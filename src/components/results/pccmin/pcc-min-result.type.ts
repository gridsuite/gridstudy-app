/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import {
    FilterConfig,
    numericFilterParams,
    textFilterParams,
    FilterType as AgGridFilterType,
} from 'types/custom-aggrid-types';
import { GlobalFilters } from '../common/global-filter/global-filter-types';
import { Page, Selector } from '../common/utils';
import { makeAgGridCustomHeaderColumn } from 'components/custom-aggrid/utils/custom-aggrid-header-utils';
import { ColumnContext } from 'components/custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { CustomAggridComparatorFilter } from 'components/custom-aggrid/custom-aggrid-filters/custom-aggrid-comparator-filter';
import { PCCMIN_ANALYSIS_RESULT_SORT_STORE, PCCMIN_RESULT } from 'utils/store-sort-filter-fields';
import { IntlShape } from 'react-intl';

export interface SinglePccMinResultInfos {
    singlePccMinResultUuid: string;
    busId: string;
    pccMinTri: number;
    limitingEquipment: string;
    x: number;
    r: number;
}

export interface PccMinResultTabProps {
    studyUuid: UUID;
    nodeUuid: UUID;
    currentRootNetworkUuid: UUID;
}
export type PagedPccMinResults = Page<SinglePccMinResultInfos>;

export interface PccMinResultTableProps {
    result: SinglePccMinResultInfos[];
    isFetching: boolean;
    onFilter: () => void;
    filters: FilterConfig[];
}

interface PccMinResults {
    studyUuid: UUID | null;
    currentNodeUuid?: UUID;
    currentRootNetworkUuid?: UUID;
    globalFilters?: GlobalFilters;
}

export interface PccMinPagedResults extends PccMinResults {
    selector: Partial<Selector>;
}

export const FROM_COLUMN_TO_FIELD_PCC_MIN: Record<string, string> = {
    busId: 'busId',
    pccMinTri: 'pccMinTri',
    iccMinTri: 'iccMinTri',
    limitingEquipment: 'limitingEquipment',
    x: 'x',
    r: 'r',
};

export const getPccMinColumns = (intl: IntlShape, onFilter: (filters: any) => void) => {
    const sortParams: ColumnContext['sortParams'] = {
        table: PCCMIN_ANALYSIS_RESULT_SORT_STORE,
        tab: PCCMIN_RESULT,
    };

    const filterParams = {
        type: AgGridFilterType.PccMin,
        tab: PCCMIN_RESULT,
        updateFilterCallback: onFilter,
    };

    const inputFilterParams = (
        filterDefinition: Pick<
            Required<ColumnContext>['filterComponentParams']['filterParams'],
            'dataType' | 'comparators'
        >
    ) => ({
        filterComponent: CustomAggridComparatorFilter,
        filterComponentParams: {
            filterParams: {
                ...filterDefinition,
                ...filterParams,
            },
        },
    });

    return [
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Bus' }),
            colId: 'busId',
            field: 'busId',
            context: { sortParams, ...inputFilterParams(textFilterParams) },
            minWidth: 180,
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Contingency' }),
            colId: 'limitingEquipment',
            field: 'limitingEquipment',
            context: { sortParams, ...inputFilterParams(textFilterParams) },
            minWidth: 180,
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'PccMinTri' }),
            colId: 'pccMinTri',
            field: 'pccMinTri',
            context: { numeric: true, fractionDigits: 2, sortParams, ...inputFilterParams(numericFilterParams) },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'IccMinTri' }),
            colId: 'iccMinTri',
            field: 'iccMinTri',
            context: { numeric: true, fractionDigits: 2, sortParams, ...inputFilterParams(numericFilterParams) },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'xOhm' }),
            colId: 'x',
            field: 'x',
            context: { numeric: true, fractionDigits: 2, sortParams, ...inputFilterParams(numericFilterParams) },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'rOhm' }),
            colId: 'r',
            field: 'r',
            context: { numeric: true, fractionDigits: 2, sortParams, ...inputFilterParams(numericFilterParams) },
        }),
    ];
};
