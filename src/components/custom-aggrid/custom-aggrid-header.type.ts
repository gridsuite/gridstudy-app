/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ColDef, IFilterOptionDef } from 'ag-grid-community';
import { SortPropsType } from '../../hooks/use-aggrid-sort';
import { AnyAction } from 'redux';
import { CrossValidationOptions } from '../spreadsheet/utils/equipment-table-utils';
import { CustomColumnConfigProps } from 'components/spreadsheet/custom-columns/custom-column-menu';
import React, { ComponentType } from 'react';

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

// not visible in the base interface :
export enum UNDISPLAYED_FILTER_NUMBER_COMPARATORS {
    GREATER_THAN = 'greaterThan',
    LESS_THAN = 'lessThan',
}

export type FilterEnumsType = Record<string, string[] | null>;

export type FilterParams = {
    filterDataType?: string;
    filterComparators?: string[];
    debounceMs?: number;
    updateFilter?: (field: string, value: FilterDataType) => void;
    filterSelector?: FilterSelectorType[] | null;
};

export interface CustomAggridFilterParams {
    field: string;
    filterParams: FilterParams;
}

export type CustomHeaderMenuParams = {
    tabIndex: number;
    isCustomColumn: boolean;
    Menu: React.FC<CustomColumnConfigProps>;
};

export type CustomHeaderSortParams = {
    isSortable?: boolean;
} & SortPropsType;

export type FilterDataType = {
    dataType?: string;
    type?: string;
    value: unknown;
    tolerance?: number; // tolerance when comparing values. Only useful for the number type
};

export type FilterSelectorType = FilterDataType & {
    column: string;
};

export type FilterStorePropsType = {
    filterType: string;
    filterTab: string;
    filterStoreAction: (filterTab: string, filter: FilterSelectorType[]) => AnyAction;
};

export interface CustomColDef<TData = any, TValue = any, F extends CustomAggridFilterParams = CustomAggridFilterParams>
    extends ColDef<TData, TValue> {
    agGridFilterParams?: {
        filterOptions: IFilterOptionDef[];
    };
    changeCmd?: string;
    columnWidth?: number;
    crossValidation?: CrossValidationOptions;
    filterTab?: string[];
    fractionDigits?: number;
    id: string;
    isDefaultSort?: boolean;
    numeric?: boolean;
    sortProps?: SortPropsType;
    forceDisplayFilterIcon?: boolean;
    tabIndex?: number;
    isCustomColumn?: boolean;
    Menu?: React.FC<CustomColumnConfigProps>;
    filterComponent?: ComponentType<F>;
    //We omit field here to avoid duplicating its declaration, we reinject it later inside CustomHeaderComponent
    filterComponentParams?: Omit<F, 'field'>;
}
