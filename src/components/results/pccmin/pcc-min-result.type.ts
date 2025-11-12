/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { GlobalFilters } from '../common/global-filter/global-filter-types';
import { Page, Selector } from '../common/utils';
import {
    FilterConfig,
    numericFilterParams,
    textFilterParams,
    FilterType as AgGridFilterType,
} from 'types/custom-aggrid-types';
import { ColumnContext } from 'components/custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { CustomAggridComparatorFilter } from 'components/custom-aggrid/custom-aggrid-filters/custom-aggrid-comparator-filter';
import { PCCMIN_ANALYSIS_RESULT_SORT_STORE, PCCMIN_RESULT } from 'utils/store-sort-filter-fields';
import { IntlShape } from 'react-intl';
import { makeAgGridCustomHeaderColumn } from 'components/custom-aggrid/utils/custom-aggrid-header-utils';

export interface SinglePccMinResultInfos {
    singlePccMinResultUuid: string;
    busId: string;
    limitingEquipment: string;
    pccMinTri: number;
    iccMinTri: number;
    r: number;
    x: number;
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
    limitingEquipment: 'limitingEquipment',
    pccMinTri: 'pccMinTri',
    iccMinTri: 'iccMinTri',
    r: 'r',
    x: 'x',
};
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

    const createFilterContext = (
        filterDefinition: Pick<
            Required<ColumnContext>['filterComponentParams']['filterParams'],
            'dataType' | 'comparators'
        >,
        numeric?: boolean,
        fractionDigits?: number
    ) => ({
        sortParams,
        ...pccMinFilterParams,
        ...(numeric ? { numeric: true, fractionDigits } : {}),
        filterComponent: CustomAggridComparatorFilter,
        filterComponentParams: {
            filterParams: {
                ...filterDefinition,
                ...pccMinFilterParams,
            },
        },
    });

    let columnsMeta = [
        { colId: 'busId', headerKey: 'Bus', filterDef: textFilterParams },
        { colId: 'limitingEquipment', headerKey: 'Contingency', filterDef: textFilterParams },
        {
            colId: 'pccMinTri',
            headerKey: 'PccMinTri',
            filterDef: numericFilterParams,
            numeric: true,
            fractionDigits: 2,
        },
        {
            colId: 'iccMinTri',
            headerKey: 'IccMinTri',
            filterDef: numericFilterParams,
            numeric: true,
            fractionDigits: 2,
        },
        { colId: 'r', headerKey: 'rOhm', filterDef: numericFilterParams, numeric: true, fractionDigits: 2 },
        { colId: 'x', headerKey: 'xOhm', filterDef: numericFilterParams, numeric: true, fractionDigits: 2 },
    ];

    return columnsMeta.map(({ colId, headerKey, filterDef, numeric, fractionDigits }) =>
        makeAgGridCustomHeaderColumn({
            colId,
            field: FROM_COLUMN_TO_FIELD_PCC_MIN[colId],
            headerName: intl.formatMessage({ id: headerKey }),
            context: createFilterContext(filterDef, numeric, fractionDigits),
            minWidth: numeric ? undefined : 180,
        })
    );
};
