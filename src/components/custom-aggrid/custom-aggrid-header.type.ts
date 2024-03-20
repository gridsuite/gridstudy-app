/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    FilterEnumsType,
    FilterPropsType,
} from '../../hooks/use-aggrid-row-filter';
import { ColDef } from 'ag-grid-community';
import { SortPropsType } from '../../hooks/use-aggrid-sort';
import { AnyAction } from 'redux';

export enum FILTER_DATA_TYPES {
    TEXT = 'text',
    NUMBER = 'number',
}

export enum FILTER_TEXT_COMPARATORS {
    EQUALS = 'equals',
    CONTAINS = 'contains',
    STARTS_WITH = 'startsWith',
}
export enum FILTER_NUMBER_COMPARATORS {
    NOT_EQUAL = 'notEqual',
    LESS_THAN_OR_EQUAL = 'lessThanOrEqual',
    GREATER_THAN_OR_EQUAL = 'greaterThanOrEqual',
}

type FilterParams = {
    filterDataType?: string;
    isDuration?: boolean;
    filterComparators?: string[];
    debounceMs?: number;
    parser?: (value: string) => void;
    filterEnums?: FilterEnumsType;
    isCountry?: boolean;
};

export interface CustomColDef extends ColDef {
    filterProps?: FilterPropsType;
    filterParams?: FilterParams;
    sortProps?: SortPropsType;
    agGridFilterParams?: any;
    filterTab?: string[];
}
export type FilterSelectorType = {
    column: string;
    dataType: string;
    type: string;
    value: string | string[];
};

export type FilterStorePropsType = {
    filterType: string;
    filterTab: string;
    filterStoreAction: (
        filterTab: string,
        filter: FilterSelectorType[]
    ) => AnyAction;
};
