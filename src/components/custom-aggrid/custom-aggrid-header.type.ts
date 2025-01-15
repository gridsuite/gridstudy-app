/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ColDef, GridApi, IFilterOptionDef } from 'ag-grid-community';
import { SortParams } from './hooks/use-custom-aggrid-sort';
import { CrossValidationOptions } from '../spreadsheet/utils/equipment-table-utils';
import { CustomColumnConfigProps } from 'components/spreadsheet/custom-columns/custom-column-menu';
import React, { ComponentType } from 'react';
import { FilterParams } from './custom-aggrid-filters/types/custom-aggrid-filter-types';

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

export interface CustomAggridFilterParams {
    api: GridApi;
    field: string;
    filterParams: FilterParams;
}

export type CustomHeaderMenuParams = {
    tabIndex: number;
    isCustomColumn: boolean;
    Menu: React.FC<CustomColumnConfigProps>;
};

export interface CustomColDef<TData = any, TValue = any, F extends CustomAggridFilterParams = CustomAggridFilterParams>
    extends ColDef<TData, TValue> {
    agGridFilterParams?: {
        filterOptions: IFilterOptionDef[];
    };
    boolean?: boolean;
    canBeInvalidated?: boolean;
    changeCmd?: string;
    columnWidth?: number;
    crossValidation?: CrossValidationOptions;
    filterTab?: string[];
    fractionDigits?: number;
    getEnumLabel?: (value: string) => string | undefined;
    id: string;
    isCountry?: boolean;
    isDefaultSort?: boolean;
    isEnum?: boolean;
    numeric?: boolean;
    withFluxConvention?: boolean;
    forceDisplayFilterIcon?: boolean;
    tabIndex?: number;
    isCustomColumn?: boolean;
    Menu?: React.FC<CustomColumnConfigProps>;
    filterComponent?: ComponentType<F>;
    //We omit field here to avoid duplicating its declaration, we reinject it later inside CustomHeaderComponent
    filterComponentParams?: Omit<F, 'field' | 'api'>;
    sortParams?: SortParams;
}
