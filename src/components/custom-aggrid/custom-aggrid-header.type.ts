/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ColDef, GridApi, IFilterOptionDef } from 'ag-grid-community';
import { SortParams } from './hooks/use-custom-aggrid-sort';
import { CustomColumnConfigProps } from 'components/custom-aggrid/custom-column-menu';
import React, { ComponentType } from 'react';
import { FilterParams } from '../../types/custom-aggrid-types';

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
    colId: string;
    filterParams: FilterParams;
}

export interface CustomColDef<TData = any, TValue = any, F extends CustomAggridFilterParams = CustomAggridFilterParams>
    extends ColDef<TData, TValue> {
    agGridFilterParams?: {
        filterOptions: IFilterOptionDef[];
    };
    columnWidth?: number;
    fractionDigits?: number;
    id?: string;
    isDefaultSort?: boolean;
    numeric?: boolean;
    forceDisplayFilterIcon?: boolean;
    tabIndex?: number;
    isCustomColumn?: boolean;
    Menu?: React.FC<CustomColumnConfigProps>;
    filterComponent?: ComponentType<F>;
    //We omit field here to avoid duplicating its declaration, we reinject it later inside CustomHeaderComponent
    filterComponentParams?: Omit<F, 'colId' | 'api'>;
    sortParams?: SortParams;
}
