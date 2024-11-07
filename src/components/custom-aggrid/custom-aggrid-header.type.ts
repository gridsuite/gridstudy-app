/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ColDef } from 'ag-grid-community';
import { SortPropsType } from '../../hooks/use-aggrid-sort';
import { AnyAction } from 'redux';

export enum FILTER_DATA_TYPES {
    TEXT = 'text',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
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
// not used in the base interface but still useful as reference constants :
export enum UNDISPLAYED_FILTER_NUMBER_COMPARATORS {
    GREATER_THAN = 'greaterThan',
    LESS_THAN = 'lessThan',
}

export type FilterEnumsType = Record<string, string[] | null>;

export type FilterPropsType = {
    updateFilter: (field: string, value: FilterDataType) => void;
    filterSelector: FilterSelectorType[] | null;
};

export type FilterParams = {
    filterDataType?: string;
    isDuration?: boolean;
    filterComparators?: string[];
    debounceMs?: number;
    filterEnums?: FilterEnumsType;
};

export interface CustomColDef extends ColDef {
    filterProps?: FilterPropsType;
    filterParams?: FilterParams;
    sortProps?: SortPropsType;
    agGridFilterParams?: any;
    filterTab?: string[];
    getEnumLabel?: (value: string) => string;
    isCountry?: boolean;
    shouldDisplayFilterBadge?: boolean;
}

export type FilterDataType = {
    dataType: string;
    type: string;
    value: undefined | null | number | string | string[];
};

export type FilterSelectorType = FilterDataType & {
    column: string;
};

export type FilterStorePropsType = {
    filterType: string;
    filterTab: string;
    filterStoreAction: (filterTab: string, filter: FilterSelectorType[]) => AnyAction;
};
